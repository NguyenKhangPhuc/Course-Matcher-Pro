/**
 * PURPOSE:
 * Interactive Source Management client component. Renders a page header matching
 * the History page style, a stat summary bar, and an expandable sources table.
 * Courses are fetched lazily via getCoursesBySourceId only when the user expands
 * a source row for the first time. Framer Motion handles all enter/exit animations.
 *
 * CONTEXT/PARENT FILE:
 * app/source-management/page.tsx
 *
 * INPUTS / PARAMETERS:
 * - sources (SourceInsert[]) – pre-fetched sources list from the server.
 * - userId  (string)         – current user's UUID.
 */

"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { SourceInsert } from "../types/source";
import { CourseInsert } from "../types/course";
import { getCoursesBySourceId, updateCourseByCourseId } from "../actions/course";
import { useNotification } from "../context/Notification";
import {
    MoreVert, Edit, Check, Close,
    KeyboardArrowDown, KeyboardArrowUp, DeleteForever,
} from "@mui/icons-material";
import StorageIcon from "@mui/icons-material/Storage";
import { deleteSource, updateSourceNameBySourceId } from "../actions/source_management";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
    sources: SourceInsert[];
    userId: string;
}

type CourseEditable = Pick<
    CourseInsert,
    | "code" | "name" | "title" | "programme" | "degree_type" | "study_option"
    | "description" | "learning_outcomes" | "content" | "prerequisites"
    | "assessment" | "instructor" | "credits" | "url"
    | "start_date" | "end_date" | "enrollment_start_date" | "enrollment_end_date"
>;

