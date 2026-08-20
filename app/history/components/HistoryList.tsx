/**
 * PURPOSE:
 * This component renders the list of search history entries. If the list is empty,
 * it displays an empty state block guiding the user to run analyses on the dashboard.
 *
 * CONTEXT/PARENT FILE:
 * Extracted from app/history/HistoryClient.tsx.
 *
 * INPUTS / PARAMETERS:
 * - items (SearchHistoryWithMatches[], Required): List of search history items.
 * - expandedId (string | null, Required): The ID of the currently expanded history item.
 * - onToggleExpand ((id: string) => void, Required): Callback to expand/collapse a row.
 * - onOpenModal ((id: string) => void, Required): Callback to trigger history deletion.
 * - deletingId (string | null, Required): The ID of the item currently being deleted, if any.
 */

"use client";

import React from "react";
import { SearchHistoryWithMatches } from "../../types/search_history";
import { HistoryItem } from "./HistoryItem";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

interface HistoryListProps {
    items: SearchHistoryWithMatches[];
    expandedId: string | null;
    onToggleExpand: (id: string) => void;
    onOpenModal: (id: string) => void;
    deletingId: string | null;
}

export function HistoryList({
    items,
    expandedId,
    onToggleExpand,
    onOpenModal,
    deletingId,
}: HistoryListProps) {
    const { language } = useLanguage();
    const t = translations[language.language] || translations.en;

    if (items.length === 0) {
        return (
            <div className="bg-white border border-[#d6edf5] rounded-2xl p-10 text-center">
                <p className="text-sm text-[#6b9daa]">
                    {t.history.noHistorySub}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 min-w-0">
            {items.map((item) => (
                <HistoryItem
                    key={item.id}
                    item={item}
                    isExpanded={expandedId === item.id}
                    onToggleExpand={() => onToggleExpand(item.id!)}
                    onOpenModal={onOpenModal}
                    deletingId={deletingId}
                />
            ))}
        </div>
    );
}
