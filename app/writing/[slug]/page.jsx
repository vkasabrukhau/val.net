import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "../../../components/SiteChrome";
import ArrowIcon from "../../../components/ArrowIcon";
import { SITE_URL, pageMetadata } from "../../site";
import { getPost, getPosts } from "../../../lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({ title: post.title, description: post.excerpt, path: `/writing/${slug}` });
}

const fullDate = iso => (iso ? `${iso.slice(5, 7)}.${iso.slice(8, 10)}.${iso.slice(2, 4)}` : "");

export default async function Post({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    url: `${SITE_URL}/writing/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/writing/${post.slug}`,
    author: { "@type": "Person", name: "Val Kasabrukhau", "@id": `${SITE_URL}/#val` },
  };

  return <Page active="writing">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
    <article className="article">
      <Link className="back" href="/writing"><ArrowIcon direction="back" /> ALL RAMBLINGS</Link>
      <div className="article-meta">
        <span className="article-date">{fullDate(post.date)}</span>
        <span>{post.minutes} MIN · {post.type.toUpperCase()}</span>
      </div>
      <h1>{post.title}</h1>
      <div className="article-rule" />
      <div className="article-content" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="article-thanks"><span>THANKS FOR READING</span><Link href="/writing">more ramblings <ArrowIcon /></Link></div>
    </article>
  </Page>;
}
