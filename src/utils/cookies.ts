import Cookies from "js-cookie";

export function setClientCookie(name, value, options = {}) {
  Cookies.set(name, value, {
    path: "/",
    ...options, // e.g. { expires: 7 } → 7 days
  });
}

export function removeACookie(cookieName) {
  Cookies.remove(cookieName);
}
