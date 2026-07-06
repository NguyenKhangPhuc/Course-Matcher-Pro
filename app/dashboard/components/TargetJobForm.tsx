/**
 * PURPOSE:
 * This component renders the target job description input form on the dashboard.
 * It integrates with React Hook Form to handle input values, validation, and submission.
 *
 * CONTEXT/PARENT FILE:
 * Extracted from app/dashboard/DashboardClient.tsx.
 *
 * INPUTS / PARAMETERS:
 * - register (UseFormRegister<JobForm>, Required): Register function from react-hook-form.
 * - handleSubmit (UseFormHandleSubmit<JobForm>, Required): HandleSubmit function from react-hook-form.
 * - errors (FieldErrors<JobForm>, Required): Form validation errors from react-hook-form.
 * - isAnalyzing (boolean, Required): Indicates if the analysis is currently in progress.
 * - selectedSourceId (string | null, Required): The ID of the currently selected source, needed to enable/disable submission.
 * - onAnalyze ((form: JobForm) => Promise<void>, Required): Callback triggered upon valid form submission.
 */

"use client";

import React from "react";
import { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import { Shield } from "@mui/icons-material";

export interface JobForm {
    company_name: string;
    job_description: string;
    position: string;
}

interface TargetJobFormProps {
    register: UseFormRegister<JobForm>;
    handleSubmit: UseFormHandleSubmit<JobForm>;
    errors: FieldErrors<JobForm>;
    isAnalyzing: boolean;
    selectedSourceId: string | null;
    onAnalyze: (form: JobForm) => Promise<void>;
}

export function TargetJobForm({
    register,
    handleSubmit,
    errors,
    isAnalyzing,
    selectedSourceId,
    onAnalyze,
}: TargetJobFormProps) {
    /**
     * BEHAVIORAL MECHANISM:
     * Component function that renders the form structure. It binds the React Hook Form register
     * functions to individual inputs, displays error messages conditionally when fields fail validation,
     * and handles submission by invoking the handleSubmit wrapper around the onAnalyze callback.
     *
     * PARAMETERS:
     * - None
     *
     * RETURNS:
     * - React.ReactElement: The rendered target job form element.
     */
    return (
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

                {/* Position */}
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

                {/* Job description */}
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
    );
}
