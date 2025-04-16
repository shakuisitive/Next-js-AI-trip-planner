import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Accommodation,
  DayPlan,
  TravelPlanRequest,
  TripPlan,
  Place,
} from "@/types";
import { getPlacePhoto } from "./googlePlaces";
import { aiConfig } from "@/config/ai-config";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyDUW5C3uJb4pMQ_Adie5lxqJVbpUvgEY9U"
);

const DEBUG = true; // Toggle debugging

// Add this interface to type the debug data
interface DebugData {
  prompt?: string;
  response?: unknown;
  error?: string;
  duration?: string;
  totalDuration?: string;
  numberOfDays?: number;
  numberOfChunks?: number;
  destination?: string;
  startDate?: string;
  endDate?: string;
  budgetMin?: number;
  budgetMax?: number;
  [key: string]: unknown; // Allow for additional properties
}

function logDebug(message: string, data?: DebugData) {
  if (DEBUG) {
    console.log("\n=================");
    console.log(message);
    if (data) console.log(JSON.stringify(data, null, 2));
    console.log("=================\n");
  }
}

const requestCache = new Map<string, Promise<TripPlan>>();

export async function generateTravelPlanWithGemini(
  request: TravelPlanRequest
): Promise<TripPlan> {
  // Create a unique key for this request
  const requestKey = JSON.stringify({
    destination: request.destination,
    startDate: request.startDate,
    endDate: request.endDate,
    budgetMin: request.budgetMin,
    budgetMax: request.budgetMax,
  });

  // Check if this exact request is already in progress
  if (requestCache.has(requestKey)) {
    logDebug("Returning cached request");
    return requestCache.get(requestKey)!;
  }

  const promise = generatePlan(request);
  requestCache.set(requestKey, promise);

  // Clean up cache after request completes
  promise.finally(() => {
    requestCache.delete(requestKey);
  });

  return promise;
}

