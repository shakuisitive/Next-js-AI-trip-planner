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
import Chatbot from "@/components/Chatbot";
import Cookies from "js-cookie";
import { getPastFunctions } from "./actions/getPastTrips";
import { X, MessageCircle } from "lucide-react";

function removeImages(data: any) {
  return {
    accommodations: data?.accommodations?.map(
      ({ image, bookingUrl, ...rest }: { image: string; bookingUrl: string }) =>
        rest
    ),
    days: data?.days?.map((day: string) => ({
      ...day,
      places: day.places.map(({ image, bookingUrl, ...rest }) => rest),
    })),
  };
}

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

          let userId = "";

          if (session?.status === undefined && loggedInViaCredentials) {
            userId = String(loggedInViaCredentialsUserInfo?.id);
          }

          if (session?.status && !loggedInViaCredentials) {
            userId = String(session?.user?.id);
          }

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
              userId,
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
  const [showChat, setShowChat] = useState(true);

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

  const [pastTrips, setPastTrips] = useState<any>(null);

  useEffect(() => {
    (async function () {
      let pastTrips = await getPastFunctions(
        loggedInViaCredentials
          ? loggedInViaCredentialsUserInfo?.id
          : session?.user?.id
      );

      setPastTrips(pastTrips);
    })();
  }, []);

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
          "X-Credentials-User-Id": loggedInViaCredentials
            ? loggedInViaCredentialsUserInfo?.id || ""
            : "",
          "X-Credentials-Auth": loggedInViaCredentials ? "true" : "false",
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

      // setWeatherString(Cookies.get("weather-string"));
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
          <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] opacity-80" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 sm:mb-4 text-center">
              Trip Itinerary
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 sm:py-12">
          {loading ? (
            <LoadingAnimation />
          ) : error ? (
            <div
              className="bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : plan ? (
            <>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-[#1F2937]">
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
                      className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
                    />
                    <p className="mt-1 text-sm text-[#6B7280]">
                      {tourName.length > 0 && tourName.length < 4
                        ? "Tour name must be at least 4 characters long"
                        : "Leave empty to use default name"}
                    </p>
                  </div>
                ) : null}
                <button
                  onClick={handleBookTrip}
                  disabled={isBooking}
                  className="bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_4px_rgba(37,99,235,0.25)]"
                >
                  {isBooking
                    ? "Booking..."
                    : showTourNameInput
                    ? "Confirm Booking"
                    : "Book This Trip"}
                </button>
              </div>
              {bookingError && (
                <div className="mt-4 text-center text-[#DC2626]">
                  {bookingError}
                </div>
              )}
            </>
          ) : null}
        </div>
      </main>

      {/* Chatbot Section */}
      <div className="relative">
        {showChat ? (
          <div className="fixed bottom-6 right-6 w-full max-w-[500px] h-[600px] bg-white rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-[#E5E7EB] z-50 transition-all duration-300 ease-in-out flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-[#E5E7EB] bg-[#2563EB] rounded-t-lg">
              <h3 className="font-semibold text-white">Travel Assistant</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-white/80 hover:text-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Chatbot
                weather={Cookies.get("weather-string")}
                inputData={inputData}
                generatedTours={removeImages(plan)}
                pastTours={pastTrips}
              />
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowChat(true)}
            className="fixed bottom-6 right-6 bg-[#7C3AED] text-white p-4 rounded-full shadow-[0_4px_6px_rgba(124,58,237,0.25)] hover:bg-[#6D28D9] transition-all duration-200 z-50 hover:scale-105"
            aria-label="Open chat"
          >
            <MessageCircle size={24} />
          </button>
        )}
      </div>

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
