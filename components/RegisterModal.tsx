"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, MessageCircle, ChevronDown, User, Lock } from 'lucide-react';
import { RiMailFill } from 'react-icons/ri';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/apiConfig';
import toast from 'react-hot-toast';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        dob: '',
        gender: 'male',
        storeName: '',
        actionType: 'call',
        accountStatus: 'review',
        verifiedBy: 'Not Verified',
        merchantType: 'Free'
    });

    const handleSocialLogin = (provider: string) => {
        if (provider === 'facebook') {
            // @ts-ignore
            if (typeof window.FB === 'undefined') {
                toast.error("Facebook SDK loading...");
                return;
            }

            // @ts-ignore
            window.FB.login(function (response) {
                if (response.authResponse) {
                    const accessToken = response.authResponse.accessToken;
                    setLoading(true);
                    fetch(`${API_BASE_URL}/api/user/facebook-login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ accessToken })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.token) {
                                Cookies.set('token', data.token, { expires: 7 });
                                toast.success("Login Successful!");
                                window.location.reload();
                            } else {
                                toast.error(data.message || "Facebook login failed");
                            }
                        })
                        .catch(() => toast.error("Failed to communicate with server"))
                        .finally(() => setLoading(false));
                }
            }, { scope: 'public_profile,email' });
        } else if (provider === 'google') {
            // @ts-ignore
            if (typeof window.google === 'undefined') {
                toast.error("Google SDK loading... Try again in a moment.");
                return;
            }

            // @ts-ignore
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                callback: (response: any) => {
                    if (response.access_token) {
                        setLoading(true);
                        fetch(`${API_BASE_URL}/api/user/google-login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token: response.access_token })
                        })
                            .then(res => res.json())
                            .then(data => {
                                if (data.token) {
                                    Cookies.set('token', data.token, { expires: 7 });
                                    toast.success("Login Successful!");
                                    window.location.reload();
                                } else {
                                    toast.error(data.message || "Google login failed");
                                }
                            })
                            .catch(() => toast.error("Failed to communicate with server"))
                            .finally(() => setLoading(false));
                    }
                },
            });
            // @ts-ignore
            client.requestAccessToken();
        }
    };

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 1) {
            if (formData.mobile && !/^\d{11}$/.test(formData.mobile)) {
                toast.error("Mobile number must be exactly 11 digits");
                return;
            }
            setStep(2);
        } else {
            handleRegister();
        }
    };

    const handleRegister = async () => {
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            if (data.token) {
                Cookies.set('token', data.token, { expires: 7 });
                toast.success("Registration Successful!");
                window.location.reload();
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Container - Anchored to bottom, compact height */}
            <div className="relative bg-[#F8F9FA] w-full max-w-[420px] rounded-lg overflow-hidden shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-full duration-300">

                {/* Header Controls - Compact */}
                <div className="flex items-center justify-between p-3 px-5 shrink-0">
                    <button
                        onClick={() => step === 2 ? setStep(1) : onClose()}
                        className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 stroke-[2]" />
                    </button>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                        <X className="w-4 h-4 stroke-[2]" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="px-6 pb-4">

                    {/* Shield Logo - Shrunken */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="relative w-[70px] h-[70px] mb-1 flex items-center justify-center">
                            <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full">
                                <path
                                    d="M50 0 L10 15 V50 C10 80 50 110 50 110 C50 110 90 80 90 50 V15 L50 0Z"
                                    fill="white"
                                    stroke="#E5E7EB"
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
                        <h2 className="text-[18px] font-medium text-slate-800 leading-none">Register</h2>
                        <p className="text-[11px] text-slate-400 mt-1">If you are a New User</p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleContinue} className="space-y-3 mb-3">
                        {/* Mobile Number with +88 */}
                        <div className="relative flex items-center bg-white border border-slate-200 rounded-md overflow-hidden">
                            <div className="flex items-center gap-1 px-3 py-2.5 border-r border-slate-100 bg-slate-50/50">
                                <span className="text-[13px] font-medium text-slate-700">+88</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div className="absolute left-[65px] top-1/2 -translate-y-1/2 w-[1px] h-4 bg-slate-200" />
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="Enter your mobile number"
                                className="flex-1 py-2.5 pl-6 pr-4 text-[13px] text-slate-800 focus:outline-none placeholder:text-slate-400"
                                required={step === 1}
                            />
                        </div>

                        {step === 2 && (
                            <>
                                {/* Name */}
                                <div className="relative animate-in slide-in-from-top-2 duration-300">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                        <RiMailFill className="w-4 h-4 text-slate-700" />
                                        <div className="w-[1px] h-4 bg-slate-200" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Full Name"
                                        className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-14 pr-4 text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder:text-slate-400"
                                        required
                                    />
                                </div>

                                {/* Email */}
                                <div className="relative animate-in slide-in-from-top-2 duration-300">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                        <RiMailFill className="w-4 h-4 text-slate-700" />
                                        <div className="w-[1px] h-4 bg-slate-200" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email Id"
                                        className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-14 pr-4 text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder:text-slate-400"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative animate-in slide-in-from-top-2 duration-300">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                        <RiMailFill className="w-4 h-4 text-slate-700" />
                                        <div className="w-[1px] h-4 bg-slate-200" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a Password for SHADAMON"
                                        className="w-full bg-white border border-slate-200 rounded-md py-2.5 pl-14 pr-4 text-[13px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-300 placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg text-[15px] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
                        >
                            {loading ? (step === 1 ? "Continuing..." : "Registering...") : (step === 1 ? "Continue" : "Register")}
                        </button>
                    </form>

                    {step === 1 && (
                        <>
                            {/* OR Divider */}
                            <div className="relative flex items-center justify-center my-4">
                                <div className="absolute inset-x-0 h-[1px] bg-slate-200" />
                                <span className="relative bg-[#F8F9FA] px-3 text-[11px] font-medium text-slate-400">OR</span>
                            </div>

                            {/* Social Buttons - Compact */}
                            <div className="space-y-2.5 mb-4">
                                <button
                                    onClick={() => handleSocialLogin('facebook')}
                                    className="w-full bg-[#3B5998] text-white py-2.5 rounded-lg flex items-center px-4 hover:bg-[#344e86] transition-all"
                                >
                                    <span className="bg-white/20 p-1 rounded-sm mr-6">
                                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </span>
                                    <span className="text-[13px]">Continue with Facebook</span>
                                </button>
                                <button
                                    onClick={() => handleSocialLogin('google')}
                                    className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg flex items-center px-4 hover:bg-slate-50 transition-all"
                                >
                                    <span className="mr-6">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                    </span>
                                    <span className="text-[13px]">Continue with Google</span>
                                </button>
                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg flex items-center px-4 hover:bg-slate-50 transition-all"
                                >
                                    <span className="mr-6">
                                        <RiMailFill className="w-4 h-4 text-slate-700" />
                                    </span>
                                    <span className="text-[13px]">Continue With Email</span>
                                </button>
                            </div>
                        </>
                    )}

                    <p className="text-[10px] text-slate-400 text-center mb-6">
                        By Register for an account you agree to our <span className="text-slate-600 font-medium underline">Term & Condition</span>
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-4 text-[11px] text-slate-400">
                        <button className="hover:text-slate-600">HelpChat</button>
                        <span>|</span>
                        <button className="hover:text-slate-600">HelpLine</button>
                    </div>

                    {/* Bottom Link */}
                    <div className="flex flex-col items-center gap-1.5 pb-2">
                        <span className="text-[11px] text-slate-500 font-medium">Allready Have a Account?</span>
                        <button
                            onClick={onSwitchToLogin}
                            className="w-[140px] bg-white border border-slate-200 text-slate-700 py-2 rounded-md text-[13px] font-medium shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            Login
                        </button>
                    </div>
                </div>

                {/* Footer Controls Overlay (Hidden when step 2 to match design vibe) */}
                {step === 1 && (
                    <div className="mt-auto px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400 bg-[#F8F9FA] relative">
                        <button className="hover:text-slate-600">HelpChat</button>
                        <button className="hover:text-slate-600">HelpLine</button>

                        {/* Floating Chat Icon */}
                        <div className="absolute right-5 -top-12">
                            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                                <MessageCircle className="w-5 h-5 fill-white" />
                            </button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="mt-auto relative">
                        <div className="absolute right-5 -top-12">
                            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                                <MessageCircle className="w-5 h-5 fill-white" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
