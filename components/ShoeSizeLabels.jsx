import React, { useState } from "react";

/* ============================================================================
   SHOE BOX SIZE LABELS  —  adidas Originals + Nike
   ----------------------------------------------------------------------------
   Two self-contained, prop-driven React components that recreate the size
   stickers printed on shoe boxes.

   SCALING MODEL
   Every internal dimension is expressed in `em`, and the root element sets
   fontSize = width / 100. So 1em === 1% of the label's width, and the whole
   label scales cleanly from a single `width` prop. No transforms, no magic
   numbers tied to a viewport.

   TYPEFACES
   Both brands use licensed type (adidas: AdiHaus / AdiNeue; Nike: Nike TG,
   a Trade Gothic derivative). Neither is redistributable, so the default is a
   neutral grotesque stack that matches the printed proportions closely.
   Override with the `fontFamily` prop if you have the real thing licensed, or
   drop in Archivo / Inter / Helvetica Neue.
   ========================================================================== */

const GROTESK =
  "'Helvetica Neue', Helvetica, Arial, 'Liberation Sans', 'Nimbus Sans', sans-serif";

/* ---------------------------------------------------------------------------
   EAN-13 / UPC-A barcode — a real encoder, not a decorative stripe pattern.
   Pass 12 digits for UPC-A or 13 for EAN-13; it renders correct module widths.
   --------------------------------------------------------------------------- */

const L = ["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"];
const G = ["0100111","0110011","0011011","0100001","0011101","0111001","0000101","0010001","0001001","0010111"];
const R = ["1110010","1100110","1101100","1000010","1011100","1001110","1010000","1000100","1001000","1110100"];
const PARITY = ["LLLLLL","LLGLGG","LLGGLG","LLGGGL","LGLLGG","LGGLLG","LGGGLL","LGLGLG","LGLGGL","LGGLGL"];

function encodeEAN13(raw) {
  const digits = String(raw).replace(/\D/g, "").padStart(13, "0").slice(0, 13);
  const d = [...digits].map(Number);
  const pattern = PARITY[d[0]];
  let bits = "101";
  for (let i = 0; i < 6; i++) bits += (pattern[i] === "L" ? L : G)[d[i + 1]];
  bits += "01010";
  for (let i = 7; i < 13; i++) bits += R[d[i]];
  bits += "101";
  return { bits, digits };
}

/**
 * Barcode
 * @param {string} value      12 (UPC-A) or 13 (EAN-13) digits
 * @param {string} format     "ean13" | "upca" — controls how digits are grouped
 * @param {boolean} vertical  rotate 90° clockwise (digits end up on the left)
 * @param {boolean} showDigits
 */
