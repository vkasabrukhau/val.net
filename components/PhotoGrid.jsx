"use client";

import { useEffect, useRef, useState } from "react";

const frames = [
  ["no.01", "35MM · —", -2.4], ["no.02", "DIGITAL · —", 1.8], ["no.03", "35MM · —", -1.2],
  ["no.04", "DIGITAL · —", 2.6], ["no.05", "IPHONE · —", -2], ["no.06", "35MM · —", 1.4],
];
export default function PhotoGrid() {
  const [images, setImages] = useState({});
  const imagesRef = useRef({});
  const pendingUploads = useRef({});

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => () => {
    Object.values(imagesRef.current).forEach(({ src }) => URL.revokeObjectURL(src));
  }, []);

  function select(index, file) {
    if (!file?.type.startsWith("image/")) return;

    const src = URL.createObjectURL(file);
    const upload = Symbol();
    pendingUploads.current[index] = upload;
    const image = new Image();

    image.onload = () => {
      if (pendingUploads.current[index] !== upload) {
        URL.revokeObjectURL(src);
        return;
      }

      setImages(current => {
        if (current[index]) URL.revokeObjectURL(current[index].src);
        return { ...current, [index]: { src, aspectRatio: `${image.naturalWidth} / ${image.naturalHeight}` } };
      });
    };
    image.onerror = () => URL.revokeObjectURL(src);
    image.src = src;
  }

  return <section className="photos-grid">{frames.map(([label, meta, rotation], index) => {
    const photo = images[index];
    return <div className="photo-frame" style={{ transform: `rotate(${rotation}deg)`, "--photo-aspect-ratio": photo?.aspectRatio }} key={label}><label className="photo-slot">{photo ? <img src={photo.src} alt={`Uploaded ${label} photograph`} /> : <span>drop photo {String(index + 1).padStart(2, "0")}</span>}<input aria-label={`Upload ${label} photograph`} type="file" accept="image/*" onChange={event => select(index, event.target.files?.[0])} /></label><div className="photo-caption"><b>{label}</b><small>{meta}</small></div></div>;
  })}</section>;
}
