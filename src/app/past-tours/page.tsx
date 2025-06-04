"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/lib/auth/getAuthUser";
import { useCredentials } from "@/context/CredentialsContext";
import Image from "next/image";
import { MapPin, Calendar, DollarSign, Star } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Trip {
  id: string;
  tourName: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetMin: number;
  budgetMax: number;
  tourStatus: string;
  feedback?: {
    rating: number;
    review: string;
  };
}

function PastToursPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { credentialsLoggedInUserInfo, loggedInViaCrdentials } =
    useCredentials();
  const authUser = useAuthUser();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("/api/trips", {
          headers: {
            "X-Credentials-User-Id": loggedInViaCrdentials
              ? credentialsLoggedInUserInfo?.id || ""
              : "",
            "X-Credentials-Auth": loggedInViaCrdentials ? "true" : "false",
          } as HeadersInit,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch trips");
        }

        const data = await response.json();
        // Filter only completed trips
        const completedTrips = data.filter(
          (trip: Trip) => trip.tourStatus === "Completed"
        );
        setTrips(completedTrips);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch trips"
        );
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchTrips();
    }
  }, [authUser, credentialsLoggedInUserInfo, loggedInViaCrdentials]);

  if (loading)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          Loading...
        </div>
        <Footer />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-red-500 text-center p-4">{error}</div>
        </div>
        <Footer />
      </div>
    );
  if (!authUser)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center p-4">
            Please log in to view your past tours
          </div>
        </div>
        <Footer />
      </div>
    );
  if (trips.length === 0)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center p-4">No completed trips found</div>
        </div>
        <Footer />
      </div>
    );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Your Past Tours
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link href={`/trips/${trip.id}`} key={trip.id}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48">
                    <Image
                      src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
                      alt={trip.tourName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {trip.destination}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {trip.tourName}
                    </h2>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Budget: ${trip.budgetMin} - ${trip.budgetMax}
                      </span>
                    </div>
                    {trip.feedback && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          Rated {trip.feedback.rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PastToursPage;
