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
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { translations } from "../../translations";

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
    selectedProgramme: string | null;
    selectedPeriod: string | null;
    onAnalyze: (form: JobForm) => Promise<void>;
}

export function TargetJobForm({
    register,
    handleSubmit,
    errors,
    isAnalyzing,
    selectedSourceId,
    selectedProgramme,
    selectedPeriod,
    onAnalyze,
}: TargetJobFormProps) {
    const { language } = useLanguage();
    const t = translations[language.language] || translations.en;

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
        <motion.section
            className="dashboard-card dashboard-card-job"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
            <motion.h2
                className="dashboard-section-title"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Shield fontSize="small" className="dashboard-section-icon" />
                {t.dashboard.targetJobTitle}
            </motion.h2>

            <motion.form
                onSubmit={handleSubmit(onAnalyze)}
                className="dashboard-form"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: {},
                    show: {
                        transition: {
                            staggerChildren: 0.08,
                        },
                    },
                }}
            >
                {/* Company name */}
                <motion.div
                    className="dashboard-field"
                    variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                    }}
                >
                    <label htmlFor="company-name-input" className="dashboard-label">{t.dashboard.companyNameLabel}</label>

                    <motion.input
                        id="company-name-input"
                        {...register("company_name", {
                            required: t.dashboard.companyRequired,
                        })}
                        className="dashboard-input"
                        placeholder={t.dashboard.companyPlaceholder}
                        whileFocus={{
                            scale: 1.01,
                        }}
                        transition={{ duration: 0.15 }}
                    />

                    {errors.company_name && (
                        <motion.p
                            className="text-red-500 text-xs mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {errors.company_name.message}
                        </motion.p>
                    )}
                </motion.div>

                {/* Position */}
                <motion.div
                    className="dashboard-field"
                    variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                    }}
                >
                    <label htmlFor="position-input" className="dashboard-label">{t.dashboard.positionLabel}</label>

                    <motion.input
                        id="position-input"
                        {...register("position", {
                            required: t.dashboard.positionRequired,
                        })}
                        className="dashboard-input"
                        placeholder={t.dashboard.positionPlaceholder}
                        whileFocus={{
                            scale: 1.01,
                        }}
                        transition={{ duration: 0.15 }}
                    />

                    {errors.position && (
                        <motion.p
                            className="text-red-500 text-xs mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {errors.position.message}
                        </motion.p>
                    )}
                </motion.div>

                {/* Job description */}
                <motion.div
                    className="dashboard-field"
                    variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 },
                    }}
                >
                    <label htmlFor="job-desc-textarea" className="dashboard-label">
                        {t.dashboard.jobDescLabel}
                    </label>

                    <motion.textarea
                        id="job-desc-textarea"
                        {...register("job_description", {
                            required: t.dashboard.jobDescRequired,
                            minLength: {
                                value: 30,
                                message:
                                    "Please provide more detail (min 30 chars)",
                            },
                        })}
                        className="dashboard-textarea"
                        placeholder={t.dashboard.jobDescPlaceholder}
                        rows={8}
                        whileFocus={{
                            scale: 1.01,
                        }}
                        transition={{ duration: 0.15 }}
                    />

                    {errors.job_description && (
                        <motion.p
                            className="text-red-500 text-xs mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {errors.job_description.message}
                        </motion.p>
                    )}
                </motion.div>

                {/* Analyze button */}
                <motion.button
                    type="submit"
                    disabled={!selectedSourceId || !selectedProgramme || !selectedPeriod || isAnalyzing}
                    className="dashboard-analyze-btn"
                    whileHover={
                        !isAnalyzing && selectedSourceId && selectedProgramme && selectedPeriod
                            ? { scale: 1.03 }
                            : {}
                    }
                    whileTap={
                        !isAnalyzing && selectedSourceId && selectedProgramme && selectedPeriod
                            ? { scale: 0.97 }
                            : {}
                    }
                    animate={
                        isAnalyzing
                            ? {
                                opacity: [0.7, 1, 0.7],
                            }
                            : {}
                    }
                    transition={
                        isAnalyzing
                            ? {
                                repeat: Infinity,
                                duration: 1.2,
                            }
                            : {
                                duration: 0.15,
                            }
                    }
                >
                    {isAnalyzing ? (
                        t.dashboard.analyzing
                    ) : (
                        <>
                            {t.dashboard.startAnalyze}
                            <motion.span
                                className="dashboard-analyze-arrow"
                                animate={{
                                    x: [0, 5, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1,
                                }}
                            >
                                →
                            </motion.span>
                        </>
                    )}
                </motion.button>
            </motion.form>
        </motion.section>
    );
}
