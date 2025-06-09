"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-date-range";
import { Range, getTrackBackground } from "react-range";
import { toast } from "sonner";
import { getAllUsers } from "@/actions";
import { Calendar, DollarSign, Plus, Trash2 } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Place {
  name: string;
  type: "attraction" | "restaurant";
  description: string;
  location: string;
  timeOfDay: string;
  duration: string;
  image?: string;
  cuisine?: string;
  priceRange?: string;
  category?: string;
}

interface Day {
  dayNumber: number;
  date: Date;
  places: Place[];
  transportation: string;
}

interface Accommodation {
  name: string;
  type: string;
  rating: number;
  pricePerNight: number;
  description: string;
  bookingUrl?: string;
  image?: string;
  amenities: string[];
}

export default function TripCreatePage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [destination, setDestination] = useState("");
  const [tourName, setTourName] = useState("");
  const [tourStatus, setTourStatus] = useState<"Pending Approval" | "Scheduled" | "Completed">("Pending Approval");
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [budget, setBudget] = useState([500, 5000]);
  const [groupType, setGroupType] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [pace, setPace] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const result = await getAllUsers();
      if (result.success && result.users) {
        setUsers(result.users);
      }
    };
    fetchUsers();
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY as string,
    libraries: ["places"],
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDateRangeText = () => {
    if (dateRange[0].startDate.getTime() === dateRange[0].endDate.getTime()) {
      return "Select dates";
    }
    return `${formatDate(dateRange[0].startDate)} - ${formatDate(dateRange[0].endDate)}`;
  };

  const handleAddDay = () => {
    const newDay: Day = {
      dayNumber: days.length + 1,
      date: new Date(dateRange[0].startDate.getTime() + days.length * 24 * 60 * 60 * 1000),
      places: [],
      transportation: "",
    };
    setDays([...days, newDay]);
  };

  const handleAddPlace = (dayIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].places.push({
      name: "",
      type: "attraction",
      description: "",
      location: "",
      timeOfDay: "",
      duration: "",
    });
    setDays(updatedDays);
  };

  const handleAddAccommodation = () => {
    setAccommodations([
      ...accommodations,
      {
        name: "",
        type: "",
        rating: 0,
        pricePerNight: 0,
        description: "",
        amenities: [],
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookTrip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          tourName,
          destination,
          tourStatus,
          startDate: dateRange[0].startDate,
          endDate: dateRange[0].endDate,
          budgetMin: budget[0],
          budgetMax: budget[1],
          groupType,
          travelStyle,
          pace,
          interests,
          plan: {
            days: days.map(day => ({
              day: day.dayNumber,
              places: day.places,
              transportation: day.transportation,
            })),
            accommodations,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create trip");
      }

      const data = await response.json();
      toast.success("Trip created successfully");
      router.push(`/dashboard/trips/${data.tripId}`);
    } catch (error) {
      toast.error("Failed to create trip");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) return <div>Error loading Google Maps. Please refresh the page.</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create Trip</h1>
          <p className="text-muted-foreground">
            Create a new trip package
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic information for the trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">User</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tour Name</label>
                <Input
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                  placeholder="Enter tour name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <Autocomplete
                  onLoad={(autocomplete) => {
                    autocomplete.addListener("place_changed", () => {
                      const place = autocomplete.getPlace();
                      if (place.formatted_address) {
                        setDestination(place.formatted_address);
                      }
                    });
                  }}
                >
                  <Input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter destination"
                  />
                </Autocomplete>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tour Status</label>
                <Select value={tourStatus} onValueChange={(value: "Pending Approval" | "Scheduled" | "Completed") => setTourStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dates</label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {getDateRangeText()}
                </Button>
                {showCalendar && (
                  <div className="absolute z-50 mt-2">
                    <DateRange
                      editableDateInputs={true}
                      onChange={(item) => setDateRange([item.selection])}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      minDate={new Date()}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Budget Range</label>
                <div className="p-4">
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
                    renderThumb={({ props }) => (
                      <div
                        {...props}
                        className="h-4 w-4 rounded-full bg-white shadow flex justify-center items-center"
                        style={{
                          ...props.style,
                          boxShadow: "0px 2px 6px #AAA",
                        }}
                      >
                        <div className="h-2 w-2 bg-[#4A0E78] rounded-full" />
                      </div>
                    )}
                  />
                  <div className="flex justify-between mt-2">
                    <span>${budget[0]}</span>
                    <span>${budget[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Set trip preferences and interests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Type</label>
                <Select value={groupType} onValueChange={setGroupType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="couple">Couple</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Travel Style</label>
                <Select value={travelStyle} onValueChange={setTravelStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select travel style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="party">Party/Nightlife</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Travel Pace</label>
                <Select value={pace} onValueChange={setPace}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow & Relaxed</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="fast">Fast-paced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Interests</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                      checked={interests.includes(interest.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setInterests([...interests, interest.id]);
                        } else {
                          setInterests(interests.filter((i) => i !== interest.id));
                        }
                      }}
                      className="w-4 h-4 text-[#4A0E78] border-gray-300 rounded focus:ring-[#4A0E78] focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">{interest.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itinerary</CardTitle>
            <CardDescription>Plan the daily activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Day {day.dayNumber}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddPlace(dayIndex)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Place
                  </Button>
                </div>

                {day.places.map((place, placeIndex) => (
                  <div key={placeIndex} className="border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <Input
                          value={place.name}
                          onChange={(e) => {
                            const updatedDays = [...days];
                            updatedDays[dayIndex].places[placeIndex].name = e.target.value;
                            setDays(updatedDays);
                          }}
                          placeholder="Place name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Type</label>
                        <Select
                          value={place.type}
                          onValueChange={(value: "attraction" | "restaurant") => {
                            const updatedDays = [...days];
                            updatedDays[dayIndex].places[placeIndex].type = value;
                            setDays(updatedDays);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attraction">Attraction</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Input
                          value={place.description}
                          onChange={(e) => {
                            const updatedDays = [...days];
                            updatedDays[dayIndex].places[placeIndex].description = e.target.value;
                            setDays(updatedDays);
                          }}
                          placeholder="Description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <Input
                          value={place.location}
                          onChange={(e) => {
                            const updatedDays = [...days];
                            updatedDays[dayIndex].places[placeIndex].location = e.target.value;
                            setDays(updatedDays);
                          }}
                          placeholder="Location"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Time of Day</label>
                        <Input
                          value={place.timeOfDay}
                          onChange={(e) => {
                            const updatedDays = [...days];
                            updatedDays[dayIndex].places[placeIndex].timeOfDay = e.target.value;
                            setDays(updatedDays);
                          }}
                          placeholder="e.g., Morning, Afternoon, Evening"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Duration</label>
                        <Input
                          value={place.duration}
                          onChange={(e) => {
                            const updatedDays = [...days];
                            updatedDays[dayIndex].places[placeIndex].duration = e.target.value;
                            setDays(updatedDays);
                          }}
                          placeholder="e.g., 2 hours"
                        />
                      </div>

                      {place.type === "restaurant" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-2">Cuisine</label>
                            <Input
                              value={place.cuisine}
                              onChange={(e) => {
                                const updatedDays = [...days];
                                updatedDays[dayIndex].places[placeIndex].cuisine = e.target.value;
                                setDays(updatedDays);
                              }}
                              placeholder="Cuisine type"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Price Range</label>
                            <Input
                              value={place.priceRange}
                              onChange={(e) => {
                                const updatedDays = [...days];
                                updatedDays[dayIndex].places[placeIndex].priceRange = e.target.value;
                                setDays(updatedDays);
                              }}
                              placeholder="e.g., $, $$, $$$"
                            />
                          </div>
                        </>
                      )}

                      {place.type === "attraction" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Category</label>
                          <Input
                            value={place.category}
                            onChange={(e) => {
                              const updatedDays = [...days];
                              updatedDays[dayIndex].places[placeIndex].category = e.target.value;
                              setDays(updatedDays);
                            }}
                            placeholder="Attraction category"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium mb-2">Transportation</label>
                  <Input
                    value={day.transportation}
                    onChange={(e) => {
                      const updatedDays = [...days];
                      updatedDays[dayIndex].transportation = e.target.value;
                      setDays(updatedDays);
                    }}
                    placeholder="Transportation details"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddDay}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Day
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accommodations</CardTitle>
            <CardDescription>Add accommodation details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accommodations.map((acc, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={acc.name}
                      onChange={(e) => {
                        const updatedAcc = [...accommodations];
                        updatedAcc[index].name = e.target.value;
                        setAccommodations(updatedAcc);
                      }}
                      placeholder="Accommodation name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <Input
                      value={acc.type}
                      onChange={(e) => {
                        const updatedAcc = [...accommodations];
                        updatedAcc[index].type = e.target.value;
                        setAccommodations(updatedAcc);
                      }}
                      placeholder="e.g., Hotel, Resort, Villa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={acc.rating}
                      onChange={(e) => {
                        const updatedAcc = [...accommodations];
                        updatedAcc[index].rating = parseFloat(e.target.value);
                        setAccommodations(updatedAcc);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Price per Night</label>
                    <Input
                      type="number"
                      min="0"
                      value={acc.pricePerNight}
                      onChange={(e) => {
                        const updatedAcc = [...accommodations];
                        updatedAcc[index].pricePerNight = parseFloat(e.target.value);
                        setAccommodations(updatedAcc);
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Input
                      value={acc.description}
                      onChange={(e) => {
                        const updatedAcc = [...accommodations];
                        updatedAcc[index].description = e.target.value;
                        setAccommodations(updatedAcc);
                      }}
                      placeholder="Accommodation description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Booking URL</label>
                    <Input
                      value={acc.bookingUrl}
                      onChange={(e) => {
                        const updatedAcc = [...accommodations];
                        updatedAcc[index].bookingUrl = e.target.value;
                        setAccommodations(updatedAcc);
                      }}
                      placeholder="Booking website URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <Input
                      value={acc.image}
                      onChange={(e) => {
                        const updatedAcc = [...accommodations];
                        updatedAcc[index].image = e.target.value;
                        setAccommodations(updatedAcc);
                      }}
                      placeholder="Image URL"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Amenities</label>
                    <Input
                      value={acc.amenities.join(", ")}
                      onChange={(e) => {
                        const updatedAcc = [...accommodations];
                        updatedAcc[index].amenities = e.target.value.split(",").map(a => a.trim());
                        setAccommodations(updatedAcc);
                      }}
                      placeholder="Comma-separated amenities"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddAccommodation}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Accommodation
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#4A0E78] text-white hover:bg-[#3A0B5E]"
          >
            {isSubmitting ? "Creating..." : "Create Trip"}
          </Button>
        </div>
      </form>
    </div>
  );
}