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
  Waves ,
  Shield,
  Heart,
  Share2,
  Download,
  Send
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingAnimation from "@/components/LoadingAnimation";

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

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(`/api/trips/${params.tripId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch trip");
        }
        const data = await response.json();
        setTrip(data);
        
        // Fetch feedback if trip is completed
        if (data.tourStatus === "Completed") {
          const feedbackResponse = await fetch(`/api/trips/${params.tripId}/feedback`);
          if (feedbackResponse.ok) {
            const feedbackData = await feedbackResponse.json();
            setFeedback(feedbackData);
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch trip");
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
    if (name.includes('wifi') || name.includes('internet')) return <Wifi className="w-4 h-4" />;
    if (name.includes('pool') || name.includes('waves')) return <Waves className="w-4 h-4" />;
    if (name.includes('parking') || name.includes('car')) return <Car className="w-4 h-4" />;
    if (name.includes('breakfast') || name.includes('coffee')) return <Coffee className="w-4 h-4" />;
    if (name.includes('security') || name.includes('safe')) return <Shield className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  const getPlaceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'restaurant':
        return <Utensils className="w-5 h-5 text-orange-500" />;
      case 'attraction':
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
      setFeedbackError(error instanceof Error ? error.message : "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        {/* Enhanced Hero Section */}
        <div className="relative h-[500px] overflow-hidden">
          <Image
            src={trip.accommodations[0]?.image || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"}
            alt={trip.tourName}
            className="absolute inset-0 w-full h-full object-cover"
            layout="fill"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <div className="max-w-4xl mx-auto w-full text-white">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-600/80 backdrop-blur-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {trip.destination}
                </span>
                <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${
                  trip.tourStatus === "Pending Approval" 
                    ? "bg-yellow-500/80 text-white" 
                    : trip.tourStatus === "Scheduled"
                    ? "bg-blue-500/80 text-white"
                    : "bg-green-500/80 text-white"
                }`}>
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
                  <DollarSign className="w-5 h-5 mr-2" />
                  ${trip.budgetMin} - ${trip.budgetMax}
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
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{getDurationInDays()}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Duration</h3>
                <p className="text-sm text-gray-600">
                  {formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">${trip.budgetMin}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Budget Range</h3>
                <p className="text-sm text-gray-600">
                  ${trip.budgetMin} - ${trip.budgetMax}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Group Type</h3>
                <p className="text-sm text-gray-600 capitalize">{trip.preferences.groupType}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Travel Style</h3>
                <p className="text-sm text-gray-600 capitalize">{trip.preferences.travelStyle}</p>
              </div>
            </div>
          </section>

          {/* Interests Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Trip Highlights</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {trip.interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {interest.interest}
                </span>
              ))}
            </div>
          </section>

          {/* Enhanced Accommodations */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Where You'll Stay</h2>
              <div className="flex items-center text-purple-600">
                <Bed className="w-5 h-5 mr-2" />
                <span className="font-medium">{trip.accommodations.length} Properties</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {trip.accommodations.map((accommodation, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  {accommodation.image && (
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={accommodation.image}
                        alt={accommodation.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-semibold text-sm">{accommodation.rating}</span>
                      </div>
                      <div className="absolute top-4 left-4 bg-purple-600/90 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white text-sm font-medium capitalize">{accommodation.type}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{accommodation.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{accommodation.description}</p>
                    
                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {accommodation.amenities.slice(0, 4).map((amenity, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                        >
                          {getAmenityIcon(amenity.name)}
                          <span>{amenity.name}</span>
                        </div>
                      ))}
                      {accommodation.amenities.length > 4 && (
                        <span className="text-xs text-gray-500 px-3 py-1">
                          +{accommodation.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${accommodation.pricePerNight}
                        </span>
                        <span className="text-gray-600 text-sm">/night</span>
                      </div>
                      {accommodation.bookingUrl && (
                        <a
                          href={accommodation.bookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300"
                        >
                          Book Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Enhanced Daily Itinerary */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Daily Itinerary</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-purple-600">
                  <Plane className="w-5 h-5 mr-2" />
                  <span className="font-medium">{trip.days.length} Days Planned</span>
                </div>
                <button
                  onClick={() => setShowAllDays(!showAllDays)}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <span className="font-medium">{showAllDays ? "Show Single Day" : "See All Days"}</span>
                  <ChevronRight className={`w-5 h-5 transition-transform ${showAllDays ? 'rotate-90' : ''}`} />
                </button>
              </div>
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
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-bold">Day {day.dayNumber}</div>
                      <div className="text-xs mt-1">{formatShortDate(day.date)}</div>
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
                  <div key={day.dayNumber} className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                        {day.dayNumber}
                      </div>
                      <div className="ml-6">
                        <h3 className="text-2xl font-bold text-gray-900">Day {day.dayNumber}</h3>
                        <p className="text-gray-600 text-lg">{formatDate(day.date)}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {day.places.map((place, index) => (
                        <div
                          key={index}
                          className="group relative bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
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
                                  <h4 className="font-bold text-xl text-gray-900">{place.name}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {place.timeOfDay}
                                  </span>
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-4 leading-relaxed">{place.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1 text-purple-500" />
                                  <span>{place.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1 text-purple-500" />
                                  <span>{place.duration}</span>
                                </div>
                              </div>

                              {place.type === "restaurant" && place.restaurant && (
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center">
                                      <Utensils className="w-4 h-4 mr-1 text-orange-500" />
                                      <span className="font-medium">Cuisine:</span>
                                      <span className="ml-1">{place.restaurant.cuisine}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <DollarSign className="w-4 h-4 mr-1 text-orange-500" />
                                      <span className="font-medium">Price:</span>
                                      <span className="ml-1">{place.restaurant.priceRange}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {place.type === "attraction" && place.attraction && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                  <div className="flex items-center text-sm">
                                    <Camera className="w-4 h-4 mr-1 text-blue-500" />
                                    <span className="font-medium">Category:</span>
                                    <span className="ml-1">{place.attraction.category}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {day.transportation && (
                      <div className="mt-8 bg-purple-50 rounded-2xl p-6 border border-purple-100">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg mr-3">
                            <Car className="w-5 h-5 text-purple-600" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">Transportation</h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{day.transportation.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Show single day
              trip.days.map((day) => (
                activeDay === day.dayNumber && (
                  <div key={day.dayNumber} className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                        {day.dayNumber}
                      </div>
                      <div className="ml-6">
                        <h3 className="text-2xl font-bold text-gray-900">Day {day.dayNumber}</h3>
                        <p className="text-gray-600 text-lg">{formatDate(day.date)}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {day.places.map((place, index) => (
                        <div
                          key={index}
                          className="group relative bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
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
                                  <h4 className="font-bold text-xl text-gray-900">{place.name}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {place.timeOfDay}
                                  </span>
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                              </div>
                              
                              <p className="text-gray-700 mb-4 leading-relaxed">{place.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1 text-purple-500" />
                                  <span>{place.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1 text-purple-500" />
                                  <span>{place.duration}</span>
                                </div>
                              </div>

                              {place.type === "restaurant" && place.restaurant && (
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center">
                                      <Utensils className="w-4 h-4 mr-1 text-orange-500" />
                                      <span className="font-medium">Cuisine:</span>
                                      <span className="ml-1">{place.restaurant.cuisine}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <DollarSign className="w-4 h-4 mr-1 text-orange-500" />
                                      <span className="font-medium">Price:</span>
                                      <span className="ml-1">{place.restaurant.priceRange}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {place.type === "attraction" && place.attraction && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                  <div className="flex items-center text-sm">
                                    <Camera className="w-4 h-4 mr-1 text-blue-500" />
                                    <span className="font-medium">Category:</span>
                                    <span className="ml-1">{place.attraction.category}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {day.transportation && (
                      <div className="mt-8 bg-purple-50 rounded-2xl p-6 border border-purple-100">
                        <div className="flex items-center mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg mr-3">
                            <Car className="w-5 h-5 text-purple-600" />
                          </div>
                          <h4 className="font-bold text-lg text-gray-900">Transportation</h4>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{day.transportation.description}</p>
                      </div>
                    )}
                  </div>
                )
              ))
            )}
          </section>
        </div>

        {trip.tourStatus === "Completed" && (
          <section className="max-w-7xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Your Trip Experience</h2>
                {feedback && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Feedback Submitted
                  </span>
                )}
              </div>
              
              {feedback ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Your Rating</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < feedback.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Your Review</h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{feedback.review}</p>
                      </div>
                    </div>

                    {feedback.suggestion && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Your Private Suggestion</h3>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-700 whitespace-pre-wrap">{feedback.suggestion}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div className="bg-purple-50 rounded-xl p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
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
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="review"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Share Your Experience
                    </label>
                    <textarea
                      id="review"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={4}
                      className="p-4 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      placeholder="Tell us about your trip experience..."
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="suggestion"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Private Suggestion (Optional)
                    </label>
                    <textarea
                      id="suggestion"
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      rows={3}
                      className="p-4 w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      placeholder="Share any suggestions to help us improve..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      This will only be visible to our team
                    </p>
                  </div>

                  {feedbackError && (
                    <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      {feedbackError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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