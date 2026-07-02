'use client'
import { useNotification } from "../context/Notification"

export const Notification = () => {
    const { notification } = useNotification()
    return (
        <div className={`fixed top-4 right-10 card duration-300 z-100 pointer-events-none ${notification.isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            <button className="group relative">
                <div className="absolute -right-2 -top-2 z-10">
                    <div className="flex h-5 w-5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7dd8cc] opacity-75"></span>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-bl from-[#1a2e35] via-[#1a3a40] to-[#0f2028] p-[1px] shadow-2xl shadow-[#7dd8cc]/20">
                    <div className="relative flex items-center gap-4 rounded-xl bg-[#1a2e35] px-6 py-3 transition-all duration-300 group-hover:bg-[#1a2e35]/80">
                        {/* Icon box */}
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#7dd8cc] to-[#1a5c55] transition-transform duration-300 group-hover:scale-110">
                            <svg
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="h-5 w-5 text-white"
                            >
                                <path
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                ></path>
                            </svg>
                            <div className="absolute inset-0 rounded-lg bg-[#7dd8cc]/40 blur-sm transition-all duration-300 group-hover:blur-md"></div>
                        </div>

                        {/* Text */}
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-semibold text-white">Notification</span>
                            <span className="text-[10px] font-medium text-[#7dd8cc]">
                                {notification.content}
                            </span>
                        </div>

                        {/* Dot indicator */}
                        <div className="ml-auto flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#7dd8cc] transition-transform duration-300 group-hover:scale-150"></div>
                        </div>
                    </div>

                    {/* Glow overlay */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7dd8cc] via-[#1a5c55] to-[#0f2028] opacity-10 transition-opacity duration-300 group-hover:opacity-25"></div>
                </div>
            </button>
        </div>

    )
}