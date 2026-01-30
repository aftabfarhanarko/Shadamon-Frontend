"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/apiConfig';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function VerificationModal({ isOpen, onClose, onSuccess }: VerificationModalProps) {
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [otpAttempts, setOtpAttempts] = useState(0);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    useEffect(() => {
        if (isOpen) {
            // Reset state on open
            setShowOtpInput(false);
            setOtp(["", "", "", "", "", ""]);
            setOtpTimer(0);
            setOtpAttempts(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleRequestOtp = async () => {
        if (otpAttempts >= 3) {
            toast.error("Maximum attempts reached. Please try again later.");
            return;
        }

        setVerificationLoading(true);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/user/otp/request`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                if (data.isVerified) {
                    toast.success("Already verified!");
                    onSuccess();
                    onClose();
                } else {
                    setShowOtpInput(true);
                    setOtpTimer(30);
                    setOtpAttempts(prev => prev + 1);
                    toast.success("OTP sent to your email!");
                }
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch (error) {
            toast.error("Failed to send OTP");
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join("");
        if (otpCode.length !== 6) {
            toast.error("Please enter full valid OTP");
            return;
        }

        setVerificationLoading(true);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/user/otp/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ otp: otpCode })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Verification Successful!");
                onSuccess();
                onClose();
            } else {
                toast.error(data.message || "Verification failed");
            }
        } catch (error) {
            toast.error("Verification failed");
        } finally {
            setVerificationLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move focus
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X className="w-5 h-5 text-slate-500" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Verification Required</h2>
                    <p className="text-sm text-slate-500 mt-1">Please verify your account to proceed.</p>
                </div>

                <div className="space-y-6">
                    {!showOtpInput ? (
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleRequestOtp}
                                disabled={verificationLoading}
                                className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all shadow-lg shadow-brand-600/20"
                            >
                                {verificationLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Request OTP Code"}
                            </button>
                            <p className="text-xs text-slate-400 mt-3">We will send a one-time password to your registered email.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {otp.map((d, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        maxLength={1}
                                        value={d}
                                        ref={el => { otpInputRefs.current[i] = el; }}
                                        onChange={e => handleOtpChange(i, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(i, e)}
                                        className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-slate-200 rounded-xl text-center font-bold text-lg text-slate-800 focus:border-brand-500 focus:outline-none bg-slate-50 focus:bg-white transition-all"
                                    />
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={verificationLoading}
                                className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all shadow-lg shadow-brand-600/20"
                            >
                                {verificationLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Proceed"}
                            </button>

                            <div className="text-center">
                                {otpTimer > 0 ? (
                                    <p className="text-xs text-slate-500">Resend code in {otpTimer}s</p>
                                ) : (
                                    <button
                                        onClick={handleRequestOtp}
                                        className="text-xs font-bold text-brand-600 hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
