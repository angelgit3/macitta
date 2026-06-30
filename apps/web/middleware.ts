import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

    let response = NextResponse.next({ request });

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
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: claimsData, error: authError } = await supabase.auth.getClaims();

    const isOfflineError =
        authError?.message?.toLowerCase().includes("fetch") ||
        authError?.message?.toLowerCase().includes("network") ||
        authError?.message?.toLowerCase().includes("failed to fetch");

    const isAuthenticated = Boolean(claimsData?.claims.sub);
    const isPublicRoute = path === "/" || path.startsWith("/api");
    const isAuthRoute = path.startsWith("/auth");
    const isAuthPassthrough = AUTH_PASSTHROUGH.some((p) => path.startsWith(p));
    const isAppRoute = !isPublicRoute && !isAuthRoute;

    if (isAppRoute && !isAuthenticated && !isOfflineError) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirectTo", path);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthenticated && isAuthRoute && !isAuthPassthrough) {
        const rawRedirect = request.nextUrl.searchParams.get("redirectTo") || "/dashboard";
        const safeRedirect =
            rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
                ? rawRedirect
                : "/dashboard";
        return NextResponse.redirect(new URL(safeRedirect, request.url));
    }

    if (isAuthenticated && path === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
    ],
};
