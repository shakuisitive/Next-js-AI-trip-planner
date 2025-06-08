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
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, trips: trips as TripWithUser[] };
  } catch (error) {
    console.error("Error fetching trips:", error);
    return { success: false, error: "Failed to fetch trips" };
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