function Barcode({
  value,
  format = "ean13",
  vertical = false,
  showDigits = true,
  color = "#000",
  background = "transparent",
  barHeight = 30,
  digitSize = 7,
  style,
}) {
  const { bits, digits } = encodeEAN13(value);
  const W = 95;                                   // modules in an EAN-13 symbol
  const H = showDigits ? barHeight + digitSize + 3 : barHeight;
  const guardTail = showDigits ? digitSize + 1 : 0;

  // Guard bars run past the baseline of the digits.
  const isGuard = (i) =>
    i < 3 || (i >= 45 && i < 50) || i >= 92;

  const bars = [];
  for (let i = 0; i < W; i++) {
    if (bits[i] === "1") {
      bars.push(
        <rect
          key={i}
          x={i}
          y={0}
          width={1.02}
          height={barHeight + (isGuard(i) ? guardTail : 0)}
          fill={color}
        />
      );
    }
  }

  // Digit grouping differs between the two symbologies.
  const y = barHeight + digitSize + 1;
  const labels = [];
  if (showDigits) {
    const txt = (key, x, anchor, children) => (
      <text
        key={key}
        x={x}
        y={y}
        fontSize={digitSize}
        fontFamily={GROTESK}
        fill={color}
        textAnchor={anchor}
        letterSpacing={digitSize * 0.06}
      >
        {children}
      </text>
    );

    if (format === "upca") {
      // 1 | 94500 | 88782 | 4  — outer digits sit outside the guard bars
      labels.push(txt("a", -1.5, "end", digits[1]));
      labels.push(txt("b", 24, "middle", digits.slice(2, 7)));
      labels.push(txt("c", 71, "middle", digits.slice(7, 12)));
      labels.push(txt("d", 96.5, "start", digits[12]));
    } else {
      // 4 | 067888 | 749267
      labels.push(txt("a", -1.5, "end", digits[0]));
      labels.push(txt("b", 24, "middle", digits.slice(1, 7)));
      labels.push(txt("c", 71, "middle", digits.slice(7)));
    }
  }

  const content = (
    <>
      <rect x={-6} y={-1} width={W + 12} height={H + 2} fill={background} />
      {bars}
      {labels}
    </>
  );

  if (!vertical) {
    return (
      <svg
        viewBox={`-6 -1 ${W + 12} ${H + 2}`}
        style={{ display: "block", width: "100%", height: "auto", ...style }}
        shapeRendering="crispEdges"
        role="img"
        aria-label={`Barcode ${digits}`}
      >
        {content}
      </svg>
    );
  }

  // rotate(90) maps (x, y) -> (-y, x); pre-translate flips it into view.
  return (
    <svg
      viewBox={`-1 -6 ${H + 2} ${W + 12}`}
      style={{ display: "block", height: "100%", width: "auto", ...style }}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`Barcode ${digits}`}
    >
      <g transform={`rotate(90) translate(0, -${H})`}>{content}</g>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Small printed marks
   --------------------------------------------------------------------------- */

// Gender pictogram in the black chip at the top-left of the adidas label.
function GenderGlyph({ gender = "women", size = "1em", color = "#fff" }) {
  if (gender === "men") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden>
        <circle cx="12" cy="4" r="3" />
        <path d="M8 8h8l2.4 8h-2.6l-.4-4.2V23h-2.6v-7h-1.6v7H8.6V11.8L8.2 16H5.6L8 8z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden>
      <circle cx="12" cy="4" r="3" />
      <path d="M12 8c2.6 0 4 1.1 4.6 3l2 6.4h-2.7L15 14v9h-2v-6.4h-2V23H9v-9l-.9 3.4H5.4L7.4 11C8 9.1 9.4 8 12 8z" />
    </svg>
  );
}

// The "♲ Inside" mark that sits next to the article number.
function InsideMark({ label = "Inside" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6em",
        border: "0.22em solid #000",
        padding: "0.25em 0.7em 0.25em 0.5em",
        lineHeight: 1,
        fontSize: "2.4em",
        fontWeight: 700,
      }}
    >
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="#000" aria-hidden>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2.6a7.4 7.4 0 0 1 6.3 11.3l-2.2-1.3 1-4.5-4.3 1.6-2.1-1.2 4.6-2.7A7.3 7.3 0 0 0 12 4.6zM5.1 9.6l2.2 1.3-1 4.4 4.3-1.6 2.1 1.3-4.6 2.6a7.4 7.4 0 0 0 6.5 1.2A7.4 7.4 0 0 1 5.1 9.6z" />
      </svg>
      {label}
    </span>
  );
}

// Möbius loop stamped beside the box code.
function RecycleMark({ size = "4.4em" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <circle cx="12" cy="12" r="11.2" fill="#000" />
      <path
        d="M12 4.6l2.6 4.5h-1.9v3.2h-1.5V9.1H9.4L12 4.6zM6.4 15.6l2.6-4.5 1.3.8-1.6 2.8 2.7 1.6-.8 1.3-4.2-2zM17.6 15.6l-4.2 2-.8-1.3 2.7-1.6-1.6-2.8 1.3-.8 2.6 4.5z"
        fill="#fff"
      />
    </svg>
  );
}

