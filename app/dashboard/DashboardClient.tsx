"use client";

/**
 * DashboardClient
 * ---------------
 * Main dashboard page. Handles:
 * - Source selection via pill buttons
 * - File drag-and-drop upload → parse → embed → store → display courses
 * - Company name + job description form with validation
 * - Agent analysis call and results display
 */

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
    CloudUpload,
    TableChart,
    Shield,
    OpenInNew,
    CheckCircle,
} from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { uploadAndEmbedCourses } from "../actions/source_management";
import { analyzeJobDescription } from "../services/agent";
import { AgentResponse } from "../types/agent";
import { CourseInsert } from "../types/course";
import { useNotification } from "../context/Notification";
import { getCoursesBySourceId } from "../actions/course";
import { createSearchHistoryAndMatches } from "../actions/search_history";
import { SearchHistoryInsert } from "../types/search_history";
import { SourceInsert } from "../types/source";
import { SearchMatchesInsert } from "../types/search_matches";
import { error } from "console";
import { DynamicModal } from "./SaveSearchModal";
import { incrementSearchUsage } from "../actions/usage";
import { useLoader } from "../context/LoaderContext";
// =====================================================================
// TYPES
// =====================================================================

interface DashboardClientProps {
    user: User;
    initialSources: SourceInsert[];
}

