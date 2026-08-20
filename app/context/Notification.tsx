'use client';

import { useContext, useState, createContext, Dispatch, SetStateAction } from "react";
// The type of the Notification controlle
interface NotificationContextType {
    content: string | null
    isOpen: boolean
}

// The type to be passed in the notification (in value)
interface NotificationProviderValueType {
    notification: NotificationContextType,
    setNotification: Dispatch<SetStateAction<NotificationContextType>>
    showNotification: (content: string) => void
}

// Create the context
const NotificationContext = createContext<NotificationProviderValueType | undefined>(undefined);

// Create the provider and pass the controller to every child in provider
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    // Notification controller
    const [notification, setNotification] = useState<NotificationContextType>({ content: null, isOpen: false });

    const showNotification = (content: string) => {
        setNotification({ content, isOpen: true });
        if (typeof window !== 'undefined') {
            try {
                const sound = new Audio('/sound/notification.mp3');
                sound.volume = 0.2;
                sound.play()?.catch(() => {
                    // Ignore audio autoplay/unsupported media errors (e.g. headless Playwright test runners)
                });
            } catch {
                // Ignore audio initialization errors
            }
        }
        setTimeout(() => {
            setNotification({ content: null, isOpen: false });
        }, 3000);
    };

    return (
        <NotificationContext.Provider value={{ notification, setNotification, showNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
// Custom hook to get the challenge controller from the context
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("Must be wrapped within the provider");
    }
    return context;
}