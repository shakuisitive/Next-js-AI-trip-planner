"use server";
import { signIn, auth } from "@/lib/auth";
import { prisma } from "./../lib/db/prisma";
import bcrypt from "bcryptjs";

export async function signInUsingGoogle() {
  let data = await signIn("google");
  let result = await auth();
  console.log(result);
}

export async function createAUser(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
  status: boolean;
}) {
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  let user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });

  return "User created successfully";
}

export async function updateUserRoleAndStatus(
  userId: string,
  updates: { role?: string; status?: boolean }
) {
  try {
    const data: any = { ...updates };

    // If status is being updated, handle deletedAt accordingly
    if (updates.status !== undefined) {
      data.deletedAt = updates.status ? null : new Date();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

export async function updateUserDetails(
  userId: string,
  updates: { name?: string; email?: string }
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user details:", error);
    return { success: false, error: "Failed to update user details" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: false,
        deletedAt: new Date(),
      },
    });
    return { success: true, user: deletedUser };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

interface TripWithUser {
  id: string;
  tourName: string;
  destination: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
  startDate: Date;
  endDate: Date;
  tourStatus: string;
  status: boolean | null;
  budgetMin: number;
  budgetMax: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: string;
}

export async function getTrips() {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        status: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        days: {
          select: {
            dayNumber: true,
          },
          orderBy: {
            dayNumber: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      trips,
    };
  } catch (error) {
    console.error("Error fetching trips:", error);
    return {
      success: false,
      error: "Failed to fetch trips",
    };
  }
}

export async function updateTripDetails(
  tripId: string,
  updates: {
    tourName?: string;
    tourStatus?: string;
    startDate?: Date;
    endDate?: Date;
    budgetMin?: number;
    budgetMax?: number;
    status?: boolean;
  }
) {
  try {
    const data: any = { ...updates };

    // If status is being updated, handle deletedAt accordingly
    if (updates.status !== undefined) {
      data.deletedAt = updates.status ? null : new Date();
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return { success: true, trip: updatedTrip };
  } catch (error) {
    console.error("Error updating trip details:", error);
    return { success: false, error: "Failed to update trip details" };
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: true,
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateTripUser(tripId: string, userId: string) {
  try {
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return { success: true, trip: updatedTrip };
  } catch (error) {
    console.error("Error updating trip user:", error);
    return { success: false, error: "Failed to update trip user" };
  }
}

interface Accommodation {
  id: string;
  name: string;
  type: string;
  tripId: string;
  rating: number;
  pricePerNight: number;
  description: string;
  bookingUrl: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  status: boolean | null;
  trip: {
    tourName: string;
  };
  amenities: {
    name: string;
  }[];
}

export async function getAccommodations() {
  try {
    const accommodations = await prisma.accommodation.findMany({
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, accommodations };
  } catch (error) {
    console.error("Error fetching accommodations:", error);
    return { success: false, error: "Failed to fetch accommodations" };
  }
}

export async function updateAccommodationDetails(
  accommodationId: string,
  updates: {
    name?: string;
    type?: string;
    rating?: number;
    pricePerNight?: number;
    description?: string;
    bookingUrl?: string;
    image?: string;
    status?: boolean;
  }
) {
  try {
    const data: any = { ...updates };

    // If status is being updated, handle deletedAt accordingly
    if (updates.status !== undefined) {
      data.deletedAt = updates.status ? null : new Date();
    }

    const updatedAccommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data,
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
    });
    return { success: true, accommodation: updatedAccommodation };
  } catch (error) {
    console.error("Error updating accommodation details:", error);
    return { success: false, error: "Failed to update accommodation details" };
  }
}

export async function updateAccommodationAmenities(
  accommodationId: string,
  amenities: string[]
) {
  try {
    // First, delete all existing amenities
    await prisma.accommodationAmenity.deleteMany({
      where: { accommodationId },
    });

    // Then, create new amenities
    const createdAmenities = await Promise.all(
      amenities.map((name) =>
        prisma.accommodationAmenity.create({
          data: {
            name,
            accommodationId,
          },
        })
      )
    );

    const updatedAccommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, accommodation: updatedAccommodation };
  } catch (error) {
    console.error("Error updating accommodation amenities:", error);
    return {
      success: false,
      error: "Failed to update accommodation amenities",
    };
  }
}

export async function deleteAccommodation(accommodationId: string) {
  try {
    const deletedAccommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data: {
        status: false,
        deletedAt: new Date(),
      },
    });
    return { success: true, accommodation: deletedAccommodation };
  } catch (error) {
    console.error("Error deleting accommodation:", error);
    return { success: false, error: "Failed to delete accommodation" };
  }
}

export async function updateAccommodationTrip(
  accommodationId: string,
  tripId: string
) {
  try {
    const updatedAccommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data: { tripId },
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
    });
    return { success: true, accommodation: updatedAccommodation };
  } catch (error) {
    console.error("Error updating accommodation trip:", error);
    return { success: false, error: "Failed to update accommodation trip" };
  }
}

