"use server";
import { signIn, auth } from "@/lib/auth";

export async function signInUsingGoogle() {
  let data = await signIn("google");
  let result = await auth();
  console.log(result);
}
