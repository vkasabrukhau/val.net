import { Page } from "../../components/SiteChrome";
import ShoeCloset from "../../components/ShoeCloset";
import { pageMetadata } from "../site";

export const metadata = pageMetadata({
  title: "Recs",
  description: "Things Val Kasabrukhau actually recommends — starting with the shoe closet.",
  path: "/recs",
});

export default function Recs() {
  return <Page active="recs">
    <header className="recs-header">
      <h1 className="page-title">The <span className="accent doto">shoe</span> closet.</h1>
      <p className="recs-hint">20 boxes · pick a category · click a box to drop its front · no affiliate links</p>
    </header>
    <ShoeCloset />
  </Page>;
}
