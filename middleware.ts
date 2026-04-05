import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    if (pathname === '/d') {
        const rewriteUrl = request.nextUrl.clone();
        const shortCategory = rewriteUrl.searchParams.get('c');
        const shortSubCategory = rewriteUrl.searchParams.get('sc');
        const shortLocation = rewriteUrl.searchParams.get('l');
        const shortSubLocation = rewriteUrl.searchParams.get('sl');

        rewriteUrl.pathname = '/dashboard';
        if (shortCategory && !rewriteUrl.searchParams.get('category')) rewriteUrl.searchParams.set('category', shortCategory);
        if (shortSubCategory && !rewriteUrl.searchParams.get('subCategory')) rewriteUrl.searchParams.set('subCategory', shortSubCategory);
        if (shortLocation && !rewriteUrl.searchParams.get('location')) rewriteUrl.searchParams.set('location', shortLocation);
        if (shortSubLocation && !rewriteUrl.searchParams.get('subLocation')) rewriteUrl.searchParams.set('subLocation', shortSubLocation);

        return NextResponse.rewrite(rewriteUrl);
    }

    const authRoutes = ['/login', '/register'];
    const publicRoutes = ['/', '/d', '/dashboard', '/dashboard/post-ad'];
    const isInfoRoute = pathname === '/info' || pathname.startsWith('/info/');
    const slug = pathname.replace(/^\/+|\/+$/g, '');
    const isSingleSegmentRoute = slug.length > 0 && !slug.includes('/');
    const reservedSlugs = new Set(['d', 'login', 'register', 'dashboard', 'info']);
    const isSellerProfileRoute = isSingleSegmentRoute && !reservedSlugs.has(slug.toLowerCase());

    // Support shared seller links like /nurislam by forwarding to the existing profile flow.
    if (isSellerProfileRoute) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/dashboard';
        dashboardUrl.searchParams.set('profile', slug);
        return NextResponse.redirect(dashboardUrl);
    }

    // If user is logged in and tries to access auth routes (login/register), redirect to dashboard
    if (token && authRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is NOT logged in and tries to access a protected route
    // Protected routes are any route that is NOT an auth route AND NOT a public route
    if (!token && !authRoutes.includes(pathname) && !publicRoutes.includes(pathname) && !isInfoRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Match all request paths except for the ones starting with:
// - api (API routes)
// - _next/static (static files)
// - _next/image (image optimization files)
// - favicon.ico (favicon file)
export const config = {
    // Exclude Next internals and any public/static files (anything with a dot/extension),
    // so PWA assets like /manifest.* and /sw.js are never redirected.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
