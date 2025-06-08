"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from 'js-cookie';

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

export function CredentialsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [loggedInViaCrdentials, setLoggedInViaCrdentials] = useState<
    boolean | null
  >(null);
  const [credentialsLoggedInUserInfo, setCredentialsLoggedInUserInfo] =
    useState<User | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const persistedLoggedIn = localStorage.getItem("loggedInViaCrdentials");
    const persistedUserInfo = localStorage.getItem(
      "credentialsLoggedInUserInfo"
    );

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
      localStorage.setItem(
        "loggedInViaCrdentials",
        JSON.stringify(loggedInViaCrdentials)
      );
      Cookies.set('loggedInViaCrdentials', JSON.stringify(loggedInViaCrdentials), { 
        expires: 7, // 7 days
        path: '/',
        sameSite: 'strict'
      });
    } else {
      localStorage.removeItem("loggedInViaCrdentials");
      Cookies.remove('loggedInViaCrdentials', { path: '/' });
    }
  }, [loggedInViaCrdentials]);

  useEffect(() => {
    if (credentialsLoggedInUserInfo) {
      localStorage.setItem(
        "credentialsLoggedInUserInfo",
        JSON.stringify(credentialsLoggedInUserInfo)
      );
      Cookies.set('credentialsLoggedInUserInfo', JSON.stringify(credentialsLoggedInUserInfo), {
        expires: 7, // 7 days
        path: '/',
        sameSite: 'strict'
      });
    } else {
      localStorage.removeItem("credentialsLoggedInUserInfo");
      Cookies.remove('credentialsLoggedInUserInfo', { path: '/' });
    }
  }, [credentialsLoggedInUserInfo]);

  return (
    <CredentialsContext.Provider
      value={{
        credentialsLoggedInUserInfo,
        loggedInViaCrdentials,
        setCredentialsLoggedInUserInfo,
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
