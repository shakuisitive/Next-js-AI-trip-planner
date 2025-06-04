"use client";

import { prisma } from "@/lib/db/prisma";
import { useState } from "react";
import { useCredentials } from "@/context/CredentialsContext";
import { useRouter } from "next/navigation";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setLoggedInViaCrdentials, setCredentialsLoggedInUserInfo } =
    useCredentials();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Update context with user info
      setLoggedInViaCrdentials(true);
      setCredentialsLoggedInUserInfo(data.user);

      // Redirect to home page
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-screen-md mx-auto p-10 border border-solid border-gray-500 mt-10"
    >
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div>
        <p className="inline mr-4">Email</p>
        <input
          className="border border-solid border-gray-500"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mt-4">
        <p className="inline mr-4">Password</p>
        <input
          className="border border-solid border-gray-500"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="border border-solid border-gray-500 bg-red-200 p-2 mt-4 hover:bg-red-300 transition-colors"
      >
        Login
      </button>
    </form>
  );
}

export default LoginPage;
