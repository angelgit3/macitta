import type { MetadataRoute } from "next";

// Public, indexable pages only. App routes require a session and are
// excluded via robots.txt, so they must not appear here either.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://macitta.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    return [
        {
            url: BASE_URL,
            lastModified,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${BASE_URL}/privacidad`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/privacy`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terminos`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms`,
            lastModified,
            changeFrequency: "monthly",
            priority: 0.3,
        },
    ];
}
