import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "GetJobQuotes — Quotes & Invoices for UK Trades", template: "%s | GetJobQuotes" },
  description: "Create professional quotes and invoices in under 2 minutes. Built for UK plumbers, electricians, builders and all tradespeople. Free to use.",
  keywords: ["quotes", "invoices", "tradespeople", "UK trades", "plumber", "electrician", "builder", "self employed", "quote generator"],
  authors: [{ name: "GetJobQuotes" }],
  creator: "GetJobQuotes",
  publisher: "GetJobQuotes",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "GetJobQuotes" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://getjobquotes.uk",
    siteName: "GetJobQuotes",
    title: "GetJobQuotes — Professional Quotes & Invoices for UK Trades",
    description: "Create professional quotes and invoices in under 2 minutes. Free for UK tradespeople.",
    images: [{ url: "https://getjobquotes.uk/og-image.png", width: 1200, height: 630, alt: "GetJobQuotes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetJobQuotes — Quotes & Invoices for UK Trades",
    description: "Professional quotes & invoices in under 2 minutes. Free for UK tradespeople.",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {process.env.NEXT_PUBLIC_GA_ID && <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
          <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}',{anonymize_ip:true});` }} />
        </>}
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`} crossOrigin="anonymous" />
        )}
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <ThemeProvider>
          {children}
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
