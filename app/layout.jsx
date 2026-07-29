import "./globals.css";
import "./fonts.css";

export const metadata = {
  title: "Val Kasabrukhau",
  description: "Portfolio of Val Kasabrukhau — computer science, XR, and things built late at night.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
