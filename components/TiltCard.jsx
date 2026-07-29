"use client";

import { useRef } from "react";

export default function TiltCard({ children, className = "", strength = 5, as: Tag = "div", ...props }) {
  const ref = useRef(null);
  function move(event) {
    if (event.pointerType !== "mouse") return;
    const element = ref.current;
    const box = element.getBoundingClientRect();
    const x = event.clientX / box.width - box.left / box.width - 0.5;
    const y = event.clientY / box.height - box.top / box.height - 0.5;
    element.style.transform = `perspective(1400px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(8px)`;
    element.style.boxShadow = "0 26px 60px rgba(14,20,20,.14)";
  }
  function leave() {
    ref.current.style.transform = "perspective(1400px) rotateY(0) rotateX(0) translateZ(0)";
    ref.current.style.boxShadow = "none";
  }
  return <Tag ref={ref} className={`tilt-card ${className}`} onPointerMove={move} onPointerLeave={leave} {...props}>{children}</Tag>;
}
