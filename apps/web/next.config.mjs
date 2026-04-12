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
    // Reload the app when connectivity is restored
    reloadOnOnline: true,
    // Cache navigations for offline support
    cacheOnNavigation: true,
    // Precache the offline fallback page
    additionalPrecacheEntries: [{ url: "/offline", revision }],
    // Exclude source maps and Next.js manifest chunks from precaching
    exclude: [/.map$/, /^manifest.*.js$/, /_buildManifest\.js$/, /_ssgManifest\.js$/],
    // Precache all public static assets
    globPublicPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@maccita/shared"],
    experimental: {
        // reactCompiler: true,
    },
};

export default withSerwist(nextConfig);
