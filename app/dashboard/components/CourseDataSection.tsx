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
        <motion.section
            className="dashboard-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
            <motion.h2
                className="dashboard-section-title"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <TableChart fontSize="small" className="dashboard-section-icon" />
                Course Data
            </motion.h2>

            {/* Source pills */}
            {sources.length > 0 && (
                <motion.div
                    className="dashboard-source-pills"
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: {},
                        show: {
                            transition: {
                                staggerChildren: 0.05,
                            },
                        },
                    }}
                >
                    {sources.map((src) => (
                        <motion.button
                            key={src.id}
                            onClick={() => onSelectSource(src.id!)}
                            className={`dashboard-pill ${selectedSourceId === src.id
                                    ? "dashboard-pill-active"
                                    : "dashboard-pill-inactive"
                                }`}
                            variants={{
                                hidden: { opacity: 0, y: -8 },
                                show: { opacity: 1, y: 0 },
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ duration: 0.2 }}
                        >
                            {src.is_default ? "⭐ " : ""}
                            {src.name}
                        </motion.button>
                    ))}
                </motion.div>
            )}

            {programmes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mt-2 mb-1 flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                    <label htmlFor="programme-select" className="text-[11px] font-semibold text-[#6b9daa] uppercase tracking-wide shrink-0">
                        Programme
                    </label>

                    <motion.select
                        id="programme-select"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.03 }}
                        whileFocus={{ scale: 1.03 }}
                        value={selectedProgramme ?? ""}
                        onChange={(e) =>
                            onSelectProgramme(
                                e.target.value === "" ? null : e.target.value
                            )
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
            )}

            {/* Course table */}
            {courses.length > 0 ? (
                <motion.div
                    className="dashboard-table-wrap"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
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
                            {courses.map((course, index) => (
                                <motion.tr
                                    key={course.id ?? course.code}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.2,
                                        delay: index * 0.03,
                                    }}
                                    whileHover={{
                                        backgroundColor: "rgba(0,0,0,0.02)",
                                    }}
                                >
                                    <td className="dashboard-table-name">
                                        {course.title ?? "-"}
                                    </td>

                                    <td>{course.code ?? "—"}</td>

                                    <td>{course.credits ?? "—"}</td>

                                    <td className="dashboard-table-desc">
                                        {course.learning_outcomes &&
                                            course.learning_outcomes.length > 0
                                            ? course.learning_outcomes.slice(0, 70)
                                            : "-"}
                                        ......
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            ) : (
                <motion.p
                    className="dashboard-table-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    Select a source above or upload a file to see courses.
                </motion.p>
            )}

            {/* Drop zone */}
            <motion.div
                className={`dashboard-dropzone ${isDragging ? "dashboard-dropzone-active" : ""
                    } ${isUploading ? "dashboard-dropzone-loading" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDropzoneClick}
                animate={{
                    scale: isDragging ? 1.02 : 1,
                }}
                whileHover={{
                    scale: isUploading ? 1 : 1.01,
                }}
                transition={{ duration: 0.2 }}
            >
                <input
                    id="file-input"
                    type="file"
                    accept=".xlsx,.xls,.csv,.json"
                    className="hidden"
                    onChange={handleInputChange}
                />

                {isUploading ? (
                    <motion.span
                        className="dashboard-dropzone-text"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.2,
                        }}
                    >
                        Uploading...
                    </motion.span>
                ) : (
                    <>
                        <motion.div
                            animate={
                                isDragging
                                    ? {
                                        y: [0, -6, 0],
                                    }
                                    : {}
                            }
                            transition={{
                                repeat: Infinity,
                                duration: 0.8,
                            }}
                        >
                            <CloudUpload className="dashboard-dropzone-icon" />
                        </motion.div>

                        <span className="dashboard-dropzone-text">
                            {isDragging
                                ? "Drop to upload"
                                : "Drag and drop file here"}
                        </span>

                        <span className="dashboard-dropzone-sub">
                            Support for <strong>Excel</strong>, <strong>CSV</strong>,{" "}
                            <strong>JSON</strong> files
                        </span>
                    </>
                )}
            </motion.div>

            {/* Example format badges */}
            <motion.div
                className="dashboard-examples"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <span className="dashboard-examples-label">
                    EXAMPLE FORMATS
                </span>

                {(
                    [
                        {
                            label: "Excel",
                            file: "courses_example.xlsx",
                        },
                        {
                            label: "CSV",
                            file: "courses_example.csv",
                        },
                        {
                            label: "JSON",
                            file: "courses_example.json",
                        },
                    ] as const
                ).map(({ label, file }, index) => (
                    <motion.a
                        key={label}
                        href={`/examples/${file}`}
                        download={file}
                        className="dashboard-example-badge"
                        style={{
                            textDecoration: "none",
                            cursor: "pointer",
                        }}
                        title={`Download ${label} example`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            delay: index * 0.05,
                        }}
                        whileHover={{
                            scale: 1.08,
                        }}
                        whileTap={{
                            scale: 0.95,
                        }}
                    >
                        {label}
                    </motion.a>
                ))}
            </motion.div>
        </motion.section>
    );
}
