"use client";

import { signInUsingGoogle } from "@/actions/index";
import LandingPage from "@/components/LandingPage";
import { useCredentials } from "@/context/CredentialsContext";
import { getAuth } from "firebase/auth";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCredentialsLoggedInChecker } from "@/lib/credentialsAuth/credentialsLoggedInChecker";

export default function Home() {
  const signInWithNextAuthGoogle = async () => {
    await signIn("google");
  };

  let {
    setCredentialsLoggedInUserInfo,
    setLoggedInViaCrdentials,
    credentialsLoggedInUserInfo,
  }: any = useCredentials();

  // all about firebase.
  // we probably need anything below just to log something
  // const auth = getAuth();
  // const user = auth.currentUser;
  // console.log(user?.uid);

  let signedInUserData = useSession();
  let signedInUserName = signedInUserData?.data?.user?.name;
  let signedInUserId = signedInUserData?.data?.user?.id;

  let signedInWithCredentials = useCredentialsLoggedInChecker();

  // Add detailed logging
  // console.log("Full session data:", signedInUserData);
  // console.log("Session status:", signedInUserData?.status);
  // console.log("User data:", signedInUserData?.data?.user);

  let loggedInContent = (
    <>
      <form className="max-w-screen-md flex items-center justify-between">
        <div>
          <h2>Hello {signedInUserName || credentialsLoggedInUserInfo?.name}</h2>
          <p>
            Your user ID is:{" "}
            {signedInUserId ||
              credentialsLoggedInUserInfo?.id ||
              "Not available"}
          </p>
          <p>
            Email:{" "}
            {signedInUserData?.data?.user?.email ||
              credentialsLoggedInUserInfo?.email}
          </p>
          <p>Login Method: {signedInUserName ? "OAuth" : "Credentials"}</p>
        </div>
        <button
          onClick={() => {
            setCredentialsLoggedInUserInfo(null);
            setLoggedInViaCrdentials(null);
            signOut();
          }}
        >
          signout
        </button>
      </form>
    </>
  );

  return (
    <>
      {signedInUserName || signedInWithCredentials ? (
        loggedInContent
      ) : (
        <button onClick={signInWithNextAuthGoogle}>login </button>
      )}
      <LandingPage />
    </>
  );
}
