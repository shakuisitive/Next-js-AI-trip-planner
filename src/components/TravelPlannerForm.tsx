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
  const [interestsValue, setInterestsValue] = useState([]);

  let session = useSession();

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
    if (!session.data) {
      signIn("google");

      return;
    }
    // if (!user) {
    //   setShowSignInModal(true);
    //   return;
    // }

    console.log("should work");

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
                  Where to?
                </label>
                {showLoadError && (
                  <div className="text-red-500 text-sm mb-2">
                    Error loading Google Maps. Please refresh the page.
                  </div>
                )}
                {isLoaded ? (
                  <Autocomplete
                    onPlaceChanged={() => {
                      const autocomplete = document.getElementById(
                        "destination"
                      ) as HTMLInputElement;
                      if (autocomplete) {
                        const place = autocomplete.value;
                        setDestination(place);
                      }
                    }}
                  >
                    <input
                      id="destination"
                      className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A0E78] focus:border-transparent"
                      placeholder="Enter destination"
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </Autocomplete>
                ) : (
                  <input
                    id="destination"
                    className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A0E78] focus:border-transparent"
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
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none bg-white text-left flex items-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A0E78] focus:border-transparent"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className="w-5 h-5 mr-3 text-[#4A0E78]" />
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
                      color="#4A0E78"
                      rangeColors={["#4A0E78"]}
                    />
                    <div className="p-4 bg-gray-100 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {formatDate(dateRange[0].startDate)} -{" "}
                        {formatDate(dateRange[0].endDate)}
                      </p>
                      <button
                        type="button"
                        className="bg-[#4A0E78] text-white px-4 py-2 rounded-md hover:bg-[#3A0B5E] focus:outline-none focus:ring-2 focus:ring-[#4A0E78] focus:ring-opacity-50"
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
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none bg-white text-left flex items-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A0E78] focus:border-transparent"
                  onClick={() => setShowBudget(!showBudget)}
                >
                  <DollarSign className="w-5 h-5 mr-3 text-[#4A0E78]" />
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
                                colors: ["#ccc", "#4A0E78", "#ccc"],
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
                            isDragged ? "ring-2 ring-[#4A0E78]" : ""
                          }`}
                          style={{
                            ...props.style,
                            boxShadow: "0px 2px 6px #AAA",
                          }}
                        >
                          <div className="h-2 w-2 bg-[#4A0E78] rounded-full" />
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
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A0E78] focus:border-transparent"
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
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A0E78] focus:border-transparent"
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
                  className="w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A0E78] focus:border-transparent"
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
                      className="w-4 h-4 text-[#4A0E78] border-gray-300 rounded focus:ring-[#4A0E78] focus:ring-2"
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
                className="bg-[#4A0E78] text-white rounded-lg px-8 py-3 hover:bg-[#3A0B5E] focus:outline-none focus:shadow-outline flex items-center space-x-2 text-lg font-semibold"
                type="submit"
              >
                <Search className="w-6 h-6" />

                {session.data ? (
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
