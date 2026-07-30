"use client";

import { useEffect, useRef, useState } from "react";
import shoes from "../data/shoes.json";

const BOX_WIDTH = 320;
const BOX_HEIGHT = 145;
const BOX_COLUMN_GAP = 28;
const BOX_ROW_GAP = 64;

const CATEGORIES = ["All", "Running", "Hiking", "Casual", "Fashion"];

const TILT = -7;

function BrandMark({ brandKey, brand }) {
  const src = brandKey === "nike"
    ? "/assets/nikelogo.png"
    : brandKey === "adidas"
      ? "/assets/trefoillogo.jpg"
      : brandKey === "yeezy"
        ? "/assets/yeezylogo.png"
        : "/assets/acglogo.svg";

  return <img className={`recs-brand-mark recs-brand-mark--${brandKey}`} src={src} alt={`${brand} logo`} />;
}

export default function ShoeCloset() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const stageRef = useRef(null);
  const sizerRef = useRef(null);
  const shelfRef = useRef(null);
  const scaleRef = useRef(1);
  const reducedRef = useRef(false);

  const visible = category === "All" ? shoes : shoes.filter(s => s.category === category);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fit = () => {
      const stage = stageRef.current;
      const sizer = sizerRef.current;
      const shelf = shelfRef.current;
      if (!stage || !sizer || !shelf) return;

      const availableWidth = Math.max(240, stage.clientWidth - 48);
      const columns = availableWidth < 760 ? 2 : 4;
      const naturalWidth = columns * BOX_WIDTH + (columns - 1) * BOX_COLUMN_GAP;
      let scale = Math.min(1, availableWidth / naturalWidth);
      shelf.style.gridTemplateColumns = `repeat(${columns}, ${BOX_WIDTH}px)`;
      shelf.style.transform = `scale(${scale}) rotateX(${TILT}deg)`;

      const projectedWidth = shelf.getBoundingClientRect().width;
      if (projectedWidth > availableWidth) {
        scale *= availableWidth / projectedWidth;
        shelf.style.transform = `scale(${scale}) rotateX(${TILT}deg)`;
      }

      scaleRef.current = scale;
      const rows = Math.ceil(visible.length / columns);
      sizer.style.height = `${Math.round((rows * BOX_HEIGHT + (rows - 1) * BOX_ROW_GAP + 106) * scale)}px`;
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [visible.length]);

  function parallax(event) {
    const stage = stageRef.current;
    const shelf = shelfRef.current;
    if (reducedRef.current || !stage || !shelf) return;
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    shelf.style.transform = `scale(${scaleRef.current}) rotateX(${TILT - y * 6}deg) rotateY(${x * 8}deg)`;
  }

  function unparallax() {
    const shelf = shelfRef.current;
    if (shelf) shelf.style.transform = `scale(${scaleRef.current}) rotateX(${TILT}deg)`;
  }

  function pick(index) {
    if (index === active) setOpen(current => !current);
    else {
      setActive(index);
      setOpen(true);
    }
  }

  function pickCategory(next) {
    if (next === category) return;
    setCategory(next);
    setActive(0);
    setOpen(false);
  }

  return <>
    <nav className="recs-filter" aria-label="Shoe categories">
      {CATEGORIES.map(c => (
        <button
          key={c}
          type="button"
          className={c === category ? "is-active" : ""}
          aria-pressed={c === category}
          onClick={() => pickCategory(c)}
        >
          {c}
          <span>{c === "All" ? shoes.length : shoes.filter(s => s.category === c).length}</span>
        </button>
      ))}
    </nav>
    <div className="recs-stage" ref={stageRef} onMouseMove={parallax} onMouseLeave={unparallax}>
      <div className="recs-sizer" ref={sizerRef}>
        <div className="recs-shelf" ref={shelfRef}>
          {visible.map((s, index) => {
            const isOpen = index === active && open;
            return <div
            key={`${s.brandKey}-${s.tag}`}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Close" : "Open"} ${s.brand} ${s.name} box`}
            className={`recs-box recs-box--${s.brandKey}${isOpen ? " recs-box--open" : ""}${index === active ? " recs-box--active" : ""}`}
            onClick={() => pick(index)}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                pick(index);
              }
            }}
          >
            <div className="recs-box-inner">
              <div className="recs-face recs-back" />
              <div className="recs-face recs-side--l" />
              <div className="recs-face recs-side--r" />
              <div className="recs-face recs-lid--top" />
              <div className="recs-face recs-lid--bottom" />
              <div className="recs-front">
                <BrandMark brandKey={s.brandKey} brand={s.brand} />
              </div>
            </div>
          </div>;
          })}
        </div>
      </div>
    </div>
  </>;
}
