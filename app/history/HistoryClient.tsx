/**
 * PURPOSE:
 * This file serves as the main orchestrator for the history screen.
 * It manages the list of user search history items, active collapsibles,
 * loader spinners, and deletion popups. It orchestrates calls to delete
 * records via database actions and renders components in a responsive grid.
 *
 * CONTEXT/PARENT FILE:
 * Root client history component.
 *
 * INPUTS / PARAMETERS:
 * - user (User, Required): The Supabase user session data.
 * - searchHistoryWithMatches (SearchHistoryWithMatches[], Required): List of past search logs with recommended courses.
 */

"use client";

import React, { useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { SearchHistoryWithMatches } from "../types/search_history";
import { useNotification } from "../context/Notification";
import { deleteSearchHistoryById } from "../actions/search_history";
import { DynamicModal } from "../dashboard/SaveSearchModal";
import { useLoader } from "../context/LoaderContext";

import { HistoryHeader } from "./components/HistoryHeader";
import { HistoryList } from "./components/HistoryList";

interface HistoryClientProps {
    user: User;
    searchHistoryWithMatches: SearchHistoryWithMatches[];
}

export default function HistoryClient({ searchHistoryWithMatches }: HistoryClientProps) {
    const [items, setItems] = useState<SearchHistoryWithMatches[]>(searchHistoryWithMatches);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const { setIsOpenLoader } = useLoader();
    const { showNotification } = useNotification();

    /**
     * BEHAVIORAL MECHANISM:
     * Toggles the collapsible state for a specific history log card. If it is already
     * expanded, it collapses it by setting the ID to null. Otherwise, sets the expanded ID.
     *
     * PARAMETERS:
     * - id (string): The search history entry ID.
     *
     * RETURNS:
     * - void
     */
    const toggleExpand = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    /**
     * BEHAVIORAL MECHANISM:
     * Invokes database action deleteSearchHistoryById using the stored deletingId.
     * On success, filters the deleted record out of local state list, resets collapsible
     * toggles if the deleted element was open, disables spinners, and pushes success toast.
     * Handles exceptions with failure notifications.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - Promise<void>
     */
    const handleDelete = async (): Promise<void> => {
        setIsOpenLoader({ isOpen: true });
        try {
            if (!deletingId) {
                throw new Error("Failed to delete");
            }
            const { error } = await deleteSearchHistoryById(deletingId);
            if (error) {
                showNotification("Failed to delete search history.");
                return;
            }
            setItems((prev) => prev.filter((item) => item.id !== deletingId));
            if (expandedId === deletingId) {
                setExpandedId(null);
            }
            setIsOpenLoader({ isOpen: false });
            showNotification("Search history deleted.");
            setShowSaveModal(false);
        } catch (err) {
            setIsOpenLoader({ isOpen: false });
            showNotification(err instanceof Error ? err.message : "Failed to delete.");
        } finally {
            setDeletingId(null);
        }
    };

    /**
     * BEHAVIORAL MECHANISM:
     * Opens the deletion confirmation dialog and flags the given searchId for removal.
     *
     * PARAMETERS:
     * - searchId (string): The ID of the search history entry to delete.
     *
     * RETURNS:
     * - void
     */
    const onOpenModal = useCallback((searchId: string) => {
        setDeletingId(searchId);
        setShowSaveModal(true);
    }, []);

    /**
     * BEHAVIORAL MECHANISM:
     * Closes the delete confirmation modal dialog.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - void
     */
    const onDismiss = useCallback(() => {
        setShowSaveModal(false);
    }, []);

    return (
        <div className="flex-1 min-h-screen min-w-0 bg-[#f0f7fa] px-4 sm:px-6 lg:px-9 py-5 sm:py-8 flex flex-col gap-5 sm:gap-7 overflow-y-auto overflow-x-hidden">
            {/* Page header */}
            <HistoryHeader />

            {/* History list */}
            <HistoryList
                items={items}
                expandedId={expandedId}
                onToggleExpand={toggleExpand}
                onOpenModal={onOpenModal}
                deletingId={deletingId}
            />

            {/* Delete Modal */}
            <DynamicModal
                isOpen={showSaveModal}
                onSave={handleDelete}
                onDismiss={onDismiss}
                title="Do you want to delete this search?"
                subTitle="This search and its matched courses will be deleted from your history."
            />
        </div>
    );
}
