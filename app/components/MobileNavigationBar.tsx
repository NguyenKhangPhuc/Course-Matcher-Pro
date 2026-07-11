"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, History, HelpCircle, LogOut, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useNotification } from "../context/Notification";
import { signout } from "../actions/authentication";
import Image from 'next/image'
import { NAV_ITEMS } from "./NavigationBarClient";
// =====================================================================
// TYPES & CONSTANTS
// =====================================================================

interface MobileNavigationBarProps {
    user: User | null;
}

// =====================================================================
// COMPONENT
// =====================================================================

/**
 * MobileNavigationBar
 * --------------------
 * Responsive mobile navigation bar shown only on small screens (md:hidden).
 * Features an animated hamburger button and a slide-in drawer overlay.
 */
const MobileNavigationBar = ({ user }: MobileNavigationBarProps) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { showNotification } = useNotification();

    const handleLogout = async () => {
        try {
            setIsOpen(false);
            await signout();
        } catch (error) {
            if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
                showNotification(error.message);
            }
        }
    };

    const close = () => setIsOpen(false);

    return (
        <>
            {/* ── Top bar — fixed, visible on mobile only ── */}
            <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3 bg-[#e8f4f8] border-b border-[#c8e6ee] md:hidden">
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <Image
                        src="/logo.png"
                        alt="Course Matcher Pro logo"
                        width={30}
                        height={30}
                        className="object-contain"
                    />
                    <span className="text-xs font-bold text-[#1a2e35] uppercase tracking-[0.05em]">
                        Course Matcher Pro
                    </span>
                </div>

                {/* Hamburger button */}
                <button
                    onClick={() => setIsOpen((prev) => !prev)}
                    aria-label="Toggle menu"
                    className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#d4eef5] transition-colors"
                >
                    <AnimatePresence mode="wait" initial={false}>
                        {isOpen ? (
                            <motion.span
                                key="close"
                                initial={{ opacity: 0, rotate: -90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 90 }}
                                transition={{ duration: 0.18 }}
                            >
                                <X size={20} className="text-[#1a5c55]" />
                            </motion.span>
                        ) : (
                            <motion.span
                                key="open"
                                initial={{ opacity: 0, rotate: 90 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: -90 }}
                                transition={{ duration: 0.18 }}
                            >
                                {/* Hamburger SVG matching the provided design */}
                                <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                                    <path
                                        className="text-[#1a5c55]"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
                                    />
                                    <path
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        className="text-[#1a5c55]"
                                        d="M7 16 27 16"
                                    />
                                </svg>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </header>

            {/* ── Backdrop ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={close}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ── Slide-in drawer ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.aside
                        key="drawer"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        className="fixed top-0 left-0 z-50 h-full w-[220px] bg-[#e8f4f8] flex flex-col py-6 px-3 shadow-2xl md:hidden"
                    >
                        {/* Brand */}
                        <div className="flex items-center gap-2.5 px-2 mb-2">
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

                        {/* Plan badge */}
                        <div className="flex items-center gap-1.5 px-2 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7dd8cc]" />
                            <span className="text-[10px] font-medium text-[#7aa5b0] uppercase tracking-wider">
                                Professional Plan
                            </span>
                        </div>

                        {/* Nav items */}
                        <nav className="flex flex-col gap-1 flex-1">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={close}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                                                ? "bg-[#7dd8cc] text-[#1a5c55]"
                                                : "text-[#4a7a85] hover:bg-[#d4eef5] hover:text-[#1a5c55]"
                                            }`}
                                    >
                                        <span className={isActive ? "text-[#1a5c55]" : "text-[#7aa5b0]"}>
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Bottom actions */}
                        <div className="flex flex-col gap-1 pt-4 border-t border-[#c8e6ee]">
                            {/* <Link
                                href="/help"
                                onClick={close}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4a7a85] hover:bg-[#d4eef5] hover:text-[#1a5c55] transition-colors"
                            >
                                <HelpCircle size={18} strokeWidth={1.8} className="text-[#7aa5b0]" />
                                Help
                            </Link> */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#4a7a85] hover:bg-[#fde8e8] hover:text-[#c0392b] transition-colors w-full text-left"
                            >
                                <LogOut size={18} strokeWidth={1.8} className="text-[#7aa5b0]" />
                                Sign Out
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── Spacer — pushes page content below the fixed top bar ── */}
            <div className="h-14 md:hidden" />
        </>
    );
}
export default MobileNavigationBar