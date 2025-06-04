"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string | null;
  email: string | null;
  id: string;
}

interface CredentialsContextType {
  credentialsLoggedInUserInfo: User | null;
  setCredentialsLoggedInUserInfo: (user: User | null) => void;
  loggedInViaCrdentials: boolean | null;
  setLoggedInViaCrdentials: (value: boolean | null) => void;
}

const CredentialsContext = createContext<CredentialsContextType | null>(null);

export function CredentialsContextProvider({ children }: { children: ReactNode }) {
  const [loggedInViaCrdentials, setLoggedInViaCrdentials] = useState<boolean | null>(null);
  const [credentialsLoggedInUserInfo, setCredentialsLoggedInUserInfo] = useState<User | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const persistedLoggedIn = localStorage.getItem('loggedInViaCrdentials');
    const persistedUserInfo = localStorage.getItem('credentialsLoggedInUserInfo');
    
    if (persistedLoggedIn) {
      setLoggedInViaCrdentials(JSON.parse(persistedLoggedIn));
    }
    if (persistedUserInfo) {
      setCredentialsLoggedInUserInfo(JSON.parse(persistedUserInfo));
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (loggedInViaCrdentials) {
      localStorage.setItem('loggedInViaCrdentials', JSON.stringify(loggedInViaCrdentials));
    } else {
      localStorage.removeItem('loggedInViaCrdentials');
    }
  }, [loggedInViaCrdentials]);

  useEffect(() => {
    if (credentialsLoggedInUserInfo) {
      localStorage.setItem('credentialsLoggedInUserInfo', JSON.stringify(credentialsLoggedInUserInfo));
    } else {
      localStorage.removeItem('credentialsLoggedInUserInfo');
    }
  }, [credentialsLoggedInUserInfo]);

  return (
    <CredentialsContext.Provider
      value={{
        credentialsLoggedInUserInfo,
        setCredentialsLoggedInUserInfo,
        loggedInViaCrdentials,
        setLoggedInViaCrdentials,
      }}
    >
      {children}
    </CredentialsContext.Provider>
  );
}

export function useCredentials() {
  const context = useContext(CredentialsContext);
  if (!context) {
    throw new Error("Please use context in the right scope");
  }

  return context;
}
