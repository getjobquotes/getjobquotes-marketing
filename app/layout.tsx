import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import GlobalCalculator from "@/components/GlobalCalculator";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://getjobquotes.uk"),
  title: {
    default: "GetJobQuotes.uk – Quotes and Invoices for Tradespeople",
    template: "%s | GetJobQuotes.uk",
  },
  description: "Create professional quotes and invoices in under 2 minutes. Free for UK tradespeople. PDF generation, online acceptance, customer management.",
  keywords: ["quotes for tradespeople", "invoice app uk", "quoting software uk", "plumber invoice", "electrician quote"],
  openGraph: {
    title: "GetJobQuotes.uk – Quotes and Invoices for Tradespeople",
    description: "Create professional quotes and invoices in under 2 minutes. Free for UK tradespeople.",
    url: "https://getjobquotes.uk",
    siteName: "GetJobQuotes",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetJobQuotes.uk – Quotes and Invoices for Tradespeople",
    description: "Create professional quotes and invoices in under 2 minutes. Free for UK tradespeople.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://getjobquotes.uk" },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB"  suppressHydrationWarning>
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
          <GlobalCalculator />
        <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
