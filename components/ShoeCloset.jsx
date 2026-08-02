"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import shoes from "../data/shoes.json";
import shoeImages from "../data/shoe-images.json";
import { AdidasSizeLabel, NikeSizeLabel } from "./ShoeSizeLabels";

const BOX_WIDTH = 320;
const BOX_HEIGHT = 145;
const BOX_COLUMN_GAP = 28;
const BOX_ROW_GAP = 64;

const CATEGORIES = ["All", "Running", "Hiking", "Casual", "Fashion"];

const TILT = -15;

// Degrees of rotateY per column step away from center; outer columns angle
// away from center so the row wraps outward around a circle bulging toward
// the viewer.
const YAW_STEP = 3;

// Split view: width reserved for the info column on desktop, and the featured
// box's vertical margins in shelf space — these mirror .recs-stage--split and
// .recs-box--featured in globals.css.
const INFO_COLUMN = 560;
const FEATURED_MT = 56;
const FEATURED_MB = 120;

// Size sticker on the lid: rotated 90° in the lid plane so it runs along the
// box depth, flush against the right edge from the front-right corner, flipped
// 180° so it reads front-to-back. translateX(100%) pulls the rotated label
// back inside the lid using its own rendered width.
const LABEL_WIDTH = 150;

const ADIDAS_US11 = { US: "11", UK: "10½", F: "45⅓", D: "10½", J: "290", CHN: "285" };

function LidSizeLabel({ brandKey, tag, name }) {
  const placement = {
    position: "absolute",
    right: 0,
    bottom: 0,
    transformOrigin: "bottom right",
    transform: "rotate(-90deg) translateX(100%) translateZ(1px)",
    pointerEvents: "none",
  };
  if (brandKey === "nike" || brandKey === "acg") {
    // Match the label to the box colorway: white paper on white race boxes,
    // box-colored panel on blazer boxes (see boxVariantClass).
    const isRace = /vaporfly|alphafly/.test(tag);
    const isBlazer = tag.includes("blazer");
    return (
      <NikeSizeLabel
        width={LABEL_WIDTH}
        name={name}
        us="11"
        paper={isRace ? "#fff" : undefined}
        accent={isRace ? "#fff" : isBlazer ? "#C2533B" : undefined}
        ink={isRace ? "#000" : undefined}
        style={placement}
      />
    );
  }
  return (
    <AdidasSizeLabel
      width={LABEL_WIDTH}
      name={name}
      gender="men"
      sizes={ADIDAS_US11}
      style={placement}
    />
  );
}

const BRAND_LOGOS = {
  nike: "/assets/nikelogo.png",
  adidas: "/assets/trefoillogo.jpg",
  yeezy: "/assets/yeezylogo.png",
  acg: "/assets/acglogo.svg",
  newbalance: "/assets/newbalancelogo2.png",
  salomon: "/assets/solomonlogo.jpg",
  birkenstock: "/assets/birkenstock-logo.png",
};

// Model-specific box colorways layered over the brand default.
function boxVariantClass(tag) {
  if (tag.includes("blazer")) return " recs-box--blazer";
  if (/vaporfly|alphafly/.test(tag)) return " recs-box--race";
  if (/1080|supercomp/.test(tag)) return " recs-box--nb-red";
  return "";
}

function BrandMark({ brandKey, brand, tag }) {
  if (tag.includes("blazer")) {
    return (
      <img
        className="recs-brand-mark recs-brand-mark--blazer"
        src="/assets/nikevintagelogo.png"
        alt={`${brand} vintage logo`}
      />
    );
  }

  const src = BRAND_LOGOS[brandKey];
  if (!src) return null; // brands without artwork get a blank box front

  return <img className={`recs-brand-mark recs-brand-mark--${brandKey}`} src={src} alt={`${brand} logo`} />;
}

