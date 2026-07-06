/**
 * PURPOSE:
 * This component renders the analysis results section of the dashboard.
 * It displays identified technical requirements and recommended academic courses
 * with match scores, descriptions, study options, and links. It uses Framer Motion
 * for smooth transitions and loading feedback.
 *
 * CONTEXT/PARENT FILE:
 * Extracted from app/dashboard/DashboardClient.tsx.
 *
 * INPUTS / PARAMETERS:
 * - agentResult (AgentResponseClient | null, Required): The current state of streaming analysis results.
 * - isAnalyzing (boolean, Required): Indicates if the streaming analysis is active.
 * - coursesSectionRef (React.RefObject<HTMLDivElement | null>, Required): Ref to the section element for scrolling.
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, OpenInNew } from "@mui/icons-material";
import { AgentResponseClient } from "../../types/agent";
import { ComponentLoader } from "../../components/ComponentLoader";

interface AnalysisResultsSectionProps {
    agentResult: AgentResponseClient | null;
    isAnalyzing: boolean;
    coursesSectionRef: React.RefObject<HTMLDivElement | null>;
}

export function AnalysisResultsSection({
    agentResult,
    isAnalyzing,
    coursesSectionRef,
}: AnalysisResultsSectionProps) {
    /**
     * BEHAVIORAL MECHANISM:
     * Component function that renders the analysis results. If agentResult is present,
     * it renders a animated container. Within this, it displays technical requirements
     * and a grid of course recommendations. Motion properties control the fading and sliding
     * animations of course cards as they stream in.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - React.ReactElement: The rendered analysis results section or null.
     */
    return (
        <AnimatePresence>
            {agentResult && (
                <motion.section
                    className="dashboard-card dashboard-results"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    ref={coursesSectionRef}
                >
                    {/* Header */}
                    <div className="dashboard-results-header">
                        <h2 className="dashboard-section-title">
                            <CheckCircle
                                fontSize="small"
                                className="dashboard-section-icon dashboard-section-icon-green"
                            />
                            Analysis Results
                        </h2>
                        <span className="dashboard-relevance-badge">Top Relevance</span>
                    </div>

                    {/* Section 1: Technical Requirements */}
                    <div className="dashboard-requirements">
                        <p className="dashboard-requirements-label">Technical Requirements Identified</p>

                        <AnimatePresence mode="wait">
                            {agentResult.technical_requirements ? (
                                <motion.p
                                    key="req-content"
                                    className="dashboard-requirements-text"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {agentResult.technical_requirements}
                                </motion.p>
                            ) : (
                                <motion.div
                                    key="req-loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <ComponentLoader
                                        sizeClassName="w-10 h-10"
                                        label="Extracting technical requirements..."
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="my-3 border-t border-[#d6edf5]" />

                    {/* Section 2: Recommended Courses */}
                    <div className="dashboard-courses-section">
                        <p className="dashboard-requirements-label">Recommended Academic Courses</p>

                        <AnimatePresence mode="wait">
                            {isAnalyzing && (!agentResult.courses || agentResult.courses.length === 0) ? (
                                <motion.div
                                    key="grid-loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <ComponentLoader
                                        sizeClassName="w-16 h-16"
                                        label="Querying vector database & compiling matches..."
                                    />
                                </motion.div>
                            ) : !isAnalyzing && (!agentResult.courses || agentResult.courses.length === 0) ? (
                                <motion.p
                                    key="grid-empty"
                                    className="dashboard-table-empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    No matching courses found.
                                </motion.p>
                            ) : (
                                <motion.div
                                    key="grid-content"
                                    className="dashboard-results-grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    {agentResult.courses.map((course, i) => (
                                        <motion.div
                                            key={course.code ?? course.id ?? i}
                                            className="border border-[#d6edf5] rounded-2xl bg-[#fafeff] p-3.5 flex flex-col gap-2 hover:shadow-[0_4px_16px_rgba(125,216,204,0.18)] transition-shadow cursor-pointer min-w-0 w-full overflow-hidden"
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                        >
                                            <div className="flex items-start justify-between gap-2 min-w-0">
                                                <span className="text-[10px] font-semibold text-[#6b9daa] uppercase tracking-wide shrink-0">
                                                    Match Score
                                                </span>
                                                <span className="text-xl font-extrabold text-[#1a5c55] leading-none shrink-0">
                                                    {Math.round(course.similarity)}%
                                                </span>
                                            </div>

                                            <p className="text-sm font-bold text-[#1a2e35] leading-tight break-words min-w-0">
                                                {course.name}
                                            </p>

                                            <p className="text-xs text-[#6b9daa] leading-relaxed flex-1 break-words min-w-0">
                                                {course.explanation}
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
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
}
