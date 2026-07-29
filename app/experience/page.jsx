import { Page } from "../../components/SiteChrome";
import TiltCard from "../../components/TiltCard";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Experience",
  description: "Where Val Kasabrukhau has worked — software engineering at Travelers, XR research at the Duke I3T Lab, Duke Applied Machine Learning, and the Nicholas Institute.",
  path: "/experience",
});

const jobs = [
  ["2025→", "DURHAM, NC", "Duke I3T Lab", "Undergraduate Researcher · XR", "RESEARCH", "Building mixed-reality experiences at the Intelligent Interactive Internet of Things Lab with Dr. Maria Gorlatova. The headsets are heavy; the ideas are not.", true],
  ["2025→", "HARTFORD, CT", "Travelers", "EDP Software Engineer", "ENTERPRISE", "In-house tools for 34,000+ employees. AI pipelines on AWS Bedrock & Textract for 11,000 underwriters, Terraform + Lambda infrastructure, and API queries 30% faster than I found them. Pitched product ideas to CIOs and lived."],
  ["2025→", "DURHAM, NC", "Duke Applied Machine Learning", "Developer · Exec Team", "CAMPUS", "Remodeling the member experience for 50+ builders — new web + mobile portal, prototyped in Figma, shipped on the MERN stack."],
  ["2024→", "DURHAM, NC", "Nicholas Institute", "Researcher · Energy & History", "RESEARCH", "From translating Soviet energy literature to co-authoring an honors thesis on post-USSR engineers in Silicon Valley. Zotero and I are on a first-name basis."],
  ["24–25", "DURHAM, NC", "Duke Robotics Club", "Electrical Engineering Team", "HARDWARE", "Prototyping boards and acoustic signaling systems for an autonomous underwater robot. Soldering counts as cardio."],
  ["24–25", "NEW BRITAIN, CT", "Acme Monaco", "Database & AI Automation SWE", "MANUFACTURING", "Automation for 300+ employees across three countries: MySQL restructures (~20% faster queries), Epicor ERP integrations, 10,000-item auto-inventory, and PyTorch guidewire inspection on a real factory floor."],
  ["2024", "BOSTON, MA", "International Economic Alliance", "Web Application Developer", "POLICY", "Digital infrastructure for G20 events — Salesforce, SEO, and an NFC profile-exchange app prototype for delegates."],
  ["2023", "FARMINGTON, CT", "theCoderSchool", "Instructor", "TEACHING", "Taught 150+ kids ages 7–13 to program. Debugging a 9-year-old’s infinite loop remains my hardest production incident."],
];
export default function Experience() { return <Page active="experience"><header className="page-header"><h1 className="page-title">Places that let me <span className="accent">push to prod</span>.</h1></header><section className="jobs">{jobs.map(([years, place, org, role, , blurb, dark]) => <TiltCard className={`job ${dark ? "dark" : ""}`} key={org} strength={4}><div><div className="job-years">{years}</div><div className="job-place">{place}</div></div><div className="job-main"><h2>{org}</h2><div className="job-role">{role}</div><p>{blurb}</p></div></TiltCard>)}</section></Page>; }
