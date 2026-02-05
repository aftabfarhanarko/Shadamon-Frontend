"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, MessageCircle, Eye } from 'lucide-react';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/apiConfig';
import toast from 'react-hot-toast';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    onSwitchToRegister: () => void;
    initialMobile?: string;
}

export default function LoginModal({ isOpen, onClose, onSuccess, onSwitchToRegister, initialMobile }: LoginModalProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    React.useEffect(() => {
        if (isOpen && initialMobile) {
            setFormData(prev => ({ ...prev, email: initialMobile }));
        }
    }, [isOpen, initialMobile]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        if (e.target.name === 'email') { // 'email' field holds Mobile or Email
            const isNumeric = /^\d+$/.test(value);
            if (isNumeric && value.length > 0 && !value.startsWith('0')) {
                value = '0' + value;
            }
        }
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.token) {
                Cookies.set('token', data.token, { expires: 7 });
                toast.success("Login Successful!");
                onClose();
                if (onSuccess) {
                    onSuccess();
                } else {
                    window.location.reload();
                }
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Container - Anchored to bottom, compact height */}
            <div className="relative bg-[#F8F9FA] w-full max-w-[565px] rounded-t-lg rounded-b-none overflow-hidden shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-full duration-300 h-[calc(100vh-20px)]">

                {/* Header Controls - Compact */}
                <div className="flex items-center justify-between p-2 px-4 border-b border-slate-200 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-black hover:bg-slate-50 rounded-full transition-colors">
                            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <h2 className="text-[16px] text-black font-medium">Login</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full">
                        <X className="w-5 h-5 text-black" />
                    </button>
                </div>

                {/* Main Content Area - No Scroll needed */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">

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
                                        <div className="w-2 h-[1.5px] bg-white rounded-full" />
                                        <div className="h-2 w-[1.5px] bg-white rounded-full absolute" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h2 className="text-[18px] font-medium text-black leading-none">Login</h2>
                        <p className="text-[12px] text-black mt-1">If Allready Registered</p>
                    </div>

                    {/* Login Form - Tight Spacing */}
                    <form onSubmit={handleSubmit} className="space-y-3 mb-2">
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-slate-500" />
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Mobile Number or Email"
                                className="w-full bg-white border border-slate-500 rounded-md py-2.5 pl-8 pr-4 text-[13px] text-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-slate-400"
                                required
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-slate-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full bg-white border border-slate-500 rounded-md py-2.5 pl-8 pr-12 text-[13px] text-black focus:outline-none focus:ring-1 focus:ring-black placeholder:text-slate-400"
                                required
                            />
                            <div
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-black select-none"
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={() => setShowPassword(false)}
                                onMouseLeave={() => setShowPassword(false)}
                                onTouchStart={() => setShowPassword(true)}
                                onTouchEnd={() => setShowPassword(false)}
                            >
                                <Eye className="w-5 h-5" />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg text-[15px] hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    {/* Secondary Actions */}
                    <div className="flex items-center justify-between text-[11px] text-black px-1 mb-4">
                        <button className="hover:underline">HelpChat</button>
                        <button className="hover:underline">Forgot Password?</button>
                    </div>

                    {/* OR Divider */}
                    <div className="relative flex items-center justify-center mb-4">
                        <div className="absolute inset-x-0 h-[1px] bg-slate-500" />
                        <span className="relative bg-[#F8F9FA] px-3 text-[11px] font-medium text-black">OR</span>
                    </div>

                    {/* Social Buttons - Compact */}
                    <div className="space-y-2.5 mb-6">
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
                            className="w-full bg-white border border-slate-500 text-black py-2.5 rounded-lg flex items-center px-4 hover:bg-slate-50 transition-all"
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
                    </div>

                    {/* Bottom Links */}
                    <div className="flex flex-col items-center gap-1.5 pb-2">
                        <span className="text-[11px] text-black italic font-medium">New User?</span>
                        <button
                            onClick={onSwitchToRegister}
                            className="w-[120px] bg-white border border-slate-500 text-black py-1.5 rounded-md text-[12px] font-medium shadow-sm hover:bg-slate-50"
                        >
                            Register
                        </button>
                    </div>
                </div>

                {/* Floating Chat Icon */}
                <div className="absolute right-5 bottom-20 z-[210]">
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

