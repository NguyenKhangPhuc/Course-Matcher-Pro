'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import LanguageIcon from '@mui/icons-material/Language';

interface LanguageSwitchButtonProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitchButton({ className = '', compact = false }: LanguageSwitchButtonProps) {
  const { language, toggleLanguage } = useLanguage();
  const currentLang = language.language; // 'en' | 'fi'

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={currentLang === 'en' ? 'Switch to Finnish' : 'Vaihda englanniksi'}
      aria-label="Toggle language"
      className={`
        relative inline-flex items-center gap-1.5 p-1 rounded-full border border-[#d6edf5] bg-[#e8f4f8]
        hover:border-[#7dd8cc] transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#7dd8cc]/50
        ${className}
      `}
    >
      <div className="flex items-center gap-1 px-1.5 py-0.5 text-[#1a5c55] font-bold text-[11px] shrink-0">
        <LanguageIcon className="w-3.5 h-3.5 text-[#1a5c55]" sx={{ fontSize: 14 }} />
        {!compact && <span className="uppercase font-mono tracking-wider">{currentLang}</span>}
      </div>

      <div className="relative flex items-center bg-white/70 backdrop-blur-sm rounded-full p-0.5 border border-[#c1e5ed]">
        {/* Animated Background Slider */}
        <motion.div
          className="absolute top-0.5 bottom-0.5 rounded-full bg-[#1a5c55] shadow-xs"
          initial={false}
          animate={{
            left: currentLang === 'en' ? '2px' : '50%',
            right: currentLang === 'en' ? '50%' : '2px',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />

        {/* EN Label */}
        <span
          className={`
            relative z-10 px-2 py-0.5 text-[10px] font-extrabold uppercase transition-colors duration-200
            ${currentLang === 'en' ? 'text-white' : 'text-[#6b9daa] hover:text-[#1a5c55]'}
          `}
        >
          EN
        </span>

        {/* FI Label */}
        <span
          className={`
            relative z-10 px-2 py-0.5 text-[10px] font-extrabold uppercase transition-colors duration-200
            ${currentLang === 'fi' ? 'text-white' : 'text-[#6b9daa] hover:text-[#1a5c55]'}
          `}
        >
          FI
        </span>
      </div>
    </button>
  );
}
