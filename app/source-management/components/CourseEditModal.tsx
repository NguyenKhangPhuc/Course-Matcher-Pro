/**
 * Purpose:
 * Renders a modal overlay allowing users to modify editable fields of a course.
 * Employs react-hook-form for form validation, mapping empty string inputs to null
 * directly inside registration options.
 *
 * Context/Parent File:
 * Extracted from app/source-management/SourceManagementClient.tsx.
 *
 * Inputs / Parameters:
 * - course (CourseInsert, Required): The course record to edit.
 * - onClose (function, Required): Callback triggered to close the modal.
 * - onSave (function, Required): Callback returning the successfully updated course record.
 */

"use client";

import React, { useState } from "react";
import { FieldErrors, useForm, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Close } from "@mui/icons-material";
import { CourseInsert } from "../../types/course";
import { updateCourseByCourseId } from "../../actions/course";
import { useNotification } from "../../context/Notification";

interface CourseEditModalProps {
    course: CourseInsert;
    onClose: () => void;
    onSave: (updated: CourseInsert) => void;
    register: UseFormRegister<CourseInsert>
    handleSubmit: UseFormHandleSubmit<CourseInsert>
    errors: FieldErrors<CourseInsert>,
}



/**
 * Behavioral Mechanism:
 * Sets up a form containing static fields using react-hook-form. On submit,
 * calls updateCourseByCourseId to persist updates. Optional values are mapped
 * to null during form registration if empty.
 *
 * Parameters:
 * - course: Initial course data.
 * - onClose: Handler to close modal.
 * - onSave: Handler called with updated data.
 *
 * Return Value:
 * - React.ReactElement: Modal component overlay.
 */
