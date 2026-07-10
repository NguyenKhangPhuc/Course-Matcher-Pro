/**
 * Purpose:
 * Main orchestrator for the Source Management screen. Manages the overall page state
 * (sources list, loaded courses, editing state, and expanded rows) and renders
 * the layout with page headers, stat cards, and the sources table.
 *
 * Context/Parent File:
 * Refactored parent client component under app/source-management/SourceManagementClient.tsx.
 *
 * Inputs / Parameters:
 * - sources (SourceInsert[], Required): List of data source records pre-fetched server-side.
 * - userId (string, Required): The currently authenticated user's ID.
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { SourceInsert } from "../types/source";
import { CourseInsert } from "../types/course";
import { getCoursesBySourceId } from "../actions/course";
import { useNotification } from "../context/Notification";
import StorageIcon from "@mui/icons-material/Storage";
import { deleteSource, updateSourceNameBySourceId } from "../actions/source_management";

// Component Imports
import { StatCard, StorageCard } from "./components/StatCards";
import { SourceRow } from "./components/SourceRow";
import CourseEditModal from "./components/CourseEditModal";
import { useForm } from "react-hook-form";

interface Props {
    sources: SourceInsert[];
    userId: string;
}

/**
 * Behavioral Mechanism:
 * Formats database date strings into a readable text format.
 *
 * Parameters:
 * - d: ISO date string.
 *
 * Return Value:
 * - string: Formatted date representation.
 */
function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Behavioral Mechanism:
 * Coordinates the global state of source lists, active sub-row courses, loading flags,
 * and current modal targets. Passes states and action callbacks as properties down to
 * specialized presentational sub-components.
 *
 * Parameters:
 * - props: Contains the initial server-fetched sources.
 *
 * Return Value:
 * - React.ReactElement: Main Source Management dashboard view.
 */
