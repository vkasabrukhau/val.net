import { Page } from "../../components/SiteChrome";
import TiltCard from "../../components/TiltCard";
import { pageMetadata } from "../site";
import { getPosts } from "../../lib/content";

export const metadata = pageMetadata({
  title: "Writing",
  description: "Essays and half-theories by Val Kasabrukhau on XR, nuclear energy, Soviet engineering culture, and the tools we build with.",
  path: "/writing",
});

const shortDate = iso => (iso ? `${iso.slice(5, 7)}.${iso.slice(2, 4)}` : "");

export default function Writing() {
  const posts = getPosts();
  return <Page active="writing">
    <header className="page-header">
      <h1 className="page-title">The <span className="accent">ramblings</span> portal.</h1>
      <p className="page-intro">Essays, half-theories, and things I couldn’t fit in a commit message. Thoughts are quick sparks; ramblings take the scenic route.</p>
    </header>
    <section className="writing-list">
      {posts.length === 0 && <p className="photos-empty">nothing here yet.</p>}
      {posts.map(({ slug, title, excerpt, date, minutes, type }) => <TiltCard as="a" href={`/writing/${slug}`} className={`post-card post-card--${type}`} key={slug} strength={3.5}>
        <div className="post-meta"><span className="post-date">{shortDate(date)}</span></div>
        <span><h2>{title}</h2><p>{excerpt}</p></span>
        <span className="post-time">{minutes} MIN</span>
      </TiltCard>)}
      <div className="new-post">+ NEW RAMBLING — drop a markdown file in <code>content/writing/</code></div>
    </section>
  </Page>;
}
