"use client";

import React from 'react';
import { X, Lock, ShieldAlert, MessageCircle } from 'lucide-react';

interface PackageUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PackageUpgradeModal({ isOpen, onClose }: PackageUpgradeModalProps) {
    if (!isOpen) return null;

    const handleUpgradeViaChat = () => {
        window.open('https://m.me/shadamonDotCom', '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-red-600" />
                        </div>
                        <h2 className="text-[16px] font-bold text-slate-800">Action Restricted</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <h3 className="text-[18px] font-extrabold text-slate-900 mb-2">
                        Mbnomb Package Required
                    </h3>
                    
                    <p className="text-[14px] text-slate-600 mb-6 leading-relaxed px-2">
                        To perform this action, you need to have a verified mobile number linked to an active package. 
                        Please upgrade your package to continue.
                    </p>

                    <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-left">
                        <h4 className="text-[13px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-slate-500" />
                            Why am I seeing this?
                        </h4>
                        <ul className="text-[12px] text-slate-600 space-y-2 list-disc pl-5 marker:text-slate-400">
                            <li>Protects users from spam and unauthorized access.</li>
                            <li>Ensures high-quality interactions on the platform.</li>
                            <li>Verifies your identity via a registered mobile number.</li>
                        </ul>
                    </div>

                    <button 
                        onClick={handleUpgradeViaChat}
                        className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-black text-white py-3 px-4 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.98] shadow-md"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Upgrade via Chat
                    </button>
                    
                    <button 
                        onClick={onClose}
                        className="mt-4 text-[13px] text-slate-500 hover:text-slate-800 transition-colors font-medium underline-offset-4 hover:underline"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}
