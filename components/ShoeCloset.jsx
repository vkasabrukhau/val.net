"use client";

import { useEffect, useRef, useState } from "react";

const BOX_WIDTH = 320;
const BOX_HEIGHT = 145;
const BOX_COLUMN_GAP = 28;
const BOX_ROW_GAP = 64;

const shoes = [
  { brand: "Nike", brandKey: "nike", tag: "daily", name: "Everyday sneaker", blurb: "The pair I reach for without thinking. Comfortable at hour ten, looks fine with everything.", meta: "OWNED · 2 YRS" },
  { brand: "Adidas", brandKey: "adidas", tag: "court", name: "Court pair", blurb: "Pickup games and pickleball alike. Grippy enough to embarrass someone.", meta: "INDOOR ONLY" },
  { brand: "Yeezy", brandKey: "yeezy", tag: "recovery", name: "Post-run slides", blurb: "Ugly on purpose. The first thing on after any long run, and I will not be shamed.", meta: "WORTH IT" },
  { brand: "ACG", brandKey: "acg", tag: "trail", name: "Off-road pair", blurb: "Mud, roots, questionable shortcuts. Grips everything, apologizes for nothing.", meta: "3 NATIONAL PARKS" },
  { brand: "Nike", brandKey: "nike", tag: "running", name: "Go-to runner", blurb: "Cushioned enough for long miles, light enough that I don't blame the shoes.", meta: "~400 MI" },
  { brand: "Adidas", brandKey: "adidas", tag: "indoor", name: "Indoor trainer", blurb: "Stable, quick, and made for the kind of session that runs longer than planned.", meta: "WEEKLY ROTATION" },
  { brand: "Yeezy", brandKey: "yeezy", tag: "foam", name: "Foam runner", blurb: "The answer for errand days when laces feel like an unnecessary negotiation.", meta: "EASY ON" },
  { brand: "ACG", brandKey: "acg", tag: "hike", name: "Hiking shoe", blurb: "A dependable companion for long trails, loose rock, and bad map decisions.", meta: "ALL TERRAIN" },
  { brand: "Nike", brandKey: "nike", tag: "retro", name: "Retro pick", blurb: "Older than some of my classmates. Still the best-looking thing on this shelf.", meta: "CLASSIC" },
  { brand: "Adidas", brandKey: "adidas", tag: "terrace", name: "Terrace classic", blurb: "Clean enough for dinner, durable enough for a day that wanders everywhere.", meta: "OFF-DUTY" },
  { brand: "Yeezy", brandKey: "yeezy", tag: "winter", name: "Winter boot", blurb: "Waterproof, warm, and immune to salt stains. Built for a proper cold snap.", meta: "SNOW READY" },
  { brand: "ACG", brandKey: "acg", tag: "weather", name: "All-weather boot", blurb: "For when the forecast looks hostile but the plan still sounds worth it.", meta: "RAIN OR SHINE" },
  { brand: "Nike", brandKey: "nike", tag: "gym", name: "Lifting shoe", blurb: "Flat, stable, zero bounce. Squats feel honest in these.", meta: "LEG DAY ONLY" },
  { brand: "Adidas", brandKey: "adidas", tag: "travel", name: "Airport slip-on", blurb: "Through security in four seconds. Comfort over dignity, always.", meta: "TSA APPROVED" },
  { brand: "Yeezy", brandKey: "yeezy", tag: "grail", name: "The grail pair", blurb: "Too clean to wear, too good to sell. They live on the shelf and judge the others.", meta: "0 WEARS · NO REGRETS" },
  { brand: "ACG", brandKey: "acg", tag: "camp", name: "Camp mule", blurb: "Easy around the campsite and forgiving after a day spent on your feet.", meta: "PACK LIGHT" },
  { brand: "Nike", brandKey: "nike", tag: "beater", name: "The beaters", blurb: "Lawn mowing, painting, rain errands. Every good rotation needs a sacrifice.", meta: "BEYOND SAVING" },
  { brand: "Adidas", brandKey: "adidas", tag: "nice-ish", name: "Dress-adjacent pick", blurb: "The one pair that survives weddings, interviews, and airport sprints alike.", meta: "BUY ONCE" },
  { brand: "Yeezy", brandKey: "yeezy", tag: "lounge", name: "Lounge pair", blurb: "Soft, understated, and reserved for a quiet weekend with nowhere to be.", meta: "SUNDAY ONLY" },
  { brand: "ACG", brandKey: "acg", tag: "ridge", name: "Ridge runner", blurb: "Light enough to move quickly, rugged enough for whatever the path becomes.", meta: "OUTSIDE" },
];

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
  const [open, setOpen] = useState(true);
  const stageRef = useRef(null);
  const sizerRef = useRef(null);
  const shelfRef = useRef(null);
  const scaleRef = useRef(1);
  const reducedRef = useRef(false);

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
      const rows = Math.ceil(shoes.length / columns);
      sizer.style.height = `${Math.round((rows * BOX_HEIGHT + (rows - 1) * BOX_ROW_GAP + 106) * scale)}px`;
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

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

  function go(delta) {
    setActive(current => (current + delta + shoes.length) % shoes.length);
    setOpen(true);
  }

  function pick(index) {
    if (index === active) setOpen(current => !current);
    else {
      setActive(index);
      setOpen(true);
    }
  }

  const shoe = shoes[active];

  return <>
    <div className="recs-stage" ref={stageRef} onMouseMove={parallax} onMouseLeave={unparallax}>
      <div className="recs-floor" />
      <div className="recs-sizer" ref={sizerRef}>
        <div className="recs-shelf" ref={shelfRef}>
          {shoes.map((s, index) => {
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
    <section className="recs-detail"><div>
      <div className="recs-counter">
        <b>{String(active + 1).padStart(2, "0")}/{String(shoes.length).padStart(2, "0")}</b>
        <span>{shoe.brand}</span>
      </div>
      <div className="recs-detail-body">
        <h2>{shoe.name}</h2>
        <p>{shoe.blurb}</p>
        <small>{shoe.meta}</small>
      </div>
      <div className="recs-detail-nav">
        <button type="button" aria-label="Previous pair" onClick={() => go(-1)}>←</button>
        <button type="button" aria-label="Next pair" onClick={() => go(1)}>→</button>
      </div>
    </div></section>
    <p className="recs-note">cars · tech — pulled from the shelf, returning soon</p>
  </>;
}
