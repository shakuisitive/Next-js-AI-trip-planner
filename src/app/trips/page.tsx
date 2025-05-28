import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "../../../node_modules/next/server";

async function AllTrips() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be authorized to get the data.");
  }

  let allTrips = await prisma.trip.findMany({
    where: {
      userId: session?.user?.id,
    },
  });

  let allTripsIds = allTrips.map((tour: { id: string }) => tour.id);

  try {
    let allToursData = [];

    for (let i = 0; i < allTripsIds.length; i++) {
      let fetchedTrip = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/getAllTrips/?tripId=${allTripsIds[i]}`,
        { method: "GET" }
      );
      const tripData = await fetchedTrip.json();
      allToursData.push(tripData);
    }
    console.log("here is all the tour data", allToursData.length);
  } catch (e: any) {
    console.log(e.message, "here the problem");
  }
  return <div>AllTours</div>;
}

export default AllTrips;
