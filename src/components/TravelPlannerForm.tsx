"use client";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import { Search, Calendar, DollarSign } from "lucide-react";
import { DateRange } from "react-date-range";
import { Range, getTrackBackground } from "react-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import SignInModal from "./SignInModal";
import { useSession, signIn } from "next-auth/react";
import Cookies from "js-cookie";

import {
  useCredentialsLoggedInChecker,
  useCredentialsLoggedInData,
} from "@/lib/credentialsAuth/credentialsLoggedInChecker";
import { removeACookie, setClientCookie } from "@/utils/cookies";

const TravelPlannerForm = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [budget, setBudget] = useState([500, 5000]);
  const [destination, setDestination] = useState("");
  const [showSignInModal, setShowSignInModal] = useState(false);

  const [groupTypeValue, setGroupTypeValue] = useState("");
  const [travelStyleValue, setTravelStyleValue] = useState("");
  const [paceValue, setPaceValue] = useState("");
  const [interestsValue, setInterestsValue] = useState<string[]>([]);
  const [weatherString, setWeatherString] = useState("");
  const [latitdue, setLatitdue] = useState("");
  const [longitude, setLongitude] = useState("");

  let session = useSession();

  useEffect(() => {
    removeACookie("weather-string");
    setClientCookie("weather-string", weatherString, { expires: 7 });
  }, [weatherString]);

  let loggedInViaCredential = useCredentialsLoggedInChecker();
  let credentialsLoggedInData = useCredentialsLoggedInData();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDateRangeText = () => {
    if (dateRange[0].startDate.getTime() === dateRange[0].endDate.getTime()) {
      return "Check in - Check out";
    }
    return `${formatDate(dateRange[0].startDate)} - ${formatDate(
      dateRange[0].endDate
    )}`;
  };

  const handleSetDates = () => {
    setShowCalendar(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // START

    async function generateWeatherSummary() {
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${latitdue},${longitude}&days=14`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch weather");

        const data = await res.json();
        console.log("the data is", data);
        const forecast = data.forecast.forecastday;

        const summary = forecast
          .map((day: any) => {
            const date = new Date(day.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            });

            const condition = day.day.condition.text;
            const max = day.day.maxtemp_c;
            const min = day.day.mintemp_c;

            let resultantWeatherString = `${date}: expect ${condition.toLowerCase()} with a high of ${max}°C and a low of ${min}°C.`;
            return resultantWeatherString;
          })
          .join(" ");

        setWeatherString(summary);
        return summary;
      } catch (err) {
        console.error("Error generating weather summary:", err);
        return "Weather information is currently unavailable.";
      }
    }

    // Run it
    await generateWeatherSummary();

    // END

    if (!session.data && !loggedInViaCredential) {
      setShowSignInModal(true);
      return;
    }

    const startDate = dateRange[0].startDate.toISOString().split("T")[0];
    const endDate = dateRange[0].endDate.toISOString().split("T")[0];
    const [budgetMin, budgetMax] = budget;

    await router.push(
      `/plan?destination=${encodeURIComponent(
        destination
      )}&startDate=${startDate}&endDate=${endDate}&budgetMin=${budgetMin}&budgetMax=${budgetMax}&groupType=${encodeURIComponent(
        groupTypeValue
      )}&travelStyle=${encodeURIComponent(
        travelStyleValue
      )}&pace=${encodeURIComponent(paceValue)}&interests=${interestsValue
        .map(encodeURIComponent)
        .join(",")}`
    );
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY as string,
    libraries: ["places"],
  });

  const [showLoadError, setShowLoadError] = useState(false);

  const [groupType, setGroupType] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [pace, setPace] = useState("");
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    if (loadError) {
      const timer = setTimeout(() => {
        setShowLoadError(true);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer);
    }
  }, [loadError]);

  if (loadError)
    return <div>Error loading Google Maps. Please refresh the page.</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <div className="w-full max-w-6xl relative">
        <div className="bg-white rounded-lg p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* First Row - Destination, Duration, Budget */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1 relative">
                <label
                  htmlFor="destination"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Where do you plan to go?
                </label>
                {showLoadError && (
                  <div className="text-red-500 text-sm mb-2">
                    Error loading Google Maps. Please refresh the page.
                  </div>
                )}
                {isLoaded ? (
                  <Autocomplete
                    onLoad={(autocomplete) => {
                      autocomplete.addListener("place_changed", () => {
                        const place = autocomplete.getPlace();
                        if (place.geometry && place.geometry.location) {
                          const location = place.geometry.location;
                          console.log("Selected place coordinates:", {
                            latitude: location.lat(),
                            longitude: location.lng(),
                          });

                          setLatitdue(location.lat());
                          setLongitude(location.lng());
                          setDestination(place.formatted_address || "");
                        }
                      });
                    }}
                  >
                    <input
                      id="destination"
                      className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                      placeholder="Enter destination"
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </Autocomplete>
                ) : (
                  <input
                    id="destination"
                    className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    placeholder="Enter destination"
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                )}
              </div>

              <div className="flex-1 relative">
                <label
                  htmlFor="dateRange"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Duration
                </label>
                <button
                  id="dateRange"
                  type="button"
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none bg-white text-left flex items-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className="w-5 h-5 mr-3 text-[#2563EB]" />
                  <span>{getDateRangeText()}</span>
                </button>
                {showCalendar && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white shadow-lg rounded-lg w-full">
                    <DateRange
                      editableDateInputs={true}
                      onChange={(item) =>
                        setDateRange([
                          {
                            startDate: item.selection.startDate ?? new Date(),
                            endDate: item.selection.endDate ?? new Date(),
                            key: "selection",
                          },
                        ])
                      }
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      className="w-full"
                      color="#2563EB"
                      rangeColors={["#2563EB"]}
                      minDate={new Date()}
                    />
                    <div className="p-4 bg-gray-100 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {formatDate(dateRange[0].startDate)} -{" "}
                        {formatDate(dateRange[0].endDate)}
                      </p>
                      <button
                        type="button"
                        className="bg-[#2563EB] text-white px-4 py-2 rounded-md hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-opacity-50"
                        onClick={handleSetDates}
                      >
                        Set Dates
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <label
                  htmlFor="budget"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Budget
                </label>
                <button
                  id="budget"
                  type="button"
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none bg-white text-left flex items-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  onClick={() => setShowBudget(!showBudget)}
                >
                  <DollarSign className="w-5 h-5 mr-3 text-[#2563EB]" />
                  <span>
                    Budget: ${budget[0]} - ${budget[1]}
                  </span>
                </button>
                {showBudget && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white shadow-lg rounded-lg w-full p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Select Budget Range
                    </h3>
                    <Range
                      values={budget}
                      step={100}
                      min={0}
                      max={10000}
                      onChange={(values) => setBudget(values)}
                      renderTrack={({ props, children }) => (
                        <div
                          onMouseDown={props.onMouseDown}
                          onTouchStart={props.onTouchStart}
                          className="h-4 flex w-full"
                          style={props.style}
                        >
                          <div
                            ref={props.ref}
                            className="h-1 w-full rounded-full self-center"
                            style={{
                              background: getTrackBackground({
                                values: budget,
                                colors: ["#ccc", "#2563EB", "#ccc"],
                                min: 0,
                                max: 10000,
                              }),
                            }}
                          >
                            {children}
                          </div>
                        </div>
                      )}
                      renderThumb={({ props, isDragged }) => (
                        <div
                          {...props}
                          className={`h-4 w-4 rounded-full bg-white shadow flex justify-center items-center ${
                            isDragged ? "ring-2 ring-[#2563EB]" : ""
                          }`}
                          style={{
                            ...props.style,
                            boxShadow: "0px 2px 6px #AAA",
                          }}
                        >
                          <div className="h-2 w-2 bg-[#2563EB] rounded-full" />
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="groupType"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Group Type
                </label>
                <select
                  id="groupType"
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  value={groupTypeValue}
                  onChange={(e) => setGroupTypeValue(e.target.value)}
                >
                  <option value="">Select group type</option>
                  <option value="solo">Solo</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="flex-1">
                <label
                  htmlFor="travelStyle"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Travel Style
                </label>
                <select
                  id="travelStyle"
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  value={travelStyleValue}
                  onChange={(e) => setTravelStyleValue(e.target.value)}
                >
                  <option value="">Select travel style</option>
                  <option value="relaxed">Relaxed</option>
                  <option value="adventure">Adventure</option>
                  <option value="luxury">Luxury</option>
                  <option value="budget">Budget</option>
                  <option value="cultural">Cultural</option>
                  <option value="party">Party/Nightlife</option>
                </select>
              </div>

              <div className="flex-1">
                <label
                  htmlFor="pace"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Travel Pace
                </label>
                <select
                  id="pace"
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                  value={paceValue}
                  onChange={(e) => setPaceValue(e.target.value)}
                >
                  <option value="">Select pace</option>
                  <option value="slow">Slow & Relaxed</option>
                  <option value="moderate">Moderate</option>
                  <option value="fast">Fast-paced</option>
                </select>
              </div>
            </div>

            {/* Third Row - Interests */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Interests (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { id: "shopping", label: "Shopping" },
                  { id: "sports", label: "Sports" },
                  { id: "food", label: "Food & Dining" },
                  { id: "culture", label: "Museums/Culture" },
                  { id: "nature", label: "Nature/Outdoors" },
                  { id: "photography", label: "Photography" },
                  { id: "nightlife", label: "Nightlife" },
                ].map((interest) => (
                  <label
                    key={interest.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={interestsValue.includes(interest.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setInterestsValue([...interestsValue, interest.id]);
                        } else {
                          setInterestsValue(
                            interestsValue.filter((i) => i !== interest.id)
                          );
                        }
                      }}
                      className="w-4 h-4 text-[#2563EB] border-gray-300 rounded focus:ring-[#2563EB] focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">
                      {interest.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                className="bg-[#2563EB] text-white rounded-lg px-8 py-3 hover:bg-[#1E40AF] focus:outline-none focus:shadow-outline flex items-center space-x-2 text-lg font-semibold"
                type="submit"
              >
                <Search className="w-6 h-6" />

                {session.data || loggedInViaCredential ? (
                  <span>Plan My Trip</span>
                ) : (
                  <span>Login To Get Trips</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        showAuthMessage={true}
      />
    </>
  );
};

export default TravelPlannerForm;
