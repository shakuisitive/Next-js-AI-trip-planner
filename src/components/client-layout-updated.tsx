"use client";

import type React from "react";

import { useState, useEffect } from "react";
import CustomSplashScreen from "./ui/custom-splash-screen";
export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // This effect is needed to trigger a re-render after initial mount
  }, []);

  return (
    <>
      {showSplash ? (
        <CustomSplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <>{children}</>
      )}
    </>
  );
}
