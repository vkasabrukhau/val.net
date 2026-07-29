const githubAsset = "/assets/githublogo.svg";

export default function GithubIcon({ className = "" }) {
  return <span aria-hidden="true" className={`github-icon ${className}`} style={{ "--github-icon": `url(${githubAsset})` }} />;
}
