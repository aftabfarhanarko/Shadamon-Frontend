"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../../utils/apiConfig';

interface AdPosition {
    _id: string;
    positionId: number;
    placeName: string;
    deskWidth: string;
    deskHeight: string;
    mobWidth: string;
    mobHeight: string;
    link: string;
    endDate: string;
    status: 'Yes' | 'No';
    imageDesk: string | null;
    imageMob: string | null;
}

interface Settings {
    siteLogo?: string;
    favIcon?: string;
    watermarkLogo?: string;
    userRepeatAdViewTime?: number;
    productPhotoLimit?: number;
    blockCheckInHeadline?: string[];
    blockCheckInDescription?: string[];
    adPositions?: AdPosition[];
}

interface SettingsContextType {
    settings: Settings;
    loading: boolean;
    fetchDashboardSettings: () => Promise<void>;
    fetchPostAdSettings: () => Promise<void>;
    fetchAdPositions: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>({});
    const [loading, setLoading] = useState(false);

    const fetchDashboardSettings = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings/dashboard`);
            const data = await res.json();
            if (data.success) {
                setSettings(prev => ({ ...prev, ...data.data }));
            }
        } catch (error) {
            console.error("Failed to fetch dashboard settings:", error);
        }
    }, []);

    const fetchPostAdSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/settings/post-ad`);
            const data = await res.json();
            if (data.success) {
                setSettings(prev => ({ ...prev, ...data.data }));
            }
        } catch (error) {
            console.error("Failed to fetch post-ad settings:", error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    const fetchAdPositions = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/ads/public/ad-positions`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSettings(prev => ({ ...prev, adPositions: data }));
            }
        } catch (error) {
            console.error("Failed to fetch ad positions:", error);
        }
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, fetchDashboardSettings, fetchPostAdSettings, fetchAdPositions }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
