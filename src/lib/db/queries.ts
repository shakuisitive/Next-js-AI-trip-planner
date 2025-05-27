import { prisma } from "./prisma.js";
import { Prisma } from "@prisma/client";

type TripWithRelations = Prisma.TripGetPayload<{
  include: {
    preferences: true;
    interests: true;
    accommodations: {
      include: {
        amenities: true;
      };
    };
    days: {
      include: {
        places: {
          include: {
            restaurant: true;
            attraction: true;
          };
        };
        transportation: true;
      };
    };
  };
}>;

type TripSummary = Prisma.TripGetPayload<{
  select: {
    id: true;
    tourName: true;
    destination: true;
    startDate: true;
    endDate: true;
    budgetMin: true;
    budgetMax: true;
    preferences: {
      select: {
        groupType: true;
        travelStyle: true;
        pace: true;
      };
    };
    interests: {
      select: {
        interest: true;
      };
    };
  };
}>;

export async function getTripDetails(tripId: string) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      preferences: true,
      interests: true,
      accommodations: {
        include: {
          amenities: true
        }
      },
      days: {
        include: {
          places: {
            include: {
              restaurant: true,
              attraction: true
            }
          },
          transportation: true
        },
        orderBy: {
          dayNumber: 'asc'
        }
      }
    }
  });

  if (!trip) return null;

  // Format the data to match the desired structure
  return {
    tourName: trip.tourName,
    destination: trip.destination,
    startDate: trip.startDate.toISOString().split('T')[0],
    endDate: trip.endDate.toISOString().split('T')[0],
    budgetMin: trip.budgetMin,
    budgetMax: trip.budgetMax,
    groupType: trip.preferences?.groupType,
    travelStyle: trip.preferences?.travelStyle,
    pace: trip.preferences?.pace,
    interests: trip.interests.map((i: { interest: string }) => i.interest),
    plan: {
      accommodations: trip.accommodations.map((acc: TripWithRelations['accommodations'][0]) => ({
        name: acc.name,
        type: acc.type,
        rating: acc.rating,
        pricePerNight: acc.pricePerNight,
        description: acc.description,
        amenities: acc.amenities.map((a: { name: string }) => a.name),
        bookingUrl: acc.bookingUrl,
        image: acc.image
      })),
      days: trip.days.map((day: TripWithRelations['days'][0]) => ({
        day: day.dayNumber,
        date: day.date.toISOString().split('T')[0],
        places: day.places.map((place: TripWithRelations['days'][0]['places'][0]) => ({
          name: place.name,
          type: place.type,
          description: place.description,
          location: place.location,
          timeOfDay: place.timeOfDay,
          duration: place.duration,
          image: place.image,
          ...(place.restaurant && {
            cuisine: place.restaurant.cuisine,
            priceRange: place.restaurant.priceRange
          })
        })),
        transportation: day.transportation?.description
      }))
    }
  };
}

// Function to get all trips for a user
export async function getUserTrips(userId: string) {
  const trips = await prisma.trip.findMany({
    where: { userId },
    select: {
      id: true,
      tourName: true,
      destination: true,
      startDate: true,
      endDate: true,
      budgetMin: true,
      budgetMax: true,
      preferences: {
        select: {
          groupType: true,
          travelStyle: true,
          pace: true
        }
      },
      interests: {
        select: {
          interest: true
        }
      }
    }
  });

  return trips.map((trip: TripSummary) => ({
    id: trip.id,
    tourName: trip.tourName,
    destination: trip.destination,
    startDate: trip.startDate.toISOString().split('T')[0],
    endDate: trip.endDate.toISOString().split('T')[0],
    budgetMin: trip.budgetMin,
    budgetMax: trip.budgetMax,
    groupType: trip.preferences?.groupType,
    travelStyle: trip.preferences?.travelStyle,
    pace: trip.preferences?.pace,
    interests: trip.interests.map((i: { interest: string }) => i.interest)
  }));
} 