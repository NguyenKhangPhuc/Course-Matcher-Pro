/**
 * PURPOSE:
 * This component renders the course data management section of the dashboard.
 * It displays available sources as pill buttons, displays courses in a tabular view,
 * provides a drag-and-drop file upload zone, and offers links to download sample files.
 *
 * CONTEXT/PARENT FILE:
 * Extracted from app/dashboard/DashboardClient.tsx.
 *
 * INPUTS / PARAMETERS:
 * - sources (SourceInsert[], Required): List of course sources available to the user.
 * - selectedSourceId (string | null, Required): The ID of the currently selected source.
 * - courses (CourseInsert[], Required): List of courses corresponding to the selected source.
 * - isUploading (boolean, Required): Indicates if a file upload is currently in progress.
 * - onSelectSource ((sourceId: string) => Promise<void>, Required): Callback triggered when a user selects a source.
 * - onUploadFile ((file: File) => Promise<void>, Required): Callback triggered when a file is dropped or selected for upload.
 */

"use client";

import React, { useState, useCallback } from "react";
import { TableChart, CloudUpload } from "@mui/icons-material";
import { SourceInsert } from "../../types/source";
import { CourseInsert } from "../../types/course";
import { motion } from "framer-motion";

interface CourseDataSectionProps {
    sources: SourceInsert[];
    selectedSourceId: string | null;
    courses: CourseInsert[];
    isUploading: boolean;
    onSelectSource: (sourceId: string) => Promise<void>;
    onUploadFile: (file: File) => Promise<void>;
    programmes: string[];
    selectedProgramme: string | null;
    onSelectProgramme: (programme: string | null) => void;
}

export function CourseDataSection({
    sources,
    selectedSourceId,
    courses,
    isUploading,
    onSelectSource,
    onUploadFile,
    programmes,
    selectedProgramme,
    onSelectProgramme,
}: CourseDataSectionProps) {
    const [isDragging, setIsDragging] = useState(false);

    /**
     * BEHAVIORAL MECHANISM:
     * Handles the dragover event by preventing default browser action to allow dropping,
     * and sets the dragging active state to true for visual feedback.
     *
     * PARAMETERS:
     * - e (React.DragEvent<HTMLDivElement>): The drag over event.
     *
     * RETURNS:
     * - void
     */
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    /**
     * BEHAVIORAL MECHANISM:
     * Handles the dragleave event by setting the dragging active state to false.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - void
     */
    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    /**
     * BEHAVIORAL MECHANISM:
     * Handles the file drop event, prevents default browser behavior, deactivates the dragging
     * visual state, and retrieves the first file from the data transfer object to initiate the upload.
     *
     * PARAMETERS:
     * - e (React.DragEvent<HTMLDivElement>): The file drop event.
     *
     * RETURNS:
     * - void
     */
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) {
                onUploadFile(file);
            }
        },
        [onUploadFile]
    );

    /**
     * BEHAVIORAL MECHANISM:
     * Handles manual file selection through the file browser dialog, extracts the selected file
     * from the input element target, and triggers the file upload callback.
     *
     * PARAMETERS:
     * - e (React.ChangeEvent<HTMLInputElement>): The file input change event.
     *
     * RETURNS:
     * - void
     */
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                onUploadFile(file);
            }
        },
        [onUploadFile]
    );

    /**
     * BEHAVIORAL MECHANISM:
     * Triggers a click programmatically on the hidden file input element when the dropzone wrapper is clicked.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - void
     */
    const handleDropzoneClick = useCallback(() => {
        document.getElementById("file-input")?.click();
    }, []);

    return (
        <section className="dashboard-card">
            <h2 className="dashboard-section-title">
                <TableChart fontSize="small" className="dashboard-section-icon" />
                Course Data
            </h2>

            {/* Source pills */}
            {sources.length > 0 && (
                <div className="dashboard-source-pills">
                    {sources.map((src) => (
                        <button
                            key={src.id}
                            onClick={() => onSelectSource(src.id!)}
                            className={`dashboard-pill ${selectedSourceId === src.id
                                ? "dashboard-pill-active"
                                : "dashboard-pill-inactive"
                                }`}
                        >
                            {src.is_default ? "⭐ " : ""}
                            {src.name}
                        </button>
                    ))}
                </div>
            )}
            {programmes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mt-2 mb-1 flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                    <span className="text-[11px] font-semibold text-[#6b9daa] uppercase tracking-wide shrink-0">
                        Programme
                    </span>

                    <motion.select
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.03 }}
                        whileFocus={{ scale: 1.03 }}
                        value={selectedProgramme ?? ""}
                        onChange={(e) =>
                            onSelectProgramme(e.target.value === "" ? null : e.target.value)
                        }
                        className="
                    w-full
                    sm:w-auto
                    sm:max-w-[220px]
                    text-[12px]
                    font-semibold
                    text-[#1a5c55]
                    bg-[#e8f4f8]
                    border
                    border-[#d6edf5]
                    rounded-full
                    px-3
                    py-1.5
                    outline-none
                    cursor-pointer
                    hover:bg-[#d6edf5]
                    transition-colors
                    "
                    >
                        <option value="">Choose your programme</option>
                        {programmes.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </motion.select>
                </motion.div>
            )
            }
            {/* Course table */}
            {
                courses.length > 0 ? (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Code</th>
                                    <th>Credits</th>
                                    <th>Learning outcomes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id ?? course.code}>
                                        <td className="dashboard-table-name">{course.title ?? "-"}</td>
                                        <td>{course.code ?? "—"}</td>
                                        <td>{course.credits ?? "—"}</td>
                                        <td className="dashboard-table-desc">
                                            {course.learning_outcomes && course.learning_outcomes.length > 0
                                                ? course.learning_outcomes.slice(0, 70)
                                                : "-"}
                                            ......
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="dashboard-table-empty">
                        Select a source above or upload a file to see courses.
                    </p>
                )
            }

            {/* Drop zone */}
            <div
                className={`dashboard-dropzone ${isDragging ? "dashboard-dropzone-active" : ""} ${isUploading ? "dashboard-dropzone-loading" : ""
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDropzoneClick}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    className="hidden"
                    onChange={handleInputChange}
                />
                {isUploading ? (
                    <span className="dashboard-dropzone-text">Uploading...</span>
                ) : (
                    <>
                        <CloudUpload className="dashboard-dropzone-icon" />
                        <span className="dashboard-dropzone-text">
                            {isDragging ? "Drop to upload" : "Drag and drop file here"}
                        </span>
                        <span className="dashboard-dropzone-sub">
                            Support for <strong>Excel</strong>, <strong>CSV</strong>,{" "}
                            <strong>JSON</strong> files
                        </span>
                    </>
                )}
            </div>

            {/* Example format badges */}
            <div className="dashboard-examples">
                <span className="dashboard-examples-label">EXAMPLE FORMATS</span>
                {(
                    [
                        { label: "Excel", file: "courses_example.xlsx" },
                        { label: "CSV", file: "courses_example.csv" },
                        { label: "JSON", file: "courses_example.json" },
                    ] as const
                ).map(({ label, file }) => (
                    <a
                        key={label}
                        href={`/examples/${file}`}
                        download={file}
                        className="dashboard-example-badge"
                        style={{ textDecoration: "none", cursor: "pointer" }}
                        title={`Download ${label} example`}
                    >
                        {label}
                    </a>
                ))}
            </div>
        </section >
    );
}
