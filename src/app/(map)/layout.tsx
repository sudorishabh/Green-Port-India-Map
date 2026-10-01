import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import MapProvider from "@/components/map/MapProvider";

const roboto = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Indian Port Trade Route Map",
  description: "Indian Port Trade Route Map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${roboto.className} antialiased`}>
        <MapProvider>{children}</MapProvider>
      </body>
    </html>
  );
}
