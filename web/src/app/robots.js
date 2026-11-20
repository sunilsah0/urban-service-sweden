export default function robots() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/provider", "/admin", "/account"] },
    sitemap: `${site}/sitemap.xml`,
  };
}