"use client";

import { useEffect, useRef } from "react";

// 4×4 Bayer matrix — ordered dither, one dot per CELL×CELL screen block.
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const CELL = 7;
const WAVE_AMPLITUDE = 0.17;
const CURSOR_RANGE = 0.37;
const ORB_LINK_RANGE = 0.5;

// A warm primary palette with one muted blue counterpoint. The blue is kept
// to a single sphere so the composition remains calm and cohesive.
const WARM = ["#fbe9d8", "#f8cca9", "#f2a26b", "#f77f00"];
const COOL = ["#dcebee", "#9fc5c9", "#4c8992", "#003049"];

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getOrbTargets(time) {
  return [
    { x: 0.76 + 0.13 * Math.sin(time * 0.68), y: 0.27 + 0.11 * Math.cos(time * 0.51), radius: 0.42, strength: 0.58, palette: WARM, cursorReactive: true, mass: 0.9, collisionRadius: 0.11 },
    { x: 0.7 + 0.16 * Math.cos(time * 0.47), y: 0.72 + 0.09 * Math.sin(time * 0.61), radius: 0.46, strength: 0.5, palette: WARM, cursorReactive: true, mass: 1.05, collisionRadius: 0.12 },
    { x: 0.42 + 0.12 * Math.sin(time * 0.39), y: 0.9 + 0.07 * Math.cos(time * 0.56), radius: 0.36, strength: 0.39, palette: WARM, cursorReactive: false, mass: 1.1, collisionRadius: 0.1 },
    { x: 0.91 + 0.08 * Math.sin(time * 0.58), y: 0.52 + 0.18 * Math.cos(time * 0.43), radius: 0.34, strength: 0.4, palette: COOL, cursorReactive: false, mass: 0.95, collisionRadius: 0.1 },
    { x: 0.52 + 0.14 * Math.cos(time * 0.52), y: 0.12 + 0.08 * Math.sin(time * 0.66), radius: 0.35, strength: 0.36, palette: COOL, cursorReactive: true, mass: 0.85, collisionRadius: 0.1 },
    { x: 0.16 + 0.1 * Math.sin(time * 0.45), y: 0.7 + 0.13 * Math.cos(time * 0.49), radius: 0.33, strength: 0.32, palette: COOL, cursorReactive: false, mass: 1.1, collisionRadius: 0.1 },
  ];
}

