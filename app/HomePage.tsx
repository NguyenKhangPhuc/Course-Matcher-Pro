import Link from "next/link";
import Image from "next/image";

function HeroSection() {
    return (
        <section className=" grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-5 py-12 xl:p-20 lg:p-10 p-5 max-w-7xl mx-auto w-full">
            {/* ── Left column: copy ── */}
            <div className="flex flex-col items-start">
                <span className="inline-flex items-center self-start gap-1.5 text-[11px] font-bold tracking-[0.1em] uppercase text-[#1a5c55] bg-[#e8faf8] border border-[#7dd8cc] rounded-full px-3.5 py-1 mb-5">
                    Academic Distinction
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold text-[#1a2e35] leading-[1.05] tracking-[-0.02em] mb-4">
                    Course Matcher<br />Pro
                </h1>

                <p className="text-base sm:text-lg font-semibold text-[#1a5c55] leading-snug mb-4">
                    Find your suitable course with only one click.
                </p>

                <p className="text-sm sm:text-[15px] text-[#6b9daa] leading-relaxed max-w-[480px] mb-8">
                    A platform built to help students discover courses that align with
                    real-world job requirements — using data from their university or
                    custom files they upload (Excel, CSV, JSON). Powered by semantic
                    search and AI analysis, so every match is grounded in actual
                    course content, not just keywords.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#1a2e35] text-white rounded-xl text-sm font-bold tracking-[0.01em] no-underline transition-colors hover:bg-[#1a5c55] w-full sm:w-auto"
                    >
                        Get started →
                    </Link>
                    <Link
                        href="#features"
                        className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-transparent text-[#1a2e35] border border-[#d6edf5] rounded-xl text-sm font-semibold no-underline transition-colors hover:border-[#7dd8cc] hover:text-[#1a5c55] w-full sm:w-auto"
                    >
                        See how it works
                    </Link>
                </div>
            </div>

            {/* ── Right column: logo ── */}
            <div className="flex items-center justify-center mt-4 lg:mt-0">
                <Image
                    src="/logo.png"
                    alt="Course Matcher Pro logo"
                    width={420}
                    height={420}
                    priority
                    className="w-48 sm:w-64 lg:w-56 lg:w-96 h-auto object-contain drop-shadow-[0_12px_32px_rgba(125,216,204,0.2)]"
                />
            </div>
        </section>
    );
}

function FeatureGrid() {
    return (
        <section id="features" className="flex flex-col gap-4 lg:gap-6 px-5 pb-16 lg:pb-20 lg:px-20 max-w-7xl mx-auto w-full">

            {/* ── Row 1: Dashboard screenshot | Dashboard text ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 bg-white border border-[#d6edf5] rounded-2xl overflow-hidden min-h-[280px] lg:min-h-[340px]">
                {/* Image — top on mobile, left on desktop */}
                <div className="relative h-52 sm:h-64 lg:h-auto bg-[#e8f4f8] overflow-hidden">
                    <Image
                        src="/screenshots/dashboard.png"
                        alt="Course Matcher Pro dashboard interface"
                        fill
                        className="object-cover object-top-left"
                    />
                </div>
                {/* Text */}
                <div className="flex flex-col justify-center gap-3 lg:gap-4 p-7 lg:p-12">
                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-[#e8f4f8] flex items-center justify-center text-[#1a5c55] shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18M9 21V9" />
                        </svg>
                    </div>
                    <h2 className="text-xl lg:text-[22px] font-extrabold text-[#1a2e35] leading-tight tracking-[-0.01em] m-0">
                        Course Analysis Dashboard
                    </h2>
                    <p className="text-sm text-[#6b9daa] leading-[1.75] m-0">
                        Upload your course catalogue in any supported format — Excel,
                        CSV, or JSON — and paste a job description. The AI extracts
                        the technical requirements, runs a semantic search across your
                        course library, and surfaces the most relevant matches with
                        match scores and plain-language explanations.
                    </p>
                </div>
            </div>

            {/* ── Row 2: History text | History screenshot ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 bg-white border border-[#d6edf5] rounded-2xl overflow-hidden min-h-[280px] lg:min-h-[340px]">
                {/* Image — top on mobile (order-first), right on desktop (order-last) */}
                <div className="relative h-52 sm:h-64 lg:h-auto bg-[#e8f4f8] overflow-hidden order-first lg:order-last">
                    <Image
                        src="/screenshots/history.png"
                        alt="Course Matcher Pro history interface"
                        fill
                        className="object-cover object-top-left"
                    />
                </div>
                {/* Text — bottom on mobile (order-last), left on desktop (order-first) */}
                <div className="flex flex-col justify-center gap-3 lg:gap-4 p-7 lg:p-12 order-last lg:order-first">
                    <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-[#e8f4f8] flex items-center justify-center text-[#1a5c55] shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M12 7v5l4 2" />
                        </svg>
                    </div>
                    <h2 className="text-xl lg:text-[22px] font-extrabold text-[#1a2e35] leading-tight tracking-[-0.01em] m-0">
                        Search History
                    </h2>
                    <p className="text-sm text-[#6b9daa] leading-[1.75] m-0">
                        Every analysis is saved so you can return to it at any time.
                        Compare matched courses across different job descriptions,
                        track how requirements shift between roles, and build a
                        personal record of course–career alignment — all from one
                        organised view.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#f0f7fa] flex flex-col">
            <HeroSection />
            <FeatureGrid />
        </div>
    );
}