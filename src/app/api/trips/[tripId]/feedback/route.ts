import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  const { rating, review, suggestion, userId, loggedInType } = await request.json();
  try {
    const session = await auth();
    if (!session?.user?.id && loggedInType !== "credentials") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    console.log('hey the user id is', userId);
    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!review || review.trim().length === 0) {
      return NextResponse.json(
        { error: "Review is required" },
        { status: 400 }
      );
    }

    // Check if trip exists and is completed
    const trip = await prisma.trip.findUnique({
      where: { id: params.tripId },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.tourStatus !== "Completed") {
      return NextResponse.json(
        { error: "Feedback can only be submitted for completed trips" },
        { status: 400 }
      );
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.tripFeedback.findUnique({
      where: { tripId: params.tripId },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "Feedback already exists for this trip" },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await prisma.tripFeedback.create({
      data: {
        tripId: params.tripId,
        userId: userId,
        rating,
        review,
        suggestion,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { tripId: string } }
) {
  try {
    // Check for credentials auth first
    const credentialsAuth = request.headers.get("X-Credentials-Auth");
    const credentialsUserId = request.headers.get("X-Credentials-User-Id");

    // If not using credentials, check OAuth
    if (credentialsAuth !== "true") {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const feedback = await prisma.tripFeedback.findUnique({
      where: { tripId: params.tripId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 