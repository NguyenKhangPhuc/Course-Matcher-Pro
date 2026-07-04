import React from 'react';

interface ComponentLoaderProps {
    /** Kích thước của vòng xoay (ví dụ: 'w-12 h-12', 'w-32 h-32') */
    sizeClassName?: string;
    /** Text thông báo trạng thái tải (nếu có) */
    label?: string;
}

export const ComponentLoader: React.FC<ComponentLoaderProps> = ({
    sizeClassName = "w-16 h-16",
    label
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-8 w-full min-h-[150px]">
            <div className="relative">
                {/* Khung chứa vòng quay động */}
                <div className={`relative ${sizeClassName}`}>
                    <div
                        className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-r-[#0ff] border-b-[#0ff] animate-spin"
                        style={{ animationDuration: '3s' }}
                    ></div>

                    <div
                        className="absolute w-full h-full rounded-full border-[3px] border-gray-100/10 border-t-[#0ff] animate-spin"
                        style={{ animationDuration: '2s', animationDirection: 'reverse' }}
                    ></div>
                </div>

                {/* Hiệu ứng hào quang xung quanh */}
                <div
                    className="absolute inset-0 bg-gradient-to-tr from-[#0ff]/10 via-transparent to-[#0ff]/5 animate-pulse rounded-full blur-sm"
                ></div>
            </div>
            {label && (
                <p className="mt-4 text-sm text-gray-400 animate-pulse font-mono tracking-wider">
                    {label}
                </p>
            )}
        </div>
    );
};