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
      password: hashedPassword
    } 
  });
  
  return "User created successfully";
}

export async function updateUserRoleAndStatus(userId: string, updates: { role?: string; status?: boolean }) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates
    });
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}
