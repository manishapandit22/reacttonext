import Cookies from "js-cookie";
import { signOut } from "next-auth/react";

export const logout = (): void => {
  Cookies.remove("user", { path: "/" });
  Cookies.remove("access_token", { path: "/" });
  signOut({ callbackUrl: "/" });
};

