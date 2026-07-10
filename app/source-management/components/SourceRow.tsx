/**
 * Purpose:
 * Renders an expandable row in the Data Sources table. It includes the source details,
 * an actions menu (Rename, Delete), inline source renaming, and a nested list of courses.
 *
 * Context/Parent File:
 * Extracted from app/source-management/SourceManagementClient.tsx.
 *
 * Inputs / Parameters:
 * - source (SourceInsert, Required): The source record data.
 * - idx (number, Required): The row index for staggered animation delays.
 * - isExpanded (boolean, Required): True if the row's nested course list is visible.
 * - isLoading (boolean, Required): True if courses are currently loading from server.
 * - activeCourses (CourseInsert[], Required): Array of course records for the expanded source.
 * - isEditingName (boolean, Required): True if the inline renaming input should display.
 * - editingName (string, Required): The temporary name string during inline renaming.
 * - setEditingName (function, Required): Callback to update the inline renaming state.
 * - isMenuOpen (boolean, Required): True if the actions dropdown is visible.
 * - setOpenMenuId (function, Required): Callback to toggle the visibility of the actions dropdown.
 * - onToggleExpand (function, Required): Callback to expand or collapse the source row.
 * - onStartEditName (function, Required): Callback to initialize inline renaming.
 * - onSaveName (function, Required): Callback to persist the new name to database.
 * - onCancelEditName (function, Required): Callback to exit inline renaming mode.
 * - onDeleteSource (function, Required): Callback to delete the data source.
 * - onSelectCourse (function, Required): Callback triggered when a nested course is clicked.
 */

"use client";

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MoreVert, Edit, Check, Close,
    KeyboardArrowDown, DeleteForever,
} from "@mui/icons-material";
import { SourceInsert } from "../../types/source";
import { CourseInsert } from "../../types/course";

interface SourceRowProps {
    source: SourceInsert;
    idx: number;
    isExpanded: boolean;
    isLoading: boolean;
    activeCourses: CourseInsert[];
    isEditingName: boolean;
    editingName: string;
    setEditingName: (name: string) => void;
    isMenuOpen: boolean;
    setOpenMenuId: (id: string | null) => void;
    onToggleExpand: (sourceId: string) => void;
    onStartEditName: (source: SourceInsert) => void;
    onSaveName: (sourceId: string) => void;
    onCancelEditName: () => void;
    onDeleteSource: (sourceId: string) => void;
    onSelectCourse: (course: CourseInsert) => void;
}

/**
 * Behavioral Mechanism:
 * Maps the file extension format to matching CSS classes for badge styling.
 *
 * Parameters:
 * - ft: Extension category text (e.g. csv, json).
 *
 * Return Value:
 * - string: CSS class list for styling.
 */
function fileTypeBadgeClass(ft: string): string {
    const map: Record<string, string> = {
        json: "bg-amber-100 text-amber-700 border-amber-200",
        csv: "bg-blue-100 text-blue-700 border-blue-200",
        excel: "bg-green-100 text-green-700 border-green-200",
        pdf: "bg-red-100 text-red-700 border-red-200",
    };
    return map[ft] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

/**
 * Behavioral Mechanism:
 * Formats database timestamps into dd/mm/yyyy.
 *
 * Parameters:
 * - d: Database ISO date string.
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
 * Renders the table row layout with animation wrappers. Manages mouse clicks for
 * collapse/expand actions, inline text inputs for renaming, and relative positioning
 * of the custom dropdown menu.
 *
 * Parameters:
 * - All parameters described in the file-level docstring interface.
 *
 * Return Value:
 * - React.ReactElement: Rendered Table Row with nested course list drawer.
 */
export function SourceRow({
    source,
    idx,
    isExpanded,
    isLoading,
    activeCourses,
    isEditingName,
    editingName,
    setEditingName,
    isMenuOpen,
    setOpenMenuId,
    onToggleExpand,
    onStartEditName,
    onSaveName,
    onCancelEditName,
    onDeleteSource,
    onSelectCourse,
}: SourceRowProps) {
    const nameInputRef = useRef<HTMLInputElement>(null);

    return (
        <motion.div
            className="border-b border-[#f0f7fa] last:border-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
        >
            {/* Source row */}
            <div
                className={`grid grid-cols-[auto_1fr] sm:grid-cols-[2fr_120px_140px_160px_80px] gap-4 px-6 py-4 items-center cursor-pointer transition-colors ${isExpanded ? "bg-[#f0faf9]" : "hover:bg-[#f7fbfd]"}`}
                onClick={() => !isEditingName && onToggleExpand(source.id!)}
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

                    {isEditingName ? (
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
                                    if (e.key === "Enter") onSaveName(source.id!);
                                    if (e.key === "Escape") onCancelEditName();
                                }}
                                autoFocus
                            />
                            <button onClick={() => onSaveName(source.id!)} className="cursor-pointer text-[#1a5c55] hover:text-[#2a8a7e] p-1">
                                <Check fontSize="small" />
                            </button>
                            <button onClick={onCancelEditName} className="cursor-pointer text-[#7aa5b0] hover:text-[#1a2e35] p-1">
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
                        onClick={() => setOpenMenuId(isMenuOpen ? null : source.id!)}
                    >
                        <MoreVert fontSize="small" />
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                className="absolute right-0 top-8 z-50 bg-white rounded-xl shadow-lg border border-[#c8e6ee] min-w-[160px] py-1"
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.15 }}
                            >
                                <button
                                    className="cursor-pointer flex items-center gap-2 w-full px-4 py-2 text-sm text-[#1a2e35] hover:bg-[#f0f7fa] transition-colors"
                                    onClick={() => onStartEditName(source)}
                                >
                                    <Edit sx={{ fontSize: 14 }} className="text-[#7aa5b0]" />
                                    Rename
                                </button>
                                {!source.is_default && (
                                    <button
                                        className="cursor-pointer flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        onClick={() => onDeleteSource(source.id!)}
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

            {/* Nested courses panel */}
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
                                    {!isLoading && (
                                        <span className="ml-2 text-[11px] font-medium text-[#7aa5b0]">
                                            ({activeCourses.length})
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
                            ) : activeCourses.length === 0 ? (
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
                                    {activeCourses.map((course, ci) => (
                                        <motion.div
                                            key={course.id}
                                            className="grid grid-cols-[1fr_auto] sm:grid-cols-[120px_1fr_100px_1fr] gap-4 px-5 py-3 border-b border-[#f0f7fa] last:border-0 hover:bg-[#f0faf9] cursor-pointer transition-colors items-center group"
                                            initial={{ opacity: 0, x: -6 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.2, delay: ci * 0.03 }}
                                            onClick={() => onSelectCourse(course)}
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
}
