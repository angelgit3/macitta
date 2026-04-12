/// <reference lib="webworker" />
// Macitta Service Worker — managed by @serwist/next
// This file is compiled and injected with the precache manifest during build.
// Do NOT import this file from app code — it runs inside the Service Worker scope.

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    // Precache manifest is injected automatically by @serwist/next during build.
    // Includes all Next.js static chunks, pages, images, and any additional entries
    // configured in next.config.mjs (e.g. /offline).
    precacheEntries: self.__SW_MANIFEST,

    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,

    // Runtime caching strategies optimized for Next.js:
    // - JS/CSS chunks: CacheFirst (hashed filenames = safe forever)
    // - Images: CacheFirst with 30-day expiry
    // - Fonts: CacheFirst with 1-year expiry
    // - API/Supabase: NetworkFirst (no caching)
    runtimeCaching: defaultCache,

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

serwist.addEventListeners();
