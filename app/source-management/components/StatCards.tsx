/**
 * Purpose:
 * Renders statistical visualization cards (StatCard and StorageCard) for the
 * Source Management dashboard screen.
 *
 * Context/Parent File:
 * Extracted from app/source-management/SourceManagementClient.tsx.
 *
 * Inputs / Parameters:
 * - label (string, Required): Display name of the statistic.
 * - value (string, Required): Display value for the statistic.
 * - accent (boolean, Optional): Highlight the value with brand coloring.
 * - small (boolean, Optional): Reduce font size of value text.
 * - count (number, Required): Current number of loaded records for storage usage calculation.
 */

"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
    label: string;
    value: string;
    accent?: boolean;
    small?: boolean;
}

interface StorageCardProps {
    count: number;
}

/**
 * Behavioral Mechanism:
 * Renders a simple card containing a descriptive label and a prominent value.
 *
 * Parameters:
 * - label: Descriptive heading of the card.
 * - value: Text or numerical value of the statistic.
 * - accent: Optional flag to style value with brand color.
 * - small: Optional flag to render text value smaller.
 *
 * Return Value:
 * - React.ReactElement: Visual card element.
 */
export function StatCard({ label, value, accent, small }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-[#d6edf5] p-4 flex flex-col gap-1 shadow-sm">
            <p className="text-[11px] font-semibold text-[#7aa5b0] uppercase tracking-wide">{label}</p>
            <p className={`font-bold text-[#1a2e35] leading-tight ${small ? "text-lg" : "text-2xl"} ${accent ? "text-[#1a5c55]" : ""}`}>
                {value}
            </p>
        </div>
    );
}

/**
 * Behavioral Mechanism:
 * Renders a progress-bar visual highlighting the percentage of storage capacity used.
 *
 * Parameters:
 * - count: Numerical count of records current stored.
 *
 * Return Value:
 * - React.ReactElement: Visual card displaying storage metrics with animated progress indicator.
 */
export function StorageCard({ count }: StorageCardProps) {
    const pct = Math.min(100, Math.round((count / 5000) * 100));
    return (
        <div className="bg-white rounded-2xl border border-[#d6edf5] p-4 flex flex-col gap-2 shadow-sm">
            <p className="text-[11px] font-semibold text-[#7aa5b0] uppercase tracking-wide">Storage Used</p>
            <div className="w-full h-2 rounded-full bg-[#e8f4f2] overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg,#1a5c55,#7dd8cc)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />
            </div>
            <p className="text-xs text-[#7aa5b0]">{count.toLocaleString()} / 5,000 records</p>
        </div>
    );
}
