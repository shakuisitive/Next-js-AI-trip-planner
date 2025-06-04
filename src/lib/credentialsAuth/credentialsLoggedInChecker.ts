import { useCredentials } from "@/context/CredentialsContext";

export function useCredentialsLoggedInChecker() {
  const { loggedInViaCrdentials, credentialsLoggedInUserInfo } = useCredentials();

  return Boolean(
    loggedInViaCrdentials &&
      credentialsLoggedInUserInfo?.id &&
      credentialsLoggedInUserInfo?.name &&
      credentialsLoggedInUserInfo?.email
  );
}

export function useCredentialsLoggedInData() {
  const { loggedInViaCrdentials, credentialsLoggedInUserInfo } = useCredentials();

  if (
    loggedInViaCrdentials &&
    credentialsLoggedInUserInfo?.id &&
    credentialsLoggedInUserInfo?.name &&
    credentialsLoggedInUserInfo?.email
  ) {
    return credentialsLoggedInUserInfo;
  }

  return null;
}
