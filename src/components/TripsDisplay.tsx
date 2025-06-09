"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Plane,
} from "lucide-react";

interface Trip {
  id: string;
  tourName: string;
  destination: string;
  startDate: string;
  endDate: string;
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
    image: string;
  }[];
  days: {
    dayNumber: number;
    places: {
      name: string;
      type: string;
      description: string;
      timeOfDay: string;
      duration: string;
      image: string;
    }[];
  }[];
}

interface TripsDisplayProps {
  trips: Trip[];
}

export default function TripsDisplay({ trips }: TripsDisplayProps) {
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleTrip = (tripId: string) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
          <div className="p-4 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Trips Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't created any trips yet. Start planning your next
            adventure!
          </p>
          <Link
            href="/create-trip"
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
          >
            Create Your First Trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <Link href={`/trips/${trip.id}`} className="block">
            <div className="relative h-48">
              <Image
                src={trip.accommodations[0]?.image || "/placeholder-trip.jpg"}
                alt={trip.tourName}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-xl font-bold text-white mb-2">
                  {trip.tourName}
                </h2>
                <div className="flex items-center text-white/90">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{trip.destination}</span>
                </div>
              </div>
            </div>
          </Link>

          <div className="p-6">
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
            </div>
            <div className="flex items-center text-gray-600 mb-4">
              <Users className="w-4 h-4 mr-2" />
              <span>{trip.preferences.groupType}</span>
            </div>

            <button
              onClick={() => toggleTrip(trip.id)}
              className="w-full flex items-center justify-between text-purple-600 hover:text-purple-800"
            >
              <span>View Details</span>
              {expandedTrip === trip.id ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {expandedTrip === trip.id && (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {trip.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                      >
                        {interest.interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Accommodation</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">
                      {trip.accommodations[0]?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {trip.accommodations[0]?.type}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Daily Itinerary</h3>
                  <div className="space-y-3">
                    {trip.days.map((day) => (
                      <div
                        key={day.dayNumber}
                        className="bg-gray-50 p-3 rounded-lg"
                      >
                        <h4 className="font-medium mb-2">
                          Day {day.dayNumber}
                        </h4>
                        <div className="space-y-2">
                          {day.places.map((place, index) => (
                            <div key={index} className="flex items-start">
                              <Clock className="w-4 h-4 mt-1 mr-2 text-gray-500" />
                              <div>
                                <p className="font-medium">{place.name}</p>
                                <p className="text-sm text-gray-600">
                                  {place.timeOfDay} ({place.duration})
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
