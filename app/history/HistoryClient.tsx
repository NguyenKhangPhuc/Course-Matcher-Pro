"use client";

/**
 * HistoryClient
 * -------------
 * Displays the user's past job-description searches and their matched
 * courses. Each search row is collapsible — clicking it expands to show
 * the matched courses (same card style as DashboardClient's Analysis Results)
 * and a delete button.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History as HistoryIcon,
  ExpandMore,
  Delete,
  OpenInNew,
  CalendarToday,
} from "@mui/icons-material";
import type { User } from "@supabase/supabase-js";
import { SearchHistoryWithMatches } from "../types/search_history";
import { useNotification } from "../context/Notification";
import { deleteSearchHistoryById } from "../actions/search_history";
import { DynamicModal } from "../dashboard/SaveSearchModal";
import { useLoader } from "../context/LoaderContext";


// =====================================================================
// TYPES
// =====================================================================

interface HistoryClientProps {
  user: User;
  searchHistoryWithMatches: SearchHistoryWithMatches[];
}

// =====================================================================
// HELPERS
// =====================================================================

/** Format an ISO date string into "MMM DD, YYYY" — e.g. "Oct 24, 2025" */
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

// =====================================================================
// COMPONENT
// =====================================================================

export default function HistoryClient({ user, searchHistoryWithMatches }: HistoryClientProps) {
  const [items, setItems] = useState<SearchHistoryWithMatches[]>(searchHistoryWithMatches);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { setIsOpenLoader } = useLoader()
  const { showNotification } = useNotification()
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /**
   * Delete a search history entry — calls the server action, removes
   * the item from local state on success, and shows an error toast on failure.
   */
  const handleDelete = async () => {
    setIsOpenLoader({ isOpen: true })
    try {
      if (!deletingId) {
        throw new Error("Fail to delete")
      }
      const { error } = await deleteSearchHistoryById(deletingId);
      if (error) {
        showNotification("Failed to delete search history.");
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== deletingId));
      if (expandedId === deletingId) setExpandedId(null);
      setIsOpenLoader({ isOpen: false })
      showNotification("Search history deleted.");
      setShowSaveModal(false)
    } catch (err) {
      setIsOpenLoader({ isOpen: false })
      showNotification(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  const onOpenModal = (searchId: string) => {
    setDeletingId(searchId);
    setShowSaveModal(true)
  }
  const onDismiss = () => {
    setShowSaveModal(false)
  }

  return (
    <div className="flex-1 min-h-screen min-w-0 bg-[#f0f7fa] px-4 sm:px-6 lg:px-9 py-5 sm:py-8 flex flex-col gap-5 sm:gap-7 overflow-y-auto overflow-x-hidden">
      {/* ── Page header ── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a3a8f] shrink-0">
          <HistoryIcon sx={{ fontSize: 20 }} className="text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-[#1a2e35] leading-tight">History</h1>
          <p className="text-xs text-[#6b9daa]">
            Review and manage your past course alignment analyses.
          </p>
        </div>
      </div>

      {/* ── Empty state ── */}
      {items.length === 0 && (
        <div className="bg-white border border-[#d6edf5] rounded-2xl p-10 text-center">
          <p className="text-sm text-[#6b9daa]">
            No search history yet. Run an analysis from the Dashboard to see it here.
          </p>
        </div>
      )}

      {/* ── History list ── */}
      <div className="flex flex-col gap-4 min-w-0">
        {items.map((item) => {
          const isExpanded = expandedId === item.id;
          const matchCount = item.search_matches?.length ?? 0;

          return (
            <div
              key={item.id}
              className="bg-white border border-[#4ad2ff] rounded-2xl overflow-hidden min-w-0"
            >
              {/* ── Row header — clickable ── */}
              <button
                onClick={() => toggleExpand(item.id!)}
                className="cursor-pointer w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-[#fafeff] transition-colors min-w-0"
              >
                {/* Company + position */}
                <div className="min-w-0 flex-1 max-w-[780px]">
                  <p className="text-sm font-bold text-[#1a2e35] truncate">{item.company_name}</p>
                  <p className="text-xs font-medium text-[#1a5c55] ">
                    <span className="font-semibold text-[#1a2e35]">Position: </span>
                    {item.position}</p>
                  <p className="text-xs text-[#4a7a85]">
                    <span className="font-semibold text-[#1a2e35]">Requirements: </span>
                    {isExpanded ? item.technical_requirements : item.technical_requirements?.slice(0, 200) + "...more"}
                  </p>
                </div>

                {/* Date + chevron */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-semibold text-[#a8c8d4] uppercase tracking-wide">
                      Created On
                    </p>
                    <p className="text-xs font-semibold text-[#4a7a85]">
                      {formatDate(item.created_at!)}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[#6b9daa] shrink-0"
                  >
                    <ExpandMore fontSize="small" />
                  </motion.div>
                </div>
              </button>

              {/* ── Expanded content ── */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-[#4ad2ff] px-6 py-5 min-w-0">
                      {/* Matched courses label */}
                      <div className="flex items-center   justify-between mb-4">
                        <p className="text-xs font-bold text-[#6b9daa] uppercase tracking-wide">
                          Matched Courses ({matchCount})
                        </p>
                      </div>

                      {/* Course grid — fixed 3 columns, click to expand learning outcomes */}
                      {matchCount === 0 ? (
                        <p className="text-xs text-[#6b9daa] text-center py-4">
                          No matched courses for this search.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5 min-w-0">
                          {item.search_matches.map((match) => {
                            const course = match.courses;
                            if (!course) return null;
                            const isCourseExpanded = expandedCourseId === match.id;

                            return (
                              <div
                                key={match.id}
                                onClick={() =>
                                  setExpandedCourseId((prev) => (prev === match.id ? null : match.id))
                                }
                                className="border border-[#d6edf5] rounded-2xl bg-[#fafeff] p-3.5 flex flex-col gap-2 hover:shadow-[0_4px_16px_rgba(125,216,204,0.18)] transition-shadow cursor-pointer min-w-0 w-full overflow-hidden"
                              >
                                <div className="flex items-start justify-between gap-2 min-w-0">
                                  <span className="text-[10px] font-semibold text-[#6b9daa] uppercase tracking-wide shrink-0">
                                    Match Score
                                  </span>
                                  <span className="text-xl font-extrabold text-[#1a5c55] leading-none shrink-0">
                                    {Math.round(match.similarity)}%
                                  </span>
                                </div>

                                <p className="text-sm font-bold text-[#1a2e35] leading-tight break-words min-w-0">
                                  {course.name}
                                </p>

                                <p className="text-xs text-[#6b9daa] leading-relaxed flex-1 break-words min-w-0">
                                  {isCourseExpanded
                                    ? course.learning_outcomes
                                    : `${course.learning_outcomes?.slice(0, 100)}...`}
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
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Delete button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => onOpenModal(item.id!)}
                          disabled={deletingId === item.id}
                          className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold text-[#c0392b] hover:bg-[#fde8e8] px-3 py-2 rounded-lg transition-colors disabled:opacity-50 shrink-0 duration-300"
                        >
                          <Delete sx={{ fontSize: 16 }} />
                          {deletingId === item.id ? "Deleting..." : "Delete History"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <DynamicModal
        isOpen={showSaveModal}
        onSave={handleDelete}
        onDismiss={onDismiss}
        title="Do you want to delete this search?"
        subTitle="This search and its matched courses will be deleted from your history."
      />
    </div >
  );
}
