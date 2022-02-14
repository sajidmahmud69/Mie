import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware (req) {
    // Token will exist if the user is logged in
    const token = await getToken ({ req, secret: process.env.JWT_SECRET })
    const { pathname } = req.nextUrl

    // Allow if the following is true ...
    // 1. It's a request for next-auth session and provider fetching
    // 2. the token exists
    if (pathname.includes ('/api/auth') || token) {
        return NextResponse.next ()         // basically means continue on
    }

    // Redirect them to the login page if they dont have toke AND requesting a protected route
    if (!token && pathname !== '/login') {
        return NextResponse.redirect ('/login')
    }
}