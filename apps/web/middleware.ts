import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { safeInternalRedirect } from "@macitta/shared";

const AUTH_PASSTHROUGH = [
    "/auth/confirm",
    "/auth/verify-otp",
    "/auth/verify-recovery",
    "/auth/update-password",
    "/auth/auth-code-error",
    "/auth/forgot-password",
];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const nonce = btoa(crypto.randomUUID());
    const isProduction = process.env.NODE_ENV === "production";
    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isProduction ? "" : " 'unsafe-eval'"}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://api.dicebear.com",
        "font-src 'self' data:",
        "media-src 'self' blob: https://*.supabase.co",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "worker-src 'self' blob:",
        "manifest-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join("; ");
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);

    let response = NextResponse.next({
        request: { headers: requestHeaders },
    });

    const isDevelopmentPreview =
        process.env.NODE_ENV === "development" &&
        (path === "/grammar-preview" ||
            path === "/reading-preview" ||
            path === "/listening-preview" ||
            path === "/toefl-preview");
    // Public marketing and legal pages must never require a session.
    const isPublicRoute =
        path === "/" ||
        path === "/privacidad" ||
        path === "/privacy" ||
        path === "/terminos" ||
        path === "/terms" ||
        path === "/offline" ||
        isDevelopmentPreview;
    const isAuthRoute = path.startsWith("/auth");
    const isAuthPassthrough = AUTH_PASSTHROUGH.some((p) => path.startsWith(p));
    const isAppRoute = !isPublicRoute && !isAuthRoute;

    const secure = (result: NextResponse) => {
        result.headers.set("Content-Security-Policy", csp);
        if (isAppRoute) {
            result.headers.set("Cache-Control", "private, no-store");
        }
        return result;
    };

    // Fast path: without a Supabase auth cookie the request cannot be
    // authenticated, so skip creating the client and parsing claims.
    // Anonymous traffic (landing, crawlers, first visits) never pays for it.
    const hasAuthCookie = request.cookies
        .getAll()
        .some(
            (cookie) =>
                cookie.name.startsWith("sb-") &&
                cookie.name.includes("auth-token"),
        );

    let isAuthenticated = false;
    if (hasAuthCookie) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        response = NextResponse.next({
                            request: { headers: requestHeaders },
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            },
        );

        const { data: claimsData } = await supabase.auth.getClaims();
        isAuthenticated = Boolean(claimsData?.claims.sub);
    }

    // Authentication must fail closed. Offline use is handled by the already
    // loaded PWA and its IndexedDB data, never by bypassing route protection.
    if (isAppRoute && !isAuthenticated) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirectTo", path);
        return secure(NextResponse.redirect(loginUrl));
    }

    if (isAuthenticated && isAuthRoute && !isAuthPassthrough) {
        const destination = safeInternalRedirect(
            request.nextUrl.searchParams.get("redirectTo"),
        );
        return secure(NextResponse.redirect(new URL(destination, request.url)));
    }

    if (isAuthenticated && path === "/") {
        return secure(NextResponse.redirect(new URL("/dashboard", request.url)));
    }

    return secure(response);
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|mp3|wav|ogg)$).*)",
    ],
};
