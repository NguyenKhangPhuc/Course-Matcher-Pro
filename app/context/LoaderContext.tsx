'use client';

import { useContext, useState, createContext, Dispatch, SetStateAction } from "react";
// The type of the Notification controlle

// The type to be passed in the notification (in value)
interface LoaderAttributes {
    title?: string,
    isOpen: boolean,
    progress?: number
}
interface LoaderProviderValueType {
    isOpenLoader: LoaderAttributes,
    setIsOpenLoader: Dispatch<SetStateAction<LoaderAttributes>>
}


// Create the context
const LoaderContext = createContext<LoaderProviderValueType | undefined>(undefined);

// Create the provider and pass the controller to every child in provider
export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
    // Notification controller
    const [isOpenLoader, setIsOpenLoader] = useState<LoaderAttributes>({isOpen: false});

    return (
        <LoaderContext.Provider value={{ isOpenLoader, setIsOpenLoader, }}>
            {children}
        </LoaderContext.Provider>
    );
};
// Custom hook to get the challenge controller from the context
export const useLoader = () => {
    const context = useContext(LoaderContext);
    if (!context) {
        throw new Error("Must be wrapped within the provider");
    }
    return context;
}