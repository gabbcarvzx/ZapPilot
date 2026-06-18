import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/assistant/:path*", "/messages/:path*", "/admin/:path*"]
};
