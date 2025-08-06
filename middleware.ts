// import { clerkMiddleware, createRouteMatcher, getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// export default clerkMiddleware(async (auth, req) => {
//   // Protect all routes starting with `/admin`
//   const { sessionClaims } = getAuth(req);
//   console.log(sessionClaims);
//   console.log("role ", await auth()?.sessionClaims?.metadata?.role);
//   if (isAdminRoute(req) && (await auth()).sessionClaims?.metadata?.role !== "ADMIN") {
//     const url = new URL("/", req.url);
//     return NextResponse.redirect(url);
//   }
// });

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Dapatkan session dan klaim user
  const authData = await auth();
  const role = authData?.sessionClaims?.metadata?.role;

  // Proteksi rute /admin
  if (isAdminRoute(req) && role !== "ADMIN") {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Jalankan middleware untuk semua rute KECUALI file statis Next.js
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Jalankan juga untuk API dan trpc
    "/(api|trpc)(.*)"
  ]
};
