"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    User, Search, Bell, MessageSquare, Globe,
    Home, Plus, Inbox, LogOut, Settings, Menu, X,
    Grid, MapPin, ChevronRight, ChevronDown
} from 'lucide-react';
import { RiMailFill, RiUser3Fill } from 'react-icons/ri';
import Cookies from 'js-cookie';
import { useLanguage } from '../context/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import PostAdModal from '../../components/PostAdModal';
import PromoteModal from '../../components/PromoteModal';
import LoginModal from '../../components/LoginModal';
import RegisterModal from '../../components/RegisterModal';
import AccountActivityModal from '../../components/AccountActivityModal';
import MobileEntryModal from '../../components/MobileEntryModal';
import VerificationModal from '../../components/VerificationModal';
import { API_BASE_URL } from '../../utils/apiConfig';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}


interface SubItem {
    _id: string;
    name: string;
    slug: string;
}

interface Category {
    _id: string;
    name: string;
    subcategories: SubItem[];
}

interface Location {
    _id: string;
    name: string;
    subLocations: SubItem[];
}

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const { t, language, setLanguage } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isMobileEntryModalOpen, setIsMobileEntryModalOpen] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [initialMobile, setInitialMobile] = useState('');
    const [tempMobile, setTempMobile] = useState<string>(""); // Store mobile from entry modal
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [accountModalInitialTab, setAccountModalInitialTab] = useState<'Page' | 'Profile' | 'Settings' | 'Post' | 'Activity'>('Page');
    const [viewingUserId, setViewingUserId] = useState<string | undefined>(undefined);
    const [adToPromote, setAdToPromote] = useState<any>(null);
    const [verificationToken, setVerificationToken] = useState<string | undefined>(undefined);

    const [mobileEntryReason, setMobileEntryReason] = useState<'post_ad' | 'account'>('post_ad');

    // Event Listener for opening account modal from children
    useEffect(() => {
        const handleOpenAccount = (e: CustomEvent) => {
            const userId = e.detail?.userId;
            setViewingUserId(userId);
            setIsAccountModalOpen(true);

            // Update URL with profile param
            if (userId) {
                const params = new URLSearchParams(window.location.search);
                params.set('profile', userId);
                router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
            }
        };

        window.addEventListener('open-account-modal', handleOpenAccount as EventListener);
        return () => window.removeEventListener('open-account-modal', handleOpenAccount as EventListener);
    }, []);

    // Mobile Sidebar State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
    const [totalAds, setTotalAds] = useState<number>(0); // Fallback to reference number

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/ads/public/all`);
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setTotalAds(data.data.length);
                }
            } catch (err) {
                console.error("Meta fetch error:", err);
            }
        };
        fetchMeta();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, subCatRes, locRes, subLocRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/categories`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/categories/sub`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/locations`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/locations/sub`).then(res => res.json())
                ]);

                if (catRes.success && subCatRes.success) {
                    const cats = catRes.data.map((c: any) => ({
                        ...c,
                        subcategories: subCatRes.data.filter((sc: any) => (sc.category?._id || sc.category) === c._id)
                    }));
                    setCategories(cats);
                }

                if (locRes.success && subLocRes.success) {
                    const locs = locRes.data.map((l: any) => ({
                        ...l,
                        subLocations: subLocRes.data.filter((sl: any) => (sl.location?._id || sl.location) === l._id)
                    }));
                    setLocations(locs);
                }
            } catch (error) {
                console.error("Failed to load menu data", error);
            }
        };
        fetchData();

        // Auto-open modal if openModal=true or profile=ID is in URL
        const openModal = searchParams.get('openModal');
        const openUsersProfile = searchParams.get('openUsersProfile');
        const profileId = searchParams.get('profile');
        const token = Cookies.get('token');

        if (openUsersProfile === 'true' && token) {
            setAccountModalInitialTab('Profile');
            setIsAccountModalOpen(true);
            const params = new URLSearchParams(window.location.search);
            params.delete('openUsersProfile');
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }

        if (openModal === 'true' && token) {
            setIsPostAdModalOpen(true);
            const params = new URLSearchParams(window.location.search);
            params.delete('openModal');
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }

        if (profileId) {
            setViewingUserId(profileId);
            setIsAccountModalOpen(true);
        }
    }, [searchParams]);

    const handleLogout = () => {
        Cookies.remove('token');
        router.push('/login');
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'bn' : 'en');
    };

    const toggleCategory = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    const toggleLocation = (id: string) => {
        setExpandedLocation(expandedLocation === id ? null : id);
    };

    const handleAddAdClick = () => {
        const token = Cookies.get('token');
        if (!token) {
            setMobileEntryReason('post_ad');
            setIsMobileEntryModalOpen(true);
        } else {
            setTempMobile(""); // Clear previous temp mobile if user is logged in
            setIsPostAdModalOpen(true);
        }
    };

    const handleAccountClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        const token = Cookies.get('token');
        if (!token) {
            setMobileEntryReason('account');
            setIsMobileEntryModalOpen(true);
        } else {
            setIsAccountModalOpen(true);
        }
    };

    return (
        <div className="h-screen bg-[#F1F5F9] font-sans overflow-hidden flex flex-col">
            {/* Top Navigation Bar */}
            <header className="flex-none bg-white border-b border-slate-200 z-50 h-16 w-full">
                <div className="max-w-[1320px] mx-auto px-4 h-full flex items-center justify-center">
                    {/* Section 1: 300px (Logo & Ad Count) */}
                    <div className="w-[300px] flex-none flex items-center gap-2">
                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 -ml-2 text-black hover:bg-slate-100 rounded-full transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
                            <span className="text-3xl font-bold text-[#1A202C] tracking-tighter">shadamon</span>
                            <div className="hidden lg:flex items-center border-l border-slate-300 pl-2 h-8 self-center">
                                <div className="flex flex-col -space-y-1">
                                    <span className="text-sm font-bold text-black">{totalAds.toLocaleString()}</span>
                                    <span className="text-xs text-black tracking-tight">Product</span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Gap 1: 50px */}
                    <div className="w-[50px] flex-none"></div>

                    {/* Section 2: 565px (Search & Icons) */}
                    <div className="w-[565px] flex-none flex items-center gap-4">
                        <div className="flex-1 flex bg-[#EDF2F7] rounded overflow-hidden transition-all focus-within:ring-2 focus-within:ring-brand-500/20">
                            <input
                                type="text"
                                placeholder="Search"
                                className="flex-1 bg-transparent px-4 py-2 outline-none text-sm text-black placeholder-slate-400"
                            />
                            <button className="bg-[#1A202C] text-white px-6 py-2 text-xs hover:bg-slate-800 transition-colors tracking-wider">
                                Search
                            </button>
                        </div>

                        {/* Language & Action Icons */}
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={toggleLanguage}
                                className="w-10 h-10 bg-[#EDF2F7] rounded-full flex items-center justify-center text-[14px] text-black uppercase"
                            >
                                {language}
                            </button>
                            <button className="w-10 h-10 bg-[#EDF2F7] rounded-full flex items-center justify-center text-[#1A202C] hover:bg-slate-200 transition-all relative">
                                <RiMailFill className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0088cc] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">23</span>
                            </button>

                            <Link
                                href="/dashboard/profile"
                                onClick={handleAccountClick}
                                className="w-10 h-10 bg-[#EDF2F7] rounded-full flex items-center justify-center text-[#1A202C] hover:bg-slate-200 transition-all"
                            >
                                <RiUser3Fill className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Gap 2: 50px */}
                    <div className="w-[50px] flex-none"></div>

                    {/* Section 3: 230px (Post Free) */}
                    <div className="w-[230px] flex-none">
                        <button
                            onClick={handleAddAdClick}
                            className="w-full bg-[#EDF2F7] text-black py-1.5 rounded text-sm uppercase tracking-widest"
                        >
                            Post Free
                        </button>
                    </div>
                    {/* Balancing Spacer */}
                    <div className="w-[70px] flex-none hidden lg:block"></div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 h-[70px] flex items-center justify-around px-2 pb-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 text-brand-600">
                    <Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold">{t('home')}</span>
                </Link>

                <button className="flex flex-col items-center gap-1 p-2 text-black hover:text-black">
                    <Search className="w-6 h-6" />
                    <span className="text-[10px] font-medium">{t('search_nav')}</span>
                </button>

                <div className="relative -top-6">
                    <button
                        onClick={handleAddAdClick}
                        className="w-14 h-14 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-7 h-7" />
                    </button>
                </div>

                <Link href="/dashboard/inbox" className="flex flex-col items-center gap-1 p-2 text-black hover:text-black">
                    <Inbox className="w-6 h-6" />
                    <span className="text-[10px] font-medium">{t('inbox')}</span>
                </Link>

                <Link
                    href="/dashboard/profile"
                    onClick={handleAccountClick}
                    className="flex flex-col items-center gap-1 p-2 text-black hover:text-black transition-all"
                >
                    <User className="w-6 h-6" />
                    <span className="text-[10px] font-medium">{t('account')}</span>
                </Link>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1320px] mx-auto px-4 pt-4 pb-0 overflow-hidden">
                {children}
            </main>

            {/* Mobile Sidebar (Drawer) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Sidebar Content */}
                    <div className="absolute inset-y-0 left-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <span className="font-bold text-lg text-black">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-black hover:bg-slate-200 rounded-full"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Categories */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-black font-bold border-b border-slate-100 pb-2">
                                    <Grid className="w-5 h-5 text-brand-600" />
                                    <h3>{t('category')}</h3>
                                </div>
                                <div className="space-y-1">
                                    {categories.map((cat) => (
                                        <div key={cat._id}>
                                            <button
                                                onClick={() => toggleCategory(cat._id)}
                                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-black transition-colors text-sm font-medium"
                                            >
                                                <span>{cat.name}</span>
                                                {cat.subcategories.length > 0 && (
                                                    expandedCategory === cat._id
                                                        ? <ChevronDown className="w-4 h-4 text-black" />
                                                        : <ChevronRight className="w-4 h-4 text-black" />
                                                )}
                                            </button>
                                            {expandedCategory === cat._id && cat.subcategories.length > 0 && (
                                                <div className="ml-4 pl-4 border-l border-slate-100 mt-1 space-y-1">
                                                    {cat.subcategories.map(sub => (
                                                        <button
                                                            key={sub._id}
                                                            className="block w-full text-left py-1.5 text-xs text-black hover:text-brand-600"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        >
                                                            {sub.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Locations */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-black font-bold border-b border-slate-100 pb-2">
                                    <MapPin className="w-5 h-5 text-brand-600" />
                                    <h3>{t('location')}</h3>
                                </div>
                                <div className="space-y-1">
                                    {locations.map((loc) => (
                                        <div key={loc._id}>
                                            <button
                                                onClick={() => toggleLocation(loc._id)}
                                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-black transition-colors text-sm font-medium"
                                            >
                                                <span>{loc.name}</span>
                                                {loc.subLocations.length > 0 && (
                                                    expandedLocation === loc._id
                                                        ? <ChevronDown className="w-4 h-4 text-black" />
                                                        : <ChevronRight className="w-4 h-4 text-black" />
                                                )}
                                            </button>
                                            {expandedLocation === loc._id && loc.subLocations.length > 0 && (
                                                <div className="ml-4 pl-4 border-l border-slate-100 mt-1 space-y-1">
                                                    {loc.subLocations.map(sub => (
                                                        <button
                                                            key={sub._id}
                                                            className="block w-full text-left py-1.5 text-xs text-black hover:text-brand-600"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        >
                                                            {sub.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer (Logout) */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 text-black rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-bold text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>{t('logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PostAdModal
                isOpen={isPostAdModalOpen}
                onClose={() => setIsPostAdModalOpen(false)}
                initialMobile={tempMobile} // Pass temp mobile
                onSuccess={(newAd) => {
                    // Dispatch custom event to tell Dashboard to refetch
                    window.dispatchEvent(new Event('refresh-ads'));

                    // After short delay to allow background refresh, open promote modal
                    setTimeout(() => {
                        if (newAd) {
                            setAdToPromote(newAd);
                            setIsPromoteModalOpen(true);
                        }
                    }, 500);
                }}
            />

            <PromoteModal
                isOpen={isPromoteModalOpen}
                onClose={() => {
                    setIsPromoteModalOpen(false);
                    setAdToPromote(null);
                }}
                ad={adToPromote}
            />

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSwitchToRegister={() => {
                    setIsLoginModalOpen(false);
                    setIsRegisterModalOpen(true);
                }}
                initialMobile={initialMobile}
                onSuccess={() => {
                    // Navigate to profile after login by reloading with param
                    const url = new URL(window.location.href);
                    url.searchParams.set('openUsersProfile', 'true');
                    window.location.href = url.toString();
                }}
            />

            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSwitchToLogin={() => {
                    setIsRegisterModalOpen(false);
                    setIsLoginModalOpen(true);
                }}
                initialMobile={initialMobile}
                onSuccess={(needsVerification = true, token) => {
                    setIsRegisterModalOpen(false);
                    if (needsVerification && token) {
                        setVerificationToken(token);
                        setIsVerificationModalOpen(true);
                    } else {
                        // Direct to profile
                        const url = new URL(window.location.href);
                        url.searchParams.set('openUsersProfile', 'true');
                        window.location.href = url.toString();
                    }
                }}
            />

            <MobileEntryModal
                isOpen={isMobileEntryModalOpen}
                onClose={() => setIsMobileEntryModalOpen(false)}
                onUserExists={(mobile) => {
                    setTempMobile(mobile);
                    setIsMobileEntryModalOpen(false);
                    if (mobileEntryReason === 'post_ad') {
                        setIsPostAdModalOpen(true);
                    } else {
                        setInitialMobile(mobile);
                        setIsLoginModalOpen(true);
                    }
                }}
                onUserNew={(mobile) => {
                    setTempMobile(mobile);
                    setIsMobileEntryModalOpen(false);
                    if (mobileEntryReason === 'post_ad') {
                        setIsPostAdModalOpen(true);
                    } else {
                        setInitialMobile(mobile);
                        setIsRegisterModalOpen(true);
                    }
                }}
            />

            <VerificationModal
                isOpen={isVerificationModalOpen}
                onClose={() => {
                    setIsVerificationModalOpen(false);
                    setVerificationToken(undefined);
                }}
                verificationToken={verificationToken}
                onSuccess={() => {
                    setIsVerificationModalOpen(false);
                    // Reload to refresh auth state and open profile
                    const url = new URL(window.location.href);
                    url.searchParams.set('openUsersProfile', 'true');
                    window.location.href = url.toString();
                }}
            />
            <AccountActivityModal
                isOpen={isAccountModalOpen}
                initialTab={accountModalInitialTab}
                onClose={() => {
                    setIsAccountModalOpen(false);
                    setAccountModalInitialTab('Page'); // Reset to default
                    setViewingUserId(undefined);
                    const params = new URLSearchParams(window.location.search);
                    params.delete('profile');
                    router.replace(`${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
                }}
                userId={viewingUserId}
                onOpenPostAd={() => {
                    setIsAccountModalOpen(false);
                    setIsPostAdModalOpen(true);
                }}
            />
        </div>
    );
}
