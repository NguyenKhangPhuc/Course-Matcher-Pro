"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, History, HelpCircle, LogOut } from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { signout } from "../actions/authentication";
import { useNotification } from "../context/Notification";
import Image from 'next/image'


// =====================================================================
// TYPES
// =====================================================================

interface NavigationBarClientProps {
  user: User | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// =====================================================================
// NAV ITEMS
// =====================================================================

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <LayoutDashboard size={18} strokeWidth={1.8} />,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} strokeWidth={1.8} />,
  },
  {
    label: "History",
    href: "/history",
    icon: <History size={18} strokeWidth={1.8} />,
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
export function NavigationBarClient({ user }: NavigationBarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showNotification } = useNotification()
  const handleLogout = async () => {
    try {
      await signout()
    } catch (error) {

      if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {

        showNotification(error.message)
      }
    }
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? "?";
  const userEmail = user?.email ?? "";

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

      {/* ── Plan badge ────────────────────────────────── */}
      <div className="nav-plan-badge">
        <span className="nav-plan-dot" />
        Professional Plan
      </div>

      {/* ── Navigation items ──────────────────────────── */}
      <nav className="nav-menu">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom actions ────────────────────────────── */}
      <div className="nav-bottom">
        <Link href="/help" className="nav-bottom-btn">
          <HelpCircle size={18} strokeWidth={1.8} />
          <span>Help</span>
        </Link>

        <button onClick={handleLogout} className="nav-bottom-btn nav-signout">
          <LogOut size={18} strokeWidth={1.8} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
