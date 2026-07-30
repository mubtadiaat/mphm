import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/sekretariat/",
        "/mustahiq/",
        "/mufattisy/",
        "/guardian/",
        "/pimpinan/",
        "/keamanan/",
      ],
    },
    sitemap: "https://m.p3hm.my.id/sitemap.xml",
  };
}