// RFID chip mark on the Nike label.
function RfidMark({ size = "5.2em", color = "#fff", ink = "#000" }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
      }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" width="86%" height="86%" fill={ink}>
        <path d="M3 6h1.8v12H3zM6.6 8.4c1.6 1.9 1.6 5.3 0 7.2l1.3 1.1c2.1-2.5 2.1-6.9 0-9.4L6.6 8.4zM10.2 6.2c2.8 3.2 2.8 8.4 0 11.6l1.3 1.1c3.3-3.8 3.3-10 0-13.8l-1.3 1.1z" />
        <text
          x="14"
          y="16.4"
          fontSize="6.4"
          fontFamily={GROTESK}
          fontWeight="700"
          fill={ink}
        >
          RFID
        </text>
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Decorative QR block. Deterministic from the seed string so a given style
   code always renders the same pattern. Swap in a real encoder (qrcode.react,
   qrcode-generator) if it needs to actually scan.
   --------------------------------------------------------------------------- */
function QrBlock({ seed = "", size = "9.4em", color = "#000", background = "#fff" }) {
  const N = 21;
  let h = 2166136261;
  for (let i = 0; i < String(seed).length; i++) {
    h ^= String(seed).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13; h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5; h >>>= 0;
    return h / 4294967296;
  };

  const inFinder = (r, c) =>
    (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);

  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (inFinder(r, c)) continue;
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) cells.push([r, c]);
        continue;
      }
      if (rand() > 0.52) cells.push([r, c]);
    }
  }

  const finder = (r, c) => (
    <g key={`f${r}${c}`}>
      <rect x={c} y={r} width="7" height="7" fill={color} />
      <rect x={c + 1} y={r + 1} width="5" height="5" fill={background} />
      <rect x={c + 2} y={r + 2} width="3" height="3" fill={color} />
    </g>
  );

  return (
    <svg
      viewBox={`-1 -1 ${N + 2} ${N + 2}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      style={{ flex: "0 0 auto" }}
      aria-hidden
    >
      <rect x="-1" y="-1" width={N + 2} height={N + 2} fill={background} />
      {finder(0, 0)}
      {finder(0, N - 7)}
      {finder(N - 7, 0)}
      {cells.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill={color} />
      ))}
    </svg>
  );
}

/* ===========================================================================
   ADIDAS ORIGINALS SIZE LABEL
   =========================================================================== */

export function AdidasSizeLabel({
  name = "JAPAN W",
  gender = "women",
  article = "IH5489",
  sizes = { US: "7", UK: "5½", F: "38⅔", D: "5½", J: "240", CHN: "235" },
  colorway = ["FTWWHT/CBLACK/GOLDMT", "FTWBLA/NOIESS/ORMETA"],
  division = ["ORIGINALS", "ORIGINALS"],
  origin = ["MADE IN VIETNAM", "FABRIQUÉ AU VIETNAM"],
  ean = "4067888749267",
  eanPo = "EAN PO# 134770907",
  boxCode = "ABSBOX/1023/V12",
  width = 620,
  fontFamily = GROTESK,
  className,
  style,
}) {
  const order = [
    ["US", "UK"],
    ["F", "D"],
    ["J", "CHN"],
  ];

  const cell = (key, isLastRow, isLastCol) => (
    <div
      key={key}
      style={{
        flex: 1,
        borderRight: isLastCol ? "none" : "0.28em solid #000",
        borderBottom: isLastRow ? "none" : "0.28em solid #000",
        padding: "0.5em 0.9em 0.9em",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: "2.35em", fontWeight: 400, lineHeight: 1 }}>{key}</span>
      <span
        style={{
          fontSize: "4.9em",
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
        }}
      >
        {sizes[key] ?? ""}
      </span>
    </div>
  );

  return (
    <div
      className={className}
      style={{
        width,
        fontSize: width / 100,       // 1em === 1% of label width
        fontFamily,
        background: "#fff",
        color: "#000",
        border: "0.3em solid #000",
        display: "flex",
        flexDirection: "column",
        fontKerning: "none",
        ...style,
      }}
    >
      {/* Header: gender chip + model name */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          borderBottom: "0.28em solid #000",
          height: "7.2em",
        }}
      >
        <div
          style={{
            width: "7em",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          <GenderGlyph gender={gender} size="4.4em" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 1.6em",
            fontSize: "3.9em",
            fontWeight: 700,
            letterSpacing: "0.005em",
            lineHeight: 1,
          }}
        >
          {name}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", alignItems: "stretch" }}>
        {/* Size grid */}
        <div
          style={{
            width: "31em",
            flex: "0 0 auto",
            borderRight: "0.28em solid #000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {order.map((row, r) => (
            <div key={r} style={{ display: "flex", flex: 1, minHeight: "10.4em" }}>
              {row.map((k, c) => cell(k, r === order.length - 1, c === row.length - 1))}
            </div>
          ))}
        </div>

        {/* Article / colorway / origin */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "0.9em 1.4em 1em",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "0.8em",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.4em" }}>
            <span style={{ fontSize: "3.4em", fontWeight: 700, lineHeight: 1 }}>
              {article}
            </span>
            <InsideMark />
          </div>

          <div style={{ fontSize: "2.5em", lineHeight: 1.16, letterSpacing: "0.005em" }}>
            {colorway.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          <div style={{ fontSize: "2.5em", lineHeight: 1.16 }}>
            {division.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>

          <div style={{ fontSize: "2.5em", lineHeight: 1.16 }}>
            {origin.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>

        {/* Barcode column */}
        <div
          style={{
            width: "27em",
            flex: "0 0 auto",
            padding: "1.6em 1.4em 1em",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Barcode value={ean} format="ean13" barHeight={26} digitSize={7.6} />
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "1em",
              marginTop: "0.8em",
            }}
          >
            <div style={{ fontSize: "1.65em", lineHeight: 1.35, letterSpacing: "0.01em" }}>
              <div>{eanPo}</div>
              <div>{boxCode}</div>
            </div>
            <RecycleMark />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   NIKE SIZE LABEL
   =========================================================================== */

export function NikeSizeLabel({
  name = "NIKE AIR ZOOM STRUCTURE 23",
  colorway = ["MIDNIGHT NAVY/WHITE-CERULEAN", "MARINE MINUIT/CERULEEN/BLANC"],
  us = "11",
  sizes = { UK: "10", cm: "29", BR: "43", EUR: "45" },
  styleCode = "CZ6720 402",
  origin = [
    "MADE IN VIETNAM /",
    "FABRIQUE AU VIETNAM /",
    "FABRICADO NO VIETNÃ /",
    "HECHO EN VIETNAM",
  ],
  upc = "194500887824",
  subCode = "16",
  accent = "#C0432E",
  paper = "#F4F1EF",
  ink,            // text/mark color override; default is white text with accent-colored marks
  showRfid = true,
  showQr = true,
  width = 620,
  fontFamily = GROTESK,
  className,
  style,
}) {
  const secondary = [
    ["UK", sizes.UK],
    ["cm", sizes.cm],
    ["BR", sizes.BR],
    ["EUR", sizes.EUR],
  ];

  return (
    <div
      className={className}
      style={{
        width,
        fontSize: width / 100,       // 1em === 1% of label width
        fontFamily,
        background: paper,
        color: ink ?? "#fff",
        padding: "1.6em",
        display: "flex",
        alignItems: "stretch",
        gap: "1.4em",
        fontKerning: "none",
        ...style,
      }}
    >
      {/* Vertical barcode strip on the paper, outside the printed panel */}
      <div
        style={{
          width: "13.5em",
          flex: "0 0 auto",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "flex-start",
          padding: "0.4em 0",
        }}
      >
        <Barcode
          value={upc}
          format="upca"
          vertical
          barHeight={26}
          digitSize={6.4}
          background={paper}
          style={{ height: "100%" }}
        />
        {subCode ? (
          <div
            style={{
              alignSelf: "flex-end",
              color: "#111",
              fontSize: "2em",
              lineHeight: 1,
              transform: "rotate(90deg)",
              transformOrigin: "center",
              marginLeft: "-0.4em",
              marginBottom: "1.2em",
            }}
          >
            {subCode}
          </div>
        ) : null}
      </div>

      {/* Printed panel */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: accent,
          padding: "2em 2.4em 1.8em",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "1.2em",
        }}
      >
        <div
          style={{
            fontSize: "4.4em",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "0.005em",
          }}
        >
          {name}
        </div>

        <div style={{ fontSize: "2.35em", fontWeight: 500, lineHeight: 1.35, letterSpacing: "0.02em" }}>
          {colorway.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        {/* Size block */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "2.6em" }}>
          <div
            style={{
              fontSize: "13.5em",
              fontWeight: 500,
              lineHeight: 0.82,
              letterSpacing: "-0.02em",
              flex: "0 0 auto",
            }}
          >
            {us}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, auto)",
              columnGap: "1.6em",
              rowGap: "0.35em",
              fontSize: "3.5em",
              fontWeight: 500,
              lineHeight: 1.1,
              paddingTop: "0.35em",
            }}
          >
            {secondary.map(([k, v]) => (
              <div key={k} style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontSize: "0.62em", marginRight: "0.5em" }}>{k}</span>
                {v}
              </div>
            ))}
          </div>
        </div>

        {/* Footer: style code, origin, machine-readable marks */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "1.6em" }}>
          <div
            style={{
              fontSize: "3.4em",
              fontWeight: 500,
              lineHeight: 1,
              flex: "0 0 auto",
              whiteSpace: "nowrap",
            }}
          >
            {styleCode}
          </div>
          <div
            style={{
              fontSize: "1.75em",
              lineHeight: 1.3,
              letterSpacing: "0.02em",
              flex: 1,
              minWidth: 0,
            }}
          >
            {origin.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1em", flex: "0 0 auto" }}>
            {showRfid ? <RfidMark ink={ink ?? accent} /> : null}
            {showQr ? <QrBlock seed={`${styleCode}${upc}`} size="9.6em" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   DEMO — a print-shop proof sheet. Delete this before shipping; keep the
   two named exports above.
   =========================================================================== */

export default function ShoeSizeLabelProof() {
  const [width, setWidth] = useState(620);
  const [size, setSize] = useState("11");

  const caption = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 11,
    letterSpacing: "0.09em",
    textTransform: "uppercase",
    color: "#8A8580",
    marginBottom: 14,
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#EDEBE7",
        padding: "40px 24px 64px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ ...caption, marginBottom: 28, color: "#57534E" }}>
          Box label components · proof sheet
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "center",
            marginBottom: 40,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            letterSpacing: "0.06em",
            color: "#57534E",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            WIDTH {String(width).padStart(3, "0")}PX
            <input
              type="range"
              min={280}
              max={860}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              style={{ width: 180, accentColor: "#C0432E" }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            NIKE US SIZE
            <input
              value={size}
              onChange={(e) => setSize(e.target.value.slice(0, 4))}
              style={{
                width: 56,
                padding: "4px 8px",
                border: "1px solid #C9C4BE",
                background: "#fff",
                font: "inherit",
                color: "#1C1917",
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 44 }}>
          <div style={caption}>adidas Originals · IH5489</div>
          <AdidasSizeLabel width={width} />
        </div>

        <div>
          <div style={caption}>Nike · CZ6720-402</div>
          <NikeSizeLabel width={width} us={size} />
        </div>
      </div>
    </div>
  );
}
