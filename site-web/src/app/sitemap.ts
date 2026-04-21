import type { MetadataRoute } from "next";
import { CLINIC } from "@/lib/clinic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = CLINIC.url;
  const now = new Date();

  const routes = [
    { path: "/", priority: 1 },
    { path: "/presentation", priority: 0.8 },
    { path: "/a-propos", priority: 0.8 },
    { path: "/prestations", priority: 0.9 },
    { path: "/horaires-contact", priority: 0.8 },
    { path: "/urgence", priority: 0.8 },
  ];

  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: r.priority,
  }));
}
