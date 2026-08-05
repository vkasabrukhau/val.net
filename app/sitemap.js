import { SITE_URL } from "./site";

const routes = [
  ["", 1],
  ["/experience", 0.9],
  ["/research", 0.9],
  ["/projects", 0.9],
  ["/writing", 0.8],
  ["/recs", 0.6],
  ["/writing/whale", 0.5],
];

export default function sitemap() {
  const lastModified = new Date();
  return routes.map(([path, priority]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority,
  }));
}
