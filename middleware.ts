import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export default auth((req: { auth: any; nextUrl: { pathname: string; origin: string | URL | undefined } }) => {
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    const newUrl = new URL('/', req.nextUrl.origin)
    return NextResponse.redirect(newUrl)
  }
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ['/dashboard/:path*'],
}