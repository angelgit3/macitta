import withSerwistInit from "@serwist/next";
import { spawnSync } from "node:child_process";

// Use git HEAD as revision for precache busting.
// Falls back to a random UUID if git is unavailable (e.g. CI without git).
const revision =
    spawnSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf-8" })
        .stdout?.trim() ?? crypto.randomUUID();

const withSerwist = withSerwistInit({
    // Source: TypeScript SW inside app/ (compiled by @serwist/next)
    swSrc: "app/sw.ts",
    // Output: Serwist generates this file during build
    swDest: "public/sw.js",
    // Auto-register the SW — removes need for manual registration scripts
    register: true,
    // Development chunks change constantly; a service worker would serve stale
    // code and make local debugging unreliable.
    disable: process.env.NODE_ENV === "development",
    // Reload the app when connectivity is restored
    reloadOnOnline: true,
    // Never copy authenticated navigations into a shared HTTP cache.
    cacheOnNavigation: false,
    // Precache the offline fallback page
    additionalPrecacheEntries: [{ url: "/offline", revision }],
    // Exclude source maps and Next.js manifest chunks from precaching
    exclude: [/.map$/, /^manifest.*.js$/, /_buildManifest\.js$/, /_ssgManifest\.js$/],
    // Precache small public static assets. Lesson audio (public/audio, ~18 MB)
    // is deliberately excluded: it is cached at runtime on first play instead,
    // so installing the PWA never triggers a multi-megabyte download.
    globPublicPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
});

const isProduction = process.env.NODE_ENV === "production";
const securityHeaders = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    { key: "Origin-Agent-Cluster", value: "?1" },
    ...(isProduction
        ? [{
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
        }]
        : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@macitta/shared"],
    experimental: {
        serverActions: {
            // Cap memory spent parsing hostile Server Action bodies.
            bodySizeLimit: "512kb",
        },
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: securityHeaders,
            },
            {
                source: "/sw.js",
                headers: [
                    { key: "Content-Type", value: "application/javascript; charset=utf-8" },
                    { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
                    {
                        key: "Content-Security-Policy",
                        value: "default-src 'self'; script-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co; object-src 'none'",
                    },
                ],
            },
        ];
    },
};

export default withSerwist(nextConfig);
