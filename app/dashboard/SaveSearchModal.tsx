"use client";

import { motion, AnimatePresence } from "framer-motion";

// =====================================================================
// TYPES
// =====================================================================
import ClearIcon from '@mui/icons-material/Clear';
interface SaveSearchModalProps {
    isOpen: boolean;
    onSave: () => void;
    onDismiss: () => void;
}

// =====================================================================
// COMPONENT
// =====================================================================

/**
 * SaveSearchModal
 * ----------------
 * Full-screen blocking modal asking the user whether to save their
 * current search results to history.
 *
 * Covers the entire viewport with a blurred backdrop, preventing any
 * interaction with the page behind it until the user picks an option.
 */
export function SaveSearchModal({ isOpen, onSave, onDismiss }: SaveSearchModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center w-screen h-screen bg-black/30 backdrop-blur-sm"
                >
                    <div className="absolute top-3 right-3 cursor-pointer text-[#6b9daa] hover:text-[#1a2e35] transition-colors">
                        <ClearIcon fontSize="small" />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="w-full max-w-sm mx-4 rounded-2xl bg-white p-6 shadow-2xl"
                    >
                        <h2 className="text-base font-bold text-[#1a2e35] text-center">
                            Do you want to save your search?
                        </h2>
                        <p className="mt-2 text-xs text-[#6b9daa] text-center">
                            This search and its matched courses will be saved to your history.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={onDismiss}
                                className="cursor-pointer flex-1 rounded-xl border border-[#d6edf5] bg-white py-2.5 text-sm font-semibold text-[#4a7a85] transition-colors hover:bg-[#f0f7fa]"
                            >
                                No
                            </button>
                            <button
                                onClick={onSave}
                                className="cursor-pointer flex-1 rounded-xl bg-[#1a5c55] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                            >
                                Yes
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
