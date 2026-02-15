import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification, ChatSession, ChatMessage } from '../types';
import { AlertModal } from '../components/AlertModal';

interface UIContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    notifications: AppNotification[];
    pushNotification: (title: string, body: string, type: AppNotification['type']) => void;
    removeNotification: (id: string) => void;
    activeChat: ChatSession | null;
    openChat: (session: ChatSession) => void;
    closeChat: () => void;
    chatMessages: Record<string, ChatMessage[]>;
    sendMessage: (sessionId: string, text: string) => void;
    showAlert: (title: string, message: string, onConfirm?: () => void) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const [currentTab, setCurrentTab] = useState('home');
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
    const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
    const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm?: () => void }>({
        isOpen: false,
        title: '',
        message: ''
    });

    useEffect(() => {
        // Sync dark mode class with state
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

        // Use addEventListener for modern browsers/Capacitor
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const pushNotification = (title: string, body: string, type: AppNotification['type']) => {
        const newNotification: AppNotification = { id: Math.random().toString(36).substr(2, 9), title, body, type, timestamp: Date.now() };
        setNotifications(prev => [newNotification, ...prev]);
        setTimeout(() => removeNotification(newNotification.id), 5000);
    };

    const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
    const openChat = (session: ChatSession) => setActiveChat(session);
    const closeChat = () => setActiveChat(null);

    const sendMessage = (sessionId: string, text: string) => {
        const newMessage: ChatMessage = { id: Math.random().toString(36).substr(2, 9), text, sender: 'ME', timestamp: new Date() };
        setChatMessages(prev => ({ ...prev, [sessionId]: [...(prev[sessionId] || []), newMessage] }));
    };

    const showAlert = (title: string, message: string, onConfirm?: () => void) => {
        setAlertModal({ isOpen: true, title, message, onConfirm });
    };

    return (
        <UIContext.Provider value={{
            isDarkMode, toggleTheme, currentTab, setCurrentTab, notifications,
            pushNotification, removeNotification, activeChat, openChat, closeChat,
            chatMessages, sendMessage, showAlert
        }}>
            {children}
            <AlertModal
                isOpen={alertModal.isOpen}
                title={alertModal.title}
                message={alertModal.message}
                onConfirm={alertModal.onConfirm}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                isDarkMode={isDarkMode}
            />
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) throw new Error('useUI must be used within a UIProvider');
    return context;
};
