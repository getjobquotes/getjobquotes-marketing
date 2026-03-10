import { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://getjobquotes.uk", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://getjobquotes.uk/demo", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: "https://getjobquotes.uk/auth", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://getjobquotes.uk/status", lastModified: new Date(), changeFrequency: "always", priority: 0.2 },
    { url: "https://getjobquotes.uk/terms", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: "https://getjobquotes.uk/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
