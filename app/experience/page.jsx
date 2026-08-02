import { Page } from "../../components/SiteChrome";
import TiltCard from "../../components/TiltCard";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Experience",
  description: "Where Val Kasabrukhau has worked — software engineering at Travelers, XR research at the Duke I3T Lab, Duke Applied Machine Learning, and the Nicholas Institute.",
  path: "/experience",
});

const jobs = [
  { years: "2025", place: "DURHAM, NC", org: "Duke I3T Lab", role: "Undergraduate Researcher · XR", tag: "RESEARCH", blurb: "Building mixed-reality experiences at the Intelligent Interactive Internet of Things Lab with Dr. Maria Gorlatova. The headsets are heavy; the ideas are not.", current: true },
  { years: "2025", place: "HARTFORD, CT", org: "Travelers", role: "EDP Software Engineer", tag: "ENTERPRISE", blurb: "In-house tools for 34,000+ employees. AI pipelines on AWS Bedrock & Textract for 11,000 underwriters, Terraform + Lambda infrastructure, and API queries 30% faster than I found them. Pitched product ideas to CIOs and lived.", current: true },
  { years: "2025", place: "DURHAM, NC", org: "Duke Applied Machine Learning", role: "Developer · Exec Team", tag: "CAMPUS", blurb: "Remodeling the member experience for 50+ builders — new web + mobile portal, prototyped in Figma, shipped on the MERN stack.", current: true },
  { years: "2024", place: "DURHAM, NC", org: "Nicholas Institute", role: "Researcher · Energy & History", tag: "RESEARCH", blurb: "From translating Soviet energy literature to co-authoring an honors thesis on post-USSR engineers in Silicon Valley. Zotero and I are on a first-name basis.", current: true },
  { years: "24–25", place: "DURHAM, NC", org: "Duke Robotics Club", role: "Electrical Engineering Team", tag: "HARDWARE", blurb: "Prototyping boards and acoustic signaling systems for an autonomous underwater robot. Soldering counts as cardio." },
  { years: "24–25", place: "NEW BRITAIN, CT", org: "Acme Monaco", role: "Database & AI Automation SWE", tag: "MANUFACTURING", blurb: "Automation for 300+ employees across three countries: MySQL restructures (~20% faster queries), Epicor ERP integrations, 10,000-item auto-inventory, and PyTorch guidewire inspection on a real factory floor." },
  { years: "2024", place: "BOSTON, MA", org: "International Economic Alliance", role: "Web Application Developer", tag: "POLICY", blurb: "Digital infrastructure for G20 events — Salesforce, SEO, and an NFC profile-exchange app prototype for delegates." },
  { years: "2023", place: "FARMINGTON, CT", org: "theCoderSchool", role: "Instructor", tag: "TEACHING", blurb: "Taught 150+ kids ages 7–13 to program. Debugging a 9-year-old’s infinite loop remains my hardest production incident." },
];

const jobCard = (j) => <TiltCard className={`job ${j.current ? "job--now" : "job--past"}`} key={j.org} strength={4}><div><div className="job-years">{j.years}{j.current && <span className="job-years-dash">—</span>}</div><div className="job-place">{j.place}</div>{j.current && <span className="job-now-pill"><i className="job-now-dot" />Now</span>}</div><div className="job-main"><h3>{j.org}</h3><div className="job-role">{j.role}</div><p>{j.blurb}</p></div></TiltCard>;

export default function Experience() {
  const now = jobs.filter((j) => j.current);
  const past = jobs.filter((j) => !j.current);
  return <Page active="experience"><header className="page-header"><h1 className="page-title">Places that let me <span className="accent">push to prod</span>.</h1></header><section className="jobs"><h2 className="jobs-divider">Currently</h2>{now.map(jobCard)}<h2 className="jobs-divider">Previously</h2>{past.map(jobCard)}</section></Page>;
}
