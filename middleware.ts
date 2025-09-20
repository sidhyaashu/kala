import { auth } from "@/lib/auth";

export default auth((req: { auth: any; nextUrl: { pathname: string; origin: string | URL | undefined; }; }) => {
  // Redirect to login if user is not authenticated and is trying to access a protected route
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    const newUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

// The matcher configures where the middleware runs
export const config = {
  matcher: ["/dashboard/:path*"],
};