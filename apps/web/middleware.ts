import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Route Protection Logic
    const path = request.nextUrl.pathname;

    // 1. Protected Routes: Any path inside (app) - effectively anything not auth or landing
    // We identify "app" routes by checking if they are NOT public
    const isPublicRoute = path === "/" || path.startsWith("/auth") || path.startsWith("/api");

    if (!user && !isPublicRoute) {
        // If trying to access dashboard/estudio/etc without login -> Redirect to Login
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // 2. Auth Redirect: If logged in and trying to access Landing or Auth -> Go to Dashboard
    //    EXCEPTION: /auth/update-password must remain accessible (user arrives authenticated via recovery token)
    if (user && (path === "/" || (path.startsWith("/auth") && path !== "/auth/update-password"))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
