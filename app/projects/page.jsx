import { Page } from "../../components/SiteChrome";
import TiltCard from "../../components/TiltCard";
import GithubIcon from "../../components/GithubIcon";
import styles from "./page.module.css";

export default function Projects() {
  return <Page active="projects">
    <header className="page-header"><h1 className="page-title">Built at <span className="accent">2am</span>, mostly.</h1></header>
    <section className="projects">
      <TiltCard as="a" href="https://github.com/vkasabrukhau/NotedBuild" target="_blank" rel="noreferrer" className="project" strength={4}>
        <div className="project-body"><div className="eyebrow">01 · FLAGSHIP · NEXT.JS + TIPTAP + PRISMA</div><h2>noted</h2><p>A social note-taking platform for students — rich-text editor with AI math-to-LaTeX conversion, school communities, friend profiles, and a pixel-art tamagotchi that judges your study habits. Doto-headed, coffee-themed, unreasonably loved.</p><span className="repo-link">open the repo <GithubIcon /></span></div>
        <div className="project-art dots"><div className={`project-art-label ${styles.notedTypewriter}`} aria-label="Take notes. Make friends. Feed the tamagotchi."><span className={`${styles.typeLine} ${styles.typeLineOne}`}>take notes.</span><span className={`${styles.typeLine} ${styles.typeLineTwo}`}>make friends.</span><span className={`${styles.typeLine} ${styles.typeLineThree}`}>feed the tamagotchi.</span></div></div>
      </TiltCard>
      <TiltCard as="a" href="https://github.com/vkasabrukhau/Healthly2" target="_blank" rel="noreferrer" className="project reverse" strength={4}><div className="project-body"><div className="eyebrow">02 · VUE</div><h2>healthly</h2><p>A personal health companion built in Vue — tracking habits and vitals without making wellness feel like a spreadsheet.</p><span className="repo-link">open the repo <GithubIcon /></span></div><div className="project-art"><div className="project-art-label">+♥</div></div></TiltCard>
      <a className="more-repos" href="https://github.com/vkasabrukhau?tab=repositories" target="_blank" rel="noreferrer"><span>39 more repos of varying dignity — stock predictors, scrapers, classifiers…</span><GithubIcon className="more-repos-github" /></a>
    </section>
  </Page>;
}
