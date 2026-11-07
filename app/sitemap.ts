import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

// Tanggal tetap (bukan new Date()) agar kompatibel dengan prerender cacheComponents.
const lastModified = "2026-11-07";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [
    ["/", 1],
    ["/bantuan", 0.6],
    ["/terms", 0.4],
    ["/privasi", 0.4],
    ["/login", 0.5],
  ];
  return pages.map(([path, priority]) => ({ url: `${SITE.url}${path}`, lastModified, priority }));
}