// Move the existing function logic here
async function generatePlan(request: TravelPlanRequest): Promise<TripPlan> {
  const totalStartTime = Date.now();
  // Convert request to DebugData type
  const debugData: DebugData = {
    destination: request.destination,
    startDate: request.startDate,
    endDate: request.endDate,
    budgetMin: request.budgetMin,
    budgetMax: request.budgetMax,
  };
  logDebug("Starting travel plan generation", debugData);

  const { destination, startDate, endDate, budgetMin, budgetMax } = request;
  const model = genAI.getGenerativeModel({ model: aiConfig.models.gemini });

  // First request: Get accommodations
  const accommodationsPrompt = `Suggest exactly 4 DIFFERENT and UNIQUE hotels/places to stay in ${destination} with a budget range of ${budgetMin} to ${budgetMax}, each with distinct characteristics:
1. A high-end luxury option
2. A mid-range option with excellent reviews
3. A budget-friendly option with good value
4. A unique or boutique option

Each accommodation must have a different name and different price point.

Return ONLY a valid JSON object with NO additional text, following this EXACT structure:
{
  "accommodations": [
    {
      "name": "string",
      "type": "Luxury | Mid-range | Budget-friendly | Unique/Boutique",
      "rating": number,
      "pricePerNight": number,
      "description": "string",
      "amenities": ["string"],
      "bookingUrl": "string"
    }
  ]
}`;

  // Second request: Get itinerary in chunks of 3 days
  const numberOfDays = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 3600 * 24)
  );
  const chunkSize = 3;
  const chunks = Math.ceil(numberOfDays / chunkSize);
  const currentDate = new Date(startDate);

  // Global set to track all place names across the entire itinerary
  const globalPlaceNames = new Set<string>();
  const globalRestaurantNames = new Set<string>();

  async function getItineraryChunk(
    startDay: number,
    numDays: number,
    chunkStartDate: Date
  ) {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      const chunkStartTime = Date.now();

      // Create a list of already used places to explicitly exclude
      const excludedPlacesText =
        globalPlaceNames.size > 0
          ? `IMPORTANT - DO NOT INCLUDE these already used places (they've already been visited earlier in the trip): ${Array.from(
              globalPlaceNames
            ).join(", ")}.`
          : "";

      const excludedRestaurantsText =
        globalRestaurantNames.size > 0
          ? `IMPORTANT - DO NOT INCLUDE these already visited restaurants: ${Array.from(
              globalRestaurantNames
            ).join(", ")}.`
          : "";

      const chunkPrompt = `Create a ${numDays}-day itinerary for days ${startDay}-${
        startDay + numDays - 1
      } of a trip to ${destination}.
    
    ${excludedPlacesText}
    ${excludedRestaurantsText}
    
    Each day MUST include EXACTLY:
    - 2 attractions/activities (with descriptions, locations, and durations)
    - 2 restaurants:
      * One for lunch/brunch (timeOfDay should be "afternoon")
      * One for dinner (timeOfDay should be "evening")
    - Transportation suggestions
    
    FOR ALL ENTRIES (both attractions and restaurants):
    - Include "duration" field estimating time needed (e.g., "1-2 hours" for attractions, "1-1.5 hours" for meals)
    - Restaurant durations should reflect typical meal times
    
    EVERY restaurant and attraction name MUST BE COMPLETELY UNIQUE across the ENTIRE trip, not just within this chunk.
    
    Return ONLY a valid JSON object with NO additional text, following this EXACT structure:
    {
      "days": [
        {
          "day": number,
          "date": "YYYY-MM-DD",
          "places": [
            {
              "name": "string",
              "type": "attraction | restaurant",
              "description": "string",
              "location": "string",
              "timeOfDay": "morning | afternoon | evening",
              "duration": "string", // REQUIRED FOR ALL ENTRIES
              "cuisine": "string (only for restaurants)",
              "priceRange": "string (only for restaurants)"
            }
          ],
          "transportation": "string"
        }
      ]
    }`;

      logDebug(
        `Generating chunk for days ${startDay}-${
          startDay + numDays - 1
        } (Attempt ${retryCount + 1})`,
        {
          prompt: chunkPrompt,
        }
      );

      try {
        const result = await model.generateContent(chunkPrompt);
        const response = await result.response;
        const text = response.text();
        const chunk = JSON.parse(cleanResponseText(text));

        // Check for duplicates within this chunk and against global places
        let hasDuplicates = false;
        const chunkPlaceNames = new Set<string>();

        for (const day of chunk.days) {
          for (const place of day.places) {
            // Check if this place name already exists globally
            if (globalPlaceNames.has(place.name.trim())) {
              logDebug(`Duplicate place found: ${place.name}`);
              hasDuplicates = true;
              break;
            }

            // Check for duplicates within this chunk
            if (chunkPlaceNames.has(place.name.trim())) {
              logDebug(`Duplicate place within chunk: ${place.name}`);
              hasDuplicates = true;
              break;
            }

            chunkPlaceNames.add(place.name.trim());
          }
          if (hasDuplicates) break;
        }

        if (hasDuplicates) {
          retryCount++;
          if (retryCount >= maxRetries) {
            throw new Error(
              `Failed to generate unique places after ${maxRetries} attempts`
            );
          }
          continue; // Retry the chunk generation
        }

        // If we got here, no duplicates were found, so add all places to the global set
        for (const day of chunk.days) {
          for (const place of day.places) {
            globalPlaceNames.add(place.name.trim());
            if (place.type === "restaurant") {
              globalRestaurantNames.add(place.name.trim());
            }
          }
        }

        const chunkDuration = Date.now() - chunkStartTime;
        logDebug(`Chunk ${startDay}-${startDay + numDays - 1} completed`, {
          duration: `${chunkDuration}ms`,
          response: chunk,
        });

        // Update dates for this chunk
        chunk.days.forEach((day: DayPlan) => {
          day.date = new Date(
            chunkStartDate.getTime() +
              (day.day - startDay) * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0];
        });

        return chunk;
      } catch (error) {
        logDebug(`Error generating chunk (Attempt ${retryCount + 1}):`, {
          error,
        });
        retryCount++;

        if (retryCount >= maxRetries) {
          throw new Error(
            `Failed to generate chunk after ${maxRetries} attempts: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }
    }

    throw new Error(
      "Failed to generate itinerary chunk after multiple attempts"
    );
  }

  try {
    logDebug("Generating accommodations with prompt:", {
      prompt: accommodationsPrompt,
    });

    const accommodationsJson = await model
      .generateContent(accommodationsPrompt)
      .then(async (result) => {
        const response = await result.response;
        const json = JSON.parse(cleanResponseText(response.text()));
        logDebug("Accommodations response:", json);
        validateAccommodations(json.accommodations);
        return json;
      });

    // Generate day chunks sequentially to ensure we can properly track all used places
    const dayChunks = [];
    for (let i = 0; i < chunks; i++) {
      const startDay = i * chunkSize + 1;
      const remainingDays = numberOfDays - i * chunkSize;
      const daysInChunk = Math.min(chunkSize, remainingDays);
      const chunkDate = new Date(
        currentDate.getTime() + i * chunkSize * 24 * 60 * 60 * 1000
      );

      const chunk = await getItineraryChunk(startDay, daysInChunk, chunkDate);
      dayChunks.push(chunk);
    }

    const fullPlan = {
      accommodations: accommodationsJson.accommodations,
      days: dayChunks
        .flatMap((chunk) => chunk.days)
        .sort((a, b) => a.day - b.day),
    };

    logDebug("Starting image processing");
    await processImagesInParallel(fullPlan, destination);

    // Verify that there are no duplicates in the final plan
    verifyNoDuplicates(fullPlan);

    // Add this line to validate and organize the plan
    validateAndOrganizePlan(fullPlan);

    const totalDuration = Date.now() - totalStartTime;
    logDebug("Travel plan generation completed", {
      totalDuration: `${totalDuration}ms`,
      numberOfDays,
      numberOfChunks: chunks,
      totalUniqueNames: globalPlaceNames.size,
    });

    return fullPlan;
  } catch (error) {
    logDebug("Error generating plan:", {
      error:
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error", // Fallback for other error types
    });
    throw error;
  }
}

function verifyNoDuplicates(plan: TripPlan) {
  const allPlaceNames = new Set<string>();
  const duplicates: string[] = [];

  for (const day of plan.days) {
    for (const place of day.places) {
      if (allPlaceNames.has(place.name)) {
        duplicates.push(place.name);
      } else {
        allPlaceNames.add(place.name);
      }
    }
  }

  if (duplicates.length > 0) {
    logDebug("WARNING: Duplicate places found in final plan", { duplicates });

    // Create a count map to find all duplicates
    const nameCount = new Map<string, number>();
    for (const day of plan.days) {
      for (const place of day.places) {
        nameCount.set(place.name, (nameCount.get(place.name) || 0) + 1);
      }
    }

    // Log all duplicates with their counts
    const duplicatesWithCounts = Array.from(nameCount.entries())
      .filter(([_, count]) => count > 1)
      .map(([name, count]) => `${name} (${count} times)`);

    logDebug("Duplicate places with counts:", { duplicatesWithCounts });

    throw new Error(`Found duplicate places in plan: ${duplicates.join(", ")}`);
  }

  logDebug("No duplicates found in final plan", {
    totalUniquePlaces: allPlaceNames.size,
    totalPlaces: plan.days.reduce((sum, day) => sum + day.places.length, 0),
  });
}

function validateAccommodations(accommodations: Accommodation[]) {
  if (!accommodations || accommodations.length !== 4) {
    throw new Error("Must have exactly 4 accommodations");
  }

  const requiredTypes: Accommodation["type"][] = [
    "Luxury",
    "Mid-range",
    "Budget-friendly",
    "Unique/Boutique",
  ];
  const types = accommodations.map((a) => a.type);
  if (!requiredTypes.every((type) => types.includes(type))) {
    throw new Error("Accommodations must include all required types");
  }

  // Check for unique names
  const names = new Set(accommodations.map((a) => a.name));
  if (names.size !== 4) {
    throw new Error("All accommodations must have unique names");
  }

  // Validate price range
  const prices = accommodations.map((a) => a.pricePerNight);
  if (new Set(prices).size !== 4) {
    throw new Error("All accommodations must have different price points");
  }

  // Ensure prices align with types
  const luxuryOption = accommodations.find((a) => a.type === "Luxury");
  const budgetOption = accommodations.find((a) => a.type === "Budget-friendly");
  if (
    luxuryOption &&
    budgetOption &&
    luxuryOption.pricePerNight <= budgetOption.pricePerNight
  ) {
    throw new Error("Luxury option must be more expensive than budget option");
  }

  return true;
}

function cleanResponseText(text: string): string {
  return text
    .replace(/```json\n?|\n?```/g, "")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .trim();
}

async function processImagesInParallel(plan: TripPlan, destination: string) {
  const imagePromises = [
    // Process accommodation images
    ...plan.accommodations.map(async (accommodation) => {
      const image = await getPlacePhoto({
        name: accommodation.name,
        city: destination,
        type: "accommodation",
      });
      accommodation.image = image || undefined; // Convert null to undefined
    }),

    // Process place images
    ...plan.days.flatMap((day) => [
      ...day.places.map(async (place) => {
        const image = await getPlacePhoto({
          name: place.name,
          location: place.location,
          city: destination,
          type: place.type as "attraction" | "restaurant",
        });
        place.image = image || undefined; // Convert null to undefined
      }),
    ]),
  ];

  await Promise.all(imagePromises);
}

function validateAndOrganizePlan(plan: TripPlan) {
  validateAccommodations(plan.accommodations);

  for (const day of plan.days) {
    // Add duration validation for all places
    for (const place of day.places) {
      if (!place.duration || typeof place.duration !== "string") {
        throw new Error(
          `Missing duration for ${place.type} "${place.name}" in day ${day.day}`
        );
      }
    }

    const attractions = day.places.filter((p) => p.type === "attraction");
    const restaurants = day.places.filter((p) => p.type === "restaurant");

    if (attractions.length < 2) {
      throw new Error(`Day ${day.day} must have exactly 2 attractions`);
    }

    if (restaurants.length < 2) {
      throw new Error(`Day ${day.day} must have exactly 2 restaurants`);
    }

    // Ensure proper meal timing
    const lunchOptions = restaurants.filter(
      (r) => r.timeOfDay === "afternoon" || r.timeOfDay === "morning"
    );
    const dinnerOptions = restaurants.filter((r) => r.timeOfDay === "evening");

    if (lunchOptions.length === 0) {
      const firstRestaurant = restaurants[0];
      firstRestaurant.timeOfDay = "afternoon";
    }

    if (dinnerOptions.length === 0) {
      const lastRestaurant = restaurants[restaurants.length - 1];
      lastRestaurant.timeOfDay = "evening";
    }

    // Sort places by time of day
    day.places.sort((a, b) => {
      const timeOrder = { morning: 0, afternoon: 1, evening: 2 };
      return timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay];
    });
  }
}
