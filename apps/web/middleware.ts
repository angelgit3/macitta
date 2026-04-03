import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Rutas de auth que NO deben redirigir al dashboard aunque haya sesión
// (ej: verify-otp puede abrir con un token temporal antes de sesión completa)
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

    // IMPORTANTE: getUser() valida con el servidor de auth.
    // Si hay error de red (alumno offline), lo tratamos como "sin sesión conocida"
    // pero NO redirigimos si la ruta ya estaba cargada (Dexie maneja offline).
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    // Detectar si el error es de red/offline para no bloquear al alumno
    const isOfflineError =
        authError?.message?.toLowerCase().includes("fetch") ||
        authError?.message?.toLowerCase().includes("network") ||
        authError?.message?.toLowerCase().includes("failed to fetch");

    const isAuthenticated = !!user;

    // ── Clasificar la ruta ──────────────────────────────────────────────────
    const isPublicRoute = path === "/" || path.startsWith("/api");
    const isAuthRoute = path.startsWith("/auth");
    const isAuthPassthrough = AUTH_PASSTHROUGH.some(p => path.startsWith(p));
    const isTeacherRoute = path.startsWith("/docente");
    const isAppRoute = !isPublicRoute && !isAuthRoute;

    // ── 1. Rutas de la app — requieren sesión ──────────────────────────────
    if (isAppRoute && !isAuthenticated && !isOfflineError) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirectTo", path);
        return NextResponse.redirect(loginUrl);
    }

    // ── 2. Portal docente — requiere rol teacher/admin ─────────────────────
    if (isTeacherRoute && isAuthenticated) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || !["teacher", "admin"].includes(profile.role)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // ── 3. Rutas auth — redirigir si ya está logueado ─────────────────────
    // NO redirigir si es una ruta de passthrough (confirm, verify-otp, etc.)
    if (isAuthenticated && isAuthRoute && !isAuthPassthrough) {
        const rawRedirect = request.nextUrl.searchParams.get("redirectTo") || "/dashboard";
        // SECURITY: Prevenir Open Redirect — solo permitir rutas relativas internas.
        // Rechazar: URLs absolutas (http://...), protocol-relative (//evil.com),
        // y cualquier cosa que no empiece con exactamente un /.
        const safeRedirect =
            typeof rawRedirect === "string" &&
            rawRedirect.startsWith("/") &&
            !rawRedirect.startsWith("//")
                ? rawRedirect
                : "/dashboard";
        return NextResponse.redirect(new URL(safeRedirect, request.url));
    }

    // ── 4. Landing "/" — si logueado, ir al dashboard ─────────────────────
    if (isAuthenticated && path === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Ejecutar en todas las rutas EXCEPTO:
         * - _next/static, _next/image (assets internos de Next)
         * - favicon.ico, manifest.json, sw.js (PWA)
         * - Archivos con extensión (imágenes, fuentes, etc.)
         */
        "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
    ],
};
