// Single source of truth for the canonical origin. Set NEXT_PUBLIC_SITE_URL in
// Vercel once the custom domain is live; the fallback keeps local builds valid.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://valkasabrukhau.com").replace(/\/$/, "");

export const OG_IMAGE = "/assets/val-portrait2.png";

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#val`,
  name: "Valiantsin Kasabrukhau",
  alternateName: ["Val Kasabrukhau", "Val"],
  url: SITE_URL,
  image: `${SITE_URL}${OG_IMAGE}`,
  jobTitle: "Software Engineer, Researcher, Founder",
  description:
    "Duke CS/Math student. XR research at the I3T Lab, software engineering at Travelers, building Noted.",
  email: "mailto:vk135@duke.edu",
  knowsAbout: ["Extended Reality", "Mixed Reality", "Machine Learning", "Nuclear Energy", "Quantum Computing"],
  affiliation: [
    { "@type": "CollegeOrUniversity", name: "Duke University", url: "https://duke.edu" },
    { "@type": "Organization", name: "Travelers", url: "https://www.travelers.com" },
    { "@type": "Organization", name: "Duke I3T Lab", url: "https://maria.gorlatova.com" },
  ],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Duke University" },
  sameAs: [
    "https://www.linkedin.com/in/valiantsin-kasabrukhau/",
    "https://github.com/vkasabrukhau",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Val Kasabrukhau",
  publisher: { "@id": `${SITE_URL}/#val` },
};

// Helper so every route file stays a one-liner.
export function pageMetadata({ title, description, path }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · Val Kasabrukhau`, description, url: path, type: "website" },
  };
}