export async function createAccommodation(data: {
  name: string;
  type: string;
  tripId: string;
  rating: number;
  pricePerNight: number;
  description: string;
  bookingUrl?: string;
  image?: string;
  amenities: string[];
}) {
  try {
    const accommodation = await prisma.accommodation.create({
      data: {
        name: data.name,
        type: data.type,
        tripId: data.tripId,
        rating: data.rating,
        pricePerNight: data.pricePerNight,
        description: data.description,
        bookingUrl: data.bookingUrl,
        image: data.image,
        status: true,
        amenities: {
          create: data.amenities.map((name) => ({ name })),
        },
      },
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
    });
    return { success: true, accommodation };
  } catch (error) {
    console.error("Error creating accommodation:", error);
    return { success: false, error: "Failed to create accommodation" };
  }
}

export async function getPlaces() {
  try {
    const places = await prisma.place.findMany({
      where: {
        status: true,
      },
      include: {
        day: {
          include: {
            trip: {
              select: {
                id: true,
                tourName: true,
              },
            },
          },
        },
        restaurant: true,
        attraction: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      places,
    };
  } catch (error) {
    console.error("Error fetching places:", error);
    return {
      success: false,
      error: "Failed to fetch places",
    };
  }
}

export async function createPlace({
  name,
  type,
  description,
  location,
  timeOfDay,
  duration,
  image,
  tripId,
  dayNumber,
  cuisine = "",
  priceRange = "",
  category = "",
}: {
  name: string;
  type: "attraction" | "restaurant";
  description: string;
  location: string;
  timeOfDay: string;
  duration: string;
  image: string;
  tripId: string;
  dayNumber: number;
  cuisine?: string;
  priceRange?: string;
  category?: string;
}) {
  try {
    // First, find or create the day
    const existingDay = await prisma.day.findFirst({
      where: {
        tripId,
        dayNumber,
      },
    });

    let dayId;
    if (existingDay) {
      dayId = existingDay.id;
    } else {
      const newDay = await prisma.day.create({
        data: {
          tripId,
          dayNumber,
          date: new Date(),
        },
      });
      dayId = newDay.id;
    }

    // Create the place
    const place = await prisma.place.create({
      data: {
        name,
        type,
        description,
        location,
        timeOfDay,
        duration,
        image,
        dayId,
        ...(type === "restaurant" && {
          restaurant: {
            create: {
              cuisine,
              priceRange,
            },
          },
        }),
        ...(type === "attraction" && {
          attraction: {
            create: {
              category,
            },
          },
        }),
      },
      include: {
        day: {
          include: {
            trip: {
              select: {
                id: true,
                tourName: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      place,
    };
  } catch (error) {
    console.error("Error creating place:", error);
    return {
      success: false,
      error: "Failed to create place",
    };
  }
}

export async function updatePlaceDetails(placeId: string, updates: any) {
  try {
    // If updating day number, we need to handle it differently
    if (updates.dayNumber) {
      // First get the current place to get the tripId
      const currentPlace = await prisma.place.findUnique({
        where: { id: placeId },
        include: {
          day: {
            include: {
              trip: true
            }
          }
        }
      });

      if (!currentPlace) {
        throw new Error("Place not found");
      }

      // Find or create the new day
      const existingDay = await prisma.day.findFirst({
        where: {
          tripId: currentPlace.day.trip.id,
          dayNumber: updates.dayNumber,
        },
      });

      let newDayId;
      if (existingDay) {
        newDayId = existingDay.id;
      } else {
        const newDay = await prisma.day.create({
          data: {
            tripId: currentPlace.day.trip.id,
            dayNumber: updates.dayNumber,
            date: new Date(),
          },
        });
        newDayId = newDay.id;
      }

      // Update the place with the new dayId
      const place = await prisma.place.update({
        where: {
          id: placeId,
        },
        data: {
          dayId: newDayId,
        },
        include: {
          day: {
            include: {
              trip: {
                select: {
                  id: true,
                  tourName: true,
                },
              },
            },
          },
          restaurant: true,
          attraction: true,
        },
      });

      return {
        success: true,
        place,
      };
    }

    // For all other updates
    const place = await prisma.place.update({
      where: {
        id: placeId,
      },
      data: updates,
      include: {
        day: {
          include: {
            trip: {
              select: {
                id: true,
                tourName: true,
              },
            },
          },
        },
        restaurant: true,
        attraction: true,
      },
    });

    return {
      success: true,
      place,
    };
  } catch (error) {
    console.error("Error updating place:", error);
    return {
      success: false,
      error: "Failed to update place",
    };
  }
}

export async function deletePlace(placeId: string) {
  try {
    await prisma.place.update({
      where: {
        id: placeId,
      },
      data: {
        status: false,
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting place:", error);
    return {
      success: false,
      error: "Failed to delete place",
    };
  }
}
