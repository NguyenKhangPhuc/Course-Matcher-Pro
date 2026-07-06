/**
 * PURPOSE:
 * This file serves as the main orchestrator for the dashboard client page.
 * It manages states for selected course sources, upload statuses, analysis states,
 * and handles the API call orchestration (file upload pipeline, database matching query,
 * and streaming agent analysis). It composes the layout using child components.
 *
 * CONTEXT/PARENT FILE:
 * Root client dashboard component.
 *
 * INPUTS / PARAMETERS:
 * - user (User, Required): The Supabase user session data.
 * - initialSources (SourceInsert[], Required): Pre-loaded sources list fetched from server.
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { User } from "@supabase/supabase-js";
import { uploadAndEmbedCourses } from "../actions/source_management";
import { analyzeJobDescriptionStreamingAxios } from "../services/agent";
import { AgentResponseClient, DoneResponse, ErrorChunk } from "../types/agent";
import { CourseAgentResponse, CourseInsert } from "../types/course";
import { useNotification } from "../context/Notification";
import { getCoursesBySourceId } from "../actions/course";
import { createSearchHistoryAndMatches } from "../actions/search_history";
import { SearchHistoryInsert } from "../types/search_history";
import { SourceInsert } from "../types/source";
import { DynamicModal } from "./SaveSearchModal";
import { useLoader } from "../context/LoaderContext";

import { CourseDataSection } from "./components/CourseDataSection";
import { TargetJobForm, JobForm } from "./components/TargetJobForm";
import { AnalysisResultsSection } from "./components/AnalysisResultsSection";

export default function DashboardClient({ user, initialSources }: { user: User; initialSources: SourceInsert[] }) {
    const [sources, setSources] = useState<SourceInsert[]>(initialSources);
    const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
    const [courses, setCourses] = useState<CourseInsert[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [agentResult, setAgentResult] = useState<AgentResponseClient | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const { showNotification } = useNotification();
    const { setIsOpenLoader } = useLoader();
    const coursesSectionRef = useRef<HTMLDivElement>(null);

    // Scroll to results section on new result stream start
    useEffect(() => {
        if (agentResult) {
            const timer = setTimeout(() => {
                coursesSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [agentResult]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<JobForm>();

    /**
     * BEHAVIORAL MECHANISM:
     * Sets the selected source ID, resets previous results, opens the loader,
     * queries the database for course records belonging to this source,
     * updates local state courses list, closes loader and displays success/error notification.
     *
     * PARAMETERS:
     * - sourceId (string): The ID of the selected source.
     *
     * RETURNS:
     * - Promise<void>
     */
    const handleSelectSource = async (sourceId: string): Promise<void> => {
        setSelectedSourceId(sourceId);
        setAgentResult(null);
        setIsOpenLoader({ isOpen: true });
        try {
            const data = await getCoursesBySourceId(sourceId);
            if (data.error) {
                throw new Error(data.error);
            }
            setCourses(data.data ?? []);
            setIsOpenLoader({ isOpen: false });
            showNotification("Load the courses successfully");
        } catch (err) {
            setIsOpenLoader({ isOpen: false });
            if (err instanceof Error) {
                showNotification(err.message);
            }
        }
    };

    /**
     * BEHAVIORAL MECHANISM:
     * Initiates loading overlay, executes action to upload and embed coursework,
     * checks for success, updates state with newly registered source and its courses,
     * handles errors and notifies user.
     *
     * PARAMETERS:
     * - file (File): The document spreadsheet, csv, or json to parse and embed.
     *
     * RETURNS:
     * - Promise<void>
     */
    const handleUploadFile = useCallback(
        async (file: File): Promise<void> => {
            setIsUploading(true);
            setIsOpenLoader({ isOpen: true, title: "Load source could take very long, stay tuned" });
            try {
                const formData = new FormData();
                formData.append("file", file);

                const result = await uploadAndEmbedCourses(formData);
                if (!result.success) {
                    showNotification(`Upload failed: ${result.errors[0]?.error ?? "Unknown error"}`);
                    return;
                }

                setSelectedSourceId(result.source_id);

                const newCourses = await getCoursesBySourceId(result.source_id);
                if (newCourses.error) {
                    throw new Error(newCourses.error);
                }
                setCourses(newCourses.data!);

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
                setIsUploading(false);
                setIsOpenLoader({ isOpen: false });
                showNotification(`Loaded ${result.inserted} courses successfully.`);
            } catch (err) {
                setIsOpenLoader({ isOpen: false });
                showNotification(err instanceof Error ? err.message : "Upload failed.");
            }
        },
        [user.id, setIsOpenLoader, showNotification]
    );

    /**
     * BEHAVIORAL MECHANISM:
     * Compiles metadata (inputs, analysis summaries, matched courses arrays),
     * fires database insert service via action to record matching search log,
     * hides modal overlay and displays toast notification.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - Promise<void>
     */
    const handleSaveHistory = async (): Promise<void> => {
        setIsOpenLoader({ isOpen: true });
        try {
            const searchHistory: SearchHistoryInsert = {
                company_name: getValues("company_name"),
                job_description: getValues("job_description"),
                position: getValues("position"),
                user_id: user.id,
                technical_requirements: agentResult?.technical_requirements,
                summary: agentResult!.summary,
                source_id: agentResult!.source_id,
            };

            const result = await createSearchHistoryAndMatches(searchHistory, agentResult!.courses);
            if (result.error) {
                throw new Error(result.error);
            }
            setIsOpenLoader({ isOpen: false });
            handleDismissSave();
            showNotification("Save the matches successfully");
        } catch (err) {
            setIsOpenLoader({ isOpen: false });
            if (err instanceof Error) {
                showNotification(err.message);
            }
        }
    };

    /**
     * BEHAVIORAL MECHANISM:
     * Dismisses the Save Search modal by setting showSaveModal state to false.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - void
     */
    const handleDismissSave = (): void => {
        setShowSaveModal(false);
    };

    /**
     * BEHAVIORAL MECHANISM:
     * Calls Axios streaming API client endpoint. Updates state progressively as
     * requirements text chunks and matched courses array objects stream down,
     * pops up confirmation notifications upon completion and opens save prompt.
     *
     * PARAMETERS:
     * - form (JobForm): The job detail form values.
     *
     * RETURNS:
     * - Promise<void>
     */
    const onAnalyze = async (form: JobForm): Promise<void> => {
        if (!selectedSourceId) return;
        setIsAnalyzing(true);
        setAgentResult(null);

        const localAgentResult: AgentResponseClient = {
            technical_requirements: "",
            courses: [],
            source_id: selectedSourceId,
            summary: "",
            steps_taken: "0",
            user_id: user.id,
        };

        try {
            await analyzeJobDescriptionStreamingAxios(
                {
                    job_description: form.job_description,
                    position: form.position,
                    source_id: selectedSourceId,
                    company_name: form.company_name,
                },
                (type, data) => {
                    if (type === "requirements") {
                        localAgentResult.technical_requirements = data as string;
                        setAgentResult({ ...localAgentResult });
                    } else if (type === "course") {
                        localAgentResult.courses.push(data as CourseAgentResponse);
                        setAgentResult({ ...localAgentResult });
                    } else if (type === "done") {
                        const chunk = data as DoneResponse;
                        setIsAnalyzing(false);
                        showNotification(chunk.summary);
                        setTimeout(() => {
                            setShowSaveModal(true);
                        }, 5000);
                    } else if (type === "error") {
                        const chunk = data as ErrorChunk;
                        setIsAnalyzing(false);
                        throw new Error(chunk.data);
                    }
                }
            );
        } catch (err) {
            setIsAnalyzing(false);
            showNotification(err instanceof Error ? err.message : "Analysis failed.");
        }
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-grid">
                {/* LEFT: Course Data */}
                <CourseDataSection
                    sources={sources}
                    selectedSourceId={selectedSourceId}
                    courses={courses}
                    isUploading={isUploading}
                    onSelectSource={handleSelectSource}
                    onUploadFile={handleUploadFile}
                />

                {/* RIGHT: Target Job */}
                <TargetJobForm
                    register={register}
                    handleSubmit={handleSubmit}
                    errors={errors}
                    isAnalyzing={isAnalyzing}
                    selectedSourceId={selectedSourceId}
                    onAnalyze={onAnalyze}
                />
            </div>

            {/* Analysis Results */}
            <AnalysisResultsSection
                agentResult={agentResult}
                isAnalyzing={isAnalyzing}
                coursesSectionRef={coursesSectionRef}
            />

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
