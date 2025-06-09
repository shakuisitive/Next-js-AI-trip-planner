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
import { getTrips, createAccommodation } from "@/actions";
import { Star } from "lucide-react";

interface Trip {
  id: string;
  tourName: string;
}

export default function AccommodationCreatePage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [rating, setRating] = useState(0);
  const [pricePerNight, setPricePerNight] = useState(0);
  const [description, setDescription] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [image, setImage] = useState("");
  const [amenities, setAmenities] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      const result = await getTrips();
      if (result.success && result.trips) {
        setTrips(result.trips);
      }
    };
    fetchTrips();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await createAccommodation({
        name,
        type,
        tripId: selectedTripId,
        rating,
        pricePerNight,
        description,
        bookingUrl: bookingUrl || undefined,
        image: image || undefined,
        amenities: amenities.split(",").map(a => a.trim()).filter(a => a),
      });

      if (result.success) {
        toast.success("Accommodation created successfully");
        router.push("/dashboard/accommodations");
      } else {
        toast.error("Failed to create accommodation");
      }
    } catch (error) {
      toast.error("An error occurred while creating accommodation");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center">
        {Array.from({ length: fullStars }, (_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <Star className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />}
        <span className="ml-1 text-sm">({rating})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Create Accommodation</h1>
          <p className="text-muted-foreground">
            Add a new accommodation option
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic information for the accommodation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Trip</label>
                <Select value={selectedTripId} onValueChange={setSelectedTripId}>
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
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter accommodation name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hotel">Hotel</SelectItem>
                    <SelectItem value="Resort">Resort</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Guest House">Guest House</SelectItem>
                    <SelectItem value="Hostel">Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <Button
                      key={r}
                      type="button"
                      variant={rating === r ? "default" : "outline"}
                      onClick={() => setRating(r)}
                      className={`w-10 h-10 p-0 ${
                        rating === r 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "hover:bg-slate-100"
                      }`}
                    >
                      {r}
                    </Button>
                  ))}
                </div>
                {rating > 0 && (
                  <div className="mt-2">
                    {renderStars(rating)}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price per Night</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    min="0"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="pl-7"
                    placeholder="Enter price per night"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Booking URL</label>
                <Input
                  value={bookingUrl}
                  onChange={(e) => setBookingUrl(e.target.value)}
                  placeholder="Enter booking website URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Enter image URL"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter accommodation description"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Amenities</label>
                <Input
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  placeholder="Enter amenities separated by commas (e.g., WiFi, Pool, Spa)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSubmitting ? "Creating..." : "Create Accommodation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
