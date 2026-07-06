/**
 * PURPOSE:
 * This component renders the page header for the history screen.
 * It displays the History title, description, and page icon.
 *
 * CONTEXT/PARENT FILE:
 * Extracted from app/history/HistoryClient.tsx.
 *
 * INPUTS / PARAMETERS:
 * - None
 */

"use client";

import React from "react";
import HistoryIcon from "@mui/icons-material/History";

export function HistoryHeader() {
    /**
     * BEHAVIORAL MECHANISM:
     * Component function that returns a styled header row containing an icon,
     * a main title, and a subtitle explaining the section's purpose.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - React.ReactElement: The rendered history page header.
     */
    return (
        <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a3a8f] shrink-0">
                <HistoryIcon sx={{ fontSize: 20 }} className="text-white" />
            </div>
            <div className="min-w-0">
                <h1 className="text-lg font-bold text-[#1a2e35] leading-tight">History</h1>
                <p className="text-xs text-[#6b9daa]">
                    Review and manage your past course alignment analyses.
                </p>
            </div>
        </div>
    );
}
