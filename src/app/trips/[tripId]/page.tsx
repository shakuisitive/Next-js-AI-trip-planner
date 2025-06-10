"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Star,
  ChevronRight,
  Utensils,
  Camera,
  Plane,
  Bed,
  Wifi,
  Car,
  Coffee,
  Waves,
  Shield,
  Heart,
  Share2,
  Download,
  Send,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingAnimation from "@/components/LoadingAnimation";
import {
  useCredentialsLoggedInChecker,
  useCredentialsLoggedInData,
} from "@/lib/credentialsAuth/credentialsLoggedInChecker";
import { useSession } from "next-auth/react";

interface TripFeedback {
  id: string;
  rating: number;
  review: string;
  suggestion?: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface Trip {
  id: string;
  tourName: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetMin: number;
  budgetMax: number;
  preferences: {
    groupType: string;
    travelStyle: string;
    pace: string;
  };
  interests: { interest: string }[];
  accommodations: {
    name: string;
    type: string;
    rating: number;
    pricePerNight: number;
    description: string;
    bookingUrl: string;
    image: string;
    amenities: { name: string }[];
  }[];
  days: {
    dayNumber: number;
    date: string;
    places: {
      name: string;
      type: string;
      description: string;
      location: string;
      timeOfDay: string;
      duration: string;
      image: string;
      restaurant?: {
        cuisine: string;
        priceRange: string;
      };
      attraction?: {
        category: string;
      };
    }[];
    transportation: {
      description: string;
    };
  }[];
  tourStatus?: string;
  feedback?: TripFeedback;
}
export default function TripPage() {
  const params = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [showAllDays, setShowAllDays] = useState(false);
  const [feedback, setFeedback] = useState<TripFeedback | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  let session = useSession();
  let loggedInViaCredentials = useCredentialsLoggedInChecker();
  let loggedInViaCredentialsUserInfo = useCredentialsLoggedInData();

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(`/api/trips/${params.tripId}`, {
          headers: {
            "X-Credentials-User-Id": loggedInViaCredentials
              ? loggedInViaCredentialsUserInfo?.id || ""
              : "",
            "X-Credentials-Auth": loggedInViaCredentials ? "true" : "false",
          } as HeadersInit,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch trip");
        }
        const data = await response.json();
        setTrip(data);

        // Fetch feedback if trip is completed
        if (data.tourStatus === "Completed") {
          const feedbackResponse = await fetch(
            `/api/trips/${params.tripId}/feedback`,
            {
              headers: {
                "X-Credentials-User-Id": loggedInViaCredentials
                  ? loggedInViaCredentialsUserInfo?.id || ""
                  : "",
                "X-Credentials-Auth": loggedInViaCredentials ? "true" : "false",
              } as HeadersInit,
            }
          );
          if (feedbackResponse.ok) {
            const feedbackData = await feedbackResponse.json();
            setFeedback(feedbackData);
          }
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch trip"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [params.tripId]);

  if (loading) return <LoadingAnimation />;
  if (error) return <div>Error: {error}</div>;
  if (!trip) return <div>Trip not found</div>;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getDurationInDays = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase();
    if (name.includes("wifi") || name.includes("internet"))
      return <Wifi className="w-4 h-4" />;
    if (name.includes("pool") || name.includes("waves"))
      return <Waves className="w-4 h-4" />;
    if (name.includes("parking") || name.includes("car"))
      return <Car className="w-4 h-4" />;
    if (name.includes("breakfast") || name.includes("coffee"))
      return <Coffee className="w-4 h-4" />;
    if (name.includes("security") || name.includes("safe"))
      return <Shield className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  const getPlaceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "restaurant":
        return <Utensils className="w-5 h-5 text-orange-500" />;
      case "attraction":
        return <Camera className="w-5 h-5 text-blue-500" />;
      default:
        return <MapPin className="w-5 h-5 text-purple-500" />;
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackError(null);

    try {
      const response = await fetch(`/api/trips/${params.tripId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          review,
          suggestion,
          userId: loggedInViaCredentials
            ? loggedInViaCredentialsUserInfo?.id
            : session?.data?.user?.id,
          loggedInType: loggedInViaCredentials ? "credentials" : "google",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      const data = await response.json();
      setFeedback(data);
      setReview("");
      setSuggestion("");
    } catch (error) {
      setFeedbackError(
        error instanceof Error ? error.message : "Failed to submit feedback"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F3F4F6]">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-[500px] overflow-hidden">
          {trip.accommodations[0]?.image ? (
            <img
              src={trip.accommodations[0].image}
              alt={trip.tourName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
              alt={trip.tourName}
              className="absolute inset-0 w-full h-full object-cover"
              layout="fill"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="max-w-4xl mx-auto w-full text-white">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#2563EB]/80 backdrop-blur-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {trip.destination}
                </span>
                <span
                  className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                    trip.tourStatus === "Pending Approval"
                      ? "bg-[#F59E0B]/80 text-white"
                      : trip.tourStatus === "Scheduled"
                      ? "bg-[#2563EB]/80 text-white"
                      : "bg-[#059669]/80 text-white"
                  }`}
                >
                  {trip.tourStatus || "Pending Approval"}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                {trip.tourName}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {getDurationInDays()} Days
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />${trip.budgetMin} - $
                  {trip.budgetMax}
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {trip.preferences.groupType}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-8 right-8 flex gap-3">
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Trip Stats Cards */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E5E7EB] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#2563EB]/10 rounded-xl">
                    <Calendar className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <span className="text-2xl font-bold text-[#1F2937]">
                    {getDurationInDays()}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-1">Duration</h3>
                <p className="text-sm text-[#6B7280]">
                  {formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E5E7EB] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#2563EB]/10 rounded-xl">
                    <DollarSign className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <span className="text-2xl font-bold text-[#1F2937]">
                    ${trip.budgetMin}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-1">Budget Range</h3>
                <p className="text-sm text-[#6B7280]">
                  ${trip.budgetMin} - ${trip.budgetMax}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E5E7EB] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#2563EB]/10 rounded-xl">
                    <Users className="w-6 h-6 text-[#2563EB]" />
                  </div>
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-1">Group Type</h3>
                <p className="text-sm text-[#6B7280] capitalize">
                  {trip.preferences.groupType}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E5E7EB] hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-[#2563EB]/10 rounded-xl">
                    <Clock className="w-6 h-6 text-[#2563EB]" />
                  </div>
                </div>
                <h3 className="font-semibold text-[#1F2937] mb-1">Travel Style</h3>
                <p className="text-sm text-[#6B7280] capitalize">
                  {trip.preferences.travelStyle}
                </p>
              </div>
            </div>
          </section>

          {/* Interests Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#1F2937]">Trip Highlights</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {trip.interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-[#2563EB]/10 text-[#2563EB] rounded-full text-sm font-medium"
                >
                  {interest.interest}
                </span>
              ))}
            </div>
          </section>

          {/* Accommodations Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#1F2937]">Where You'll Stay</h2>
              <div className="flex items-center text-[#2563EB]">
                <Bed className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {trip.accommodations.length} Properties
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {trip.accommodations.map((accommodation, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {accommodation.image && (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={accommodation.image}
                        alt={accommodation.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                        <Star className="w-4 h-4 text-[#F59E0B] mr-1" />
                        <span className="font-semibold text-sm">
                          {accommodation.rating}
                        </span>
                      </div>
                      <div className="absolute top-4 left-4 bg-[#2563EB]/90 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-sm font-medium capitalize">
                          {accommodation.type}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#1F2937] mb-2">
                      {accommodation.name}
                    </h3>
                    <p className="text-[#6B7280] mb-4 line-clamp-2">
                      {accommodation.description}
                    </p>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {accommodation.amenities?.map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-[#F3F4F6] text-[#6B7280] rounded-full text-sm"
                        >
                          {getAmenityIcon(amenity.name)}
                          {amenity.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      {accommodation.bookingUrl && (
                        <a
                          href={accommodation.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#2563EB] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1E40AF] transition-all duration-300"
                        >
                          Learn More
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Itinerary Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#1F2937]">Your Itinerary</h2>
              <button
                onClick={() => setShowAllDays(!showAllDays)}
                className="flex items-center gap-2 text-[#2563EB] hover:text-[#1E40AF] transition-colors"
              >
                <span className="font-semibold">
                  {showAllDays ? "Show Single Day" : "See All Days"}
                </span>
                <ChevronRight
                  className={`w-5 h-5 transition-transform ${
                    showAllDays ? "rotate-90" : ""
                  }`}
                />
              </button>
            </div>

            {/* Day Navigation */}
            {!showAllDays && (
              <div className="flex overflow-x-auto pb-4 mb-8 gap-4">
                {trip.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setActiveDay(day.dayNumber)}
                    className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeDay === day.dayNumber
                        ? "bg-[#2563EB] text-white shadow-lg"
                        : "bg-white text-[#6B7280] hover:bg-[#F3F4F6] shadow-md"
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold">Day {day.dayNumber}</div>
                      <div className="text-xs mt-1">
                        {formatShortDate(day.date)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Day Content */}
            {showAllDays ? (
              // Show all days
              <div className="space-y-8">
                {trip.days.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="bg-white rounded-2xl shadow-lg p-8"
                  >
                    <div className="flex items-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                        {day.dayNumber}
                      </div>
                      <div className="ml-6">
                        <h3 className="text-2xl font-bold text-[#1F2937]">
                          Day {day.dayNumber}
                        </h3>
                        <p className="text-[#6B7280]">{formatDate(day.date)}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {day.places.map((place, index) => (
                        <div
                          key={index}
                          className="group relative bg-[#F3F4F6] rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex items-start gap-6">
                            {place.image && (
                              <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                                <img
                                  src={place.image}
                                  alt={place.name}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              </div>
                            )}

                            <div className="flex-grow">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  {getPlaceTypeIcon(place.type)}
                                  <h4 className="font-bold text-xl text-[#1F2937]">
                                    {place.name}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-[#2563EB]/10 text-[#2563EB] px-3 py-1 rounded-full text-sm font-medium">
                                    {place.timeOfDay}
                                  </span>
                                  <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                                </div>
                              </div>

                              <p className="text-[#6B7280] mb-4 leading-relaxed">
                                {place.description}
                              </p>

                              <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] mb-4">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1 text-[#2563EB]" />
                                  <span>{place.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1 text-[#2563EB]" />
                                  <span>{place.duration}</span>
                                </div>
                              </div>

                              {place.type === "restaurant" && place.restaurant && (
                                <div className="bg-[#F97316]/10 rounded-xl p-4 border border-[#F97316]/20">
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center">
                                      <Utensils className="w-4 h-4 mr-1 text-[#F97316]" />
                                      <span className="font-medium">Cuisine:</span>
                                      <span className="ml-1">{place.restaurant.cuisine}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <DollarSign className="w-4 h-4 mr-1 text-[#F97316]" />
                                      <span className="font-medium">Price:</span>
                                      <span className="ml-1">{place.restaurant.priceRange}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {place.type === "attraction" && place.attraction && (
                                <div className="bg-[#2563EB]/10 rounded-xl p-4 border border-[#2563EB]/20">
                                  <div className="flex items-center text-sm">
                                    <Camera className="w-4 h-4 mr-1 text-[#2563EB]" />
                                    <span className="font-medium">Category:</span>
                                    <span className="ml-1">{place.attraction.category}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {day.transportation && (
                        <div className="mt-8 bg-[#2563EB]/10 rounded-2xl p-6 border border-[#2563EB]/20">
                          <div className="flex items-center mb-3">
                            <div className="p-2 bg-[#2563EB]/20 rounded-lg mr-3">
                              <Car className="w-5 h-5 text-[#2563EB]" />
                            </div>
                            <h4 className="font-bold text-lg text-[#1F2937]">
                              Transportation
                            </h4>
                          </div>
                          <p className="text-[#6B7280] leading-relaxed">
                            {day.transportation.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Show single day
              trip.days.map(
                (day) =>
                  activeDay === day.dayNumber && (
                    <div
                      key={day.dayNumber}
                      className="bg-white rounded-2xl shadow-lg p-8"
                    >
                      <div className="flex items-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                          {day.dayNumber}
                        </div>
                        <div className="ml-6">
                          <h3 className="text-2xl font-bold text-[#1F2937]">
                            Day {day.dayNumber}
                          </h3>
                          <p className="text-[#6B7280]">{formatDate(day.date)}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {day.places.map((place, index) => (
                          <div
                            key={index}
                            className="group relative bg-[#F3F4F6] rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start gap-6">
                              {place.image && (
                                <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
                                  <Image
                                    src={place.image}
                                    alt={place.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="transition-transform duration-300 group-hover:scale-110"
                                  />
                                </div>
                              )}

                              <div className="flex-grow">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    {getPlaceTypeIcon(place.type)}
                                    <h4 className="font-bold text-xl text-[#1F2937]">
                                      {place.name}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="bg-[#2563EB]/10 text-[#2563EB] px-3 py-1 rounded-full text-sm font-medium">
                                      {place.timeOfDay}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                                  </div>
                                </div>

                                <p className="text-[#6B7280] mb-4 leading-relaxed">
                                  {place.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280] mb-4">
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1 text-[#2563EB]" />
                                    <span>{place.location}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1 text-[#2563EB]" />
                                    <span>{place.duration}</span>
                                  </div>
                                </div>

                                {place.type === "restaurant" && place.restaurant && (
                                  <div className="bg-[#F97316]/10 rounded-xl p-4 border border-[#F97316]/20">
                                    <div className="flex items-center gap-4 text-sm">
                                      <div className="flex items-center">
                                        <Utensils className="w-4 h-4 mr-1 text-[#F97316]" />
                                        <span className="font-medium">Cuisine:</span>
                                        <span className="ml-1">{place.restaurant.cuisine}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <DollarSign className="w-4 h-4 mr-1 text-[#F97316]" />
                                        <span className="font-medium">Price:</span>
                                        <span className="ml-1">{place.restaurant.priceRange}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {place.type === "attraction" && place.attraction && (
                                  <div className="bg-[#2563EB]/10 rounded-xl p-4 border border-[#2563EB]/20">
                                    <div className="flex items-center text-sm">
                                      <Camera className="w-4 h-4 mr-1 text-[#2563EB]" />
                                      <span className="font-medium">Category:</span>
                                      <span className="ml-1">{place.attraction.category}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                        {day.transportation && (
                          <div className="mt-8 bg-[#2563EB]/10 rounded-2xl p-6 border border-[#2563EB]/20">
                            <div className="flex items-center mb-3">
                              <div className="p-2 bg-[#2563EB]/20 rounded-lg mr-3">
                                <Car className="w-5 h-5 text-[#2563EB]" />
                              </div>
                              <h4 className="font-bold text-lg text-[#1F2937]">
                                Transportation
                              </h4>
                            </div>
                            <p className="text-[#6B7280] leading-relaxed">
                              {day.transportation.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
              )
            )}
          </section>
        </div>

        {trip.tourStatus === "Completed" && (
          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-[#1F2937]">
                  Your Trip Experience
                </h2>
                {feedback && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-[#059669]/10 text-[#059669]">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Feedback Submitted
                  </span>
                )}
              </div>

              {feedback ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-[#2563EB]/10 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#2563EB]/20 flex items-center justify-center">
                      <Star className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1F2937]">Your Rating</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < feedback.rating
                                ? "text-[#F59E0B] fill-current"
                                : "text-[#E5E7EB]"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-[#1F2937] mb-2">
                        Your Review
                      </h3>
                      <div className="bg-[#F3F4F6] rounded-xl p-4">
                        <p className="text-[#6B7280] whitespace-pre-wrap">
                          {feedback.review}
                        </p>
                      </div>
                    </div>

                    {feedback.suggestion && (
                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-2">
                          Your Private Suggestion
                        </h3>
                        <div className="bg-[#F3F4F6] rounded-xl p-4">
                          <p className="text-[#6B7280] whitespace-pre-wrap">
                            {feedback.suggestion}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-[#6B7280]">
                    Submitted on{" "}
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div className="bg-[#2563EB]/10 rounded-xl p-6">
                    <label className="block text-sm font-medium text-[#1F2937] mb-4">
                      How would you rate your experience?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          className="focus:outline-none transform hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-10 h-10 ${
                              value <= rating
                                ? "text-[#F59E0B] fill-current"
                                : "text-[#E5E7EB]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="review"
                      className="block text-sm font-medium text-[#1F2937] mb-2"
                    >
                      Share Your Experience
                    </label>
                    <textarea
                      id="review"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={4}
                      className="p-4 w-full rounded-xl border-[#E5E7EB] shadow-sm focus:border-[#2563EB] focus:ring-[#2563EB]"
                      placeholder="Tell us about your trip experience..."
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="suggestion"
                      className="block text-sm font-medium text-[#1F2937] mb-2"
                    >
                      Private Suggestion (Optional)
                    </label>
                    <textarea
                      id="suggestion"
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      rows={3}
                      className="p-4 w-full rounded-xl border-[#E5E7EB] shadow-sm focus:border-[#2563EB] focus:ring-[#2563EB]"
                      placeholder="Share any suggestions to help us improve..."
                    />
                    <p className="mt-1 text-sm text-[#6B7280]">
                      This will only be visible to our team
                    </p>
                  </div>

                  {feedbackError && (
                    <div className="text-[#DC2626] text-sm bg-[#FEF2F2] p-3 rounded-lg">
                      {feedbackError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-[#2563EB] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit Your Feedback
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
