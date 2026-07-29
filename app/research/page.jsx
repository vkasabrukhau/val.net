import { Page } from "../../components/SiteChrome";
import TiltCard from "../../components/TiltCard";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Research",
  description: "Val Kasabrukhau's research — mixed reality at the Duke I3T Lab with Dr. Maria Gorlatova, plus energy history and post-Soviet engineers in Silicon Valley.",
  path: "/research",
});

function ResearchCard({ dark, label, title, copy, art }) { return <TiltCard className={`research-card ${dark ? "dark" : ""}`}><div className="research-art"><div className="dot-field" /><div className="art-label">{art}</div></div><div className="research-body"><div className="eyebrow">{label}</div><h2>{title}</h2><p>{copy}</p></div></TiltCard>; }
export default function Research() { return <Page active="research"><header className="page-header"><h1 className="page-title">Things I stare at until they make <span className="accent">sense</span>.</h1></header><section className="research-grid"><ResearchCard dark art="[ XR ]" label="I3T LAB · PRATT SCHOOL OF ENGINEERING · 2025→" title="Mixed reality that feels like the room belongs to it" copy="At the Intelligent Interactive Internet of Things Lab, I work with Dr. Maria Gorlatova’s group on immersive AR/VR experiences — where headsets, edge computing, and human perception collide. My job is making the virtual layer feel less like an overlay and more like physics." /><ResearchCard art="СССР→SV" label="NICHOLAS INSTITUTE · HONORS THESIS · 2024→" title="How Soviet engineers quietly built Silicon Valley" copy="Co-authoring an honors thesis with Prof. Cinq-Mars on post-USSR immigration to Silicon Valley — 30+ years of history, original Russian-language archival work, and interviews with the founders and engineers who carried Soviet technical culture into American innovation." /></section><section className="research-note"><div><div><div className="eyebrow">EARLIER · BASS CONNECTIONS · 2024–25</div><div>Reexamining nuclear power in the Carolinas — translated Soviet energy literature, traced the Druzhba pipeline.</div></div><span className="doto">☢ → ⚡</span></div></section></Page>; }
