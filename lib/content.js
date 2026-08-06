// Reads writing posts out of the Obsidian vault at content/writing/.
// Frontmatter + markdown are parsed by hand (subset documented in
// content/CONVENTIONS.md) so the site stays dependency-free.
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const WRITING_DIR = join(process.cwd(), "content", "writing");

// Frontmatter subset: `key: value` lines between --- fences.
// Values: plain strings, true/false, and [a, b] arrays.
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const entry = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!entry) continue;
    const key = entry[1];
    const value = entry[2].trim();
    if (/^\[.*\]$/.test(value)) {
      data[key] = value.slice(1, -1).split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else if (value === "true" || value === "false") {
      data[key] = value === "true";
    } else {
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { data, body: raw.slice(match[0].length) };
}

const escapeHtml = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Inline markdown: `code`, ![img](src), [link](href), **bold**, *italic*.
function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) =>
      /^https?:\/\//.test(href)
        ? `<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`
        : `<a href="${href}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

// Block markdown: paragraphs, ## headings, > quotes, - and 1. lists,
// ``` code fences, and --- rules.
export function renderMarkdown(md) {
  const html = [];
  const lines = md.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("```")) {
      const code = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) code.push(lines[i]);
      i++;
      html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      html.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) { html.push("<hr />"); i++; continue; }
    if (line.startsWith(">")) {
      const quote = [];
      for (; i < lines.length && lines[i].startsWith(">"); i++) quote.push(lines[i].replace(/^>\s?/, ""));
      html.push(`<blockquote><p>${quote.map(inline).join(" ").trim()}</p></blockquote>`);
      continue;
    }
    const listItem = /^(\s*)([-*]|\d+\.)\s+/.exec(line);
    if (listItem) {
      const ordered = /\d/.test(listItem[2]);
      const items = [];
      for (; i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i]); i++) {
        items.push(`<li>${inline(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ""))}</li>`);
      }
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }
    const paragraph = [];
    for (; i < lines.length && lines[i].trim() && !/^(#{1,6}\s|>|```|\s*([-*]|\d+\.)\s)/.test(lines[i]); i++) {
      paragraph.push(lines[i]);
    }
    html.push(`<p>${inline(paragraph.join(" "))}</p>`);
  }
  return html.join("\n");
}

function toPost(file) {
  const slug = file.replace(/\.md$/, "");
  const { data, body } = parseFrontmatter(readFileSync(join(WRITING_DIR, file), "utf8"));
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    body,
    title: data.title || slug,
    date: data.date || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    type: data.type === "thought" ? "thought" : "rambling",
    excerpt: data.excerpt || "",
    draft: data.draft === true,
    minutes: Math.max(1, Math.round(words / 200)),
  };
}

export function getPosts() {
  if (!existsSync(WRITING_DIR)) return [];
  return readdirSync(WRITING_DIR)
    .filter(f => f.endsWith(".md") && !f.startsWith("_"))
    .map(toPost)
    .filter(post => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug) {
  const post = getPosts().find(p => p.slug === slug);
  return post ? { ...post, html: renderMarkdown(post.body) } : null;
}
