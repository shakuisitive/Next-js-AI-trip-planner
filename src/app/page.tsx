"use client";
import LandingPage from "@/components/LandingPage";
import { getAuth } from "firebase/auth";

export default function Home() {
  const auth = getAuth();
  const user = auth.currentUser;
  console.log(user.uid);
  return <LandingPage />;
}
