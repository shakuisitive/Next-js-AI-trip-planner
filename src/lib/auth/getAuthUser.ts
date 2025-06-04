"use client";

import { auth } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { useCredentials } from "@/context/CredentialsContext";

// Types
export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  authMethod: 'oauth' | 'credentials';
}

// Server-side utility function
export async function getServerAuthUser(request?: Request): Promise<AuthUser | null> {
  const session = await auth();
  const credentialsUserId = request?.headers.get("X-Credentials-User-Id");
  const isCredentialsAuth = request?.headers.get("X-Credentials-Auth") === "true";

  // Check OAuth first
  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      authMethod: 'oauth'
    };
  }

  // Then check credentials
  if (isCredentialsAuth && credentialsUserId) {
    // You might want to fetch the full user data from your database here
    // For now, we'll return just the ID since that's what we have
    return {
      id: credentialsUserId,
      name: null, // You can fetch this from your database if needed
      email: null, // You can fetch this from your database if needed
      authMethod: 'credentials'
    };
  }

  return null;
}

// Client-side hook
export function useAuthUser(): AuthUser | null {
  const { data: session } = useSession();
  const { credentialsLoggedInUserInfo, loggedInViaCrdentials } = useCredentials();

  // Check OAuth first
  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      authMethod: 'oauth'
    };
  }

  // Then check credentials
  if (loggedInViaCrdentials && credentialsLoggedInUserInfo) {
    return {
      id: credentialsLoggedInUserInfo.id,
      name: credentialsLoggedInUserInfo.name ?? null,
      email: credentialsLoggedInUserInfo.email ?? null,
      authMethod: 'credentials'
    };
  }

  return null;
}

// Helper function to get auth headers for API calls
export function getAuthHeaders(): HeadersInit {
  const { credentialsLoggedInUserInfo, loggedInViaCrdentials } = useCredentials();
  
  return {
    "X-Credentials-User-Id": loggedInViaCrdentials ? credentialsLoggedInUserInfo?.id || "" : "",
    "X-Credentials-Auth": loggedInViaCrdentials ? "true" : "false"
  };
} 