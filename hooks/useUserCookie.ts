import { useEffect, useState } from "react";
import Cookies from "js-cookie";

interface User {
  [key: string]: any;
}

const useUserCookie = (): User | undefined => {
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch {
        console.error("Error parsing cookie!");
      }
    }
  }, []);

  return user;
};
export default useUserCookie;

