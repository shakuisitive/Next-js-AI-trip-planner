"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { getTrips, createPlace } from "@/actions";

interface Trip {
  id: string;
  tourName: string;
  days: {
    dayNumber: number;
  }[];
}

const generateRandomData = () => {
  const placeTypes = ["attraction", "restaurant"];
  const placeNames = [
    "Eiffel Tower",
    "Louvre Museum",
    "Notre Dame",
    "Arc de Triomphe",
    "Montmartre",
    "Champs-Élysées",
    "Sacre Coeur",
    "Palace of Versailles",
    "Disneyland Paris",
    "Centre Pompidou",
  ];
  const descriptions = [
    "A must-visit landmark with stunning views",
    "Famous cultural site with rich history",
    "Iconic architectural masterpiece",
    "Popular tourist destination",
    "Historic monument with beautiful surroundings",
  ];
  const locations = [
    "Paris, France",
    "London, UK",
    "Rome, Italy",
    "Barcelona, Spain",
    "Amsterdam, Netherlands",
  ];
  const timeOfDays = ["Morning", "Afternoon", "Evening", "Night"];
  const durations = ["1 hour", "2 hours", "3 hours", "4 hours", "Full day"];
  const cuisines = ["French", "Italian", "Spanish", "Mediterranean", "International"];
  const priceRanges = ["$", "$$", "$$$", "$$$$"];
  const categories = ["Museum", "Landmark", "Park", "Gallery", "Historical Site"];
  const images = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
  ];

  return {
    type: placeTypes[Math.floor(Math.random() * placeTypes.length)],
    name: placeNames[Math.floor(Math.random() * placeNames.length)],
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    timeOfDay: timeOfDays[Math.floor(Math.random() * timeOfDays.length)],
    duration: durations[Math.floor(Math.random() * durations.length)],
    image: images[Math.floor(Math.random() * images.length)],
    cuisine: cuisines[Math.floor(Math.random() * cuisines.length)],
    priceRange: priceRanges[Math.floor(Math.random() * priceRanges.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
  };
};

export default function PlaceCreatePage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [name, setName] = useState("");
  const [type, setType] = useState<"attraction" | "restaurant">("attraction");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const result = await getTrips();
        if (result.success && result.trips) {
          setTrips(result.trips as unknown as Trip[]);
          // Auto-select first trip and its first day
          if (result.trips.length > 0) {
            const firstTrip = result.trips[0];
            setSelectedTripId(firstTrip.id);
            if (firstTrip.days && firstTrip.days.length > 0) {
              setSelectedDayNumber(firstTrip.days[0].dayNumber);
            }
          }
        } else {
          toast.error("Failed to fetch trips");
        }
      } catch (error) {
        toast.error("An error occurred while fetching trips");
      }
    };

    fetchTrips();
  }, []);

  // Auto-fill form with random data when component mounts
  useEffect(() => {
    const randomData = generateRandomData();
    setName(randomData.name);
    setType(randomData.type as "attraction" | "restaurant");
    setDescription(randomData.description);
    setLocation(randomData.location);
    setTimeOfDay(randomData.timeOfDay);
    setDuration(randomData.duration);
    setImage(randomData.image);
    setCuisine(randomData.cuisine);
    setPriceRange(randomData.priceRange);
    setCategory(randomData.category);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createPlace({
        name,
        type,
        description,
        location,
        timeOfDay,
        duration,
        image,
        tripId: selectedTripId,
        dayNumber: selectedDayNumber,
        ...(type === "restaurant" && {
          cuisine,
          priceRange,
        }),
        ...(type === "attraction" && {
          category,
        }),
      });

      if (result.success) {
        toast.success("Place created successfully");
        router.push("/dashboard/places");
      } else {
        toast.error(result.error || "Failed to create place");
      }
    } catch (error) {
      toast.error("An error occurred while creating place");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
  const availableDays = selectedTrip?.days || [];

  // Reset selected day number when trip changes
  useEffect(() => {
    if (selectedTrip && selectedTrip.days.length > 0) {
      setSelectedDayNumber(selectedTrip.days[0].dayNumber);
    }
  }, [selectedTripId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create Place</h1>
          <p className="text-muted-foreground">Add a new place to a trip</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic information for the place
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Trip</label>
                <Select
                  value={selectedTripId}
                  onValueChange={setSelectedTripId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a trip" />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.tourName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Day Number
                </label>
                <Select
                  value={selectedDayNumber.toString()}
                  onValueChange={(value) =>
                    setSelectedDayNumber(parseInt(value))
                  }
                  disabled={!selectedTripId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDays.map((day) => (
                      <SelectItem
                        key={day.dayNumber}
                        value={day.dayNumber.toString()}
                      >
                        Day {day.dayNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Place name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select
                  value={type}
                  onValueChange={(value: "attraction" | "restaurant") =>
                    setType(value)
                  }
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
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Location
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Time of Day
                </label>
                <Input
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  placeholder="e.g., Morning, Afternoon, Evening"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration
                </label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 2 hours"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URL
                </label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Image URL for the place"
                />
              </div>

              {type === "restaurant" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cuisine
                    </label>
                    <Input
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      placeholder="Cuisine type"
                      required
                    />
                  </div>

                  <div>
                    <label className="label text-sm font-medium mb-2">
                      Price Range
                    </label>
                    <Input
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      placeholder="e.g., $, $$, $$$"
                      required
                    />
                  </div>
                </>
              )}

              {type === "attraction" && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Attraction category"
                    required
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !selectedTripId}
            className="bg-slate-800 hover:bg-slate-700 text-white"
          >
            {isSubmitting ? "Creating..." : "Create Place"}
          </Button>
        </div>
      </form>
    </div>
  );
}
