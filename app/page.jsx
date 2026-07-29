import Link from "next/link";
import { Page } from "../components/SiteChrome";
import TiltCard from "../components/TiltCard";
import HeroDither from "../components/HeroDither";
import ArrowIcon from "../components/ArrowIcon";
import GithubIcon from "../components/GithubIcon";

const cards = [
  ["01", "Where I’ve worked", "Travelers, Acme Monaco, DAML, a robotics club, and a town hall basement.", "/experience"],
  ["02", "What I research", "Mixed reality at the I3T Lab, and how Soviet engineers quietly built Silicon Valley.", "/research", "dark"],
  ["03", "What I’m building", "Noted, Healthly, and whatever idea refused to let me sleep this week.", "/projects"],
];

export default function Home() {
  return <Page active="home"><section className="home-hero"><HeroDither /><div className="hero-inner"><h1 className="home-title">Hey, I’m Val Kasabrukhau.<br />I make <span className="gradient-text">cool stuff</span>.</h1><div className="button-row"><Link className="button button-primary" href="/experience">see the work <ArrowIcon /></Link><a className="button button-secondary" href="https://github.com/vkasabrukhau" target="_blank" rel="noreferrer">github <GithubIcon /></a></div></div></section><div className="ticker"><div className="ticker-track">{["XR RESEARCH", "◦", "NUCLEAR ENERGY", "◦", "QUANTUM COMPUTING", "◦", "AI IN EDUCATION", "◦", "A LITTLE BIT OF HISTORY", "◦", "XR RESEARCH", "◦", "NUCLEAR ENERGY", "◦", "QUANTUM COMPUTING", "◦", "AI IN EDUCATION", "◦", "A LITTLE BIT OF HISTORY", "◦"].map((text, i) => <span key={i}>{text}</span>)}</div></div><section className="home-cards">{cards.map(([number, title, text, href, theme]) => <TiltCard as="a" href={href} key={title} className={`home-card ${theme || ""}`}><span className="number">{number}</span><h2>{title}</h2><p>{text}</p><ArrowIcon className="arrow" /></TiltCard>)}</section></Page>;
}
