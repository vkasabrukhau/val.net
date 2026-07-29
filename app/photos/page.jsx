import { Page } from "../../components/SiteChrome";
import PhotoGrid from "../../components/PhotoGrid";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Photos",
  description: "Frames caught by Val Kasabrukhau — a rotating set of photographs.",
  path: "/photos",
});

export default function Photos() { return <Page active="photos"><header className="page-header"><h1 className="page-title">Frames I <span className="accent">caught</span>.</h1><p className="page-intro mono" style={{ fontSize: 12, color: "#8a908e", letterSpacing: ".06em" }}>choose an image for any frame ↓</p></header><PhotoGrid /></Page>; }
