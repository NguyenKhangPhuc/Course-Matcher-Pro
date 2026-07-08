/**
 * PURPOSE:
 * This component renders a single collapsible item in the search history list.
 * It displays company name, position, technical requirements preview, date,
 * and collapses/expands to reveal the matching courses grid and a delete history action button.
 *
 * CONTEXT/PARENT FILE:
 * Extracted from app/history/HistoryClient.tsx.
 *
 * INPUTS / PARAMETERS:
 * - item (SearchHistoryWithMatches, Required): The search history entry.
 * - isExpanded (boolean, Required): Indicates if the details panel is expanded.
 * - onToggleExpand (() => void, Required): Callback to toggle the expansion state.
 * - onOpenModal ((id: string) => void, Required): Callback to open the delete confirmation modal.
 * - deletingId (string | null, Required): The ID of the item currently being deleted, if any.
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExpandMore, Delete } from "@mui/icons-material";
import { SearchHistoryWithMatches } from "../../types/search_history";
import { CourseMatchCard } from "./CourseMatchCard";

interface HistoryItemProps {
    item: SearchHistoryWithMatches;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onOpenModal: (id: string) => void;
    deletingId: string | null;
}

/**
 * BEHAVIORAL MECHANISM:
 * Formats an ISO date string into a developer-friendly date presentation format
 * such as "Oct 24, 2025" using the standard JavaScript Date formatting methods.
 *
 * PARAMETERS:
 * - isoString (string): The ISO timestamp of when the search log was created.
 *
 * RETURNS:
 * - string: A formatted representation of the date.
 */
function formatDate(isoString: string): string {
    return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export function HistoryItem({
    item,
    isExpanded,
    onToggleExpand,
    onOpenModal,
    deletingId,
}: HistoryItemProps) {
    const matchCount = item.search_matches?.length ?? 0;

    /**
     * BEHAVIORAL MECHANISM:
     * Component function rendering a search history list row. The header row is a button
     * that triggers the toggle callback. The details pane is wrapped in Framer Motion's AnimatePresence
     * to transition height and opacity when expanded. Inside the details pane, matches are mapped
     * to CourseMatchCard components.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - React.ReactElement: The rendered history item list element.
     */
    return (
        <div data-testid="history-item" className="bg-white border border-[#4ad2ff] rounded-2xl overflow-hidden min-w-0">
            {/* Row header — clickable */}
            <button
                onClick={onToggleExpand}
                className="cursor-pointer w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-[#fafeff] transition-colors min-w-0"
            >
                {/* Company + position */}
                <div className="min-w-0 flex-1 max-w-[780px]">
                    <p className="text-sm font-bold text-[#1a2e35] truncate">{item.company_name}</p>
                    <p className="text-xs font-medium text-[#1a5c55]">
                        <span className="font-semibold text-[#1a2e35]">Position: </span>
                        {item.position}
                    </p>
                    {item.programme && <p className="text-xs font-medium text-[#1a5c55]">
                        <span className="font-semibold text-[#1a2e35]">Programme: </span>
                        {item.programme}
                    </p>}
                    <p className="text-xs text-[#4a7a85]">
                        <span className="font-semibold text-[#1a2e35]">Requirements: </span>
                        {isExpanded
                            ? item.technical_requirements
                            : (item.technical_requirements?.slice(0, 200) || "") + "...more"}
                    </p>
                </div>

                {/* Date + chevron */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-semibold text-[#a8c8d4] uppercase tracking-wide">
                            Created On
                        </p>
                        <p className="text-xs font-semibold text-[#4a7a85]">
                            {formatDate(item.created_at!)}
                        </p>
                    </div>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[#6b9daa] shrink-0"
                    >
                        <ExpandMore fontSize="small" />
                    </motion.div>
                </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div data-testid="history-expanded-panel" className="border-t border-[#4ad2ff] px-6 py-5 min-w-0">
                            {/* Matched courses label */}
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-bold text-[#6b9daa] uppercase tracking-wide">
                                    Matched Courses ({matchCount})
                                </p>
                            </div>

                            {/* Course grid */}
                            {matchCount === 0 ? (
                                <p className="text-xs text-[#6b9daa] text-center py-4">
                                    No matched courses for this search.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5 min-w-0">
                                    {item.search_matches.map((match) => (
                                        <CourseMatchCard key={match.id} match={match} />
                                    ))}
                                </div>
                            )}

                            {/* Delete button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => onOpenModal(item.id!)}
                                    disabled={deletingId === item.id}
                                    className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-[#c0392b] hover:bg-[#fde8e8] px-3 py-2 rounded-lg transition-colors disabled:opacity-50 shrink-0 duration-300"
                                >
                                    <Delete sx={{ fontSize: 16 }} />
                                    {deletingId === item.id ? "Deleting..." : "Delete History"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
