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

// export const runtime = "edge";

export const metadata: Metadata = {
  title: "P3HM & MPHM Lirboyo - Sistem Informasi Pesantren",
  description: "Portal Resmi Sistem Informasi Pesantren & Akademik Pondok Pesantren Putri Hidayatul Mubtadi'at Lirboyo Kediri",
  verification: {
    google: "NWFc77K47PFCLGvevFoceljSg4NFF9ls9J9cXgoAU3s",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body className="font-sans antialiased text-gray-900 bg-gray-50 dark:bg-zinc-950 dark:text-gray-100">
        <Providers>
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
