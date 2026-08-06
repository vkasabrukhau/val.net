import { SITE_URL } from "./site";
import { getPosts } from "../lib/content";

const routes = [
  ["", 1],
  ["/experience", 0.9],
  ["/research", 0.9],
  ["/projects", 0.9],
  ["/writing", 0.8],
  ["/photos", 0.6],
  ["/recs", 0.6],
];

export default function sitemap() {
  const lastModified = new Date();
  const pages = routes.map(([path, priority]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority,
  }));
  const posts = getPosts().map(({ slug, date }) => ({
    url: `${SITE_URL}/writing/${slug}`,
    lastModified: date ? new Date(date) : lastModified,
    changeFrequency: "yearly",
    priority: 0.7,
  }));
  return [...pages, ...posts];
}
