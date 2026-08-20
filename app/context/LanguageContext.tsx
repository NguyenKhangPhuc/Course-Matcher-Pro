'use client';

import React, { useContext, useState, createContext, Dispatch, SetStateAction } from "react";

export type LanguageCode = 'en' | 'fi';

export interface LanguageContextType {
    language: LanguageCode;
}

interface LanguageProviderValueType {
    language: LanguageContextType;
    setLanguage: Dispatch<SetStateAction<LanguageContextType>>;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageProviderValueType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<LanguageContextType>({ language: 'en' });

    const toggleLanguage = () => {
        setLanguage((prev) => ({
            language: prev.language === 'en' ? 'fi' : 'en',
        }));
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("Must be wrapped within the LanguageProvider");
    }
    return context;
};