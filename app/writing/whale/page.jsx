import Link from "next/link";
import { Page } from "../../../components/SiteChrome";
import ArrowIcon from "../../../components/ArrowIcon";
import { SITE_URL, pageMetadata } from "../../site";

const title = "Why every headset demo starts with a whale";
const description = "Val Kasabrukhau on XR demos, wonder as a design requirement, and why the ocean keeps showing up indoors.";
const datePublished = "2026-07-28";

export const metadata = pageMetadata({ title, description, path: "/writing/whale" });

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description,
  datePublished,
  dateModified: datePublished,
  url: `${SITE_URL}/writing/whale`,
  mainEntityOfPage: `${SITE_URL}/writing/whale`,
  author: { "@type": "Person", name: "Val Kasabrukhau", "@id": `${SITE_URL}/#val` },
};

export default function WhalePost() { return <Page active="writing"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /><article className="article"><Link className="back" href="/writing"><ArrowIcon direction="back" /> ALL RAMBLINGS</Link><div className="article-meta"><span className="article-date">07.28.26</span><span>4 MIN · NOTE</span></div><h1>Why every headset demo starts with a whale</h1><div className="article-rule" /><div className="article-content"><p>This is the template body for a rambling. Write like you talk — short paragraphs, one idea each. Duplicate this route for every new post, swap the date, title, and read-time above, and you’re published.</p><p>Second paragraph goes here. If a thought deserves emphasis, pull it out into a quote block like the one below instead of reaching for bold.</p><blockquote>A pull quote — the one sentence you’d want someone to screenshot.</blockquote><p>Short notes can be just two paragraphs and no quote. Long essays can repeat these blocks as many times as needed. Code, links, and <a href="https://github.com/vkasabrukhau" target="_blank" rel="noreferrer">inline references</a> all inherit the house style.</p></div><div className="article-thanks"><span>THANKS FOR READING</span><Link href="/writing">more ramblings <ArrowIcon /></Link></div></article></Page>; }