const COURSE_FIELDS: { key: keyof CourseEditable; label: string; type: "text" | "date" | "textarea" }[] = [
    { key: "code", label: "Code", type: "text" },
    { key: "name", label: "Name", type: "text" },
    { key: "title", label: "Title", type: "text" },
    { key: "programme", label: "Programme", type: "text" },
    { key: "degree_type", label: "Degree Type", type: "text" },
    { key: "study_option", label: "Study Option", type: "text" },
    { key: "instructor", label: "Instructor", type: "text" },
    { key: "credits", label: "Credits", type: "text" },
    { key: "url", label: "URL", type: "text" },
    { key: "start_date", label: "Start Date", type: "date" },
    { key: "end_date", label: "End Date", type: "date" },
    { key: "enrollment_start_date", label: "Enroll Start", type: "date" },
    { key: "enrollment_end_date", label: "Enroll End", type: "date" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "learning_outcomes", label: "Learning Outcomes", type: "textarea" },
    { key: "content", label: "Content", type: "textarea" },
    { key: "prerequisites", label: "Prerequisites", type: "textarea" },
    { key: "assessment", label: "Assessment", type: "textarea" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateForInput(dateStr: string | null | undefined): string {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
}

function fileTypeBadgeClass(ft: string): string {
    const map: Record<string, string> = {
        json: "bg-amber-100 text-amber-700 border-amber-200",
        csv: "bg-blue-100 text-blue-700 border-blue-200",
        excel: "bg-green-100 text-green-700 border-green-200",
        pdf: "bg-red-100 text-red-700 border-red-200",
    };
    return map[ft] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENT — Course Edit Modal
// ─────────────────────────────────────────────────────────────────────────────

function CourseEditModal({
    course,
    onClose,
    onSave,
}: {
    course: CourseInsert;
    onClose: () => void;
    onSave: (updated: CourseInsert) => void;
}) {
    const { register, handleSubmit, formState: { errors } } = useForm<CourseEditable>({
        defaultValues: {
            code: course.code ?? "",
            name: course.name ?? "",
            title: course.title ?? "",
            programme: course.programme ?? "",
            degree_type: course.degree_type ?? "",
            study_option: course.study_option ?? "",
            description: course.description ?? "",
            learning_outcomes: course.learning_outcomes ?? "",
            content: course.content ?? "",
            prerequisites: course.prerequisites ?? "",
            assessment: course.assessment ?? "",
            instructor: course.instructor ?? "",
            credits: course.credits ?? "",
            url: course.url ?? "",
            start_date: formatDateForInput(course.start_date),
            end_date: formatDateForInput(course.end_date),
            enrollment_start_date: formatDateForInput(course.enrollment_start_date),
            enrollment_end_date: formatDateForInput(course.enrollment_end_date),
        }
    });

    const [saving, setSaving] = useState(false);
    const { showNotification } = useNotification();

    /**
     * Persists the edited course fields via the updateCourseByCourseId server
     * action and fires the onSave callback with the merged result.
     */
    const onSubmit = async (data: CourseEditable) => {
        setSaving(true);
        // Ensure any empty string values for dates/etc. are cleaned/sanitized.
        const cleanedData = Object.entries(data).reduce((acc, [key, val]) => {
            acc[key as keyof CourseEditable] = val === "" ? null : val;
            return acc;
        }, {} as Record<keyof CourseEditable, any>);

        const { error } = await updateCourseByCourseId(course.id!, cleanedData);

        if (error) {
            showNotification(error);
            setSaving(false);
            return;
        }
        showNotification("Course updated successfully");
        onSave({ ...course, ...cleanedData });
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-[#c8e6ee]"
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8f4f8]">
                        <div>
                            <h2 className="text-base font-bold text-[#1a2e35]">Edit Course</h2>
                            <p className="text-xs text-[#7aa5b0] mt-0.5">{course.code ?? course.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="cursor-pointer text-[#7aa5b0] hover:text-[#1a2e35] transition-colors p-1 rounded-lg hover:bg-[#f0f7fa]"
                        >
                            <Close fontSize="small" />
                        </button>
                    </div>

                    {/* Body */}
                    <form
                        id="course-edit-form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="overflow-y-auto flex-1 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {COURSE_FIELDS.map(({ key, label, type }) => {
                            const isTextArea = type === "textarea";
                            const isDate = type === "date";
                            const hasError = !!errors[key];

                            return (
                                <div key={key} className={isTextArea ? "sm:col-span-2" : ""}>
                                    <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                        {label} {key === "name" && <span className="text-red-500">*</span>}
                                    </label>
                                    {isTextArea ? (
                                        <textarea
                                            className={`w-full border ${hasError ? "border-red-500 focus:border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none resize-none min-h-[80px]`}
                                            {...register(key, {
                                                required: key === "name" ? "Course name is required" : false
                                            })}
                                        />
                                    ) : (
                                        <input
                                            type={isDate ? "date" : "text"}
                                            className={`w-full border ${hasError ? "border-red-500 focus:border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                            {...register(key, {
                                                required: key === "name" ? "Course name is required" : false,
                                                validate: isDate
                                                    ? (value) => !value || !isNaN(Date.parse(value)) || "Please enter a valid date"
                                                    : undefined
                                            })}
                                        />
                                    )}
                                    {errors[key] && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors[key]?.message}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </form>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e8f4f8]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium text-[#4a7a85] hover:bg-[#f0f7fa] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="course-edit-form"
                            disabled={saving}
                            className="cursor-pointer px-5 py-2 rounded-lg text-sm font-semibold bg-[#1a5c55] text-white hover:bg-[#2a8a7e] transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CLIENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SourceManagementClient({ sources }: Props) {
    const { showNotification } = useNotification();

    // ── State ─────────────────────────────────────────────────────────
    const [sourceList, setSourceList] = useState<SourceInsert[]>(sources);

    // Lazily-loaded courses: keyed by sourceId, undefined = not yet fetched
    const [courseMap, setCourseMap] = useState<Record<string, CourseInsert[]>>({});
    const [loadingSourceId, setLoadingSourceId] = useState<string | null>(null);
    const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

    // Inline source name editing
    const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const nameInputRef = useRef<HTMLInputElement>(null);

    // Course edit modal
    const [editingCourse, setEditingCourse] = useState<CourseInsert | null>(null);

    // Source actions dropdown
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // ── Computed stats ────────────────────────────────────────────────
    const totalSources = sourceList.length;
    const totalCourses = Object.values(courseMap).reduce((s, c) => s + c.length, 0);
    const lastUpdated = sourceList[0]?.updated_at ? formatDate(sourceList[0].updated_at) : "—";

    // ── Handlers ──────────────────────────────────────────────────────

    /**
     * Toggles a source row. On first expand, fetches courses lazily via
     * getCoursesBySourceId and caches them in courseMap.
     */
    const handleToggleExpand = async (sourceId: string) => {
        setOpenMenuId(null);

        // Collapse if already open
        if (expandedSourceId === sourceId) {
            setExpandedSourceId(null);
            return;
        }

        setExpandedSourceId(sourceId);

        // Courses already cached — skip fetch
        if (courseMap[sourceId] !== undefined) return;

        setLoadingSourceId(sourceId);
        try {
            const result = await getCoursesBySourceId(sourceId);
            if (result.error) throw new Error(result.error);
            setCourseMap((prev) => ({ ...prev, [sourceId]: result.data ?? [] }));
        } catch (err) {
            showNotification(err instanceof Error ? err.message : "Failed to load courses.");
        } finally {
            setLoadingSourceId(null);
        }
    };

    /**
     * Begins inline editing of a source's name field.
     */
    const handleStartEditName = (source: SourceInsert) => {
        setEditingSourceId(source.id!);
        setEditingName(source.name);
        setOpenMenuId(null);
        setTimeout(() => nameInputRef.current?.focus(), 50);
    };

    /**
     * Persists the edited source name via updateSourceNameBySourceId server
     * action and updates local state on success.
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
     * Cancels inline source name editing without persisting.
     */
    const handleCancelEditName = () => {
        setEditingSourceId(null);
        setEditingName("");
    };

    /**
     * Deletes a source and all its cascaded courses via the server action,
     * then removes it from local state.
     */
    const handleDeleteSource = async (sourceId: string) => {
        setOpenMenuId(null);
        try {
            await deleteSource(sourceId);
            setSourceList((prev) => prev.filter((s) => s.id !== sourceId));
            setCourseMap((prev) => {
                const next = { ...prev };
                delete next[sourceId];
                return next;
            });
            if (expandedSourceId === sourceId) setExpandedSourceId(null);
            showNotification("Source deleted successfully.");
        } catch (err) {
            showNotification(err instanceof Error ? err.message : "Failed to delete source.");
        }
    };

    /**
     * Updates local courseMap after a course is saved via the edit modal.
     */
    const handleCourseSaved = (updated: CourseInsert) => {
        setCourseMap((prev) => ({
            ...prev,
            [updated.source_id]: (prev[updated.source_id] ?? []).map((c) =>
                c.id === updated.id ? updated : c
            ),
        }));
    };

    // ─────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────

    return (
        <div className="flex-1 min-h-screen min-w-0 bg-[#f0f7fa] px-4 sm:px-6 lg:px-9 py-5 sm:py-8 flex flex-col gap-5 sm:gap-7 overflow-y-auto overflow-x-hidden">

            {/* ── Page header — mirrors HistoryHeader style ─────────────── */}
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
                    <h1 className="text-lg font-bold text-[#1a2e35] leading-tight">Source Management</h1>
                    <p className="text-xs text-[#6b9daa]">
                        Manage academic data streams and nested course definitions.
                    </p>
                </div>
            </motion.div>

            {/* ── Stat cards ────────────────────────────────────────────── */}
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

            {/* ── Sources table card ────────────────────────────────────── */}
            <motion.div
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
                    <p className="text-sm text-[#7aa5b0] text-center py-12">No sources found.</p>
                ) : (
                    sourceList.map((source, idx) => {
                        const isExpanded = expandedSourceId === source.id;
                        const isLoading = loadingSourceId === source.id;
                        const courses = courseMap[source.id!];
                        const isEditingThis = editingSourceId === source.id;

                        return (
                            <motion.div
                                key={source.id}
                                className="border-b border-[#f0f7fa] last:border-0"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: idx * 0.04 }}
                            >
                                {/* ── Source row ──────────────────────────── */}
                                <div
                                    className={`grid grid-cols-[auto_1fr] sm:grid-cols-[2fr_120px_140px_160px_80px] gap-4 px-6 py-4 items-center cursor-pointer transition-colors ${isExpanded ? "bg-[#f0faf9]" : "hover:bg-[#f7fbfd]"}`}
                                    onClick={() => !isEditingThis && handleToggleExpand(source.id!)}
                                >
                                    {/* Expand icon + Name */}
                                    <div className="flex items-center gap-3 min-w-0 col-span-2 sm:col-span-1">
                                        <motion.span
                                            className="text-[#7dd8cc] shrink-0"
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <KeyboardArrowDown fontSize="small" />
                                        </motion.span>

                                        {isEditingThis ? (
                                            <div
                                                className="flex items-center gap-2 flex-1 min-w-0"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    ref={nameInputRef}
                                                    className="flex-1 min-w-0 border border-[#7dd8cc] rounded-lg px-2.5 py-1 text-sm text-[#1a2e35] focus:outline-none bg-white"
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleSaveName(source.id!);
                                                        if (e.key === "Escape") handleCancelEditName();
                                                    }}
                                                />
                                                <button onClick={() => handleSaveName(source.id!)} className="cursor-pointer text-[#1a5c55] hover:text-[#2a8a7e] p-1">
                                                    <Check fontSize="small" />
                                                </button>
                                                <button onClick={handleCancelEditName} className="cursor-pointer text-[#7aa5b0] hover:text-[#1a2e35] p-1">
                                                    <Close fontSize="small" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-semibold text-[#1a2e35] truncate">
                                                {source.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* File type badge */}
                                    <div className="hidden sm:flex items-center">
                                        <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md border ${fileTypeBadgeClass(source.file_type)}`}>
                                            {source.file_type}
                                        </span>
                                    </div>

                                    {/* Default status */}
                                    <div className="hidden sm:flex items-center">
                                        {source.is_default ? (
                                            <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#e8faf8] text-[#1a5c55] border border-[#7dd8cc]">
                                                DEFAULT
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-medium uppercase px-2.5 py-0.5 rounded-full border border-[#c8e6ee] text-[#7aa5b0]">
                                                SECONDARY
                                            </span>
                                        )}
                                    </div>

                                    {/* Created at */}
                                    <div className="hidden sm:flex items-center">
                                        <span className="text-sm text-[#4a7a85]">{formatDate(source.created_at)}</span>
                                    </div>

                                    {/* Actions menu */}
                                    <div
                                        className="hidden sm:flex items-center justify-end relative"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            className="cursor-pointer text-[#7aa5b0] hover:text-[#1a2e35] transition-colors p-1 rounded-lg hover:bg-[#f0f7fa]"
                                            onClick={() => setOpenMenuId(openMenuId === source.id ? null : source.id!)}
                                        >
                                            <MoreVert fontSize="small" />
                                        </button>

                                        <AnimatePresence>
                                            {openMenuId === source.id && (
                                                <motion.div
                                                    className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-lg border border-[#c8e6ee] min-w-[160px] py-1"
                                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                                    transition={{ duration: 0.15 }}
                                                >
                                                    <button
                                                        className="cursor-pointer flex items-center gap-2 w-full px-4 py-2 text-sm text-[#1a2e35] hover:bg-[#f0f7fa] transition-colors"
                                                        onClick={() => handleStartEditName(source)}
                                                    >
                                                        <Edit sx={{ fontSize: 14 }} className="text-[#7aa5b0]" />
                                                        Rename
                                                    </button>
                                                    {!source.is_default && (
                                                        <button
                                                            className="cursor-pointer flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                            onClick={() => handleDeleteSource(source.id!)}
                                                        >
                                                            <DeleteForever sx={{ fontSize: 14 }} />
                                                            Delete
                                                        </button>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* ── Nested courses panel ─────────────────── */}
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            key="courses-panel"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.28, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-l-4 border-[#7dd8cc] ml-6 mr-4 mb-4 rounded-xl bg-[#fafeff] overflow-hidden max-h-80 overflow-y-auto scrollbar-thin">
                                                {/* Sub-header */}
                                                <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8f4f8]">
                                                    <h3 className="text-sm font-bold text-[#1a5c55]">
                                                        Nested Courses
                                                        {courses !== undefined && (
                                                            <span className="ml-2 text-[11px] font-medium text-[#7aa5b0]">
                                                                ({courses.length})
                                                            </span>
                                                        )}
                                                    </h3>
                                                </div>

                                                {/* Loading spinner */}
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center gap-3 py-8">
                                                        <motion.div
                                                            className="w-4 h-4 rounded-full border-2 border-[#7dd8cc] border-t-transparent"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                                                        />
                                                        <span className="text-sm text-[#7aa5b0]">Loading courses…</span>
                                                    </div>
                                                ) : courses === undefined ? null : courses.length === 0 ? (
                                                    <p className="text-sm text-[#7aa5b0] text-center py-8">
                                                        No courses in this source.
                                                    </p>
                                                ) : (
                                                    <>
                                                        {/* Column headings */}
                                                        <div className="hidden sm:grid grid-cols-[120px_1fr_100px_1fr] gap-4 px-5 py-2 bg-[#f0f7fa]">
                                                            {["Code", "Course Name", "Credits", "Instructor"].map((h) => (
                                                                <span key={h} className="text-[10px] font-semibold text-[#6b9daa] uppercase tracking-wide">
                                                                    {h}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        {/* Course rows */}
                                                        {courses.map((course, ci) => (
                                                            <motion.div
                                                                key={course.id}
                                                                className="grid grid-cols-[1fr_auto] sm:grid-cols-[120px_1fr_100px_1fr] gap-4 px-5 py-3 border-b border-[#f0f7fa] last:border-0 hover:bg-[#f0faf9] cursor-pointer transition-colors items-center group"
                                                                initial={{ opacity: 0, x: -6 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ duration: 0.2, delay: ci * 0.03 }}
                                                                onClick={() => setEditingCourse(course)}
                                                            >
                                                                <span className="text-sm font-semibold text-[#1a5c55] truncate">
                                                                    {course.code ?? "—"}
                                                                </span>
                                                                <span className="text-sm font-medium text-[#1a2e35] truncate">
                                                                    {course.name}
                                                                </span>
                                                                <span className="hidden sm:block text-sm text-[#4a7a85]">
                                                                    {course.credits ?? "—"}
                                                                </span>
                                                                <div className="hidden sm:flex items-center justify-between gap-2">
                                                                    <span className="text-sm text-[#4a7a85] truncate">
                                                                        {course.instructor ?? "—"}
                                                                    </span>
                                                                    <Edit
                                                                        sx={{ fontSize: 14 }}
                                                                        className="text-[#c8e6ee] group-hover:text-[#7dd8cc] transition-colors shrink-0"
                                                                    />
                                                                </div>
                                                                <Edit
                                                                    sx={{ fontSize: 14 }}
                                                                    className="sm:hidden text-[#c8e6ee] group-hover:text-[#7dd8cc] transition-colors shrink-0"
                                                                />
                                                            </motion.div>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* ── Course edit modal ──────────────────────────────────────── */}
            {editingCourse && (
                <CourseEditModal
                    course={editingCourse}
                    onClose={() => setEditingCourse(null)}
                    onSave={(updated) => {
                        handleCourseSaved(updated);
                        setEditingCourse(null);
                    }}
                />
            )}

            {/* Close dropdown on outside click */}
            {openMenuId && (
                <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, small }: {
    label: string; value: string; accent?: boolean; small?: boolean;
}) {
    return (
        <div className="bg-white rounded-2xl border border-[#d6edf5] p-4 flex flex-col gap-1 shadow-sm">
            <p className="text-[11px] font-semibold text-[#7aa5b0] uppercase tracking-wide">{label}</p>
            <p className={`font-bold text-[#1a2e35] leading-tight ${small ? "text-lg" : "text-2xl"} ${accent ? "text-[#1a5c55]" : ""}`}>
                {value}
            </p>
        </div>
    );
}

function StorageCard({ count }: { count: number }) {
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
