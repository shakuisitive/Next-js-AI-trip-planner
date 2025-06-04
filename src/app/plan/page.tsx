"use client";
import { Suspense, useCallback } from "react";
import { useSearchParams, ReadonlyURLSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TripPlan from "@/components/TripPlan";
import LoadingAnimation from "@/components/LoadingAnimation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TripPlan as TripPlanType } from "@/types";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useCredentialsLoggedInChecker,
  useCredentialsLoggedInData,
} from "@/lib/credentialsAuth/credentialsLoggedInChecker";

const useGeneratePlan = (searchParams: ReadonlyURLSearchParams) => {
  const [plan, setPlan] = useState<TripPlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  let loggedInViaCredentials = useCredentialsLoggedInChecker();
  let loggedInViaCredentialsUserInfo = useCredentialsLoggedInData();

  useEffect(() => {
    if (status === "unauthenticated" && !loggedInViaCredentials) {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  const generatePlanWithRetry = useCallback(
    async (retries = 3) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const groupType = searchParams.get("groupType");
          const travelStyle = searchParams.get("travelStyle");
          const pace = searchParams.get("pace");
          const interestsRaw = searchParams.get("interests");

          // Convert comma-separated interests into array
          const interests = interestsRaw
            ? interestsRaw.split(",").map(decodeURIComponent)
            : [];

          const response = await fetch("/api/generatePlan", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              destination: searchParams.get("destination"),
              startDate: searchParams.get("startDate"),
              endDate: searchParams.get("endDate"),
              budgetMin: Number(searchParams.get("budgetMin")),
              budgetMax: Number(searchParams.get("budgetMax")),
              groupType,
              travelStyle,
              pace,
              interests,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setPlan(data.plan);
          setLoading(false);
          return;
        } catch (error) {
          console.error(`Attempt ${attempt} failed:`, error);
          if (attempt === retries) {
            setError(
              error instanceof Error ? error.message : "Failed to generate plan"
            );
            setLoading(false);
          }
        }
      }
    },
    [searchParams, router]
  );

  useEffect(() => {
    generatePlanWithRetry();
  }, [generatePlanWithRetry]);

  return { plan, loading, error };
};

const PlanContent = () => {
  const searchParams = useSearchParams();
  const { plan, loading, error } = useGeneratePlan(searchParams);
  const { data: session, status } = useSession();
  const router = useRouter();
  let loggedInViaCredentials = useCredentialsLoggedInChecker();
  let loggedInViaCredentialsUserInfo = useCredentialsLoggedInData();

  const groupType = searchParams.get("groupType");
  const travelStyle = searchParams.get("travelStyle");
  const pace = searchParams.get("pace");
  const interestsRaw = searchParams.get("interests");

  const interests = interestsRaw
    ? interestsRaw.split(",").map(decodeURIComponent)
    : [];

  let inputData = {
    destination: searchParams.get("destination"),
    startDate: searchParams.get("startDate"),
    endDate: searchParams.get("endDate"),
    budgetMin: Number(searchParams.get("budgetMin")),
    budgetMax: Number(searchParams.get("budgetMax")),
    groupType,
    travelStyle,
    pace,
    interests,
  };

  let dataToPushInDb = {
    ...inputData,
    userId: loggedInViaCredentials
      ? loggedInViaCredentialsUserInfo?.id
      : session?.user?.id,
    plan: plan,
  };

  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [tourName, setTourName] = useState("");
  const [showTourNameInput, setShowTourNameInput] = useState(false);

  const handleBookTrip = async () => {
    if (!session?.user?.id && !loggedInViaCredentials) {
      router.push("/api/auth/signin");
      return;
    }

    if (!showTourNameInput) {
      setShowTourNameInput(true);
      return;
    }

    if (tourName && tourName.length < 4) {
      setBookingError("Tour name must be at least 4 characters long");
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/bookTrip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Credentials-User-Id": loggedInViaCredentials ? loggedInViaCredentialsUserInfo?.id || "" : "",
          "X-Credentials-Auth": loggedInViaCredentials ? "true" : "false"
        } as HeadersInit,
        body: JSON.stringify({
          ...dataToPushInDb,
          tourName: tourName || `${searchParams.get("destination")} Trip`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book trip");
      }

      const data = await response.json();
      router.push(`/trips/${data.tripId}`);
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Failed to book trip"
      );
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="relative h-[200px] sm:h-[250px] md:h-[300px]">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80"
            alt="Destination"
            className="absolute inset-0 w-full h-full object-cover"
            layout="fill"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 sm:mb-4 text-center">
              Trip itinerary
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {loading ? (
            <LoadingAnimation />
          ) : error ? (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : plan ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
                Your Travel Itinerary
              </h2>
              <TripPlan plan={plan} />
              <div className="mt-8 flex flex-col items-center gap-4">
                {showTourNameInput ? (
                  <div className="w-full max-w-md">
                    <input
                      type="text"
                      value={tourName}
                      onChange={(e) => setTourName(e.target.value)}
                      placeholder="Enter a name for your tour (optional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {tourName.length > 0 && tourName.length < 4
                        ? "Tour name must be at least 4 characters long"
                        : "Leave empty to use default name"}
                    </p>
                  </div>
                ) : null}
                <button
                  onClick={handleBookTrip}
                  disabled={isBooking}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking
                    ? "Booking..."
                    : showTourNameInput
                    ? "Confirm Booking"
                    : "Book This Trip"}
                </button>
              </div>
              {bookingError && (
                <div className="mt-4 text-center text-red-600">
                  {bookingError}
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default function PlanPage() {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      <PlanContent />
    </Suspense>
  );
}
