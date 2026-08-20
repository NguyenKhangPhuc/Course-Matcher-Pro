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
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations";

// Component Imports
import { StatCard, StorageCard } from "./components/StatCards";
import { SourceRow } from "./components/SourceRow";
import CourseEditModal from "./components/CourseEditModal";
import { useForm } from "react-hook-form";

interface Props {
    sources: SourceInsert[];
    userId: string;
}

export default function SourceManagementClient({ sources }: Props) {
    const { showNotification } = useNotification();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<CourseInsert>();
    const { language } = useLanguage();
    const t = translations[language.language] || translations.en;

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

    // Dropdown menu state
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // ── Computed stats ────────────────────────────────────────────────
    const totalSources = sourceList.length;
    const totalCourses = activeCourses.length;
    const lastUpdated = formatDate(sourceList[0]?.created_at);

    function formatDate(d: string | null | undefined): string {
        if (!d) return "—";
        return new Date(d).toLocaleDateString(language.language === 'fi' ? "fi-FI" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
    }

    // ── Handlers ──────────────────────────────────────────────────────

    const handleToggleExpand = async (sourceId: string) => {
        if (expandedSourceId === sourceId) {
            setExpandedSourceId(null);
            return;
        }
        setExpandedSourceId(sourceId);
        setLoadingSourceId(sourceId);
        try {
            const result = await getCoursesBySourceId(sourceId);
            if (result.error) {
                showNotification(result.error);
                setActiveCourses([]);
            } else {
                setActiveCourses(result.data || []);
            }
        } catch {
            showNotification("Failed to fetch courses.");
            setActiveCourses([]);
        } finally {
            setLoadingSourceId(null);
        }
    };

    const handleStartEditName = (source: SourceInsert) => {
        setEditingSourceId(source.id!);
        setEditingName(source.name);
        setOpenMenuId(null);
    };

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

    const handleCancelEditName = () => {
        setEditingSourceId(null);
        setEditingName("");
    };

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

    const handleCourseSaved = (updated: CourseInsert) => {
        setActiveCourses((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
        );
    };

    function formatDateForInput(dateStr: string | null): string {
        if (!dateStr || typeof dateStr !== "string") return "";
        return dateStr.split("T")[0];
    }

    const handleSelectCourse = (course: CourseInsert) => {
        setEditingCourse(course)
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
                    <h1 data-testid="source-management-heading" className="text-lg font-bold text-[#1a2e35] leading-tight">
                        {t.sourceManagement.pageTitle}
                    </h1>
                    <p className="text-xs text-[#6b9daa]">
                        {t.sourceManagement.pageSub}
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
                <StatCard label={t.sourceManagement.totalSources} value={String(totalSources)} />
                <StatCard label={language.language === 'fi' ? "Käsitellyt tietueet" : "Processed Records"} value={totalCourses.toLocaleString()} accent />
                <StatCard label={language.language === 'fi' ? "Viimeksi päivitetty" : "Last Updated"} value={lastUpdated} small />
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
                    <h2 className="text-sm font-bold text-[#1a2e35]">{t.sourceManagement.sourcesTableTitle}</h2>
                    <span className="text-xs font-medium text-[#7aa5b0]">{t.sourceManagement.pageTitle}</span>
                </div>

                {/* Column headings */}
                <div className="hidden sm:grid grid-cols-[2fr_120px_140px_160px_80px] gap-4 px-6 py-2.5 bg-[#f0f7fa] border-b border-[#e8f4f8]">
                    {[t.sourceManagement.colName, t.sourceManagement.colType, t.sourceManagement.colStatus, t.sourceManagement.colCreated, t.sourceManagement.colActions].map((h) => (
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
