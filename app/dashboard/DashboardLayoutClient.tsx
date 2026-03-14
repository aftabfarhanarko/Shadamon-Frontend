"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import {
    User, Search, Bell, MessageSquare, Globe,
    Home, Plus, Inbox, LogOut, Settings, Menu, X,
    Grid, MapPin, ChevronRight, ChevronDown
} from 'lucide-react';
import { RiMailFill, RiUser3Fill } from 'react-icons/ri';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';
import PostAdModal from '../../components/PostAdModal';
import PromoteModal from '../../components/PromoteModal';
import LoginModal from '../../components/LoginModal';
import RegisterModal from '../../components/RegisterModal';
import AccountActivityModal from '../../components/AccountActivityModal';
import MobileEntryModal from '../../components/MobileEntryModal';
import VerificationModal from '../../components/VerificationModal';
import AdDetailsModal from '../../components/AdDetailsModal';
import MessageModal from '../../components/MessageModal';
import ChatMessageModal from '../../components/ChatMessageModal';
import InfoModal from '../../components/InfoModal';
import { toast } from 'react-hot-toast';


import { API_BASE_URL } from '../../utils/apiConfig';
import { getImageUrl } from '../../utils/imageUrl';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}


interface SubItem {
    _id: string;
    name: string;
    slug: string;
    image?: string;
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
    const pathname = usePathname();

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
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isChatMessageModalOpen, setIsChatMessageModalOpen] = useState(false);
    const [chatAd, setChatAd] = useState<any>(null);
    const [chatOtherUser, setChatOtherUser] = useState<any>(null);


    const [adToPromote, setAdToPromote] = useState<any>(null);
    const [adToEdit, setAdToEdit] = useState<any>(null);
    const [verificationToken, setVerificationToken] = useState<string | undefined>(undefined);
    const [user, setUser] = useState<any>(null);

    const [mobileEntryReason, setMobileEntryReason] = useState<'post_ad' | 'account' | 'message' | 'report'>('post_ad');
    const [reportAd, setReportAd] = useState<any>(null);
    const [shouldOpenReportAfterLogin, setShouldOpenReportAfterLogin] = useState(false);


    const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; content: string }>({
        isOpen: false,
        title: '',
        content: ''
    });

    const openInfoModal = (type: 'about' | 'terms' | 'privacy' | 'contact' | 'safety') => {
        const contentMap = {
            about: {
                title: language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us',
                content: language === 'bn'
                    ? 'শাদামন বাংলাদেশের একটি ক্রমবর্ধমান অনলাইন মার্কেটপ্লেস। আমরা ক্রেতা এবং বিক্রেতাদের সংযোগ করি যাতে কেনাবেচা সবার জন্য সহজ, দ্রুত এবং নিরাপদ হয়।'
                    : 'Shadamon is a growing online marketplace in Bangladesh. We connect buyers and sellers to make trade easier, faster, and more secure for everyone.'
            },
            terms: {
                title: language === 'bn' ? 'শর্তাবলী' : 'Terms & Conditions',
                content: language === 'bn'
                    ? 'শাদামন ব্যবহার করার মাধ্যমে আপনি সঠিক পণ্য পোস্ট করা, অন্য ব্যবহারকারীদের প্রতি শ্রদ্ধা প্রদর্শন এবং আমাদের কমিউনিটি স্ট্যান্ডার্ড অনুসরণ করতে সম্মত হন। প্রতারণামূলক কার্যক্রম একাউন্ট বাতিলের কারণ হতে পারে।'
                    : 'By using Shadamon, you agree to post authentic items, respect other users, and follow our community standards. Fraudulent activities will lead to account termination.'
            },
            privacy: {
                title: language === 'bn' ? 'প্রাইভেসি পলিসি' : 'Privacy Policy',
                content: language === 'bn'
                    ? 'আপনার প্রাইভেসি আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। আমরা শুধুমাত্র আপনার অভিজ্ঞতা উন্নত করার জন্য প্রয়োজনীয় তথ্য সংগ্রহ করি এবং আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।'
                    : 'Your privacy is important to us. We only collect necessary information to improve your experience and never sell your data to third parties.'
            },
            contact: {
                title: language === 'bn' ? 'যোগাযোগ' : 'Contact Us',
                content: language === 'bn'
                    ? 'সাহায্য প্রয়োজন? সাপোর্ট চ্যাট, ইমেইল বা আমাদের হটলাইনের মাধ্যমে আমাদের সাথে যোগাযোগ করুন। আমাদের টিম আপনাকে সাহায্য করার জন্য সর্বদা প্রস্তুত।'
                    : 'Need help? Reach out to us via Support Chat, Email, or our Hotline. Our team is always ready to assist you.'
            },
            safety: {
                title: language === 'bn' ? 'নিরাপদ থাকুন' : 'Safety Tips',
                content: language === 'bn'
                    ? 'সর্বদা জনাকীর্ণ স্থানে দেখা করুন। পণ্যটি কেনার আগে ভালো করে যাচাই করে নিন। পণ্য হাতে পাওয়ার আগে কোনো অগ্রিম টাকা (বিকাশ/রকেট) পাঠাবেন না।'
                    : 'Always meet in public places. Inspect the item thoroughly before paying. Never send money in advance (bkash/rocket) without receiving the product.'
            }
        };
        const selected = contentMap[type];
        setInfoModal({
            isOpen: true,
            title: selected.title,
            content: selected.content
        });
    };


    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedAdForDetail, setSelectedAdForDetail] = useState<any | null>(null);

    const searchRef = useRef<HTMLDivElement>(null);

    // Event Listener for opening account modal from children
    useEffect(() => {
        const handleOpenAccount = (e: any) => {
            const userId = e.detail?.userId;
            const activeTab = e.detail?.activeTab;

            setViewingUserId(userId);
            if (activeTab) {
                setAccountModalInitialTab(activeTab);
            } else {
                setAccountModalInitialTab('Page');
            }

            setIsAccountModalOpen(true);

            // Update URL with profile param
            if (userId) {
                const params = new URLSearchParams(window.location.search);
                params.set('profile', userId);
                router.push(`/dashboard?${params.toString()}`, { scroll: false });
            }

        };

        window.addEventListener('open-account-modal', handleOpenAccount as EventListener);

        const handleOpenMobileEntry = (e: any) => {
            if (e.detail?.reason) {
                setMobileEntryReason(e.detail.reason);
                if (e.detail.reason === 'report' && e.detail.ad) {
                    setReportAd(e.detail.ad);
                }
            } else {
                setMobileEntryReason('post_ad');
                setReportAd(null);
            }
            setIsMobileEntryModalOpen(true);
        };

        window.addEventListener('open-mobile-entry-modal', handleOpenMobileEntry as EventListener);


        const handleOpenChat = (e: CustomEvent) => {
            setChatAd(e.detail?.ad);
            setChatOtherUser(e.detail?.otherUser || null);
            setIsChatMessageModalOpen(true);
        };
        window.addEventListener('open-chat-modal', handleOpenChat as EventListener);

        const handleOpenInfo = (e: CustomEvent) => {
            openInfoModal(e.detail?.type);
        };
        window.addEventListener('open-info-modal', handleOpenInfo as EventListener);

        const handleOpenPostAd = (e: CustomEvent) => {
            setAdToEdit(e.detail?.ad || null);
            setIsPostAdModalOpen(true);
        };
        window.addEventListener('open-post-ad-modal', handleOpenPostAd as EventListener);

        const handleOpenPromote = (e: CustomEvent) => {
            setAdToPromote(e.detail?.ad || null);
            setIsPromoteModalOpen(true);
        };
        window.addEventListener('open-promote-modal', handleOpenPromote as EventListener);

        return () => {
            window.removeEventListener('open-account-modal', handleOpenAccount as EventListener);
            window.removeEventListener('open-mobile-entry-modal', handleOpenMobileEntry);
            window.removeEventListener('open-chat-modal', handleOpenChat as EventListener);
            window.removeEventListener('open-info-modal', handleOpenInfo as EventListener);
            window.removeEventListener('open-post-ad-modal', handleOpenPostAd as EventListener);
            window.removeEventListener('open-promote-modal', handleOpenPromote as EventListener);
        };

    }, [language, router]);

    // Handle clicking outside of search to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [socket, setSocket] = useState<any>(null);

    const { settings, fetchDashboardSettings } = useSettings();

    // Socket.io for notifications and Auth Sync
    useEffect(() => {
        const fetchUserAndSetupSocket = async () => {
            const token = Cookies.get('token');
            if (!token) {
                setUser(null);
                setUnreadCount(0);
                if (socket) {
                    socket.disconnect();
                    setSocket(null);
                }
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) {
                    setUser(null);
                    return;
                }
                const userData = await res.json();

                if (userData && userData._id) {
                    setUser(userData);
                    const socketUrl = API_BASE_URL.replace('/api', '');
                    const newSocket = io(socketUrl);
                    setSocket(newSocket);

                    newSocket.emit('setup', { id: userData._id });

                    newSocket.on('notification received', () => {
                        fetchUnreadCount();
                        window.dispatchEvent(new Event('refresh-unread-count'));
                    });

                    return () => {
                        newSocket.disconnect();
                    };
                }
            } catch (err) {
                console.error("Socket setup error:", err);
            }
        };

        fetchUserAndSetupSocket();

        // Listen for auth changes
        const handleAuthChange = () => {
            fetchUserAndSetupSocket();
            fetchUnreadCount();
        };

        window.addEventListener('auth-change', handleAuthChange);
        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
        };
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
        fetchDashboardSettings();
    }, [fetchDashboardSettings]);

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
                    const cats = catRes.data
                        .map((c: any) => ({
                            ...c,
                            subcategories: subCatRes.data
                                .filter((sc: any) => (sc.category?._id || sc.category) === c._id)
                                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                        }))
                        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                    setCategories(cats);
                }

                if (locRes.success && subLocRes.success) {
                    const locs = locRes.data
                        .map((l: any) => ({
                            ...l,
                            subLocations: subLocRes.data
                                .filter((sl: any) => (sl.location?._id || sl.location) === l._id)
                                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                        }))
                        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
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
        const openMessageModal = searchParams.get('openMessageModal');
        const profileId = searchParams.get('profile');
        const token = Cookies.get('token');

        if (openMessageModal === 'true' && token) {
            setIsMessageModalOpen(true);
            const params = new URLSearchParams(window.location.search);
            params.delete('openMessageModal');
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }

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

        // Handle direct /dashboard/post-ad route
        if (pathname === '/dashboard/post-ad') {
            const token = Cookies.get('token');
            if (!token) {
                setMobileEntryReason('post_ad');
                setIsMobileEntryModalOpen(true);
            } else {
                setTempMobile("");
                setIsPostAdModalOpen(true);
            }
        }
    }, [searchParams, pathname]);

    // Apply Site Settings (Favicon, etc)
    useEffect(() => {
        if (settings.favIcon) {
            const faviconUrl = getImageUrl(settings.favIcon);

            // Standard favicon
            let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = faviconUrl;

            // Apple Touch Icon
            let appleIcon: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
            if (!appleIcon) {
                appleIcon = document.createElement('link');
                appleIcon.rel = 'apple-touch-icon';
                document.getElementsByTagName('head')[0].appendChild(appleIcon);
            }
            appleIcon.href = faviconUrl;

            // Shortcut icon
            let shortcutIcon: HTMLLinkElement | null = document.querySelector("link[rel='shortcut icon']");
            if (!shortcutIcon) {
                shortcutIcon = document.createElement('link');
                shortcutIcon.rel = 'shortcut icon';
                document.getElementsByTagName('head')[0].appendChild(shortcutIcon);
            }
            shortcutIcon.href = faviconUrl;
        }
    }, [settings.favIcon]);

    // Handle Search Suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length >= 2) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/ads/public/all?search=${encodeURIComponent(searchQuery)}&limit=5`);
                    const data = await res.json();
                    console.log("Search suggestions API response:", data);
                    if (data.success) {
                        setSuggestions(data.data);
                        setShowSuggestions(true);
                    }
                } catch (err) {
                    console.error("Suggestion fetch error:", err);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 50);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearchExecution = () => {
        window.dispatchEvent(new CustomEvent('show-search-results', { detail: { query: searchQuery } }));
        setShowSuggestions(false);
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        setUser(null);
        setUnreadCount(0);
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        sessionStorage.removeItem('ad_session_views');
        sessionStorage.removeItem('ad_session_view_tokens');
        window.dispatchEvent(new Event('auth-change'));
        toast.success("Logged out successfully");
        window.location.href = '/dashboard';
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

    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        const token = Cookies.get('token');
        if (!token) {
            setUnreadCount(0);
            return;
        }
        try {
            const [convRes, notifRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/messages/conversations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/user/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const convData = await convRes.json();
            const notifData = await notifRes.json();

            let total = 0;

            if (convData.success && Array.isArray(convData.data)) {
                // Count how many conversations have at least one unread message
                total += convData.data.filter((conv: any) => (conv.unreadCount || 0) > 0).length;
            }

            if (Array.isArray(notifData)) {
                // Count unread admin notifications
                total += notifData.filter((n: any) => !n.isRead).length;
            }

            setUnreadCount(total);
        } catch (err) {
            console.error("Unread count fetch error:", err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Every 30s
        window.addEventListener('refresh-unread-count', fetchUnreadCount);
        return () => {
            clearInterval(interval);
            window.removeEventListener('refresh-unread-count', fetchUnreadCount);
        };
    }, []);

    const handleMessageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const token = Cookies.get('token');
        if (!token) {
            setMobileEntryReason('message');
            setIsMobileEntryModalOpen(true);
        } else {
            setIsMessageModalOpen(true);
            fetchUnreadCount();
        }
    };


    const [headerOffset, setHeaderOffset] = useState(0);

    useEffect(() => {
        const handleCenterScroll = (e: any) => {
            setHeaderOffset(e.detail?.offset || 0);
        };
        window.addEventListener('center-scroll', handleCenterScroll as EventListener);
        return () => window.removeEventListener('center-scroll', handleCenterScroll as EventListener);
    }, []);

    return (
        <div className="h-screen bg-[#F1F5F9] font-sans overflow-hidden flex flex-col relative">
            <div
                className="flex-none z-50 transform-gpu"
                style={{ transform: `translateY(${-headerOffset}px)`, marginBottom: -headerOffset }}
            >
                {/* Top Navigation Bar */}
                <header className="bg-white border-b border-slate-200 h-16 w-full">
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

                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 shrink-0"
                                onClick={() => {
                                    window.dispatchEvent(new Event('reset-saved-search'));
                                    window.dispatchEvent(new Event('refresh-ads'));
                                }}
                            >
                                {settings.siteLogo ? (
                                    <div className="h-10 w-auto">
                                        <img
                                            src={getImageUrl(settings.siteLogo)}
                                            alt="Logo"
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-3xl font-bold text-[#1A202C] tracking-tighter">shadamon</span>
                                )}
                            </Link>
                        </div>

                        {/* Gap 1: 50px */}
                        <div className="w-[50px] flex-none"></div>

                        {/* Section 2: 565px (Search & Icons) */}
                        <div className="w-[565px] flex-none flex items-center gap-4 relative" ref={searchRef}>
                            <div className="flex-1 flex bg-[#EDF2F7] rounded relative">
                                <div className="flex-1 relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchExecution()}
                                        onFocus={() => {
                                            if (searchQuery.trim().length >= 2 && suggestions.length > 0) setShowSuggestions(true);
                                        }}
                                        className="flex-1 bg-transparent px-4 py-2 pr-10 outline-none text-sm text-black placeholder-slate-400"
                                    />

                                    {searchQuery && (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setShowSuggestions(false);
                                            }}
                                            className="absolute right-2 p-1 text-slate-400 hover:text-black transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Suggestions Dropdown */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute top-full left-0 w-full bg-[#EDF2F7] border border-brand-500/20 shadow-2xl z-[100] mt-1 overflow-hidden divide-y divide-slate-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                            {suggestions.map((ad) => (
                                                <div
                                                    key={ad._id}
                                                    className="p-3 hover:bg-slate-200 cursor-pointer flex items-center justify-between group transition-colors"
                                                    onClick={() => {
                                                        setSelectedAdForDetail(ad);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <div className="flex-1 min-w-0 pr-4">
                                                        <h4 className="text-sm font-medium text-black truncate group-hover:text-[#0088cc]">{ad.headline}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{ad.user?.name || ad.user?.storeName}</span>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span className="text-[10px] text-[#0088cc] font-medium">{ad.category}</span>
                                                        </div>
                                                    </div>
                                                    {ad.images && ad.images[0] && (
                                                        <div className="w-12 h-12 rounded bg-white overflow-hidden shrink-0 border border-slate-200">
                                                            <img
                                                                src={getImageUrl(ad.images[0])}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleSearchExecution}
                                    className="bg-[#1A202C] text-white px-6 py-2 text-xs hover:bg-slate-800 transition-colors tracking-wider rounded-r"
                                >
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
                                <button
                                    onClick={handleMessageClick}
                                    className="w-10 h-10 bg-[#EDF2F7] rounded-full flex items-center justify-center text-[#1A202C] hover:bg-slate-200 transition-all relative"
                                >
                                    <RiMailFill className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0088cc] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>


                                <Link
                                    href="/dashboard/profile"
                                    onClick={handleAccountClick}
                                    className={cn(
                                        "w-10 h-10 bg-[#EDF2F7] rounded-full flex items-center justify-center text-[#1A202C] hover:bg-slate-200 transition-all overflow-hidden",
                                        user?.photo && "border-2 border-[#0088cc]"
                                    )}
                                >
                                    {user && user.photo ? (
                                        <img
                                            src={getImageUrl(user.photo)}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <RiUser3Fill className="w-5 h-5" />
                                    )}
                                </Link>
                            </div>
                        </div>

                        {/* Gap 2: 50px */}
                        <div className="w-[50px] flex-none"></div>

                        {/* Section 3: 230px (Post Free) */}
                        <div className="w-[230px] flex-none">
                            <Link
                                href="/dashboard/post-ad"
                                className="w-full bg-[#EDF2F7] border border-slate-400 shadow-sm text-black py-1.5 rounded text-sm uppercase tracking-widest flex items-center justify-center"
                            >
                                Post Free
                            </Link>
                        </div>
                        {/* Balancing Spacer */}
                        <div className="w-[70px] flex-none hidden lg:block"></div>
                    </div>
                </header>
            </div>

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
                    <Link
                        href="/dashboard/post-ad"
                        className="w-14 h-14 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-7 h-7" />
                    </Link>
                </div>

                <Link
                    href="/dashboard/inbox"
                    onClick={handleMessageClick}
                    className="flex flex-col items-center gap-1 p-2 text-black hover:text-black relative"
                >
                    <div className="relative">
                        <Inbox className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0088cc] text-white text-[9px] flex items-center justify-center rounded-full border border-white">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] font-medium">{t('inbox')}</span>
                </Link>


                <Link
                    href="/dashboard/profile"
                    onClick={handleAccountClick}
                    className="flex flex-col items-center gap-1 p-2 text-black hover:text-black transition-all"
                >
                    <div className="w-6 h-6 rounded-full bg-[#EDF2F7] flex items-center justify-center overflow-hidden border border-[#0088cc]">
                        {user && user.photo ? (
                            <img
                                src={getImageUrl(user.photo)}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-6 h-6" />
                        )}
                    </div>
                    <span className="text-[10px] font-medium">{t('account')}</span>
                </Link>
            </nav>

            {/* Main Content Area - Full width scroller to show scrollbar on the far right edge of the screen */}
            <main
                id="main-dashboard-scroller"
                className="flex-1 w-full overflow-y-auto"
                onScroll={(e) => {
                    const scrollTop = e.currentTarget.scrollTop;
                    const clamped = Math.min(scrollTop, 64);
                    setHeaderOffset(clamped);
                    window.dispatchEvent(new CustomEvent('center-scroll', { detail: { offset: clamped } }));
                }}
            >
                <div className="max-w-[1320px] mx-auto px-4 pt-4">
                    {children}
                </div>
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
                                                            className="flex items-center gap-2 w-full text-left py-1.5 text-xs text-black hover:text-brand-600"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        >
                                                            {sub.image && (
                                                                <img
                                                                    src={getImageUrl(sub.image)}
                                                                    className="w-4 h-4 object-cover rounded shrink-0"
                                                                    alt=""
                                                                />
                                                            )}
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
                                                            className="flex items-center gap-2 w-full text-left py-1.5 text-xs text-black hover:text-brand-600"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        >
                                                            {sub.image && (
                                                                <img
                                                                    src={getImageUrl(sub.image)}
                                                                    className="w-4 h-4 object-cover rounded shrink-0"
                                                                    alt=""
                                                                />
                                                            )}
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
                onClose={() => {
                    setIsPostAdModalOpen(false);
                    setAdToEdit(null);
                    if (pathname === '/dashboard/post-ad') {
                        router.push('/dashboard');
                    }
                }}
                editAd={adToEdit}
                initialMobile={tempMobile} // Pass temp mobile
                onSuccess={(newAd) => {
                    setIsPostAdModalOpen(false);
                    // Dispatch custom event to tell Dashboard to refetch
                    window.dispatchEvent(new Event('refresh-ads'));

                    // Open Account Activity Modal and go to Post tab
                    setAccountModalInitialTab('Post');
                    setIsAccountModalOpen(true);

                    if (pathname === '/dashboard/post-ad') {
                        router.replace('/dashboard');
                    }
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
                    if (mobileEntryReason === 'report') {
                        setIsLoginModalOpen(false);
                        setSelectedAdForDetail(reportAd);
                        setShouldOpenReportAfterLogin(true);
                        window.dispatchEvent(new Event('auth-change'));
                        return;
                    }
                    // Navigate to profile or message after login by reloading with param
                    const url = new URL(window.location.href);
                    if (mobileEntryReason === 'message') {
                        url.searchParams.set('openMessageModal', 'true');
                    } else {
                        url.searchParams.set('openUsersProfile', 'true');
                    }
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
                        if (mobileEntryReason === 'report') {
                            setSelectedAdForDetail(reportAd);
                            setShouldOpenReportAfterLogin(true);
                            window.dispatchEvent(new Event('auth-change'));
                            return;
                        }
                        // Direct to profile or message
                        const url = new URL(window.location.href);
                        if (mobileEntryReason === 'message') {
                            url.searchParams.set('openMessageModal', 'true');
                        } else {
                            url.searchParams.set('openUsersProfile', 'true');
                        }
                        window.location.href = url.toString();

                    }
                }}

            />

            <MobileEntryModal
                isOpen={isMobileEntryModalOpen}
                onClose={() => {
                    setIsMobileEntryModalOpen(false);
                    if (pathname === '/dashboard/post-ad') {
                        router.push('/dashboard');
                    }
                }}
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
                    if (mobileEntryReason === 'report') {
                        setSelectedAdForDetail(reportAd);
                        setShouldOpenReportAfterLogin(true);
                        window.dispatchEvent(new Event('auth-change'));
                        return;
                    }
                    // Reload to refresh auth state and open profile or message
                    const url = new URL(window.location.href);
                    if (mobileEntryReason === 'message') {
                        url.searchParams.set('openMessageModal', 'true');
                    } else {
                        url.searchParams.set('openUsersProfile', 'true');
                    }
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
                    router.replace(`/dashboard${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
                }}
                userId={viewingUserId}
                onOpenPostAd={() => {
                    setIsAccountModalOpen(false);
                    setIsPostAdModalOpen(true);
                }}
                onEditAd={(ad) => {
                    setIsAccountModalOpen(false);
                    setAdToEdit(ad);
                    setIsPostAdModalOpen(true);
                }}
            />

            <AdDetailsModal
                isOpen={!!selectedAdForDetail}
                ad={selectedAdForDetail}
                onClose={() => {
                    setSelectedAdForDetail(null);
                    setShouldOpenReportAfterLogin(false);
                }}
                initialReportOpen={shouldOpenReportAfterLogin}
            />


            <MessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                onOpenChat={(ad, otherUser) => {
                    setIsMessageModalOpen(false);
                    setChatAd(ad);
                    setChatOtherUser(otherUser);
                    setIsChatMessageModalOpen(true);
                }}
            />

            <ChatMessageModal
                isOpen={isChatMessageModalOpen}
                onClose={() => {
                    setIsChatMessageModalOpen(false);
                    fetchUnreadCount();
                }}
                onBack={() => {
                    setIsChatMessageModalOpen(false);
                    setIsMessageModalOpen(true);
                }}
                ad={chatAd}
                otherUser={chatOtherUser}
            />

            <InfoModal
                isOpen={infoModal.isOpen}
                onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
                title={infoModal.title}
                content={infoModal.content}
            />


        </div>
    );
}
