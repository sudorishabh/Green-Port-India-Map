"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, BarChart2, Users } from "lucide-react";
import { portalRoutes } from "@/lib/portal/routes";

const navItems = [
  { href: portalRoutes.ports, label: "Ports", icon: Anchor },
  { href: portalRoutes.kpis, label: "KPIs", icon: BarChart2 },
  { href: portalRoutes.users, label: "Users", icon: Users },
];

const variants = {
  sidebar: {
    nav: "flex flex-col gap-1 p-4",
    link: "rounded-lg px-3 py-2",
    active: "bg-sky-100 font-semibold text-sky-800",
    inactive: "text-muted-foreground hover:bg-sky-50 hover:text-foreground",
  },
  tabs: {
    nav: "flex gap-1 overflow-x-auto px-2 sm:px-4",
    link: "border-b-2 px-3 py-2.5",
    active: "border-sky-700 font-semibold text-sky-800",
    inactive:
      "border-transparent text-muted-foreground hover:text-foreground",
  },
};

/**
 * Links to the portal's sections: a sidebar list on large screens, or a row of
 * tabs under the header on smaller ones.
 */
export function PortalNav({ variant }: { variant: keyof typeof variants }) {
  const pathname = usePathname();
  const styles = variants[variant];

  return (
    <nav
      aria-label='Portal sections'
      className={styles.nav}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 text-sm transition-colors ${
              styles.link
            } ${isActive ? styles.active : styles.inactive}`}>
            <Icon className='size-4' />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
