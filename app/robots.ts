import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/guides/",
          "/help/",
          "/templates/",
          "/features",
          "/pricing",
          "/about",
          "/contact",
          "/demo",
          "/privacy",
          "/terms",
          "/cookies",
        ],
        disallow: [
          "/dashboard/",
          "/tool/",
          "/profile/",
          "/customers/",
          "/settings/",
          "/api/",
          "/auth/",
          "/_next/",
        ],
      },
    ],
    sitemap: "https://getjobquotes.uk/sitemap.xml",
  };
}
