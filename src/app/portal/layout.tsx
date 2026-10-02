import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import StoreProvider from "@/components/portal/store-provider";
import PersistentUser from "@/components/portal/persistent-user";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Green Ports India Map Admin",
  description:
    "Manage the ports, KPIs and green initiatives shown on Green Ports India Map.",
};

// Root layout for /portal: the admin portal has its own document, styles and
// store, separate from the public map in app/(map).
export default function PortalRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body> before
          React hydrates; this ignores those, and only on <body> itself. */}
      <body
        suppressHydrationWarning
        className={cn(
          inter.variable,
          "min-h-screen bg-background font-sans antialiased"
        )}>
        <StoreProvider>
          <PersistentUser>{children}</PersistentUser>
          <Toaster richColors />
        </StoreProvider>
      </body>
    </html>
  );
}