export default function ShoeCloset() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [columns, setColumns] = useState(4);
  const stageRef = useRef(null);
  const sizerRef = useRef(null);
  const shelfRef = useRef(null);
  const scaleRef = useRef(1);
  const reducedRef = useRef(false);
  const hoverRef = useRef(-1);
  const flipRef = useRef(new Map());

  const visible = category === "All" ? shoes : shoes.filter(s => s.category === category);
  const shoe = visible.length ? visible[Math.min(active, visible.length - 1)] : null;
  const split = open && shoe !== null;

  function fit() {
    const stage = stageRef.current;
    const sizer = sizerRef.current;
    const shelf = shelfRef.current;
    if (!stage || !sizer || !shelf) return;

    const stacked = window.matchMedia("(max-width: 800px)").matches;
    const reserved = open && !stacked ? INFO_COLUMN : 0;
    const availableWidth = Math.max(240, stage.clientWidth - 48 - reserved);
    const cols = open ? 2 : availableWidth < 760 ? 2 : 4;
    setColumns(cols);
    const naturalWidth = cols * BOX_WIDTH + (cols - 1) * BOX_COLUMN_GAP;
    let scale = Math.min(1, availableWidth / naturalWidth);
    shelf.style.gridTemplateColumns = `repeat(${cols}, ${BOX_WIDTH}px)`;

    // Measure the perspective-projected width with the shelf transition
    // suspended so the reading reflects the target transform rather than a
    // mid-transition frame, then restore and apply the corrected transform.
    const prevTransform = shelf.style.transform;
    shelf.style.transition = "none";
    shelf.style.transform = `scale(${scale}) rotateX(${TILT}deg)`;
    const projectedWidth = shelf.getBoundingClientRect().width;
    if (projectedWidth > availableWidth) scale *= availableWidth / projectedWidth;
    shelf.style.transform = prevTransform;
    void shelf.offsetHeight;
    shelf.style.transition = "";
    shelf.style.transform = `scale(${scale}) rotateX(${TILT}deg)`;

    scaleRef.current = scale;
    const rows = open ? 1 + Math.ceil((visible.length - 1) / 2) : Math.ceil(visible.length / cols);
    const featuredExtra = open ? FEATURED_MT + FEATURED_MB : 0;
    sizer.style.height = `${Math.round((rows * BOX_HEIGHT + (rows - 1) * BOX_ROW_GAP + featuredExtra + 106) * scale)}px`;
  }

  // FLIP: event handlers snapshot each box's pre-change grid offset; after
  // React commits the new layout, playFlip measures the new offsets and
  // animates every moved box across the difference. offsetLeft/Top ignore
  // transforms, so the deltas live in unscaled shelf space and compose with
  // the shelf's own scale transition.
  function snapshot() {
    const shelf = shelfRef.current;
    const map = flipRef.current;
    map.clear();
    if (!shelf) return;
    // The shelf's own layout box narrows and recenters instantly when the
    // column count changes, so its stage-relative offset is snapshotted too
    // and folded into every box delta — box offsets alone are shelf-relative
    // and would miss that container jump.
    map.set("__shelf", { x: shelf.offsetLeft, y: shelf.offsetTop });
    for (const el of shelf.children) map.set(el.dataset.tag, { x: el.offsetLeft, y: el.offsetTop });
  }

  function playFlip() {
    const shelf = shelfRef.current;
    const map = flipRef.current;
    if (!shelf || !map.size) return;
    const shelfPrev = map.get("__shelf");
    const sdx = shelfPrev ? shelfPrev.x - shelf.offsetLeft : 0;
    const sdy = shelfPrev ? shelfPrev.y - shelf.offsetTop : 0;
    const moved = [];
    if (!reducedRef.current) {
      for (const el of shelf.children) {
        const prev = map.get(el.dataset.tag);
        if (!prev) continue;
        const dx = prev.x - el.offsetLeft + sdx;
        const dy = prev.y - el.offsetTop + sdy;
        if (dx || dy) {
          el.classList.add("recs-box--teleport");
          el.style.setProperty("--fx", `${dx}px`);
          el.style.setProperty("--fy", `${dy}px`);
          moved.push(el);
        }
      }
    }
    map.clear();
    if (!moved.length) return;
    void shelf.offsetHeight;
    requestAnimationFrame(() => {
      for (const el of moved) {
        el.classList.remove("recs-box--teleport");
        el.style.setProperty("--fx", "0px");
        el.style.setProperty("--fy", "0px");
      }
    });
  }

  useLayoutEffect(() => {
    fit();
    playFlip();
  }, [category, open, active]);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [category, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = event => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // After an open or featured swap, bring the box and the full info card into
  // view: the top of the page when everything fits the viewport, otherwise
  // just far enough down that the card's bottom edge clears it. The aside is
  // measured instead of the card so a currently-stuck sticky card doesn't
  // skew the target.
  useEffect(() => {
    if (!open) return;
    const aside = stageRef.current?.querySelector(".recs-info");
    const card = aside?.querySelector(".recs-info-card");
    if (!card) return;
    const asideTop = aside.getBoundingClientRect().top + window.scrollY;
    const cardHeight = card.getBoundingClientRect().height;
    const target = Math.max(0, Math.min(asideTop + cardHeight + 24 - window.innerHeight, asideTop - 28));
    window.scrollTo({ top: target, behavior: reducedRef.current ? "auto" : "smooth" });
  }, [open, active]);

  function close() {
    snapshot();
    setOpen(false);
  }

  // The tilted, perspective-projected boxes render offset from their flat DOM
  // hit rects (lower rows drift furthest), so the shelf ignores pointer events
  // and clicks/hovers are resolved here against the projected front-face rects.
  function boxAt(clientX, clientY) {
    const shelf = shelfRef.current;
    if (!shelf) return -1;
    const boxes = shelf.children;
    let frontHit = -1;
    let frontDist = Infinity;
    let planeHit = -1;
    for (let i = 0; i < boxes.length; i++) {
      const front = boxes[i].querySelector(".recs-front")?.getBoundingClientRect();
      if (
        front &&
        clientX >= front.left && clientX <= front.right &&
        clientY >= front.top && clientY <= front.bottom
      ) {
        const dist = Math.hypot(
          clientX - (front.left + front.right) / 2,
          clientY - (front.top + front.bottom) / 2,
        );
        if (dist < frontDist) {
          frontDist = dist;
          frontHit = i;
        }
      } else if (planeHit === -1) {
        const plane = boxes[i].getBoundingClientRect();
        if (
          clientX >= plane.left && clientX <= plane.right &&
          clientY >= plane.top && clientY <= plane.bottom
        ) {
          planeHit = i;
        }
      }
    }
    return frontHit !== -1 ? frontHit : planeHit;
  }

  function clearHover() {
    const stage = stageRef.current;
    const shelf = shelfRef.current;
    hoverRef.current = -1;
    if (stage) stage.style.cursor = "";
    if (shelf) for (const el of shelf.querySelectorAll(".is-hover")) el.classList.remove("is-hover");
  }

  function parallax(event) {
    const stage = stageRef.current;
    const shelf = shelfRef.current;
    if (!stage || !shelf) return;
    if (!reducedRef.current) {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      shelf.style.transform = `scale(${scaleRef.current}) rotateX(${TILT - y * 6}deg) rotateY(${x * 8}deg)`;
    }
    const index = boxAt(event.clientX, event.clientY);
    if (index !== hoverRef.current) {
      clearHover();
      hoverRef.current = index;
      if (index >= 0) {
        shelf.children[index].classList.add("is-hover");
        stage.style.cursor = "pointer";
      }
    }
  }

  function unparallax() {
    const shelf = shelfRef.current;
    if (shelf) shelf.style.transform = `scale(${scaleRef.current}) rotateX(${TILT}deg)`;
    clearHover();
  }

  function stageClick(event) {
    const index = boxAt(event.clientX, event.clientY);
    if (index >= 0) pick(index);
  }

  function pick(index) {
    snapshot();
    if (index === active) setOpen(current => !current);
    else {
      setActive(index);
      setOpen(true);
    }
  }

  function pickCategory(next) {
    if (next === category) return;
    snapshot();
    setCategory(next);
    setActive(0);
    setOpen(false);
    clearHover();
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
    <div
      className={`recs-stage${split ? " recs-stage--split" : ""}`}
      ref={stageRef}
      onMouseMove={parallax}
      onMouseLeave={unparallax}
      onClick={stageClick}
    >
      <div className="recs-sizer" ref={sizerRef}>
        <div className="recs-shelf" ref={shelfRef}>
          {visible.map((s, index) => {
            const isOpen = index === active && open;
            const isFeatured = split && index === active;
            const cols = split ? 2 : columns;
            const rank = split ? index - (index > active ? 1 : 0) : index;
            const yaw = isFeatured ? 0 : ((rank % cols) - (cols - 1) / 2) * YAW_STEP;
            return <div
            key={`${s.brandKey}-${s.tag}`}
            data-tag={s.tag}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Close" : "Open"} ${s.brand} ${s.name} box`}
            className={`recs-box recs-box--${s.brandKey}${boxVariantClass(s.tag)}${isOpen ? " recs-box--open recs-box--active" : ""}${isFeatured ? " recs-box--featured" : ""}`}
            style={{ "--box-yaw": `${yaw.toFixed(2)}deg` }}
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
              {shoeImages[s.tag] ? (
                <div className="recs-shoe" aria-hidden="true">
                  <img src={shoeImages[s.tag]} alt="" loading="lazy" draggable={false} />
                </div>
              ) : null}
              <div className="recs-face recs-side--l" />
              <div className="recs-face recs-side--r" />
              <div className="recs-face recs-lid--top">
                <LidSizeLabel brandKey={s.brandKey} tag={s.tag} name={s.name} />
              </div>
              <div className="recs-face recs-lid--bottom" />
              <div className="recs-front">
                <BrandMark brandKey={s.brandKey} brand={s.brand} tag={s.tag} />
              </div>
            </div>
          </div>;
          })}
        </div>
      </div>
      <aside className="recs-info">
        {shoe ? (
          <div
            className="recs-info-card"
            key={shoe.tag}
            role="region"
            aria-label={`${shoe.brand} ${shoe.name} details`}
            aria-hidden={!split}
          >
            <button type="button" className="recs-info-close" aria-label="Close shoe details" onClick={close}>
              ✕
            </button>
            <p className="recs-info-eyebrow">
              {BRAND_LOGOS[shoe.brandKey] ? (
                <img
                  className={`recs-info-brand recs-info-brand--${shoe.brandKey}`}
                  src={BRAND_LOGOS[shoe.brandKey]}
                  alt={shoe.brand}
                />
              ) : (
                shoe.brand
              )}
              <span>· {shoe.category}</span>
            </p>
            <h2 className="recs-info-name">{shoe.name}</h2>
            <p className="recs-info-purpose">{shoe.purpose}</p>
            <div className="recs-info-rating">
              <span className="recs-info-rating-num doto">{shoe.rating.toFixed(1)}</span>
              <span className="recs-info-rating-den">/ 10</span>
              <span className="recs-info-rating-bar" role="img" aria-label={`Rated ${shoe.rating} out of 10`}>
                {Array.from({ length: 10 }, (_, i) => (
                  <i key={i} className={i < Math.round(shoe.rating) ? "is-filled" : ""} />
                ))}
              </span>
            </div>
            <dl className="recs-info-stats">
              <div><dt>Miles</dt><dd>{shoe.miles}<small> mi</small></dd></div>
              <div><dt>Lifespan</dt><dd>{shoe.lifespan}</dd></div>
              <div><dt>MSRP</dt><dd>${shoe.msrp}</dd></div>
              <div><dt>I paid</dt><dd className={shoe.paid < shoe.msrp ? "recs-deal" : ""}>${shoe.paid}</dd></div>
              <div className="recs-info-stat--wide"><dt>Foam</dt><dd>{shoe.foam}</dd></div>
              <div className="recs-info-stat--wide"><dt>Sole</dt><dd>{shoe.sole}</dd></div>
            </dl>
            <p className="recs-info-review">{shoe.review}</p>
          </div>
        ) : null}
      </aside>
    </div>
  </>;
}
