"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { LayoutDashboard, History, HelpCircle, LogOut } from "lucide-react";
import { createClient } from "../utils/supabase/client";


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

const NAV_ITEMS: NavItem[] = [
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

  const handleSignOut = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() ?? "?";
  const userEmail = user?.email ?? "";

  return (
    <aside className="nav-sidebar">
      {/* ── Brand ─────────────────────────────────────── */}
      <div className="nav-brand">
        <div className="nav-brand-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <div>
          <p className="nav-brand-title">Course Matcher</p>
          <p className="nav-brand-subtitle">Pro</p>
        </div>
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

        <button onClick={handleSignOut} className="nav-bottom-btn nav-signout">
          <LogOut size={18} strokeWidth={1.8} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
