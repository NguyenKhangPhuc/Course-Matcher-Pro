"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, History, LogOut, Database } from "lucide-react";
import { signout } from "../actions/authentication";
import { useNotification } from "../context/Notification";
import Image from 'next/image'


import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";
import { LanguageSwitchButton } from "./LanguageSwitchButton";

// =====================================================================
// TYPES
// =====================================================================

interface NavigationBarClientProps {
  user?: User | null;
}

interface NavItem {
  id: "home" | "dashboard" | "history" | "sourceManagement";
  href: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    href: "/",
    icon: <LayoutDashboard size={18} strokeWidth={1.8} />,
  },
  {
    id: "dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} strokeWidth={1.8} />,
  },
  {
    id: "history",
    href: "/history",
    icon: <History size={18} strokeWidth={1.8} />,
  },
  {
    id: "sourceManagement",
    href: "/source-management",
    icon: <Database size={18} strokeWidth={1.8} />,
  },
];

// =====================================================================
// COMPONENT
// =====================================================================

/**
 * NavigationBarClient
 * -------------------
 * Client component — renders the left sidebar navigation.
 * Receives the Supabase user object from the server component parent.
 *
 * Highlights the active route, handles sign-out, and shows the
 * user's email initial in the bottom avatar area.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function NavigationBarClient({ user }: NavigationBarClientProps) {
  const pathname = usePathname();
  const { showNotification } = useNotification();
  const { language } = useLanguage();
  const t = translations[language.language] || translations.en;

  const handleLogout = async () => {
    try {
      await signout();
    } catch (error) {
      if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
        showNotification(error.message);
      }
    }
  };

  return (
    <aside className="nav-sidebar">
      {/* ── Brand ─────────────────────────────────────── */}
      <div className="nav-brand">
        <Image
          src="/logo.png"
          alt="Course Matcher Pro logo"
          width={30}
          height={30}
          className="object-contain"
        />
        <span className="nav-brand-title">
          Course Matcher Pro
        </span>
      </div>

      {/* ── Plan badge & Language Switch ──────────────────── */}
      <div className="flex flex-col gap-2 px-1">
        <div className="nav-plan-badge">
          <span className="nav-plan-dot" />
          {t.nav.professionalPlan}
        </div>

        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-[11px] font-semibold text-[#6b9daa]">{t.nav.language}</span>
          <LanguageSwitchButton />
        </div>
      </div>

      {/* ── Navigation items ──────────────────────────── */}
      <nav className="nav-menu">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const label = t.nav[item.id] || item.id;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom actions ────────────────────────────── */}
      <div className="nav-bottom">
        <button onClick={handleLogout} className="nav-bottom-btn nav-signout">
          <LogOut size={18} strokeWidth={1.8} />
          <span>{t.nav.signOut}</span>
        </button>
      </div>
    </aside>
  );
}
