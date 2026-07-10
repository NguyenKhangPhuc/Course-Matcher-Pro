/**
 * Footer
 * ------
 * Site-wide footer — reusable across all pages.
 * Placed in layout.tsx so it appears on every route.
 *
 * Shows the academic partner callout and basic legal links.
 */
import Link from "next/link";
import Image from "next/image";

export function Footer() {
    return (
        <footer className="mt-auto bg-[#e8f4f8] border-t border-[#d6edf5]">
            {/* ── Partner callout card ── */}

            {/* ── Bottom bar ── */}
            <div className="flex items-center sm:justify-between justify-center gap-4 flex-wrap px-6 py-5 md:px-20">
                {/* Brand */}
                <div className="flex items-center justify-center gap-2">
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

                {/* Centre credit */}
                <div className="flex flex-col items-center justify-center text-center text-[11px] text-[#a8c8d4]">
                    Built by students of University of Oulu — IKAPO team.
                    {/* ── Copyright ── */}
                    <p className="">
                        © {new Date().getFullYear()} Course Matcher Pro. All rights reserved.
                    </p>
                </div>

                {/* Links */}
                <div className="flex gap-5">
                    <Link href="/privacy-policy"
                        className="text-xs text-[#6b9daa] no-underline transition-colors hover:text-[#1a5c55]">
                        Privacy Policy
                    </Link>
                    <Link href="/terms-and-conditions"
                        className="text-xs text-[#6b9daa] no-underline transition-colors hover:text-[#1a5c55]">
                        Terms
                    </Link>
                </div>
            </div>


        </footer>
    );
}