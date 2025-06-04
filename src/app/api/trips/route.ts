import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const credentialsUserId = request.headers.get("X-Credentials-User-Id");
    const isCredentialsAuth =
      request.headers.get("X-Credentials-Auth") === "true";

    // Check if user is authenticated via either method
    const userId =
      session?.user?.id || (isCredentialsAuth ? credentialsUserId : null);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trips = await prisma.trip.findMany({
      where: {
        userId,
        status: true, // Only get non-deleted trips
      },
      include: {
        preferences: true,
        interests: true,
        feedback: true,
      },
      orderBy: {
        startDate: "desc", // Most recent trips first
      },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}
