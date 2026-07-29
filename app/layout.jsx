import "./globals.css";
import "./fonts.css";
import { SITE_URL, OG_IMAGE, personSchema, websiteSchema } from "./site";

const description =
  "Val Kasabrukhau (Valiantsin) — Duke CS & Math student, XR researcher at the I3T Lab, software engineer at Travelers, and founder of Noted.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Val Kasabrukhau — Duke CS, XR Researcher, Founder of Noted",
    template: "%s · Val Kasabrukhau",
  },
  description,
  alternates: { canonical: "/" },
  keywords: [
    "Val Kasabrukhau",
    "Valiantsin Kasabrukhau",
    "Duke computer science",
    "I3T Lab",
    "XR research",
    "Noted app",
  ],
  authors: [{ name: "Val Kasabrukhau", url: SITE_URL }],
  creator: "Val Kasabrukhau",
  openGraph: {
    type: "website",
    siteName: "Val Kasabrukhau",
    title: "Val Kasabrukhau — Duke CS, XR Researcher, Founder of Noted",
    description,
    url: "/",
    images: [{ url: OG_IMAGE, width: 900, height: 900, alt: "Val Kasabrukhau" }],
  },
  twitter: {
    card: "summary",
    title: "Val Kasabrukhau — Duke CS, XR Researcher, Founder of Noted",
    description,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([personSchema, websiteSchema]) }} />
    {children}
  </body></html>;
}
