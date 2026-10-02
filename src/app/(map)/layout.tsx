import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import MapProvider from "@/components/map/MapProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Green Ports India Map",
  description:
    "An interactive map of India's ports, their trade routes and green shipping progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body> before
          React hydrates; this ignores those, and only on <body> itself. */}
      <body
        className={`${poppins.className} antialiased`}
        suppressHydrationWarning>
        <MapProvider>{children}</MapProvider>
      </body>
    </html>
  );
}
