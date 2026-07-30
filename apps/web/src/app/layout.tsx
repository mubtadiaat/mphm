import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://m.p3hm.my.id"),
  title: {
    default: "P3HM & MPHM Lirboyo - Pusat Rilis Software & Aplikasi Resmi",
    template: "%s | P3HM & MPHM Lirboyo",
  },
  description:
    "Portal Resmi Distribusi Software Desktop Admin Sekretariat, Aplikasi Android Staff & Pengurus, dan Aplikasi Wali Santri Pondok Pesantren Putri Hidayatul Mubtadi'aat Lirboyo Kediri.",
  keywords: [
    "P3HM",
    "MPHM",
    "P3HM Lirboyo",
    "MPHM Lirboyo",
    "Lirboyo",
    "Lirboyo Kediri",
    "Pesantren Putri Hidayatul Mubtadi'aat",
    "Software Admin Sekretariat",
    "Aplikasi Wali Santri Lirboyo",
    "App Staff Pengurus Lirboyo",
    "Mustahiq Lirboyo",
    "Mufattisy Lirboyo",
    "Mundzir Lirboyo",
    "Raport Santri Lirboyo",
    "Sistem Informasi Pesantren",
  ],
  authors: [{ name: "P3HM & MPHM Lirboyo Kediri" }],
  creator: "P3HM & MPHM Lirboyo",
  publisher: "Pondok Pesantren Putri Hidayatul Mubtadi'aat Lirboyo Kediri",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://m.p3hm.my.id",
    siteName: "P3HM & MPHM Lirboyo",
    title: "P3HM & MPHM Lirboyo - Pusat Rilis Software & Aplikasi Resmi",
    description:
      "Portal Distribusi Resmi Software Desktop Admin Sekretariat & Aplikasi Mobile Pengurus, Mustahiq, dan Wali Santri Pondok Pesantren Putri Hidayatul Mubtadi'aat Lirboyo Kediri.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Logo P3HM & MPHM Lirboyo Kediri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "P3HM & MPHM Lirboyo - Pusat Rilis Software & Aplikasi Resmi",
    description:
      "Portal Distribusi Resmi Software Desktop Admin Sekretariat & Aplikasi Mobile Pondok Pesantren Putri Hidayatul Mubtadi'aat Lirboyo Kediri.",
    images: ["/logo.png"],
  },
  verification: {
    google: "NWFc77K47PFCLGvevFoceljSg4NFF9ls9J9cXgoAU3s",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://m.p3hm.my.id/#website",
      "url": "https://m.p3hm.my.id",
      "name": "P3HM & MPHM Lirboyo",
      "description": "Pusat Rilis Software & Aplikasi Resmi Pesantren Putri Hidayatul Mubtadi'aat Lirboyo Kediri",
      "inLanguage": "id-ID",
    },
    {
      "@type": "EducationalOrganization",
      "@id": "https://m.p3hm.my.id/#organization",
      "name": "Pondok Pesantren Putri Hidayatul Mubtadi'aat Lirboyo Kediri",
      "alternateName": ["P3HM Lirboyo", "MPHM Lirboyo"],
      "url": "https://m.p3hm.my.id",
      "logo": "https://m.p3hm.my.id/logo.png",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Kediri",
        "addressRegion": "Jawa Timur",
        "addressCountry": "ID",
      },
    },
    {
      "@type": "SoftwareApplication",
      "name": "Admin Mubtadiaat Software & Apps",
      "operatingSystem": "Windows 10, Windows 11, Android",
      "applicationCategory": "EducationalApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IDR",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased text-gray-900 bg-gray-50">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
