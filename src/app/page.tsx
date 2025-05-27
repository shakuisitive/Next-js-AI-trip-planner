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

  if (signedInUserData) console.log(`there you go:`);
  if (signedInUserData) console.log(`${signedInUserData}`);
  let signedInUserName = signedInUserData?.data?.user?.name;

  let loggedInContent = (
    <>
      <form className="max-w-screen-md flex items-center justify-between">
        <h2>Hello {signedInUserName}</h2>
        <button onClick={ () =>  signOut()}>signout</button>
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
