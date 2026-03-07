import { NextResponse } from "next/server";

export function middleware(req) {
    const session = req.cookies.get("session")?.value;
    const { pathname } = req.nextUrl;

    const isAuthPage = pathname === "/login" || pathname === "/signup";
    const isProtectedPage = pathname === "/generateblueprint" || pathname === "/profile" || pathname.startsWith("/blueprints/");

    if (session && isAuthPage) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if (!session && isProtectedPage) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/login", "/signup", "/generateblueprint", "/profile", "/blueprints/:path*"],
};
