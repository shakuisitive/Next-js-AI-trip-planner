import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";
export async function GET(request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const tripIdSeachQuery = searchParams.get("tripId");

  try {
    const trip = await prisma.trip.findUnique({
      where: {
        status: true,
        id: tripIdSeachQuery,
      },
      include: {
        preferences: true,
        interests: true,
        accommodations: {
          include: {
            amenities: true,
          },
        },
        days: {
          include: {
            places: {
              include: {
                restaurant: true,
                attraction: true,
              },
            },
            transportation: true,
          },
          orderBy: {
            dayNumber: "asc",
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    console.log(trip);

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}