export default function SourceManagementClient({ sources }: Props) {
    const { showNotification } = useNotification();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CourseInsert>();

    // ── State ─────────────────────────────────────────────────────────
    const [sourceList, setSourceList] = useState<SourceInsert[]>(sources);
    const [activeCourses, setActiveCourses] = useState<CourseInsert[]>([]);
    const [loadingSourceId, setLoadingSourceId] = useState<string | null>(null);
    const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

    // Inline source name editing
    const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    // Course edit modal
    const [editingCourse, setEditingCourse] = useState<CourseInsert | null>(null);

    // Source actions dropdown
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // ── Computed stats ────────────────────────────────────────────────
    const totalSources = sourceList.length;
    const totalCourses = activeCourses.length;
    const lastUpdated = sourceList[0]?.updated_at ? formatDate(sourceList[0].updated_at) : "—";

    // ── Handlers ──────────────────────────────────────────────────────

    /**
     * Behavioral Mechanism:
     * Expands or collapses a source row. If expanded, triggers a lazy fetch for nested courses.
     *
     * Parameters:
     * - sourceId: The unique ID of the source.
     *
     * Return Value:
     * - Promise<void>
     */
    const handleToggleExpand = async (sourceId: string) => {
        setOpenMenuId(null);

        if (expandedSourceId === sourceId) {
            setExpandedSourceId(null);
            setActiveCourses([]);
            return;
        }

        setExpandedSourceId(sourceId);
        setActiveCourses([]);
        setLoadingSourceId(sourceId);

        try {
            const result = await getCoursesBySourceId(sourceId);
            if (result.error) throw new Error(result.error);
            setActiveCourses(result.data ?? []);
        } catch (err) {
            showNotification(err instanceof Error ? err.message : "Failed to load courses.");
        } finally {
            setLoadingSourceId(null);
        }
    };

    /**
     * Behavioral Mechanism:
     * Prepares inline inputs with the current name of the selected source.
     *
     * Parameters:
     * - source: The source object selected.
     *
     * Return Value:
     * - void
     */
    const handleStartEditName = (source: SourceInsert) => {
        setEditingSourceId(source.id!);
        setEditingName(source.name);
        setOpenMenuId(null);
    };

    /**
     * Behavioral Mechanism:
     * Persists inline name edits to the database via server action updateSourceNameBySourceId.
     *
     * Parameters:
     * - sourceId: The ID of the source record being renamed.
     *
     * Return Value:
     * - Promise<void>
     */
    const handleSaveName = async (sourceId: string) => {
        const { error } = await updateSourceNameBySourceId(sourceId, editingName);

        if (error) {
            showNotification(error);
            return;
        }
        setSourceList((prev) =>
            prev.map((s) => (s.id === sourceId ? { ...s, name: editingName.trim() } : s))
        );
        setEditingSourceId(null);
        showNotification("Source renamed successfully.");
    };

    /**
     * Behavioral Mechanism:
     * Discards current name modifications and exits inline input mode.
     *
     * Parameters:
     * - None
     *
     * Return Value:
     * - void
     */
    const handleCancelEditName = () => {
        setEditingSourceId(null);
        setEditingName("");
    };

    /**
     * Behavioral Mechanism:
     * Performs a hard delete on a database source record via deleteSource action.
     *
     * Parameters:
     * - sourceId: The ID of the source.
     *
     * Return Value:
     * - Promise<void>
     */
    const handleDeleteSource = async (sourceId: string) => {
        setOpenMenuId(null);
        try {
            await deleteSource(sourceId);
            setSourceList((prev) => prev.filter((s) => s.id !== sourceId));
            if (expandedSourceId === sourceId) {
                setExpandedSourceId(null);
                setActiveCourses([]);
            }
            showNotification("Source deleted successfully.");
        } catch (err) {
            showNotification(err instanceof Error ? err.message : "Failed to delete source.");
        }
    };

    /**
     * Behavioral Mechanism:
     * Updates local state with modified course fields returned by the modal.
     *
     * Parameters:
     * - updated: The updated course insert structure.
     *
     * Return Value:
     * - void
     */
    const handleCourseSaved = (updated: CourseInsert) => {
        setActiveCourses((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
        );
    };
    /**
     * Behavioral Mechanism:
     * Formats a raw date string to YYYY-MM-DD representation.
     *
     * Parameters:
     * - dateStr: Raw date value from database.
     *
     * Return Value:
     * - string: Formatted date string or empty string.
     */
    function formatDateForInput(dateStr: string | null): string {
        if (!dateStr || typeof dateStr !== "string") return "";
        return dateStr.split("T")[0];
    }

    const handleSelectCourse = (course: CourseInsert) => {
        setEditingCourse(course)
        // console.log(course)
        reset({
            ...course,
            start_date: formatDateForInput(course.start_date ?? null),
            end_date: formatDateForInput(course.end_date ?? null),
            enrollment_start_date: formatDateForInput(course.enrollment_start_date ?? null),
            enrollment_end_date: formatDateForInput(course.enrollment_end_date ?? null),
        } as CourseInsert)
    }

    return (
        <div className="flex-1 min-h-screen min-w-0 bg-[#f0f7fa] px-4 sm:px-6 lg:px-9 py-5 sm:py-8 flex flex-col gap-5 sm:gap-7 overflow-y-auto overflow-x-hidden">

            {/* Page header */}
            <motion.div
                className="flex items-center gap-3 min-w-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a5c55] shrink-0">
                    <StorageIcon sx={{ fontSize: 20 }} className="text-white" />
                </div>
                <div className="min-w-0">
                    <h1 data-testid="source-management-heading" className="text-lg font-bold text-[#1a2e35] leading-tight">Source Management</h1>
                    <p className="text-xs text-[#6b9daa]">
                        Manage academic data streams and nested course definitions.
                    </p>
                </div>
            </motion.div>

            {/* Stat cards */}
            <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
            >
                <StatCard label="Total Sources" value={String(totalSources)} />
                <StatCard label="Processed Records" value={totalCourses.toLocaleString()} accent />
                <StatCard label="Last Updated" value={lastUpdated} small />
                <StorageCard count={totalCourses} />
            </motion.div>

            {/* Sources table card */}
            <motion.div
                data-testid="sources-table"
                className="bg-white rounded-2xl border border-[#d6edf5] overflow-hidden shadow-sm"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
            >
                {/* Table header bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8f4f8]">
                    <h2 className="text-sm font-bold text-[#1a2e35]">Data Sources</h2>
                    <span className="text-xs font-medium text-[#7aa5b0]">Sources Table</span>
                </div>

                {/* Column headings */}
                <div className="hidden sm:grid grid-cols-[2fr_120px_140px_160px_80px] gap-4 px-6 py-2.5 bg-[#f0f7fa] border-b border-[#e8f4f8]">
                    {["Name", "File Type", "Default Status", "Created At", "Actions"].map((h) => (
                        <span key={h} className="text-[11px] font-semibold text-[#6b9daa] uppercase tracking-wide">
                            {h}
                        </span>
                    ))}
                </div>

                {/* Rows */}
                {sourceList.length === 0 ? (
                    <p data-testid="empty-sources-message" className="text-sm text-[#7aa5b0] text-center py-12">No sources found.</p>
                ) : (
                    sourceList.map((source, idx) => (
                        <SourceRow
                            key={source.id}
                            source={source}
                            idx={idx}
                            isExpanded={expandedSourceId === source.id}
                            isLoading={loadingSourceId === source.id}
                            activeCourses={activeCourses}
                            isEditingName={editingSourceId === source.id}
                            editingName={editingName}
                            setEditingName={setEditingName}
                            isMenuOpen={openMenuId === source.id}
                            setOpenMenuId={setOpenMenuId}
                            onToggleExpand={handleToggleExpand}
                            onStartEditName={handleStartEditName}
                            onSaveName={handleSaveName}
                            onCancelEditName={handleCancelEditName}
                            onDeleteSource={handleDeleteSource}
                            onSelectCourse={handleSelectCourse}
                        />
                    ))
                )}
            </motion.div>

            {/* Course edit modal */}
            {editingCourse && (
                <CourseEditModal
                    course={editingCourse}
                    onClose={() => setEditingCourse(null)}
                    onSave={(updated) => {
                        handleCourseSaved(updated);
                        setEditingCourse(null);
                    }}
                    register={register}
                    handleSubmit={handleSubmit}
                    errors={errors}
                />
            )}

            {/* Close dropdown on outside click */}
            {openMenuId && (
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
            )}
        </div>
    );
}
