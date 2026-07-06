/**
 * PURPOSE:
 * This component renders a card for a single matched course.
 * It displays the course name, similarity match score, study option or program,
 * a link to the course page, and allows toggling the full learning outcomes details.
 *
 * CONTEXT/PARENT FILE:
 * Extracted from app/history/HistoryClient.tsx.
 *
 * INPUTS / PARAMETERS:
 * - match (SearchHistoryWithMatches["search_matches"][number], Required): The match record containing similarity and nested course object.
 */

"use client";

import React, { useState, useCallback } from "react";
import { OpenInNew } from "@mui/icons-material";
import { SearchHistoryWithMatches } from "../../types/search_history";

interface CourseMatchCardProps {
    match: SearchHistoryWithMatches["search_matches"][number];
}

export function CourseMatchCard({ match }: CourseMatchCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const course = match.courses;

    /**
     * BEHAVIORAL MECHANISM:
     * Toggles the local expansion state of the course card, which controls whether
     * the learning outcomes text is shown in full or truncated.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - void
     */
    const toggleExpand = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    if (!course) {
        return null;
    }

    return (
        <div
            onClick={toggleExpand}
            className="border border-[#d6edf5] rounded-2xl bg-[#fafeff] p-3.5 flex flex-col gap-2 hover:shadow-[0_4px_16px_rgba(125,216,204,0.18)] transition-shadow cursor-pointer min-w-0 w-full overflow-hidden"
        >
            <div className="flex items-start justify-between gap-2 min-w-0">
                <span className="text-[10px] font-semibold text-[#6b9daa] uppercase tracking-wide shrink-0">
                    Match Score
                </span>
                <span className="text-xl font-extrabold text-[#1a5c55] leading-none shrink-0">
                    {Math.round(match.similarity)}%
                </span>
            </div>

            <p className="text-sm font-bold text-[#1a2e35] leading-tight break-words min-w-0">
                {course.name}
            </p>

            <p className="text-xs text-[#6b9daa] leading-relaxed flex-1 break-words min-w-0">
                {isExpanded
                    ? course.learning_outcomes
                    : `${course.learning_outcomes?.slice(0, 100)}...`}
            </p>

            <div className="flex items-center justify-between mt-auto pt-1 gap-2 min-w-0">
                <span className="text-[11px] font-semibold text-[#4a7a85] bg-[#e8f4f8] px-2.5 py-1 rounded-full truncate min-w-0 flex-1">
                    {course.study_option || course.programme || "Course"}
                </span>
                {course.url && (
                    <a
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[#7dd8cc] hover:text-[#1a5c55] transition-colors shrink-0"
                    >
                        <OpenInNew sx={{ fontSize: 14 }} />
                    </a>
                )}
            </div>
        </div>
    );
}
