import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  //skipping validation for this
  if (req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next();
  }
 // console.log("thee coookei value",req.cookies)
  const accessToken = req.cookies.get("access_token")?.value;
  
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  try {
    // Verify the token using your secret key
    jwt.verify(accessToken, process.env.JWT_SECRET!);
    // If the token is valid, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, expired, or any other error, redirect to login
    console.error("Token validation failed:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/all-creators"], // Routes protected
};

