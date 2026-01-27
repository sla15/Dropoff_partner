import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification, ChatSession, ChatMessage } from '../types';

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
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentTab, setCurrentTab] = useState('home');
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
    const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

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

    return (
        <UIContext.Provider value={{
            isDarkMode, toggleTheme, currentTab, setCurrentTab, notifications,
            pushNotification, removeNotification, activeChat, openChat, closeChat,
            chatMessages, sendMessage
        }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) throw new Error('useUI must be used within a UIProvider');
    return context;
};
