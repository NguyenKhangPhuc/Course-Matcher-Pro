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
import { getCoursesBySourceId, getUniqueProgrammeBySourceId } from "../actions/course";
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
    const courses = useRef<CourseInsert[]>([]);
    const [filterCouses, setFilterCourses] = useState<CourseInsert[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [agentResult, setAgentResult] = useState<AgentResponseClient | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const { showNotification } = useNotification();
    const { setIsOpenLoader } = useLoader();
    const coursesSectionRef = useRef<HTMLDivElement>(null);
    const [programmes, setProgrammes] = useState<string[]>([]);
    const [selectedProgramme, setSelectedProgramme] = useState<string | null>(null);
    const uploadProgressRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Scroll to results section on new result stream start
    useEffect(() => {
        if (isAnalyzing == true) {
            const timer = setTimeout(() => {
                coursesSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isAnalyzing]);

    // Clear the simulated upload progress interval on unmount to prevent
    // memory leaks and stale state updates on an unmounted component.
    useEffect(() => {
        return () => {
            if (uploadProgressRef.current !== null) {
                clearInterval(uploadProgressRef.current);
            }
        };
    }, []);

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
        setSelectedProgramme(null); // reset filter khi đổi source

        // Step 0 → 1 %: open overlay
        setIsOpenLoader({ isOpen: true, title: "Saving your search...", progress: 1 });
        await new Promise((r) => setTimeout(r, 120)); // allow first render
        setIsOpenLoader((prev) => ({ ...prev, progress: 40 }));
        try {
            // Step 1 → 50 %: fetch courses
            const data = await getCoursesBySourceId(sourceId);
            if (data.error) throw new Error(data.error);
            courses.current = data.data ?? []
            setFilterCourses(data.data ?? [])
            // console.log(data.data)
            const programmeResult = await getUniqueProgrammeBySourceId(sourceId);
            if (programmeResult.error) throw new Error(programmeResult.error);
            setProgrammes(programmeResult.data);
            setIsOpenLoader((prev) => ({ ...prev, progress: 100 }));
            await new Promise((r) => setTimeout(r, 1000));
            // Brief pause so the user sees the completed bar before it disappears
            setIsOpenLoader({ isOpen: false });
            showNotification("Load the courses successfully");
        } catch (err) {
            setIsOpenLoader({ isOpen: false });
            if (err instanceof Error) showNotification(err.message);
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

            // Start loader with progress at 1 and simulate ticking up to ~90 %
            // while the server processes the file (no real progress signal from API).
            setIsOpenLoader({ isOpen: true, title: "Load source could take very long, stay tuned", progress: 1 });
            let simulatedProgress = 1;
            uploadProgressRef.current = setInterval(() => {
                simulatedProgress = Math.min(90, simulatedProgress + Math.ceil((90 - simulatedProgress) * 0.06) || 1);
                setIsOpenLoader((prev) => ({ ...prev, progress: simulatedProgress }));
            }, 400);

            try {
                const formData = new FormData();
                formData.append("file", file);

                const result = await uploadAndEmbedCourses(formData);

                // Stop simulation and jump to 100 % before closing
                if (uploadProgressRef.current) clearInterval(uploadProgressRef.current);
                setIsOpenLoader((prev) => ({ ...prev, progress: 100 }));

                if (!result.success) {
                    showNotification(`Upload failed: ${result.errors[0]?.error ?? "Unknown error"}`);
                    setIsOpenLoader({ isOpen: false });
                    return;
                }

                setSelectedSourceId(result.source_id);
                setSelectedProgramme(null);

                const newCourses = await getCoursesBySourceId(result.source_id);
                if (newCourses.error) throw new Error(newCourses.error);
                courses.current = newCourses.data ?? []
                setFilterCourses(newCourses.data ?? [])

                const programmeResult = await getUniqueProgrammeBySourceId(result.source_id);
                if (programmeResult.error) throw new Error(programmeResult.error);
                setProgrammes(programmeResult.data);

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
                // Small delay so the user sees 100 % before the overlay disappears
                await new Promise((r) => setTimeout(r, 600));
                setIsOpenLoader({ isOpen: false });
                showNotification(`Loaded ${result.inserted} courses successfully.`);
            } catch (err) {
                if (uploadProgressRef.current) clearInterval(uploadProgressRef.current);
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
        // Open loader at 0 % then ramp to 50 % while the API call is in flight.
        setIsOpenLoader({ isOpen: true, title: "Saving your search...", progress: 1 });
        await new Promise((r) => setTimeout(r, 120)); // allow first render
        setIsOpenLoader((prev) => ({ ...prev, progress: 50 }));
        try {
            const searchHistory: SearchHistoryInsert = {
                company_name: getValues("company_name"),
                job_description: getValues("job_description"),
                position: getValues("position"),
                user_id: user.id,
                technical_requirements: agentResult?.technical_requirements,
                summary: agentResult!.summary,
                source_id: agentResult!.source_id,
                programme: selectedProgramme,
            };

            const result = await createSearchHistoryAndMatches(searchHistory, agentResult!.courses);
            if (result.error) {
                throw new Error(result.error);
            }
            // Jump to 100 % and let the user see the completed bar briefly
            setIsOpenLoader((prev) => ({ ...prev, progress: 100 }));
            await new Promise((r) => setTimeout(r, 600));
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
        if (!selectedProgramme) {
            showNotification('Please choose your programme')
            return;
        }
        setIsAnalyzing(true);
        setAgentResult(null);

        const localAgentResult: AgentResponseClient = {
            technical_requirements: "",
            courses: [],
            source_id: selectedSourceId,
            summary: "",
            steps_taken: "0",
            user_id: user.id,
            programme: selectedProgramme
        };

        try {
            await analyzeJobDescriptionStreamingAxios(
                {
                    job_description: form.job_description,
                    position: form.position,
                    source_id: selectedSourceId,
                    company_name: form.company_name,
                    programme: selectedProgramme!,   // <-- thêm dòng này

                },
                (type, data) => {
                    // console.log(type, data)
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

                        // Fix: Gọi thẳng notification ở đây thay vì throw lỗi vô định
                        showNotification(chunk.data || "Analysis failed.");
                        console.error("Stream Error:", chunk.data);
                        return;
                    }
                }
            );
        } catch (err) {
            setIsAnalyzing(false);
            showNotification(err instanceof Error ? err.message : "Analysis failed.");
        }
    };

    const handleSelectProgramme = (chosenProgramme: string | null) => {
        if (!chosenProgramme || chosenProgramme.length == 0) {
            // console.log(courses.current)
            setFilterCourses(courses.current)
            setSelectedProgramme(null)
            return
        }
        const filtered = courses.current.filter((course) => {
            return course.programme == chosenProgramme
        })
        setSelectedProgramme(chosenProgramme)
        setFilterCourses(filtered)
    }



    return (
        <div className="dashboard-page">
            <div className="dashboard-grid">
                {/* LEFT: Course Data */}
                <CourseDataSection
                    sources={sources}
                    selectedSourceId={selectedSourceId}
                    courses={filterCouses}
                    isUploading={isUploading}
                    onSelectSource={handleSelectSource}
                    onUploadFile={handleUploadFile}
                    programmes={programmes}
                    selectedProgramme={selectedProgramme}
                    onSelectProgramme={handleSelectProgramme}
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
