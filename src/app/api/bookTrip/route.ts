import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {

  try {
    const session = await auth();
    const credentialsUserId = request.headers.get("X-Credentials-User-Id");
    const isCredentialsAuth = request.headers.get("X-Credentials-Auth") === "true";

    // Check if user is authenticated via either method
    const isAuthenticated = 
      session?.user?.id || 
      (isCredentialsAuth && credentialsUserId);

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      destination,
      startDate,
      endDate,
      budgetMin,
      budgetMax,
      groupType,
      travelStyle,
      pace,
      interests,
      plan,
      tourName,
      userId,
    } = body;

    // Validate required fields
    if (
      !destination ||
      !startDate ||
      !endDate ||
      !budgetMin ||
      !budgetMax ||
      !groupType ||
      !travelStyle ||
      !pace
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!plan?.days || !Array.isArray(plan.days) || plan.days.length === 0) {
      return NextResponse.json(
        { error: "Invalid plan data: days are missing or empty" },
        { status: 400 }
      );
    }

    // Validate each day's data
    for (const day of plan.days) {
      if (!day.places || !Array.isArray(day.places)) {
        return NextResponse.json(
          { error: `Invalid places data for day ${day.day}` },
          { status: 400 }
        );
      }

      for (const place of day.places) {
        if (
          !place.name ||
          !place.type ||
          !place.description ||
          !place.location ||
          !place.timeOfDay ||
          !place.duration
        ) {
          return NextResponse.json(
            {
              error: `Missing required fields for place ${place.name} in day ${day.day}`,
            },
            { status: 400 }
          );
        }

        if (
          place.type === "restaurant" &&
          (!place.cuisine || !place.priceRange)
        ) {
          return NextResponse.json(
            {
              error: `Missing cuisine or price range for restaurant ${place.name} in day ${day.day}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Validate tour name if provided
    if (tourName && tourName.length < 4) {
      return NextResponse.json(
        { error: "Tour name must be at least 4 characters long" },
        { status: 400 }
      );
    }

    let dataToCreateATrip = {
      data: {
        userId,
        tourName: tourName || `${destination} Trip`,
        destination,
        tourStatus: "Pending Approval",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budgetMin,
        budgetMax,
        preferences: {
          create: {
            groupType,
            travelStyle,
            pace,
          },
        },
        interests: {
          create: interests.map((interest: string) => ({
            interest,
          })),
        },
        days: {
          create: plan.days.map((day: any, index: number) => ({
            dayNumber: index + 1,
            date: new Date(
              new Date(startDate).getTime() + index * 24 * 60 * 60 * 1000
            ),
            places: {
              create: day.places.map((place: any) => ({
                name: place.name,
                type: place.type,
                description: place.description,
                location: place.location,
                timeOfDay: place.timeOfDay,
                duration: place.duration,
                image: place.image,
                ...(place.type === "restaurant" && {
                  restaurant: {
                    create: {
                      cuisine: place.cuisine,
                      priceRange: place.priceRange,
                    },
                  },
                }),
                ...(place.type === "attraction" && {
                  attraction: {
                    create: {
                      category: place.category || "General",
                    },
                  },
                }),
              })),
            },
            transportation: {
              create: {
                description: day.transportation,
              },
            },
          })),
        },
        accommodations: {
          create: plan.accommodations.map((acc: any) => ({
            name: acc.name,
            type: acc.type,
            rating: acc.rating,
            pricePerNight: acc.pricePerNight,
            description: acc.description,
            bookingUrl: acc.bookingUrl,
            image: acc.image,
            amenities: {
              create: acc.amenities.map((amenity: string) => ({
                name: amenity,
              })),
            },
          })),
        },
      },
    }

    console.log("Copy this data and pass", dataToCreateATrip)
    
    // Write the data to a file in a readable format
    const dataString = JSON.stringify(dataToCreateATrip, null, 2);
    const filePath = path.join(process.cwd(), 'trip-data.txt');
    fs.writeFileSync(filePath, dataString);
    console.log(`Data written to ${filePath}`);

    // Create the main trip record
    const trip = await prisma.trip.create(dataToCreateATrip);

    return NextResponse.json({ tripId: trip.id });
  } catch (error) {
    console.error("Error booking trip:", error);
    return NextResponse.json({ error: "Failed to book trip" }, { status: 500 });
  }
}
