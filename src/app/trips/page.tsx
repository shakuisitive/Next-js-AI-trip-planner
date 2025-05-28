import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

async function AllTrips() {
  const session = await auth();
  console.log("the session is here:", session);

  let allTrips = await prisma.trip.findMany({
    where: {
      userId: "6836eaafcab6730aae4e7ac3",
    },
  });

  let allTripsIds = allTrips.map((tour: { id: string }) => tour.id);

  try {
    let fetchedTrip = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/trips/6836f4dccab6730aae4e7ac6`
    );
  } catch (e: any) {
    console.log(e.message, "here the problem");
  }
  return <div>AllTours</div>;
}

export default AllTrips;
