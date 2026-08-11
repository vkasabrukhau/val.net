import Link from "next/link";
import { notFound } from "next/navigation";
import { Page } from "../../../components/SiteChrome";
import { pageMetadata } from "../../site";
import photos from "../../../data/photos.json";

export const dynamicParams = false;

export function generateStaticParams() {
  return photos.map(({ slug }) => ({ slug }));
}

const findPhoto = slug => photos.find(p => p.slug === slug);

const longDate = date =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

const megapixels = photo => `${((photo.fullWidth * photo.fullHeight) / 1e6).toFixed(1)} MP`;
const fileSize = bytes => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

export async function generateMetadata({ params }) {
  const photo = findPhoto((await params).slug);
  if (!photo) return {};
  return pageMetadata({
    title: `Photo ${photo.label}`,
    description: `${photo.source} photograph by Val Kasabrukhau, ${longDate(photo.date)} — view and download in full resolution.`,
    path: `/photos/${photo.slug}`,
  });
}

export default async function PhotoPage({ params }) {
  const photo = findPhoto((await params).slug);
  if (!photo) notFound();

  const facts = [
    ["source", photo.source],
    ["taken", longDate(photo.date)],
    ["resolution", `${photo.fullWidth} × ${photo.fullHeight} · ${megapixels(photo)}`],
    ["file", `JPEG · ${fileSize(photo.fullBytes)}`],
  ];

  return <Page active="photos">
    <div className="photo-view">
      <Link href="/photos" className="back">← all frames</Link>
      <figure className="photo-frame photo-frame--view">
        <div className="photo-slot">
          <img
            src={photo.full}
            alt={`${photo.label} photograph, full resolution`}
            width={photo.fullWidth}
            height={photo.fullHeight}
            fetchPriority="high"
          />
        </div>
        <figcaption className="photo-caption">
          <b>{photo.label}</b>
          <small>{photo.source.toUpperCase()} · {longDate(photo.date).toUpperCase()}</small>
        </figcaption>
      </figure>
      <dl className="photo-view-facts">
        {facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}
      </dl>
      <div className="photo-view-actions">
        <a className="photo-view-download" href={photo.full} download={`val-kasabrukhau-${photo.slug}.jpg`}>
          download full res ↓
        </a>
      </div>
    </div>
  </Page>;
}
