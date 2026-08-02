import { Page } from "../../components/SiteChrome";
import TiltCard from "../../components/TiltCard";
import GithubIcon from "../../components/GithubIcon";
import styles from "./page.module.css";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Projects",
  description: "Things Val Kasabrukhau is building — Noted, a social note-taking platform for students, Healthly, Jarvis, a smart mirror LLM integration, Brickonomics, and other late-night side projects.",
  path: "/projects",
});

export default function Projects() {
  return <Page active="projects">
    <header className="page-header"><h1 className="page-title">Built at <span className="accent">2am</span>, mostly.</h1></header>
    <section className="projects">
      <TiltCard className="project" strength={4}>
        <div className="project-body"><div className="eyebrow">01 · FLAGSHIP · NEXT.JS + TIPTAP + PRISMA</div><h2>noted</h2><p>A social note-taking platform for students — rich-text editor with AI math-to-LaTeX conversion, school communities, friend profiles, and a pixel-art tamagotchi that judges your study habits. Doto-headed, coffee-themed, unreasonably loved.</p><a className={styles.repoButton} href="https://github.com/vkasabrukhau/NotedBuild" target="_blank" rel="noreferrer">open the repo <GithubIcon /></a></div>
        <div className="project-art dots"><div className={`project-art-label ${styles.notedTypewriter}`} aria-label="Take notes. Make friends. Feed the tamagotchi."><span className={`${styles.typeLine} ${styles.typeLineOne}`}>take notes.</span><span className={`${styles.typeLine} ${styles.typeLineTwo}`}>make friends.</span><span className={`${styles.typeLine} ${styles.typeLineThree}`}>feed the tamagotchi.</span></div></div>
      </TiltCard>
      <TiltCard className="project reverse" strength={4}><div className="project-body"><div className="eyebrow">02 · VUE</div><h2>healthly</h2><p>A personal health companion built in Vue — tracking habits and vitals without making wellness feel like a spreadsheet.</p><a className={styles.repoButton} href="https://github.com/vkasabrukhau/Healthly2" target="_blank" rel="noreferrer">open the repo <GithubIcon /></a></div><div className="project-art"><div className="project-art-label">+♥</div></div></TiltCard>
      <TiltCard className="project" strength={4}>
        <div className="project-body"><div className="eyebrow">03 · OPEN SOURCE · MAGICMIRROR + HERMES + EDGE</div><h2>jarvis</h2><p>An open-source smart mirror integration, built as a MagicMirror community module as part of my research at the I3T Lab. A computer becomes an edge server running Obsidian wired into Hermes — an LLM harness powered by GPT and Claude Sonnet — while the mirror plays smart interface, pairing with a facial-recognition module so it knows who it&rsquo;s talking to. Mirror, mirror on the wall, now answering follow-up questions.</p></div>
        <div className="project-art">
          <div className={styles.jarvisScene} aria-hidden="true">
            <div className={styles.mirrorFrame}>
              <span className={styles.silhouette} />
              <span className={styles.reticle} />
              <span className={styles.scanline} />
              <span className={styles.scanCheck}>✓</span>
            </div>
            <div className={styles.linkPath}><span className={styles.packet} /></div>
            <div className={styles.laptop}>
              <span className={styles.laptopScreen}><span className={styles.termLine} /><span className={styles.termLine} /><span className={styles.termLine} /><span className={styles.cursor} /></span>
              <span className={styles.laptopBase} />
            </div>
          </div>
          <div className={`project-art-label ${styles.jarvisLabel}`}>mirror <span className={styles.jarvisAccent}>↔</span> edge</div>
        </div>
      </TiltCard>
      <TiltCard className="project reverse" strength={4}>
        <div className="project-body"><div className="eyebrow">04 · WEB APP · SCRAPING + STATISTICS</div><h2 className={styles.brickTitle}>brickonomics</h2><p>A statistics case study in scraping the Lego second-hand market alongside primary data on the sets themselves. The web app pins the prices real Lego customers actually pay for coveted sets — puncturing the &ldquo;Legoflation&rdquo; myths one data point at a time.</p></div>
        <div className="project-art">
          <div className={styles.brickChart} aria-hidden="true">
            {[3, 2, 4, 3, 5, 4, 6, 7].map((height, col, cols) => {
              const fallen = cols.slice(0, col).reduce((sum, h) => sum + h, 0);
              return <div key={col} className={styles.brickCol}>{Array.from({ length: height }, (_, row) => <span key={row} className={styles.brick} style={{ "--fall-delay": `${((fallen + row) * 0.06).toFixed(2)}s` }} />)}</div>;
            })}
            <svg className={styles.stockLine} viewBox="0 0 328 150"><polyline points="17,92 59,108 101,76 143,92 185,60 227,76 269,44 311,28" /><circle cx="311" cy="28" r="5" /></svg>
          </div>
        </div>
      </TiltCard>
      <a className="more-repos" href="https://github.com/vkasabrukhau?tab=repositories" target="_blank" rel="noreferrer"><span>39 more repos of varying dignity — stock predictors, scrapers, classifiers…</span><GithubIcon className="more-repos-github" /></a>
    </section>
  </Page>;
}