export default function HeroDither() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const host = canvas.parentElement;
    const context = canvas.getContext("2d");
    if (!host || !context) return undefined;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { active: false, x: 0, y: 0, velocityX: 0, velocityY: 0, timestamp: 0 };
    let orbs = [];
    let previousElapsed = 0;

    function trackPointer(event) {
      if (!event.isPrimary) return;

      const bounds = host.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const x = clamp((event.clientX - bounds.left) / bounds.width, 0, 1);
      const y = clamp((event.clientY - bounds.top) / bounds.height, 0, 1);
      const timestamp = event.timeStamp || performance.now();

      if (pointer.active && pointer.timestamp) {
        const seconds = Math.max(0.016, (timestamp - pointer.timestamp) / 1000);
        pointer.velocityX = clamp((x - pointer.x) / seconds, -2.5, 2.5);
        pointer.velocityY = clamp((y - pointer.y) / seconds, -2.5, 2.5);
      }

      pointer.active = true;
      pointer.x = x;
      pointer.y = y;
      pointer.timestamp = timestamp;
    }

    function releasePointer() {
      pointer.active = false;
      pointer.velocityX = 0;
      pointer.velocityY = 0;
      pointer.timestamp = 0;
    }

    function advanceOrbs(elapsed, aspect) {
      const targets = getOrbTargets(elapsed * 0.0004);

      if (!orbs.length) {
        orbs = targets.map((target) => ({ ...target, x: target.x, y: target.y, velocityX: 0, velocityY: 0, energy: 0 }));
        previousElapsed = elapsed;
        return orbs;
      }

      const seconds = clamp((elapsed - previousElapsed) / 1000, 0.001, 0.04);
      previousElapsed = elapsed;

      for (let index = 0; index < orbs.length; index++) {
        const orb = orbs[index];
        const target = targets[index];

        orb.radius = target.radius;
        orb.strength = target.strength;
        orb.palette = target.palette;
        orb.cursorReactive = target.cursorReactive;
        orb.mass = target.mass;
        orb.collisionRadius = target.collisionRadius;
        orb.energy = Math.max(0, orb.energy - seconds * 1.35);
        orb.velocityX += (target.x - orb.x) * 10 * seconds;
        orb.velocityY += (target.y - orb.y) * 10 * seconds;

        if (!pointer.active || !orb.cursorReactive) continue;

        const offsetX = (orb.x - pointer.x) * aspect;
        const offsetY = orb.y - pointer.y;
        const distance = Math.hypot(offsetX, offsetY);
        if (distance >= CURSOR_RANGE) continue;

        // The cursor behaves like a small moving force field. Its direction
        // pushes only the selected orbs; pair coupling below carries that
        // energy through the autonomous part of the system.
        const influence = (1 - distance / CURSOR_RANGE) ** 2;
        const fallbackAngle = index * 2.4;
        const directionX = distance ? offsetX / distance : Math.cos(fallbackAngle);
        const directionY = distance ? offsetY / distance : Math.sin(fallbackAngle);
        const cursorSpeed = Math.min(2, Math.hypot(pointer.velocityX * aspect, pointer.velocityY));
        const impulse = (4.4 + cursorSpeed * 2.1) * influence;

        orb.energy = Math.max(orb.energy, influence);
        orb.velocityX += (directionX / aspect) * impulse * seconds + pointer.velocityX * influence * 0.045;
        orb.velocityY += directionY * impulse * seconds + pointer.velocityY * influence * 0.045;
      }

      for (let firstIndex = 0; firstIndex < orbs.length; firstIndex++) {
        for (let secondIndex = firstIndex + 1; secondIndex < orbs.length; secondIndex++) {
          const first = orbs[firstIndex];
          const second = orbs[secondIndex];
          const offsetX = (second.x - first.x) * aspect;
          const offsetY = second.y - first.y;
          const distance = Math.max(0.0001, Math.hypot(offsetX, offsetY));
          const directionX = offsetX / distance;
          const directionY = offsetY / distance;
          const sharedRadius = first.collisionRadius + second.collisionRadius;

          if (distance < sharedRadius) {
            const overlap = (sharedRadius - distance) / sharedRadius;
            const separation = overlap * 28 * seconds;

            first.velocityX -= (directionX / aspect) * separation / first.mass;
            first.velocityY -= directionY * separation / first.mass;
            second.velocityX += (directionX / aspect) * separation / second.mass;
            second.velocityY += directionY * separation / second.mass;
          }

          // Nearby orbs exchange velocity along their shared axis. This is
          // intentionally softer than a collision, giving the autonomous
          // orbs a visible response without breaking their base drift.
          if (distance >= ORB_LINK_RANGE) continue;

          const connection = (1 - distance / ORB_LINK_RANGE) ** 2 * 0.18;
          const relativeVelocity = (second.velocityX - first.velocityX) * directionX * aspect + (second.velocityY - first.velocityY) * directionY;

          const sharedEnergy = Math.max(first.energy, second.energy) * connection * 0.9;
          first.energy = Math.max(first.energy, sharedEnergy);
          second.energy = Math.max(second.energy, sharedEnergy);

          first.velocityX += (directionX / aspect) * relativeVelocity * connection / first.mass;
          first.velocityY += directionY * relativeVelocity * connection / first.mass;
          second.velocityX -= (directionX / aspect) * relativeVelocity * connection / second.mass;
          second.velocityY -= directionY * relativeVelocity * connection / second.mass;
        }
      }

      const damping = Math.exp(-2.8 * seconds);
      for (const orb of orbs) {
        orb.velocityX *= damping;
        orb.velocityY *= damping;
        orb.x = clamp(orb.x + orb.velocityX * seconds, -0.15, 1.15);
        orb.y = clamp(orb.y + orb.velocityY * seconds, -0.15, 1.15);
      }

      return orbs;
    }

    function draw(elapsed) {
      const width = Math.max(1, Math.floor(host.clientWidth / CELL));
      const height = Math.max(1, Math.floor(host.clientHeight / CELL));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      context.clearRect(0, 0, width, height);

      const time = elapsed * 0.0004;
      const aspect = width / height;
      const spheres = advanceOrbs(elapsed, aspect);

      for (let y = 0; y < height; y++) {
        const row = BAYER[y & 3];
        for (let x = 0; x < width; x++) {
          const nx = x / width;
          const ny = y / height;
          const wave = 0.5 + 0.5 * Math.sin(nx * 4 + time + Math.sin(ny * 3 - time * 1.3));
          let level = wave * WAVE_AMPLITUDE;
          let strongestSphere = spheres[0];
          let strongestContribution = 0;

          for (const sphere of spheres) {
            const offsetX = (nx - sphere.x) * aspect;
            const offsetY = ny - sphere.y;
            const distance = Math.hypot(offsetX, offsetY);
            const radius = sphere.radius * (1 + sphere.energy * 0.2);
            const falloff = Math.max(0, 1 - distance / radius);
            const contribution = falloff * falloff * (sphere.strength + sphere.energy * 0.1);
            level += contribution;
            if (contribution > strongestContribution) {
              strongestContribution = contribution;
              strongestSphere = sphere;
            }
          }

          const threshold = (row[x & 3] + 0.5) / 16;
          if (level <= threshold) continue;
          const palette = strongestContribution > 0.04 ? strongestSphere.palette : WARM;
          const colorIndex = Math.min(palette.length - 1, Math.floor(Math.min(level, 0.99) * palette.length));
          context.fillStyle = palette[colorIndex];
          context.fillRect(x, y, 1, 1);
        }
      }
    }

    if (still) {
      draw(0);
      const observer = new ResizeObserver(() => draw(0));
      observer.observe(host);
      return () => observer.disconnect();
    }

    host.addEventListener("pointermove", trackPointer);
    host.addEventListener("pointerleave", releasePointer);
    host.addEventListener("pointercancel", releasePointer);

    let frame = requestAnimationFrame(function loop(elapsed) {
      frame = requestAnimationFrame(loop);
      draw(elapsed);
    });

    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", trackPointer);
      host.removeEventListener("pointerleave", releasePointer);
      host.removeEventListener("pointercancel", releasePointer);
    };
  }, []);

  return <canvas className="hero-dither" ref={canvasRef} aria-hidden="true" />;
}
