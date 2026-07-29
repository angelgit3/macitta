/// <reference lib="webworker" />
// Macitta Service Worker — managed by @serwist/next
// This file is compiled and injected with the precache manifest during build.
// Do NOT import this file from app code — it runs inside the Service Worker scope.

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const PRIVATE_ROUTE_PREFIXES = [
    "/auth",
    "/api",
    "/dashboard",
    "/estudio",
    "/grammar",
    "/listening",
    "/toefl",
    "/usuario",
    "/vocabulario",
];

const serwist = new Serwist({
    // Precache manifest is injected automatically by @serwist/next during build.
    // Includes all Next.js static chunks, pages, images, and any additional entries
    // configured in next.config.mjs (e.g. /offline).
    precacheEntries: self.__SW_MANIFEST,

    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,

    // Runtime caching strategies optimized for Next.js:
    // - Authenticated routes, API traffic and Supabase: NetworkOnly
    // - JS/CSS chunks: CacheFirst (hashed filenames = safe forever)
    // - Images: CacheFirst with 30-day expiry
    // - Fonts: CacheFirst with 1-year expiry
    runtimeCaching: [
        {
            matcher: ({ request, sameOrigin, url }) => {
                const isSupabase = url.hostname.endsWith(".supabase.co");
                const isPrivateRoute =
                    sameOrigin &&
                    PRIVATE_ROUTE_PREFIXES.some((prefix) =>
                        url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
                    );
                return (
                    request.method === "GET" &&
                    (isSupabase || isPrivateRoute || request.headers.has("Authorization"))
                );
            },
            method: "GET",
            handler: new NetworkOnly(),
        },
        ...defaultCache,
    ],

    // Offline fallback: serve /offline when navigation fails with no cache
    fallbacks: {
        entries: [
            {
                url: "/offline",
                matcher({ request }) {
                    return request.destination === "document";
                },
            },
        ],
    },
});

const LEGACY_PRIVATE_CACHE_NAMES = [
    "pages",
    "pages-rsc",
    "pages-rsc-prefetch",
    "apis",
    "next-data",
    "others",
    "cross-origin",
];

self.addEventListener("activate", (event) => {
    event.waitUntil(
        Promise.all(
            LEGACY_PRIVATE_CACHE_NAMES.map((cacheName) => caches.delete(cacheName))
        ).then(() => undefined)
    );
});

serwist.addEventListeners();
