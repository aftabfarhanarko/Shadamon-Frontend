"use client";

import React, { useState } from 'react';
import { X, ArrowLeft, Smartphone, Loader2, ChevronDown, MessageCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import toast from 'react-hot-toast';

interface MobileEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserExists: (mobile: string) => void;
    onUserNew: (mobile: string) => void;
}

export default function MobileEntryModal({ isOpen, onClose, onUserExists, onUserNew }: MobileEntryModalProps) {
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        // Ensure numeric
        if (!/^\d*$/.test(value)) return;

        // Auto prefix 0
        if (value.length > 0 && !value.startsWith('0')) {
            value = '0' + value;
        }

        // Limit to 11 digits
        if (value.length > 11) return;

        setMobile(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mobile.length !== 11) {
            toast.error("Please enter a valid 11-digit mobile number");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/user/check-mobile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile })
            });

            const data = await res.json();

            if (res.ok) {
                if (data.exists) {
                    onUserExists(mobile);
                } else {
                    onUserNew(mobile);
                }
                onClose();
            } else {
                toast.error(data.message || "Something went wrong");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-[#F8F9FA] w-full max-w-[565px] rounded-lg overflow-hidden shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-full duration-300">

                {/* Header Controls - Compact */}
                <div className="flex items-center justify-between p-3 px-5 shrink-0">
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-black hover:bg-slate-200 transition-colors">
                        <ArrowLeft className="w-4 h-4 stroke-[2]" />
                    </button>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-black hover:bg-slate-200 transition-colors">
                        <X className="w-4 h-4 stroke-[2]" />
                    </button>
                </div>

                <div className="px-6 pb-4">
                    {/* Shield Logo - Shrunken */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="relative w-[70px] h-[70px] mb-1 flex items-center justify-center">
                            <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full">
                                <path
                                    d="M50 0 L10 15 V50 C10 80 50 110 50 110 C50 110 90 80 90 50 V15 L50 0Z"
                                    fill="white"
                                    stroke="#64748b"
                                    strokeWidth="1.5"
                                />
                                <path
                                    d="M50 8 L18 20 V50 C18 75 50 102 50 102 C50 102 82 75 82 50 V20 L50 8Z"
                                    fill="transparent"
                                    stroke="#F97316"
                                    strokeWidth="2.5"
                                />
                            </svg>
                            <div className="relative z-10 bg-gradient-to-b from-orange-400 to-orange-600 w-8 h-8 rounded-md flex items-center justify-center shadow-lg translate-y-[-2px]">
                                <div className="relative w-4 h-4">
                                    <div className="absolute inset-0 border-[1.5px] border-white rounded-[1px] mt-0.5" />
                                    <div className="absolute top-[-3px] left-1/2 -translate-x-1/2 w-3 h-2 border-[1.5px] border-white rounded-t-full" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="h-2 w-[1.5px] bg-white rounded-full absolute" />
                                        <div className="w-[1.5px] h-2 bg-white rounded-full absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 rotate-90" />
                                        <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center text-orange-600 text-[8px] font-bold">+</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h2 className="text-[18px] font-medium text-black leading-none">Welcome</h2>
                        <p className="text-[12px] text-black mt-1">Enter mobile number to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
                        <div className="relative flex items-center bg-white border border-slate-500 rounded-md overflow-hidden">
                            <div className="flex items-center gap-1 px-3 py-2.5 border-r border-slate-500 bg-slate-50/50">
                                <span className="text-[13px] font-medium text-black">+88</span>
                                <ChevronDown className="w-3.5 h-3.5 text-black" />
                            </div>
                            <div className="absolute left-[65px] top-1/2 -translate-y-1/2 w-[1px] h-4 bg-slate-500" />
                            <input
                                type="tel"
                                value={mobile}
                                onChange={handleChange}
                                placeholder="Enter your mobile number"
                                className="flex-1 py-2.5 pl-6 pr-4 text-[13px] text-black focus:outline-none placeholder:text-slate-400"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || mobile.length < 11}
                            className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg text-[15px] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading ? "Checking..." : "Continue"}
                        </button>
                    </form>

                    <p className="text-[10px] text-black text-center mb-6">
                        By continuing you agree to our <span className="text-black font-medium underline">Term & Condition</span>
                    </p>
                </div>

                {/* Floating Chat Icon */}
                <div className="absolute right-5 bottom-5 z-[210]">
                    <div className="flex flex-col items-center">
                        <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all mb-1">
                            <MessageCircle className="w-5 h-5 fill-white" />
                        </button>
                        <button className="text-[11px] text-black font-bold">HelpChat</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
