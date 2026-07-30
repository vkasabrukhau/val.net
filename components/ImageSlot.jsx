"use client";

import { useEffect, useRef, useState } from "react";

// React port of the omelette <image-slot> starter: a user-fillable image
// placeholder. Drop or browse to fill; the image is downscaled through a
// canvas and persisted (IndexedDB stands in for the prototype's sidecar
// file, which needed a host write bridge this site doesn't have). Filled
// slots can be reframed — double-click or Edit, then drag to pan and
// scroll to zoom; Escape or clicking out commits the crop.

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const MAX_DIM = 1200;
const S_MAX = 5;
const DB_NAME = "recs-image-slots";
const DB_STORE = "slots";

const clampS = s => Math.max(1, Math.min(S_MAX, s));

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadSlots() {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const store = tx.objectStore(DB_STORE);
      const keys = store.getAllKeys();
      const vals = store.getAll();
      tx.oncomplete = () => {
        const out = {};
        keys.result.forEach((k, i) => {
          const v = vals.result[i];
          if (v && typeof v.u === "string" && /^data:image\//i.test(v.u)) out[k] = v;
        });
        resolve(out);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return {};
  }
}

export function persistSlot(id, value) {
  if (typeof indexedDB === "undefined" || !id) return;
  openDb().then(db => {
    const store = db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE);
    if (value) store.put(value, id);
    else store.delete(id);
  }).catch(() => {});
}

async function decodeFile(file) {
  if (typeof createImageBitmap === "function") {
    try { return await createImageBitmap(file); } catch {}
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("decode failed")); };
    img.src = url;
  });
}

