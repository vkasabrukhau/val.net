import Link from "next/link";
import { Page } from "../../components/SiteChrome";
import TiltCard from "../../components/TiltCard";

const posts = [
  { title: "Why every headset demo starts with a whale", copy: "On XR demos, wonder as a design requirement, and why the ocean keeps showing up indoors.", time: "4 MIN", type: "thought" },
  { title: "Nuclear power has a branding problem, not a physics problem", copy: "Notes from the Bass Connections archive and an argument for better PR for the atom.", time: "7 MIN", type: "rambling" },
  { title: "My grandfather’s slide rule vs. my LLM subscription", copy: "Soviet engineering culture, tools that force understanding, and what we trade for speed.", time: "6 MIN", type: "rambling" },
];

export default function Writing() {
  return <Page active="writing">
    <header className="page-header">
      <h1 className="page-title">The <span className="accent">ramblings</span> portal.</h1>
      <p className="page-intro">Essays, half-theories, and things I couldn’t fit in a commit message. Thoughts are quick sparks; ramblings take the scenic route.</p>
    </header>
    <section className="writing-list">
      {posts.map(({ title, copy, time, type }) => <TiltCard as="a" href="/writing/whale" className={`post-card post-card--${type}`} key={title} strength={3.5}>
        <div className="post-meta"><span className="post-date">07.26</span></div>
        <span><h2>{title}</h2><p>{copy}</p></span>
        <span className="post-time">{time}</span>
      </TiltCard>)}
      <div className="new-post">+ NEW RAMBLING — add a new post in <code>app/writing/page.jsx</code></div>
    </section>
  </Page>;
}
