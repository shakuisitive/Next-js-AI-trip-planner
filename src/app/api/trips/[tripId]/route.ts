import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    const session = await auth();
    const credentialsUserId = request.headers.get("X-Credentials-User-Id");
    const isCredentialsAuth =
      request.headers.get("X-Credentials-Auth") === "true";

    // Check if user is authenticated via either method
    const isAuthenticated =
      session?.user?.id || (isCredentialsAuth && credentialsUserId);

    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // const testingTrip = await prisma.trip.findUnique({
    //   where: {
    //     id: params.tripId,
    //   },
    //   include: {
    //     preferences: true,
    //     interests: true,
    //     accommodations: {
    //       include: {
    //         amenities: true,
    //       },
    //     },
    //     days: {
    //       include: {
    //         places: {
    //           include: {
    //             restaurant: true,
    //             attraction: true,
    //           },
    //         },
    //         transportation: true,
    //       },
    //       orderBy: {
    //         dayNumber: "asc",
    //       },
    //     },
    //   },
    // });

    // console.log("here is the data buddy", testingTrip);

    const trip = await prisma.trip.findUnique({
      where: {
        id: params.tripId,
      },
      include: {
        preferences: true,
        interests: true,
        accommodations: {
          where: {
            status: true,
          },
          include: {
            amenities: true,
          },
        },
        days: {
          include: {
            places: {
              where: {
                status: true,
              },
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

    // Check if the trip belongs to the current user
    const userId = session?.user?.id || credentialsUserId;
    if (trip.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}
