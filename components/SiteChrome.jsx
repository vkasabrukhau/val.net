import Link from "next/link";
import ArrowIcon from "./ArrowIcon";
import GithubIcon from "./GithubIcon";

const links = [
  ["home", "/"], ["experience", "/experience"], ["research", "/research"],
  ["projects", "/projects"], ["writing", "/writing"],
  ["recs", "/recs"],
];

export function Nav({ active }) {
  return <nav className="site-nav" aria-label="Main navigation"><div className="nav-pill">
    {links.map(([label, href]) => label === active ? <span className="nav-active" key={label}>{label}</span> : <Link href={href} key={label}>{label}</Link>)}
  </div></nav>;
}

export function Footer() {
  return <footer className="site-footer">
    <span>Val (Valiantsin) Kasabrukhau</span>
    <a href="mailto:vk135@duke.edu">vk135@duke.edu</a><a href="mailto:vkasabrukhau@gmail.com">vkasabrukhau@gmail.com</a>
    <a href="https://www.linkedin.com/in/valiantsin-kasabrukhau/" target="_blank" rel="noreferrer">linkedin <ArrowIcon direction="external" /></a>
    <a href="https://github.com/vkasabrukhau" target="_blank" rel="noreferrer">github <GithubIcon /></a>
  </footer>;
}

export function Page({ active, children }) {
  return <main className={`site-shell site-shell--${active}`}><Nav active={active} />{children}<Footer /></main>;
}
