"use client";

import { useState } from "react";
import photos from "../data/photos.json";

const SOURCES = ["All", "iPhone", "Fujifilm X-M5", "Digital Art", "Drawings"];

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

function caption(photo) {
  const date = new Date(`${photo.date}T00:00:00`)
    .toLocaleDateString("en-US", { month: "short", year: "numeric" })
    .toUpperCase();
  return `${photo.source.toUpperCase()} · ${date}`;
}

export default function PhotoGrid() {
  const [source, setSource] = useState("All");
  const [sort, setSort] = useState("latest");

  const visible = (source === "All" ? photos : photos.filter(p => p.source === source))
    .toSorted(COMPARATORS[sort]);

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
      : <section className="photos-grid">{visible.map(photo => (
          <div
            className="photo-frame"
            style={{ transform: `rotate(${photo.rotation ?? 0}deg)` }}
            key={photo.label}
          >
            <div className="photo-slot">
              <img src={photo.src} alt={`${photo.label} photograph`} width={photo.width} height={photo.height} loading="lazy" />
            </div>
            <div className="photo-caption"><b>{photo.label}</b><small>{caption(photo)}</small></div>
          </div>
        ))}</section>}
  </>;
}
