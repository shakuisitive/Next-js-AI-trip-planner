"use client";

import { signInUsingGoogle } from "@/actions/index";
import LandingPage from "@/components/LandingPage";
import { getAuth } from "firebase/auth";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const signInWithNextAuthGoogle = async () => {
    await signIn("google");
  };

  // all about firebase.
  // we probably need anything below just to log something
  const auth = getAuth();
  const user = auth.currentUser;
  // console.log(user?.uid);

  let signedInUserData = useSession();

  // Add detailed logging
  console.log("Full session data:", signedInUserData);
  console.log("Session status:", signedInUserData?.status);
  console.log("User data:", signedInUserData?.data?.user);

  let signedInUserName = signedInUserData?.data?.user?.name;
  let signedInUserId = signedInUserData?.data?.user?.id;

  let loggedInContent = (
    <>
      <form className="max-w-screen-md flex items-center justify-between">
        <div>
          <h2>Hello {signedInUserName}</h2>
          <p>Your user ID is: {signedInUserId || "Not available"}</p>
          <p>Session status: {signedInUserData?.status}</p>
        </div>
        <button onClick={() => signOut()}>signout</button>
      </form>
    </>
  );

  return (
    <>
      {signedInUserName ? (
        loggedInContent
      ) : (
        <button onClick={signInWithNextAuthGoogle}>login </button>
      )}
      <LandingPage />
    </>
  );
}
