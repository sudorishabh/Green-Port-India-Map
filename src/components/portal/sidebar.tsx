"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalRoutes } from "@/lib/portal/routes";

const navItems = [
  { href: portalRoutes.ports, label: "Ports" },
  { href: portalRoutes.kpis, label: "KPIs" },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className='fixed mt-12 inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex'>
      <nav className='flex flex-col items-start gap-4 px-4 py-6'>
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground w-full pl-6 transition-all hover:text-primary ${
              pathname === href
                ? "text-sky-800 bg-sky-100 font-semibold"
                : "hover:bg-sky-100"
            }`}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
