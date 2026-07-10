'use client'

import { useEffect, useRef, useState } from 'react'

/* ─────────────────────────────────────────────────────────────────
   ProgressLoader
   A reusable, smooth progress-bar component that animates from
   1 % to 100 % using the project's login-button brand colour (#1a5c55).

   Props
   ─────
   • progress  : number        – current value (0–100), controlled from outside.
   • label     : string?       – optional heading above the bar (e.g. "Analysing…")
   • subLabel  : string?       – optional small text below the bar
   • overlay   : boolean?      – full-screen fixed overlay when true (default: false)
   • onComplete: () => void?   – called exactly once when progress reaches 100
───────────────────────────────────────────────────────────────────── */

interface ProgressLoaderProps {
  progress: number
  label?: string
  subLabel?: string
  overlay?: boolean
  onComplete?: () => void
}

export default function ProgressLoader({
  progress,
  label,
  subLabel,
  overlay = false,
  onComplete,
}: ProgressLoaderProps) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const completedRef = useRef(false)

  /* Animate the displayed counter toward the real `progress` value with ease-out */
  useEffect(() => {
    const target = Math.min(100, Math.max(0, Math.round(progress)))

    const step = () => {
      setDisplayed((prev) => {
        if (prev === target) return prev
        const delta = Math.ceil(Math.abs(target - prev) * 0.08) || 1
        const next = prev < target
          ? Math.min(prev + delta, target)
          : Math.max(prev - delta, target)
        return next
      })
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [progress])

  /* Fire onComplete exactly once when 100 % is reached */
  useEffect(() => {
    if (displayed >= 100 && !completedRef.current) {
      completedRef.current = true
      onComplete?.()
    }
  }, [displayed, onComplete])

  const bar = (
    <div className="flex flex-col items-center gap-2.5 w-full max-w-[360px] px-6 py-8 rounded-[20px] bg-white border border-[#7dd8cc] shadow-[0_8px_40px_rgba(26,92,85,0.14),0_2px_12px_rgba(26,92,85,0.08)]">

      {/* Heading */}
      {label && (
        <p className="m-0 text-[15px] font-bold text-[#1a5c55] tracking-tight text-center">
          {label}
        </p>
      )}

      {/* Track */}
      <div
        className="relative w-full h-2.5 rounded-full bg-[#e8f4f2] overflow-hidden"
        role="progressbar"
        aria-valuenow={displayed}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Fill bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full overflow-hidden transition-[width] duration-[60ms] ease-linear"
          style={{
            width: `${displayed}%`,
            background: 'linear-gradient(90deg, #1a5c55 0%, #2a8a7e 50%, #7dd8cc 100%)',
          }}
        >
          {/* Shimmer sweep */}
          <span className="absolute inset-0 animate-progress-shimmer"
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)',
              backgroundSize: '200% 100%',
            }}
          />
          {/* Glowing leading edge */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3.5 rounded-full bg-[#7dd8cc] blur-[4px] opacity-90" />
        </div>
      </div>

      {/* Percentage + sub-label row */}
      <div className="w-full flex justify-between items-center">
        <span className="text-[11px] font-medium text-[#7aa5b0] tracking-wide">
          {subLabel ?? ''}
        </span>
        <span className="text-[22px] font-extrabold text-[#1a5c55] leading-none tabular-nums tracking-tighter">
          {displayed}%
        </span>
      </div>

      {/* Animated bounce dots */}
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-[7px] h-[7px] rounded-full bg-[#7dd8cc] animate-progress-dot"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )

  if (!overlay) return bar

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-[10px]">
      {bar}
    </div>
  )
}