export default function CourseEditModal({
    course,
    onClose,
    onSave,
    register,
    handleSubmit,
    errors
}: CourseEditModalProps) {

    const [saving, setSaving] = useState(false);
    const { showNotification } = useNotification();

    const onSubmit = async (data: CourseInsert) => {
        setSaving(true);
        const { error } = await updateCourseByCourseId(course.id!, data);

        if (error) {
            showNotification(error);
            setSaving(false);
            return;
        }
        showNotification("Course updated successfully");
        onSave({ ...course, ...data });
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
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer text-[#7aa5b0] hover:text-[#1a2e35] transition-colors p-1 rounded-lg hover:bg-[#f0f7fa]"
                        >
                            <Close fontSize="small" />
                        </button>
                    </div>

                    {/* Body Form */}
                    <form
                        id="course-edit-form"
                        onSubmit={handleSubmit(onSubmit)}
                        className="overflow-y-auto flex-1 px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                        {/* Code */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Code
                            </label>
                            <input
                                type="text"
                                className={`w-full border ${errors.code ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("code", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.code && (
                                <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
                            )}
                        </div>

                        {/* Name (Required) */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full border ${errors.name ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("name", {
                                    required: "Course name is required",
                                    setValueAs: (v) => v === "" ? null : v
                                })}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                className={`w-full border ${errors.title ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("title", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Programme */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Programme
                            </label>
                            <input
                                type="text"
                                className={`w-full border ${errors.programme ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("programme", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.programme && (
                                <p className="text-red-500 text-sm mt-1">{errors.programme.message}</p>
                            )}
                        </div>

                        {/* Degree Type */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Degree Type
                            </label>
                            <input
                                type="text"
                                className={`w-full border ${errors.degree_type ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("degree_type", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.degree_type && (
                                <p className="text-red-500 text-sm mt-1">{errors.degree_type.message}</p>
                            )}
                        </div>

                        {/* Study Option */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Study Option
                            </label>
                            <input
                                type="text"
                                className={`w-full border ${errors.study_option ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("study_option", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.study_option && (
                                <p className="text-red-500 text-sm mt-1">{errors.study_option.message}</p>
                            )}
                        </div>

                        {/* Instructor */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Instructor
                            </label>
                            <input
                                type="text"
                                className={`w-full border ${errors.instructor ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("instructor", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.instructor && (
                                <p className="text-red-500 text-sm mt-1">{errors.instructor.message}</p>
                            )}
                        </div>

                        {/* Credits */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Credits
                            </label>
                            <input
                                type="text"
                                className={`w-full border ${errors.credits ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("credits", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.credits && (
                                <p className="text-red-500 text-sm mt-1">{errors.credits.message}</p>
                            )}
                        </div>

                        {/* URL */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                URL
                            </label>
                            <input
                                type="text"
                                className={`w-full border ${errors.url ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("url", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.url && (
                                <p className="text-red-500 text-sm mt-1">{errors.url.message}</p>
                            )}
                        </div>

                        {/* Start Date */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                className={`w-full border ${errors.start_date ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("start_date", {
                                    setValueAs: (v) => v === "" ? null : v,
                                    validate: (value) => !value || !isNaN(Date.parse(value as string)) || "Please enter a valid date"
                                })}
                            />
                            {errors.start_date && (
                                <p className="text-red-500 text-sm mt-1">{errors.start_date.message}</p>
                            )}
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                className={`w-full border ${errors.end_date ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("end_date", {
                                    setValueAs: (v) => v === "" ? null : v,
                                    validate: (value) => !value || !isNaN(Date.parse(value as string)) || "Please enter a valid date"
                                })}
                            />
                            {errors.end_date && (
                                <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>
                            )}
                        </div>

                        {/* Enroll Start */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Enroll Start
                            </label>
                            <input
                                type="date"
                                className={`w-full border ${errors.enrollment_start_date ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("enrollment_start_date", {
                                    setValueAs: (v) => v === "" ? null : v,
                                    validate: (value) => !value || !isNaN(Date.parse(value as string)) || "Please enter a valid date"
                                })}
                            />
                            {errors.enrollment_start_date && (
                                <p className="text-red-500 text-sm mt-1">{errors.enrollment_start_date.message}</p>
                            )}
                        </div>

                        {/* Enroll End */}
                        <div>
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Enroll End
                            </label>
                            <input
                                type="date"
                                className={`w-full border ${errors.enrollment_end_date ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none`}
                                {...register("enrollment_end_date", {
                                    setValueAs: (v) => v === "" ? null : v,
                                    validate: (value) => !value || !isNaN(Date.parse(value as string)) || "Please enter a valid date"
                                })}
                            />
                            {errors.enrollment_end_date && (
                                <p className="text-red-500 text-sm mt-1">{errors.enrollment_end_date.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Description
                            </label>
                            <textarea
                                className={`w-full border ${errors.description ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none resize-none min-h-[80px]`}
                                {...register("description", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        {/* Learning Outcomes */}
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Learning Outcomes
                            </label>
                            <textarea
                                className={`w-full border ${errors.learning_outcomes ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none resize-none min-h-[80px]`}
                                {...register("learning_outcomes", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.learning_outcomes && (
                                <p className="text-red-500 text-sm mt-1">{errors.learning_outcomes.message}</p>
                            )}
                        </div>

                        {/* Content */}
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Content
                            </label>
                            <textarea
                                className={`w-full border ${errors.content ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none resize-none min-h-[80px]`}
                                {...register("content", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.content && (
                                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                            )}
                        </div>

                        {/* Prerequisites */}
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Prerequisites
                            </label>
                            <textarea
                                className={`w-full border ${errors.prerequisites ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none resize-none min-h-[80px]`}
                                {...register("prerequisites", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.prerequisites && (
                                <p className="text-red-500 text-sm mt-1">{errors.prerequisites.message}</p>
                            )}
                        </div>

                        {/* Assessment */}
                        <div className="sm:col-span-2">
                            <label className="block text-[11px] font-semibold text-[#4a7a85] uppercase tracking-wide mb-1">
                                Assessment
                            </label>
                            <textarea
                                className={`w-full border ${errors.assessment ? "border-red-500" : "border-[#c8e6ee] focus:border-[#7dd8cc]"} rounded-lg px-3 py-2 text-sm text-[#1a2e35] bg-[#fafeff] focus:outline-none resize-none min-h-[80px]`}
                                {...register("assessment", { setValueAs: (v) => v === "" ? null : v })}
                            />
                            {errors.assessment && (
                                <p className="text-red-500 text-sm mt-1">{errors.assessment.message}</p>
                            )}
                        </div>
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