interface JobForm {
    company_name: string;
    job_description: string;
    position: string;
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function DashboardClient({ user, initialSources }: DashboardClientProps) {
    // ── State ────────────────────────────────────────────────────────────
    const [sources, setSources] = useState<SourceInsert[]>(initialSources);
    const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
    const [courses, setCourses] = useState<CourseInsert[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [agentResult, setAgentResult] = useState<AgentResponse | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const { showNotification } = useNotification();
    const { setIsOpenLoader } = useLoader();
    // ── Form ─────────────────────────────────────────────────────────────
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<JobForm>();
    // ── Source selection ─────────────────────────────────────────────────
    const handleSelectSource = async (sourceId: string) => {
        setSelectedSourceId(sourceId);
        setAgentResult(null);
        setIsOpenLoader(true)
        try {
            const data = await getCoursesBySourceId(sourceId);
            if (data.error) {
                throw new Error(data.error)
            }
            setCourses(data.data ?? []);
            setIsOpenLoader(false)
            showNotification('Load the courses successfully')
        } catch (err) {
            setIsOpenLoader(false)
            if (err instanceof Error) {
                showNotification(err.message)
            }
        }
    };

    // ── File upload pipeline ─────────────────────────────────────────────

    /**
     * Handle a dropped or selected file — runs the full upload pipeline:
     * parse → embed → insert source + courses → refresh course table.
     */
    const handleFile = useCallback(async (file: File) => {
        setIsUploading(true);
        setIsOpenLoader(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadAndEmbedCourses(formData);
            // return
            if (!result.success) {
                showNotification(`Upload failed: ${result.errors[0]?.error ?? "Unknown error"}`);
                return;
            }

            // Auto-select the newly uploaded source
            setSelectedSourceId(result.source_id);

            // Reload courses for the new source
            const newCourses = await getCoursesBySourceId(result.source_id);
            if (newCourses.error) {
                throw new Error(newCourses.error)
            }
            setCourses(newCourses.data!);

            // Refresh source list (add new source to pills)
            setSources((prev) => [
                {
                    id: result.source_id,
                    name: file.name,
                    file_type: file.name.split(".").pop() as SourceInsert["file_type"],
                    is_default: false,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                } as SourceInsert,
                ...prev,
            ]);
            setIsUploading(false)
            setIsOpenLoader(false)
            showNotification(`Loaded ${result.inserted} courses successfully.`);

        } catch (err) {
            setIsOpenLoader(false)
            showNotification(err instanceof Error ? err.message : "Upload failed.");
        }
    }, [user.id]);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleSaveHistory = async () => {
        setIsOpenLoader(true)
        try {
            const searchHistory: SearchHistoryInsert = {
                company_name: getValues('company_name'),
                job_description: getValues('job_description'),
                position: getValues('position'),
                user_id: user.id,
                technical_requirements: agentResult?.technical_requirements,
                summary: agentResult!.summary,
                source_id: agentResult!.source_id,
            }

            const result = await createSearchHistoryAndMatches(searchHistory, agentResult!.courses);
            if (result.error) {
                throw new Error(result.error);
            }
            setIsOpenLoader(false)
            handleDismissSave()
            showNotification('Save the matches successfully')
        } catch (error) {
            setIsOpenLoader(false)

            if (error instanceof Error) {
                showNotification(error.message)
            }
        }
    }
    const handleDismissSave = () => {
        setShowSaveModal(false);
    };

    // ── Analyze ──────────────────────────────────────────────────────────

    /**
     * Submit the job form — calls the FastAPI agent and displays results.
     */
    const onAnalyze = async (form: JobForm) => {
        if (!selectedSourceId) return;
        setIsAnalyzing(true);
        setAgentResult(null);
        setIsOpenLoader(true);
        try {
            const usage = await incrementSearchUsage(user.id);
            if (usage.error) {
                showNotification(usage.error);
                return;
            }
            const result = await analyzeJobDescription({
                job_description: form.job_description,
                position: form.position,
                source_id: selectedSourceId,
                company_name: form.company_name,
            });
            setAgentResult(result);
            setShowSaveModal(true); // ← mở modal ngay khi có kết quả
            setIsAnalyzing(false);
            setIsOpenLoader(false)
            showNotification('Analyze the job description successfully')
        } catch (err) {
            setIsOpenLoader(false)
            showNotification(err instanceof Error ? err.message : "Analysis failed.");
        }
    };

    // ── Render ───────────────────────────────────────────────────────────
    return (
        <div className="dashboard-page">

            {/* ── Top grid: Course Data (left) + Target Job (right) ── */}
            <div className="dashboard-grid">

                {/* ── LEFT: Course Data ───────────────────────────────── */}
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
                                    onClick={() => handleSelectSource(src.id!)}
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

                    {/* Course table */}
                    {courses.length > 0 ? (
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
                                            <td className="dashboard-table-name">{course.name}</td>
                                            <td>{course.code ?? "—"}</td>
                                            <td>{course.credits ?? "—"}</td>
                                            <td className="dashboard-table-desc">
                                                {(course.learning_outcomes && course.learning_outcomes.length > 0) ? course.learning_outcomes.slice(0, 70) : "-"}......
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
                    )}

                    {/* Drop zone */}
                    <div
                        className={`dashboard-dropzone ${isDragging ? "dashboard-dropzone-active" : ""} ${isUploading ? "dashboard-dropzone-loading" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("file-input")?.click()}
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
                                    Support for{" "}
                                    <strong>Excel</strong>, <strong>CSV</strong>,{" "}
                                    <strong>JSON</strong> files
                                </span>
                            </>
                        )}
                    </div>

                    {/* Example format badges — click to download sample file */}
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
                </section>

                {/* ── RIGHT: Target Job ───────────────────────────────── */}
                <section className="dashboard-card dashboard-card-job">
                    <h2 className="dashboard-section-title">
                        <Shield fontSize="small" className="dashboard-section-icon" />
                        Target Job
                    </h2>

                    <form onSubmit={handleSubmit(onAnalyze)} className="dashboard-form">
                        {/* Company name */}
                        <div className="dashboard-field">
                            <label className="dashboard-label">Company Name</label>
                            <input
                                {...register("company_name", { required: "Company name is required" })}
                                className="dashboard-input"
                                placeholder="e.g. Google, TechCorp Inc."
                            />
                            {errors.company_name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.company_name.message}
                                </p>
                            )}
                        </div>

                        {/* Job description */}
                        <div className="dashboard-field">
                            <label className="dashboard-label">Position</label>
                            <input
                                {...register("position", { required: "Position is required" })}
                                className="dashboard-input"
                                placeholder="e.g. AI developer"
                            />
                            {errors.position && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.position.message}
                                </p>
                            )}
                        </div>

                        <div className="dashboard-field">
                            <label className="dashboard-label">Job Description</label>
                            <textarea
                                {...register("job_description", {
                                    required: "Job description is required",
                                    minLength: { value: 30, message: "Please provide more detail (min 30 chars)" },
                                })}
                                className="dashboard-textarea"
                                placeholder="Paste the job requirements, responsibilities, and qualifications here..."
                                rows={8}
                            />
                            {errors.job_description && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.job_description.message}
                                </p>
                            )}
                        </div>

                        {/* Analyze button */}
                        <button
                            type="submit"
                            disabled={!selectedSourceId || isAnalyzing}
                            className="dashboard-analyze-btn"
                        >
                            {isAnalyzing ? (
                                "Analyzing..."
                            ) : (
                                <>
                                    Start Analyze Description
                                    <span className="dashboard-analyze-arrow">→</span>
                                </>
                            )}
                        </button>


                    </form>
                </section>
            </div>

            {/* ── Analysis Results ────────────────────────────────────────── */}
            <AnimatePresence>
                {agentResult && (
                    <motion.section
                        className="dashboard-card dashboard-results"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                        <div className="dashboard-results-header">
                            <h2 className="dashboard-section-title">
                                <CheckCircle fontSize="small" className="dashboard-section-icon dashboard-section-icon-green" />
                                Analysis Results
                            </h2>
                            <span className="dashboard-relevance-badge">Top Relevance</span>
                        </div>

                        {/* Technical requirements summary */}
                        {agentResult.technical_requirements && (
                            <div className="dashboard-requirements">
                                <p className="dashboard-requirements-label">Technical Requirements Identified</p>
                                <p className="dashboard-requirements-text">
                                    {agentResult.technical_requirements}
                                </p>
                            </div>
                        )}

                        {/* Matched courses grid */}
                        {agentResult.courses.length === 0 ? (
                            <p className="dashboard-table-empty">No matching courses found.</p>
                        ) : (
                            <div className="dashboard-results-grid">
                                {agentResult.courses.map((course, i) => (
                                    <motion.div
                                        key={course.code ?? i}
                                        className="dashboard-result-card"
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07, duration: 0.3 }}
                                    >
                                        {/* Score */}
                                        <div className="dashboard-result-header">
                                            <span className="dashboard-result-score-label">Match Score</span>
                                            <span className="dashboard-result-score">
                                                {course.similarity ?? "—"}%
                                            </span>
                                        </div>

                                        {/* Course info */}
                                        <p className="dashboard-result-name">{course.name}</p>
                                        <p className="dashboard-result-desc">
                                            {course.description ?? course.learning_outcomes ?? ""}
                                        </p>

                                        {/* Footer */}
                                        <div className="dashboard-result-footer">
                                            <span className="dashboard-result-tag">
                                                {course.study_option ?? course.programme ?? "Course"}
                                            </span>
                                            {course.url && (
                                                <a
                                                    href={course.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="dashboard-result-link"
                                                >
                                                    <OpenInNew fontSize="inherit" />
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                <button onClick={() => setShowSaveModal(!showSaveModal)} className="mt-5 w-full text-white font-medium rounded-xl text-base uppercase login_btn"><i className="animation"></i>Show<i className="animation"></i>
                                </button>
                            </div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>

            <DynamicModal
                isOpen={showSaveModal}
                onSave={handleSaveHistory}
                onDismiss={handleDismissSave}
                title="Do you want to save your search?"
                subTitle="This search and its matched courses will be saved to your history."
            />
        </div>
    );
}
