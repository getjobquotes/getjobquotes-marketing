import type { MetadataRoute } from "next";

const BASE = "https://getjobquotes.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const routes: MetadataRoute.Sitemap = [
    // Core public pages
    { url: BASE,                    lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/demo`,          lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/pricing`,       lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/features`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`,       lastModified: now, changeFrequency: "yearly",  priority: 0.6 },

    // Help centre
    { url: `${BASE}/help`,                      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/help/getting-started`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/help/quotes`,               lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/help/invoices`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/help/customers`,            lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/help/calculator`,           lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // Guides
    { url: `${BASE}/guides`,                              lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/guides/how-to-write-a-quote-uk`,      lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/guides/how-to-write-an-invoice-uk`,   lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/guides/how-to-price-a-job`,           lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/guides/quote-template-uk`,            lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/guides/invoice-template-uk`,          lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/guides/vat-calculator-uk`,            lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/guides/labour-rate-calculator-uk`,    lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Templates
    { url: `${BASE}/templates/quote-template-uk`,         lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/templates/invoice-template-uk`,       lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // Legal
    { url: `${BASE}/privacy`,  lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/terms`,    lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/cookies`,  lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes;
}