// Re-encode through a canvas so storage carries resized bytes, not the raw
// upload: longest side capped at 2x the slot's rendered width and MAX_DIM.
async function fileToDataUrl(file, targetW) {
  const source = await decodeFile(file);
  try {
    const sw = source.naturalWidth || source.width;
    const sh = source.naturalHeight || source.height;
    const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
    const scale = Math.min(1, cap / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * scale));
    const h = Math.max(1, Math.round(sh * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(source, 0, 0, w, h);
    return canvas.toDataURL("image/webp", 0.85);
  } finally {
    if (source.close) source.close();
    else if (source.src?.startsWith("blob:")) URL.revokeObjectURL(source.src);
  }
}

export default function ImageSlot({ id, placeholder, alt, value, onChange, compact = false }) {
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const inputRef = useRef(null);
  const viewRef = useRef({ s: 1, x: 0, y: 0 });
  const genRef = useRef(0);
  const depthRef = useRef(0);
  const errTimerRef = useRef(null);
  const [over, setOver] = useState(false);
  const [reframe, setReframe] = useState(false);
  const [panning, setPanning] = useState(false);
  const [error, setError] = useState(null);
  const filled = !!value?.u;

  function geom() {
    const img = imgRef.current, frame = frameRef.current;
    if (!img || !frame) return null;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const fw = frame.clientWidth, fh = frame.clientHeight;
    if (!iw || !ih || !fw || !fh) return null;
    return { iw, ih, fw, fh, base: Math.max(fw / iw, fh / ih) };
  }

  function clampView() {
    const g = geom();
    if (!g) return;
    const v = viewRef.current;
    const mx = Math.max(0, (g.iw * g.base * v.s / g.fw - 1) * 50);
    const my = Math.max(0, (g.ih * g.base * v.s / g.fh - 1) * 50);
    v.x = Math.max(-mx, Math.min(mx, v.x));
    v.y = Math.max(-my, Math.min(my, v.y));
  }

  // Frame-percent geometry (cover baseline x view scale) so a responsive
  // resize keeps the same crop — same math as the prototype's _applyView.
  function applyView() {
    const img = imgRef.current;
    if (!img) return;
    const g = geom();
    if (!g) {
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.left = "50%";
      img.style.top = "50%";
      img.style.objectFit = "cover";
      return;
    }
    const k = g.base * viewRef.current.s;
    img.style.width = `${g.iw * k / g.fw * 100}%`;
    img.style.height = `${g.ih * k / g.fh * 100}%`;
    img.style.left = `${50 + viewRef.current.x}%`;
    img.style.top = `${50 + viewRef.current.y}%`;
    img.style.objectFit = "";
  }

  useEffect(() => {
    if (reframe) return;
    viewRef.current = {
      s: clampS(Number.isFinite(value?.s) ? value.s : 1),
      x: Number.isFinite(value?.x) ? value.x : 0,
      y: Number.isFinite(value?.y) ? value.y : 0,
    };
    clampView();
    applyView();
  });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const ro = new ResizeObserver(() => { clampView(); applyView(); });
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => clearTimeout(errTimerRef.current), []);

  function flashError(msg) {
    clearTimeout(errTimerRef.current);
    setError(msg);
    if (msg) errTimerRef.current = setTimeout(() => setError(null), 3000);
  }

  async function ingest(file) {
    flashError(null);
    if (!file || !ACCEPT.includes(file.type)) {
      flashError("Drop a PNG, JPEG, WebP, or AVIF image.");
      return;
    }
    const gen = ++genRef.current;
    try {
      const targetW = frameRef.current?.clientWidth || MAX_DIM;
      const url = await fileToDataUrl(file, targetW);
      if (gen !== genRef.current) return;
      setReframe(false);
      onChange({ u: url, s: 1, x: 0, y: 0 });
    } catch {
      if (gen !== genRef.current) return;
      flashError("Could not read that image.");
    }
  }

  function browse() {
    inputRef.current?.click();
  }

  function exitReframe() {
    setReframe(false);
    setPanning(false);
    if (filled) {
      const v = viewRef.current;
      onChange({ u: value.u, s: v.s, x: v.x, y: v.y });
    }
  }

  useEffect(() => {
    if (!reframe) return;
    const frame = frameRef.current;
    const outside = e => {
      if (frame && !e.composedPath().includes(frame)) exitReframe();
    };
    const esc = e => { if (e.key === "Escape") exitReframe(); };
    const wheel = e => {
      e.preventDefault();
      e.stopPropagation();
      const r = frame.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width * 100 - 50;
      const cy = (e.clientY - r.top) / r.height * 100 - 50;
      const v = viewRef.current;
      const next = clampS(v.s * Math.pow(1.0015, -e.deltaY));
      if (next === v.s) return;
      const k = next / v.s;
      v.s = next;
      v.x = cx * (1 - k) + v.x * k;
      v.y = cy * (1 - k) + v.y * k;
      clampView();
      applyView();
    };
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", esc, true);
    frame.addEventListener("wheel", wheel, { passive: false });
    return () => {
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", esc, true);
      frame.removeEventListener("wheel", wheel);
    };
  }, [reframe]);

  function startPan(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const frame = frameRef.current;
    frame.setPointerCapture(event.pointerId);
    setPanning(true);
    const rect = frame.getBoundingClientRect();
    const start = { px: event.clientX, py: event.clientY, x: viewRef.current.x, y: viewRef.current.y };
    const move = ev => {
      viewRef.current.x = start.x + (ev.clientX - start.px) / (rect.width || 1) * 100;
      viewRef.current.y = start.y + (ev.clientY - start.py) / (rect.height || 1) * 100;
      clampView();
      applyView();
    };
    const up = () => {
      frame.removeEventListener("pointermove", move);
      frame.removeEventListener("pointerup", up);
      frame.removeEventListener("pointercancel", up);
      setPanning(false);
    };
    frame.addEventListener("pointermove", move);
    frame.addEventListener("pointerup", up);
    frame.addEventListener("pointercancel", up);
  }

  function onDragInto(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    if (event.type === "dragenter") depthRef.current++;
    setOver(true);
  }

  function onDragLeave(event) {
    event.stopPropagation();
    if (--depthRef.current <= 0) {
      depthRef.current = 0;
      setOver(false);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    depthRef.current = 0;
    setOver(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) ingest(file);
  }

  const classes = ["recs-slot"];
  if (filled) classes.push("recs-slot--filled");
  if (over) classes.push("recs-slot--over");
  if (reframe) classes.push("recs-slot--reframe");
  if (panning) classes.push("recs-slot--panning");
  if (compact) classes.push("recs-slot--compact");

  return <div
    ref={frameRef}
    className={classes.join(" ")}
    onClick={event => { event.stopPropagation(); if (compact && filled) browse(); }}
    onDoubleClick={event => {
      event.stopPropagation();
      if (compact || !filled) return;
      if (reframe) exitReframe(); else setReframe(true);
    }}
    onKeyDown={event => event.stopPropagation()}
    onPointerDown={reframe ? startPan : undefined}
    onDragEnter={onDragInto}
    onDragOver={onDragInto}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
  >
    {filled && <img
      ref={imgRef}
      src={value.u}
      alt={alt || placeholder}
      draggable={false}
      onLoad={() => { clampView(); applyView(); }}
    />}
    {!filled && <button type="button" className="recs-slot-empty" onClick={browse} aria-label={`Upload ${placeholder}`}>
      {!compact && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
      </svg>}
      <span>{placeholder}</span>
      {!compact && <small>drop an image or browse</small>}
    </button>}
    {filled && !compact && <div className="recs-slot-ctl">
      <button type="button" onClick={browse} title="Replace image">Replace</button>
      <button type="button" onClick={() => (reframe ? exitReframe() : setReframe(true))} title="Reframe image">{reframe ? "Done" : "Edit"}</button>
      <button type="button" onClick={() => { setReframe(false); onChange(null); }} title="Remove image">Clear</button>
    </div>}
    {filled && compact && <button type="button" className="recs-slot-x" onClick={event => { event.stopPropagation(); onChange(null); }} aria-label={`Clear ${placeholder}`}>×</button>}
    {error && <div className="recs-slot-err" role="alert">{error}</div>}
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT.join(",")}
      hidden
      onChange={event => {
        const file = event.target.files?.[0];
        if (file) ingest(file);
        event.target.value = "";
      }}
    />
  </div>;
}
