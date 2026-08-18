"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import photos from "../data/photos.json";

// Approximate frame chrome (padding + caption) as a fraction of column width,
// so column balancing accounts for it on top of each image's aspect ratio.
const FRAME_CHROME = 0.18;

// Filter options come from the manifest itself (folder names / EXIF cameras
// assigned by scripts/process-photos.mjs), so new sources appear automatically.
const SOURCES = ["All", ...new Set(photos.map(p => p.source))];

const SORTS = [
  { key: "latest", label: "Latest" },
  { key: "earliest", label: "Earliest" },
  { key: "res-desc", label: "Highest res" },
  { key: "res-asc", label: "Lowest res" },
];

const COMPARATORS = {
  latest: (a, b) => new Date(b.date) - new Date(a.date),
  earliest: (a, b) => new Date(a.date) - new Date(b.date),
  "res-desc": (a, b) => b.width * b.height - a.width * a.height,
  "res-asc": (a, b) => a.width * a.height - b.width * b.height,
};

// Each frame gets a stable pseudo-random pose from its slug (not Math.random,
// which would mismatch between server and client renders): the manifest's
// alternating tilt scaled up, a wobble so tilts aren't uniform, and an x/y
// offset so frames sit off the column axis like a hand-scattered pile.
function pose(photo) {
  let h = 2166136261;
  for (const c of photo.slug) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const next = () => {
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
    return (((h >>> 0) % 1000) / 999) * 2 - 1; // -1..1
  };
  const rotate = (photo.rotation ?? 0) * 1.8 + next() * 0.8;
  const x = next() * 12;
  const y = next() * 10;
  return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rotate.toFixed(1)}deg)`;
}

function caption(photo) {
  const date = new Date(`${photo.date}T00:00:00`)
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();
  return `${photo.source.toUpperCase()} · ${date}`;
}

export default function PhotoGrid() {
  const [source, setSource] = useState("All");
  const [sort, setSort] = useState("latest");
  const [columnCount, setColumnCount] = useState(3);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 800px)");
    const update = () => setColumnCount(narrow.matches ? 1 : 3);
    update();
    narrow.addEventListener("change", update);
    return () => narrow.removeEventListener("change", update);
  }, []);

  const visible = (source === "All" ? photos : photos.filter(p => p.source === source))
    .toSorted(COMPARATORS[sort]);

  // Masonry: drop each photo into the currently-shortest column.
  const columns = Array.from({ length: columnCount }, () => []);
  const columnHeights = new Array(columnCount).fill(0);
  for (const photo of visible) {
    const shortest = columnHeights.indexOf(Math.min(...columnHeights));
    columns[shortest].push(photo);
    columnHeights[shortest] += photo.height / photo.width + FRAME_CHROME;
  }

  return <>
    <div className="photos-controls">
      <label className="photos-select">
        <span className="photos-select-label">filter</span>
        <select aria-label="Filter photos by source" value={source} onChange={e => setSource(e.target.value)}>
          {SOURCES.map(s => (
            <option key={s} value={s}>
              {s} ({s === "All" ? photos.length : photos.filter(p => p.source === s).length})
            </option>
          ))}
        </select>
      </label>
      <label className="photos-select">
        <span className="photos-select-label">sort</span>
        <select aria-label="Sort photos" value={sort} onChange={e => setSort(e.target.value)}>
          {SORTS.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
        </select>
      </label>
    </div>
    {visible.length === 0
      ? <p className="photos-empty">nothing here yet.</p>
      : <section className="photos-grid">{columns.map((column, index) => (
          <div className="photos-col" key={index}>{column.map(photo => (
            <Link
              className="photo-frame"
              style={{ transform: pose(photo) }}
              key={photo.label}
              href={`/photos/${photo.slug}`}
              aria-label={`Open ${photo.label} in full resolution`}
            >
              <div className="photo-slot">
                <img src={photo.src} alt={`${photo.label} photograph`} width={photo.width} height={photo.height} loading="lazy" />
              </div>
              <div className="photo-caption"><b>{photo.label}</b><small>{caption(photo)}</small></div>
            </Link>
          ))}</div>
        ))}</section>}
  </>;
}
