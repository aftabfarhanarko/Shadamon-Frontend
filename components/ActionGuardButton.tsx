"use client";

import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/apiConfig';
import PackageUpgradeModal from './PackageUpgradeModal';

interface ActionGuardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onGuardedClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function ActionGuardButton({ onGuardedClick, children, className, ...props }: ActionGuardButtonProps) {
    const [isChecking, setIsChecking] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        
        const token = Cookies.get('token');
        if (!token) {
            // Not logged in -> trigger auth modal globally
            window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
            return;
        }

        setIsChecking(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok && data && data.mobile) {
                // User has a verified mobile number, allow action
                onGuardedClick(e);
            } else {
                // User does not have a mobile number (or package issue), trigger upgrade modal
                setShowUpgradeModal(true);
            }
        } catch (error) {
            console.error("Error checking user profile for action guard:", error);
            // Default to showing the upgrade/restriction modal on fetch failure
            setShowUpgradeModal(true); 
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <>
            <button 
                onClick={handleClick} 
                className={className}
                disabled={isChecking || props.disabled}
                {...props}
            >
                {isChecking ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </span>
                ) : children}
            </button>
            <PackageUpgradeModal 
                isOpen={showUpgradeModal} 
                onClose={() => setShowUpgradeModal(false)} 
            />
        </>
    );
}
