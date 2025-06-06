"use server";

import { prisma } from "@/lib/db/prisma";

export async function getPastFunctions(userId: { userId: any }) {
  const pastTours = await prisma.trip.findMany({
    where: {
      userId,
      status: true, // Only get non-deleted trips
      tourStatus: "Completed", // Only get completed trips
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

  return pastTours;
}
