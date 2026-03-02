"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Home, CheckCircle2, Store, Smartphone, Grid, Package, ChevronDown, ChevronRight,
    Search, MapPin, Menu, X, Plus, Inbox, User, Globe, Clock, Eye, ArrowRight, ArrowUp, SlidersHorizontal, Bookmark
} from 'lucide-react';
import { RiCheckboxCircleFill } from 'react-icons/ri';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
import { API_BASE_URL } from '../../utils/apiConfig';
import { useLanguage } from '../context/LanguageContext';
import { timeAgo } from '../../utils/timeAgo';
import { getImageUrl } from '../../utils/imageUrl';
import Image from 'next/image';
import LatestFreeAdPromo from '../../components/LatestFreeAdPromo';
import AdDetailsModal from '../../components/AdDetailsModal';
import FilterModal, { FilterState } from '../../components/FilterModal';
import Cookies from 'js-cookie';
import { useSettings } from '../context/SettingsContext';

const VerifiedBadge = () => (
    <div className="relative group/badge flex items-center justify-center -mt-0.5">
        <RiCheckboxCircleFill className="w-4 h-4 text-[#0088cc] shrink-0 cursor-pointer" />
        <div className="absolute bottom-full left-1/2 -translate-x-[20%] lg:-translate-x-1/2 mb-2 hidden group-hover/badge:block w-[220px] sm:w-[240px] bg-slate-50 border border-slate-200 shadow-xl rounded-xl p-3 z-[100] animate-in fade-in zoom-in-95 duration-200 pointer-events-none text-left">
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed whitespace-normal">
                <span className="font-bold text-black">Verified</span> by mobile number & additional checks to ensure authenticity.
            </p>
            <div className="absolute top-full left-[20%] lg:left-1/2 -translate-x-1/2 -mt-[1px]">
                <div className="w-3 h-3 bg-slate-50 border-b border-r border-slate-200 transform rotate-45" />
            </div>
        </div>
    </div>
);

interface SubItem {
    _id: string;
    name: string;
    slug: string;
}

interface Category {
    _id: string;
    name: string;
    icon?: string; // Changed from photo
    subcategories: SubItem[];
}

interface Location {
    _id: string;
    name: string;
    image?: string; // Changed from photo
    subLocations: SubItem[];
}

interface ActiveAd {
    _id: string;
    headline: string;
    description: string;
    images: string[];
    price?: number;
    category: string;
    subCategory?: string;
    location: string;
    subLocation?: string;
    user: {
        _id: string;
        name: string;
        storeName?: string;
        photo?: string;
        verifiedBy?: string;
        mVerified?: boolean;
    };
    deliveryCount: number;
    createdAt: string;
    adType: 'Free' | 'Promoted';
}

interface PremiumUser {
    _id: string;
    name: string;
    storeName?: string;
    photo?: string;
    merchantType?: 'Premium';
    verifiedBy?: string;
    mVerified?: boolean;
    hasPromotedAds?: boolean;
    profileViews?: number;
    isFollowing?: boolean;
}

export default function DashboardClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();
    const { settings } = useSettings();

    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([]);
    const [ads, setAds] = useState<ActiveAd[]>([]);
    const [totalAds, setTotalAds] = useState<ActiveAd[]>([]);
    const [loading, setLoading] = useState(true);

    const [expandedCategory, setExpandedCategory] = useState<string | null>('main');
    const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
    const [activeSelectorTab, setActiveSelectorTab] = useState<'category' | 'location'>('category');
    const [showLocationFilter, setShowLocationFilter] = useState(false);
    const [selectedAd, setSelectedAd] = useState<ActiveAd | null>(null);
    const [headerOffset, setHeaderOffset] = useState(0);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        category: "",
        subCategory: "",
        location: "",
        subLocation: "",
        promoteTag: "All",
        sort: "newest",
        search: ""
    });

    const [isViewingSavedSearch, setIsViewingSavedSearch] = useState(false);
    const [savedAdsData, setSavedAdsData] = useState<ActiveAd[]>([]);

    const openInfoModal = (type: 'about' | 'terms' | 'privacy' | 'contact' | 'safety') => {
        window.dispatchEvent(new CustomEvent('open-info-modal', { detail: { type } }));
    };

    useEffect(() => {
        const saved = localStorage.getItem('saved_search_ads');
        if (saved) {
            try {
                setSavedAdsData(JSON.parse(saved));
            } catch (e) {
                console.error("Error parsing saved ads", e);
            }
        }
    }, []);

    const handleSaveSearch = () => {
        if (savedAdsData.length === 0) {
            localStorage.setItem('saved_search_ads', JSON.stringify(ads));
            setSavedAdsData(ads);
            setIsViewingSavedSearch(false);
        } else if (!isViewingSavedSearch) {
            setIsViewingSavedSearch(true);
        } else {
            setIsViewingSavedSearch(false);
        }
    };

    const handleResetSavedSearch = React.useCallback(() => {
        setIsViewingSavedSearch(false);
        setSavedAdsData([]);
        localStorage.removeItem('saved_search_ads');
    }, []);

    const createSlug = (text: string) => {
        if (!text) return "";
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\u0980-\u09FF\w-]+/g, '') // Remove all non-word chars (keeping Bangla range)
            .replace(/--+/g, '-')     // Replace multiple - with single -
            .replace(/^-+/, '')       // Trim - from start of text
            .replace(/-+$/, '');      // Trim - from end of text
    };

    const getAdUrl = (ad: any) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('ad', `${createSlug(ad.headline)}--${ad._id}`);
        return `?${params.toString()}`;
    };

    const getCategoryUrl = (catName: string, subCatName: string = "") => {
        const params = new URLSearchParams(searchParams.toString());
        if (catName) params.set('category', catName); else params.delete('category');
        if (subCatName) params.set('subCategory', subCatName); else params.delete('subCategory');
        const str = params.toString();
        return str ? `/dashboard?${str}` : '/dashboard';
    };

    const getLocationUrl = (locName: string, subLocName: string = "") => {
        const params = new URLSearchParams(searchParams.toString());
        if (locName) params.set('location', locName); else params.delete('location');
        if (subLocName) params.set('subLocation', subLocName); else params.delete('subLocation');
        const str = params.toString();
        return str ? `/dashboard?${str}` : '/dashboard';
    };

    // Initialize filters from URL on mount
    useEffect(() => {

        const urlCategory = searchParams.get('category');
        const urlSubCategory = searchParams.get('subCategory');
        const urlLocation = searchParams.get('location');
        const urlSubLocation = searchParams.get('subLocation');
        const urlSearch = searchParams.get('search');

        const currentFilters = {
            category: urlCategory || "",
            subCategory: urlSubCategory || "",
            location: urlLocation || "",
            subLocation: urlSubLocation || "",
            search: urlSearch || ""
        };

        // Only update state if values actually changed to avoid cycles
        if (
            currentFilters.category !== filters.category ||
            currentFilters.subCategory !== filters.subCategory ||
            currentFilters.location !== filters.location ||
            currentFilters.subLocation !== filters.subLocation ||
            currentFilters.search !== filters.search
        ) {
            setFilters(prev => ({
                ...prev,
                ...currentFilters
            }));

            // Handle sidebar expansion
            if (currentFilters.category && categories.length > 0) {
                const cat = categories.find(c => c.name === currentFilters.category);
                if (cat) setExpandedCategory(cat._id);
            }
            if (currentFilters.location && locations.length > 0) {
                const loc = locations.find(l => l.name === currentFilters.location);
                if (loc) setExpandedLocation(loc._id);
            }
        }
    }, [searchParams, categories.length, locations.length]);

    // Update URL when filters change
    const isInitialMount = useRef(true);
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const params = new URLSearchParams();
        if (filters.category) params.set('category', filters.category);
        if (filters.subCategory) params.set('subCategory', filters.subCategory);
        if (filters.location) params.set('location', filters.location);
        if (filters.subLocation) params.set('subLocation', filters.subLocation);
        if (filters.search) params.set('search', filters.search);

        // Keep the ad param if it exists
        const adParam = searchParams.get('ad');
        if (adParam) params.set('ad', adParam);

        const queryString = params.toString();
        const newUrl = queryString ? `/dashboard?${queryString}` : '/dashboard';

        const currentQuery = searchParams.toString();
        if (queryString !== currentQuery) {
            router.push(newUrl, { scroll: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, router]);

    // Effect to handle URL-based modal opening
    useEffect(() => {
        const adParam = searchParams.get('ad');
        if (adParam) {
            // Extract ID from slug--ID format if present
            const idMatch = adParam.match(/--([a-f\d]{24})$/i);
            const adId = idMatch ? idMatch[1] : adParam;

            // Always fetch to increment views and get fresh data
            fetch(`${API_BASE_URL}/api/ads/public/${adId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setSelectedAd(data.data);
                    } else {
                        // Fallback to local data if fetch fails
                        const foundAd = ads.find(a => a._id === adId);
                        if (foundAd) setSelectedAd(foundAd);
                    }
                })
                .catch(err => {
                    console.error("Error fetching specific ad:", err);
                    const foundAd = ads.find(a => a._id === adId);
                    if (foundAd) setSelectedAd(foundAd);
                });
        } else {
            setSelectedAd(null);
        }
    }, [searchParams, ads]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };
    // I will stack them: Categories first, then Locations.

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.subCategory) params.append('subCategory', filters.subCategory);
            if (filters.location) params.append('location', filters.location);
            if (filters.subLocation) params.append('subLocation', filters.subLocation);
            if (filters.promoteTag && filters.promoteTag !== 'All') params.append('promoteTag', filters.promoteTag);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.search) params.append('search', filters.search);

            const [catRes, subCatRes, locRes, subLocRes, adsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/categories`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/categories/sub`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/locations`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/locations/sub`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/ads/public/all?${params.toString()}`).then(res => res.json()),
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

            if (adsRes.success) {
                // Filter ads by session repeat view limit
                const limit = settings.userRepeatAdViewTime || 0;
                let filteredAds = adsRes.data;

                if (limit > 0) {
                    const sessionViews = JSON.parse(sessionStorage.getItem('ad_session_views') || '{}');
                    filteredAds = adsRes.data.filter((ad: ActiveAd) => {
                        const views = sessionViews[ad._id] || 0;
                        return views < limit;
                    });

                    // Count this delivery/view for the remaining ads
                    filteredAds.forEach((ad: ActiveAd) => {
                        sessionViews[ad._id] = (sessionViews[ad._id] || 0) + 1;
                    });
                    sessionStorage.setItem('ad_session_views', JSON.stringify(sessionViews));
                }

                setAds(filteredAds);
            }
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [language, filters]);

    const fetchInitialData = React.useCallback(async () => {
        try {
            const allAdsRes = await fetch(`${API_BASE_URL}/api/ads/public/all`).then(res => res.json());

            if (allAdsRes.success) {
                const allAdsData = allAdsRes.data;
                setTotalAds(allAdsData);

                // 1. Get unique users from all ads
                const userMap = new Map<string, PremiumUser>();
                allAdsData.forEach((ad: ActiveAd) => {
                    if (!ad.user?._id) return;
                    if (!userMap.has(ad.user._id)) {
                        userMap.set(ad.user._id, {
                            _id: ad.user._id,
                            name: ad.user.name,
                            photo: ad.user.photo,
                            storeName: ad.user.storeName,
                            verifiedBy: ad.user.verifiedBy,
                            mVerified: ad.user.mVerified,
                            hasPromotedAds: false
                        });
                    }
                    if (ad.adType === 'Promoted') {
                        const u = userMap.get(ad.user._id);
                        if (u) u.hasPromotedAds = true;
                    }
                });

                // 2. Separate promoted and free sellers
                const sellers = Array.from(userMap.values());
                const promotedSellers = sellers.filter(s => s.hasPromotedAds);
                const freeSellers = sellers.filter(s => !s.hasPromotedAds);

                // 3. Shuffle both for randomness
                const shuffledPromoted = [...promotedSellers].sort(() => Math.random() - 0.5);
                const shuffledFree = [...freeSellers].sort(() => Math.random() - 0.5);

                // 4. Combine and take top 10
                const top10Sellers = [...shuffledPromoted, ...shuffledFree].slice(0, 10);

                // 5. Check following status if logged in
                const token = Cookies.get('token');
                if (token) {
                    try {
                        const meRes = await fetch(`${API_BASE_URL}/api/user/me`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const meData = await meRes.json();
                        if (meRes.ok && meData.following) {
                            top10Sellers.forEach(u => {
                                u.isFollowing = meData.following.includes(u._id);
                            });
                        }
                    } catch (e) { }
                }

                setPremiumUsers(top10Sellers);
            }
        } catch (error) {
            console.error("Failed to load initial data", error);
        }
    }, []);

    const handleProfileClick = async (userId: string) => {
        // Increment view count optimistically
        setPremiumUsers(prev => prev.map(u =>
            u._id === userId ? { ...u, profileViews: (u.profileViews || 0) + 1 } : u
        ));

        // Send to backend
        try {
            fetch(`${API_BASE_URL}/api/user/profile/${userId}/view`, { method: 'POST' });
        } catch (e) { }

        // Open modal
        window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId } }));
    };

    const handleFollowUser = async (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        const token = Cookies.get('token');
        if (!token) {
            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/user/follow/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setPremiumUsers(prev => prev.map(u =>
                    u._id === userId ? { ...u, isFollowing: data.isFollowing } : u
                ));
            }
        } catch (error) {
            console.error("Follow error", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchInitialData();

        const handleRefresh = () => {
            fetchData();
            fetchInitialData();
        };

        const handleSearch = (e: any) => {
            const query = e.detail?.query || "";
            setFilters(prev => ({ ...prev, search: query }));
        };

        window.addEventListener('refresh-ads', handleRefresh);
        window.addEventListener('show-search-results', handleSearch as EventListener);
        window.addEventListener('reset-saved-search', handleResetSavedSearch);
        return () => {
            window.removeEventListener('refresh-ads', handleRefresh);
            window.removeEventListener('show-search-results', handleSearch as EventListener);
            window.removeEventListener('reset-saved-search', handleResetSavedSearch);
        };
    }, [fetchData, handleResetSavedSearch]);

    const toggleCategory = (id: string) => {
        setExpandedCategory(expandedCategory === id ? 'main' : id);
    };

    const toggleLocation = (id: string) => {
        setExpandedLocation(expandedLocation === id ? null : id);
    };

    return (
        <div className="flex flex-col lg:flex-row items-start justify-center w-full">
            {/* Left Sidebar - 300px */}
            <div className="hidden lg:block w-[300px] flex-none sticky top-4 h-[calc(100vh-32px)] overflow-y-auto no-scrollbar pb-10">
                <div className="flex flex-col min-h-full space-y-4">
                    <div className="flex-1 space-y-4">
                        {/* 1. All Categories & Locations Card */}
                        <div className="bg-white rounded-lg overflow-hidden">
                            <div className="p-2 space-y-2">
                                {/* Categories Section */}
                                <div className="space-y-1">
                                    <div
                                        className="flex items-center justify-between group cursor-pointer"
                                        onClick={() => setExpandedCategory(expandedCategory === 'main' ? null : 'main')}
                                    >
                                        <h3 className="text-sm text-black">{t('category')}</h3>
                                        <ChevronDown className={cn("w-5 h-5 text-black group-hover:text-black transition-all", (expandedCategory === 'main' || expandedCategory !== null) && "rotate-180")} />
                                    </div>

                                    {expandedCategory !== null && (
                                        <div className="pl-1 space-y-1">
                                            <Link
                                                href={getCategoryUrl("")}
                                                scroll={false}
                                                className="block text-sm text-black ml-4 tracking-wider cursor-pointer hover:text-[#0088cc] transition-colors"
                                                onClick={() => {
                                                    setFilters({ ...filters, category: "", subCategory: "" });
                                                    handleResetSavedSearch();
                                                }}
                                            >
                                                {t('all_categories')}
                                            </Link>

                                            {categories.map((cat, idx) => {
                                                // Assign icons based on name or index to match image
                                                const CategoryIcon = idx === 0 ? Smartphone : (idx === 1 ? Grid : Package);

                                                return (
                                                    <div key={cat._id} className="space-y-1">
                                                        <Link
                                                            href={getCategoryUrl(cat.name)}
                                                            scroll={false}
                                                            className="flex items-center justify-between group cursor-pointer"
                                                            onClick={() => {
                                                                toggleCategory(cat._id);
                                                                setFilters({ ...filters, category: cat.name, subCategory: "" });
                                                                setActiveSelectorTab('category');
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-1 text-sm text-[#0088cc] font-medium hover:underline">
                                                                {cat.icon && getImageUrl(cat.icon) ? (
                                                                    <img
                                                                        src={getImageUrl(cat.icon) || undefined}
                                                                        className="w-4 h-4 object-cover shrink-0"
                                                                        alt=""
                                                                        loading="lazy"
                                                                    />
                                                                ) : (
                                                                    <CategoryIcon className="w-4 h-4 text-black shrink-0" />
                                                                )}
                                                                <span className={cn((expandedCategory === cat._id || filters.category === cat.name) && "text-black")}>{cat.name}</span>
                                                                <span className="text-black font-normal ml-0.5">({totalAds.filter(ad => ad.category === cat.name).length.toLocaleString()})</span>
                                                            </div>
                                                            {cat.subcategories.length > 0 && (
                                                                <ChevronDown className={cn("w-3.5 h-3.5 text-black transition-all", expandedCategory === cat._id && "rotate-180")} />
                                                            )}
                                                        </Link>

                                                        {/* Subcategories with correct indentation and bullet points */}
                                                        {
                                                            expandedCategory === cat._id && cat.subcategories.length > 0 && (
                                                                <div className="pl-6 space-y-1 border-l border-slate-100 ml-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    {cat.subcategories.map(sub => (
                                                                        <Link
                                                                            key={sub._id}
                                                                            href={getCategoryUrl(cat.name, sub.name)}
                                                                            scroll={false}
                                                                            className="flex items-center gap-1 text-sm text-[#0088cc] hover:underline cursor-pointer group"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setFilters({ ...filters, category: cat.name, subCategory: sub.name });
                                                                                setActiveSelectorTab('category');
                                                                            }}
                                                                        >
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#0088cc] transition-colors", filters.subCategory === sub.name && "bg-[#0088cc]")} />
                                                                            <span className={cn(filters.subCategory === sub.name && "text-black")}>{sub.name}</span>
                                                                            <span className="text-black">({totalAds.filter(ad => ad.subCategory === sub.name).length.toLocaleString()})</span>
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="h-[1px] bg-slate-100 w-full" />

                                {/* Location Section */}
                                <div className="">
                                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => setExpandedLocation(expandedLocation === 'main' ? null : 'main')}>
                                        <h3 className="text-sm text-black">{t('location')}</h3>
                                        <ChevronDown className={cn("w-5 h-5 text-black group-hover:text-black transition-all", expandedLocation !== null && "rotate-180")} />
                                    </div>

                                    {expandedLocation !== null && (
                                        <div className="pl-1 space-y-1">
                                            <Link
                                                href={getLocationUrl("")}
                                                scroll={false}
                                                className="block text-sm text-black ml-4 tracking-wider cursor-pointer hover:text-[#0088cc] transition-colors"
                                                onClick={() => {
                                                    setFilters({ ...filters, location: "", subLocation: "" });
                                                    handleResetSavedSearch();
                                                }}
                                            >
                                                {t('all_bangladesh')}
                                            </Link>

                                            {locations.map(loc => (
                                                <div key={loc._id} className="space-y-1">
                                                    <Link
                                                        href={getLocationUrl(loc.name)}
                                                        scroll={false}
                                                        className="flex items-center justify-between group cursor-pointer"
                                                        onClick={() => {
                                                            toggleLocation(loc._id);
                                                            setFilters({ ...filters, location: loc.name, subLocation: "" });
                                                            setActiveSelectorTab('location');
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1 text-sm text-[#0088cc] font-medium hover:underline">
                                                            <span className={cn((expandedLocation === loc._id || filters.location === loc.name) && "text-black")}>{loc.name}</span>
                                                            <span className="text-black font-normal ml-0.5">({totalAds.filter(ad => ad.location === loc.name).length.toLocaleString()})</span>
                                                        </div>
                                                        {loc.subLocations.length > 0 && (
                                                            <ChevronDown className={cn("w-3.5 h-3.5 text-black transition-all", expandedLocation === loc._id && "rotate-180")} />
                                                        )}
                                                    </Link>

                                                    {/* Dynamic Sub-locations matching image style */}
                                                    {expandedLocation === loc._id && loc.subLocations.length > 0 && (
                                                        <div className="pl-6 space-y-1 border-l border-slate-100 ml-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {loc.subLocations.map(sub => (
                                                                <Link
                                                                    key={sub._id}
                                                                    href={getLocationUrl(loc.name, sub.name)}
                                                                    scroll={false}
                                                                    className="flex items-center gap-1 text-sm text-[#0088cc] hover:underline cursor-pointer group"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFilters({ ...filters, location: loc.name, subLocation: sub.name });
                                                                        setActiveSelectorTab('location');
                                                                    }}
                                                                >
                                                                    <div className={cn("w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#0088cc] transition-colors", filters.subLocation === sub.name && "bg-[#0088cc]")} />
                                                                    <span className={cn(filters.subLocation === sub.name && "text-black")}>{sub.name}</span>
                                                                    <span className="text-black">({totalAds.filter(ad => ad.subLocation === sub.name).length.toLocaleString()})</span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. Filters Card */}
                        {/* <div className="bg-white rounded-lg p-3 space-y-2">
                    <h3 className="text-[15px] text-black">{t('filters')}</h3>

                    <div className="space-y-1.5">
                        <label className="text-[11px] text-black tracking-tight">{t('sort_by')}</label>
                        <div className="relative">
                            <select className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-black appearance-none outline-none focus:ring-1 focus:ring-slate-300">
                                <option>Date: Newest on top</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] text-black tracking-tight">{t('filter_by')}</label>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="filter" defaultChecked className="w-4 h-4 border-slate-300 text-[#0088cc] focus:ring-0" />
                                <span className="text-[13px] text-black group-hover:text-black transition-colors">{t('all')}</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="filter" className="w-4 h-4 border-slate-300 text-[#0088cc] focus:ring-0" />
                                <span className="text-[13px] text-black group-hover:text-black transition-colors">{t('promoted')}</span>
                            </label>
                        </div>
                    </div>
                </div> */}
                    </div>

                    {/* 3. Footer Links & Apps Card */}
                    <div className="bg-white rounded-lg p-3 space-y-4">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-black font-medium">
                            <button onClick={() => openInfoModal('about')} className="hover:text-black transition-colors">{t('about_us')}</button>
                            <span>•</span>
                            <button onClick={() => openInfoModal('terms')} className="hover:text-black transition-colors">{t('terms_and_con')}</button>
                            <span>•</span>
                            <button onClick={() => openInfoModal('privacy')} className="hover:text-black transition-colors">{t('privacy_policy')}</button>
                            <span>•</span>
                            <button onClick={() => openInfoModal('contact')} className="hover:text-black transition-colors">{t('contact_us')}</button>
                            <span>•</span>
                            <button onClick={() => openInfoModal('safety')} className="hover:text-black transition-colors">
                                {language === 'bn' ? 'নিরাপদ থাকুন' : 'Safety Tips'}
                            </button>
                            <span>•</span>
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { activeTab: 'Post' } }))}
                                className="hover:text-black transition-colors"
                            >
                                {t('promote')}
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            <p className="text-[12px] text-black">{t('get_our_app')}</p>
                            <div className="flex items-center gap-2">
                                <button className="w-9 h-9 bg-[#A4C639] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <Smartphone className="w-5 h-5 fill-white" />
                                </button>
                                <button className="w-9 h-9 bg-[#999999] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <Globe className="w-5 h-5" />
                                </button>
                                <button className="w-9 h-9 bg-[#999999] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <div className="text-lg font-bold">+</div>
                                </button>
                            </div>
                        </div>

                        {/* <div className="space-y-2.5 pt-2">
                        <p className="text-[12px] text-black">{t('get_more')}</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                <span className="text-[12px] text-black group-hover:text-black">{t('newsportal')}</span>
                            </div>
                            <div className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                <span className="text-[12px] text-black group-hover:text-black">{t('social_platform')}</span>
                            </div>
                        </div>
                    </div> */}
                    </div>
                </div>

            </div>

            {/* Gap 1: 50px */}
            <div className="hidden lg:block w-[50px] flex-none"></div>

            {/* Center Content - Feed / Ads: 565px */}
            <div
                id="center-feed-container"
                className="w-full lg:w-[565px] flex-none space-y-4 pb-32 lg:pb-20"
            >

                {/* Secondary Filter Bar */}
                <div className="bg-white rounded-lg flex divide-x divide-slate-100 overflow-hidden sticky top-4 z-30 shadow-sm">
                    <button
                        onClick={() => {
                            setIsFilterModalOpen(true);
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('open-filter-view', { detail: { view: 'category' } }));
                            }, 50);
                        }}
                        className="flex-1 px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors group"
                    >
                        <Grid className="w-5 h-5 text-black" />
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-black">{filters.category ? (filters.subCategory || filters.category) : (language === 'bn' ? 'ক্যাটাগরি' : 'Category')}</span>
                            {filters.category && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFilters(prev => ({ ...prev, category: "", subCategory: "" }));
                                    }}
                                    className="p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5 text-slate-500" />
                                </div>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => {
                            setIsFilterModalOpen(true);
                            setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('open-filter-view', { detail: { view: 'location' } }));
                            }, 100);
                        }}
                        className="flex-1 px-4 py-2.5 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors group"
                    >
                        <MapPin className="w-5 h-5 text-black" />
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-black">{filters.location ? (filters.subLocation || filters.location) : (language === 'bn' ? 'লোকেশন' : 'Location')}</span>
                            {filters.location && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFilters(prev => ({ ...prev, location: "", subLocation: "" }));
                                    }}
                                    className="p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5 text-slate-500" />
                                </div>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex-1 px-4 py-2.5 flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
                    >
                        <SlidersHorizontal className="w-5 h-5 text-black" />
                        <span className="text-sm text-black">{language === 'bn' ? 'ফিল্টার' : 'Filter'}</span>
                    </button>
                </div>

                {/* Category Selector Card */}
                <div className="bg-white rounded-lg overflow-hidden">
                    {/* Selector Header Tabs */}
                    <div className="px-5 pt-4 flex items-center justify-between border-b border-slate-50">
                        <div className="flex items-center gap-8">
                            <div
                                className="relative pb-2 cursor-pointer"
                                onClick={() => setActiveSelectorTab('category')}
                            >
                                <span className={cn(
                                    "text-[15px] transition-colors",
                                    activeSelectorTab === 'category' ? "text-black" : "text-black hover:text-black"
                                )}>
                                    Select Categorie
                                </span>
                                {activeSelectorTab === 'category' && (
                                    <div className="absolute -top-4 left-0 right-0 h-[3px] bg-blue-500 rounded-b-full" />
                                )}
                            </div>
                            <div
                                className="relative pb-2 cursor-pointer"
                                onClick={() => setActiveSelectorTab('location')}
                            >
                                <span className={cn(
                                    "text-[15px] transition-colors",
                                    activeSelectorTab === 'location' ? "text-black" : "text-black hover:text-black"
                                )}>
                                    Select Location
                                </span>
                                {activeSelectorTab === 'location' && (
                                    <div className="absolute -top-4 left-0 right-0 h-[3px] bg-blue-500 rounded-b-full" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Category/Location Bubbles */}
                    <div className="p-5 pt-0 flex items-center justify-between">
                        <div className="flex items-center gap-4 overflow-hidden">
                            {activeSelectorTab === 'category' ? (
                                [...categories]
                                    .sort((a, b) => (a.name === filters.category ? -1 : b.name === filters.category ? 1 : 0))
                                    .slice(0, 5)
                                    .map((cat) => (
                                        <Link
                                            key={cat._id}
                                            href={cat.name === filters.category ? getCategoryUrl("") : getCategoryUrl(cat.name)}
                                            scroll={false}
                                            className={cn(
                                                "flex flex-col items-center gap-2 flex-none group cursor-pointer",
                                                cat.name === filters.category && "relative"
                                            )}
                                            onClick={() => {
                                                const isSelected = cat.name === filters.category;
                                                setFilters({ ...filters, category: isSelected ? "" : cat.name, subCategory: "" });
                                                if (!isSelected) {
                                                    setExpandedCategory(cat._id);
                                                } else {
                                                    setExpandedCategory('main');
                                                }
                                            }}
                                        >
                                            <div className={cn(
                                                "w-[72px] h-[72px] rounded-full border-2 p-1 transition-all",
                                                cat.name === filters.category ? "border-[#0088cc] bg-blue-50" : "border-[#0088cc]/30"
                                            )}>
                                                <div className="w-full h-full rounded-full bg-blue-50 overflow-hidden flex items-center justify-center">
                                                    {cat.icon ? (
                                                        <img
                                                            src={getImageUrl(cat.icon) || undefined}
                                                            alt={cat.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={`https://placehold.co/100x100?text=${cat.name.charAt(0)}`}
                                                            alt={cat.name}
                                                            className="w-full h-full object-cover opacity-50"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-[11px] font-bold text-center max-w-[72px] truncate transition-colors",
                                                cat.name === filters.category ? "text-[#0088cc]" : "text-black"
                                            )}>{cat.name}</span>
                                        </Link>
                                    ))
                            ) : (
                                [...locations]
                                    .sort((a, b) => (a.name === filters.location ? -1 : b.name === filters.location ? 1 : 0))
                                    .slice(0, 5)
                                    .map((loc) => (
                                        <Link
                                            key={loc._id}
                                            href={loc.name === filters.location ? getLocationUrl("") : getLocationUrl(loc.name)}
                                            scroll={false}
                                            className={cn(
                                                "flex flex-col items-center gap-2 flex-none group cursor-pointer",
                                                loc.name === filters.location && "relative"
                                            )}
                                            onClick={() => {
                                                const isSelected = loc.name === filters.location;
                                                setFilters({ ...filters, location: isSelected ? "" : loc.name, subLocation: "" });
                                                if (!isSelected) {
                                                    setExpandedLocation(loc._id);
                                                } else {
                                                    setExpandedLocation(null);
                                                }
                                            }}
                                        >
                                            <div className={cn(
                                                "w-[72px] h-[72px] rounded-full border-2 p-1 transition-all",
                                                loc.name === filters.location ? "border-[#0088cc] bg-blue-50" : "border-[#0088cc]/30"
                                            )}>
                                                <div className="w-full h-full rounded-full bg-blue-50 overflow-hidden flex items-center justify-center">
                                                    {loc.image ? (
                                                        <img
                                                            src={getImageUrl(loc.image) || undefined}
                                                            alt={loc.name}
                                                            className="w-full h-full object-cover"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={`https://placehold.co/100x100?text=${loc.name.charAt(0)}`}
                                                            alt={loc.name}
                                                            className="w-full h-full object-cover opacity-50"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-[11px] font-bold text-center max-w-[72px] truncate transition-colors",
                                                loc.name === filters.location ? "text-[#0088cc]" : "text-black"
                                            )}>{loc.name}</span>
                                        </Link>
                                    ))
                            )}
                        </div>

                        {/* Arrow Button - Inline as the 6th item */}
                        {(activeSelectorTab === 'category' ? categories.length > 5 : locations.length > 5) && (
                            <button
                                onClick={scrollRight}
                                className="w-16 h-16 rounded-full bg-[#F4F4F4] flex items-center justify-center text-black hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all flex-none"
                            >
                                <ArrowRight className="w-6 h-6 stroke-[3]" />
                            </button>
                        )}
                    </div>
                </div>

                {!filters.category && !filters.location && !filters.search && filters.promoteTag === 'All' && <LatestFreeAdPromo />}

                {loading ? (
                    <div className="text-center py-20 pb-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
                        <p className="text-black text-sm">{t('loading_feed')}</p>
                    </div>
                ) : ads.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-black">
                        {/* Empty state content */}
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <Home className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="text-lg font-bold text-black">{t('no_ads_yet')}</h3>
                    </div>
                ) : (
                    (() => {
                        const displayAdsList = isViewingSavedSearch ? savedAdsData : ads;
                        // 2. Interleaved Chunking Logic (1 Big + 5 Promoted + 5 Free pattern)
                        const promotedPool = [...displayAdsList.filter(ad => ad.adType === 'Promoted')];
                        const freePool = [...displayAdsList.filter(ad => ad.adType !== 'Promoted')];
                        const chunks = [];

                        while (promotedPool.length > 0 || freePool.length > 0) {
                            const bigAd = promotedPool.shift() || freePool.shift();
                            const promotedSmall = promotedPool.splice(0, 5);
                            const freeSmall = freePool.splice(0, 5);
                            chunks.push({ bigAd, promotedSmall, freeSmall });
                        }

                        const categoriesWithAds = categories.filter(cat =>
                            ads.some(ad => ad.category === cat.name)
                        );

                        return (
                            <div className="space-y-1">
                                {/* Feed Header */}
                                <div className="flex items-center justify-between">
                                    {/* <div className="text-sm text-black flex items-center gap-1">
                                        <span className="border-slate-200">
                                            {filters.category ? (filters.subCategory || filters.category) : (language === 'bn' ? 'সব ক্যাটাগরি' : 'All Category')}
                                        </span>
                                        <span className="text-slate-500">{language === 'bn' ? 'বিজ্ঞাপন থেকে' : 'Ads From'}</span>
                                        <span className="border-slate-200">
                                            {filters.location ? (filters.subLocation || filters.location) : (language === 'bn' ? 'পুরো বাংলাদেশ' : 'All Bangladesh')}
                                        </span>
                                    </div> */}
                                    <div className="text-sm text-black flex items-center gap-1">
                                        <span>
                                            {language === 'bn'
                                                ? `${displayAdsList.length.toLocaleString('bn-BD')} টি বিজ্ঞাপন দেখছেন`
                                                : `Viewing ${displayAdsList.length.toLocaleString('en-US')} ads`}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleSaveSearch}
                                        className={cn(
                                            "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors",
                                            isViewingSavedSearch
                                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                                : "text-black bg-white border border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        <Bookmark
                                            className={cn(
                                                "w-3.5 h-3.5 transition-all",
                                                savedAdsData.length > 0 ? "fill-blue-600 text-blue-600" : "text-slate-400",
                                                isViewingSavedSearch && "fill-white text-white"
                                            )}
                                        />
                                        {savedAdsData.length === 0
                                            ? (language === 'bn' ? 'সেভ সার্চ' : 'Save Search')
                                            : !isViewingSavedSearch
                                                ? (language === 'bn' ? 'সেভ করা সার্চ দেখুন' : 'show saved search')
                                                : (language === 'bn' ? 'সেভ করা সার্চ দেখাচ্ছে' : 'Showing save searched')
                                        }
                                    </button>
                                </div>

                                {chunks.map((chunk, chunkIndex) => {
                                    const categoryToShow = categoriesWithAds[chunkIndex % categoriesWithAds.length];
                                    return (
                                        <div key={chunkIndex} className="flex flex-col gap-4">
                                            {/* Big Card */}
                                            {chunk.bigAd && (
                                                <Link
                                                    href={getAdUrl(chunk.bigAd)}
                                                    scroll={false}
                                                    className="bg-white rounded-xl cursor-pointer group block border border-slate-100 shadow-sm"
                                                >
                                                    <div className="relative h-[315px] w-full bg-black rounded-t-xl overflow-hidden">
                                                        {getImageUrl(chunk.bigAd.images?.[0]) && (
                                                            <img
                                                                src={getImageUrl(chunk.bigAd.images?.[0]) || undefined}
                                                                alt={chunk.bigAd.headline}
                                                                className="w-full h-full object-contain"
                                                                loading="lazy"
                                                            />
                                                        )}
                                                        <div className="absolute bottom-0 right-0 p-2">
                                                            <div className="bg-[#0088cc] p-1.5 rounded-tl-lg rounded-br-lg">
                                                                {settings.watermarkLogo ? (
                                                                    <img
                                                                        src={getImageUrl(settings.watermarkLogo)}
                                                                        alt="Watermark"
                                                                        className="w-4 h-4 object-contain"
                                                                    />
                                                                ) : (
                                                                    <User className="w-4 h-4 text-white" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-1 text-[11px] text-black mb-0.5">
                                                                    <span>{chunk.bigAd.adType === 'Promoted' ? 'Promoted By' : 'Post By'}</span>
                                                                    <span
                                                                        className="font-bold text-black cursor-pointer hover:text-blue-600 hover:underline"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId: chunk.bigAd?.user?._id } }));
                                                                        }}
                                                                    >
                                                                        {chunk.bigAd.user?.storeName || chunk.bigAd.user?.name || 'User'}
                                                                    </span>
                                                                    {chunk.bigAd.user?.mVerified && <VerifiedBadge />}
                                                                </div>
                                                                <h3 className="font-bold text-lg text-black leading-tight mb-0.5">{chunk.bigAd.headline}</h3>
                                                                <div className="font-bold text-base text-black mb-1">৳ {chunk.bigAd.price?.toLocaleString() || 'N/A'}</div>
                                                                <div className="flex items-center gap-3 text-[10px] text-black">
                                                                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-black" />{chunk.bigAd.location}</div>
                                                                    <div className="flex items-center gap-1"><Grid className="w-3 h-3 text-black" />{chunk.bigAd.category}</div>
                                                                </div>
                                                            </div>
                                                            <button className="border border-slate-300 text-black bg-gray-200 px-3 py-1 rounded text-xs font-bold hover:bg-slate-50">Detail</button>
                                                        </div>
                                                    </div>
                                                </Link>
                                            )}

                                            {/* Promoted Small Cards */}
                                            {chunk.promotedSmall.length > 0 && (
                                                <div className="flex flex-col gap-2 bg-white rounded-lg pb-2">
                                                    {chunk.promotedSmall.map((ad) => (
                                                        <Link
                                                            key={ad._id}
                                                            href={getAdUrl(ad)}
                                                            scroll={false}
                                                            className="bg-white rounded-lg p-3 pb-0 flex gap-2 cursor-pointer transition-colors hover:bg-slate-50"
                                                        >
                                                            <div className="w-[200px] h-[130px] bg-black rounded-lg overflow-hidden shrink-0 relative group-hover:bg-black transition-colors">
                                                                {getImageUrl(ad.images?.[0]) && (
                                                                    <img src={getImageUrl(ad.images?.[0]) || undefined} alt={ad.headline} className="w-full h-full object-contain" loading="lazy" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                <div className="flex items-center gap-1 text-[10px] text-black mb-0.5">
                                                                    <span>Promoted By</span>
                                                                    <span className="font-bold text-black hover:text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId: ad.user?._id } })); }}>{ad.user?.storeName || ad.user?.name || 'User'}</span>
                                                                    {ad.user?.mVerified && <VerifiedBadge />}
                                                                </div>
                                                                <h4 className="text-sm text-black truncate mb-0.5">{ad.headline}</h4>
                                                                <div className="text-sm text-black mb-1">৳ {ad.price?.toLocaleString() || 'N/A'}</div>
                                                                <div className="flex items-center gap-2 text-[10px] text-black">
                                                                    <div className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /><span className="truncate max-w-[80px]">{ad.location}</span></div>
                                                                    <div className="flex items-center gap-0.5"><Grid className="w-2.5 h-2.5" /><span className="truncate max-w-[80px]">{ad.category}</span></div>
                                                                    <div className="ml-auto text-black"></div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Free Small Cards */}
                                            {chunk.freeSmall.length > 0 && (
                                                <div className="flex flex-col gap-2 bg-white rounded-lg pb-2">
                                                    {chunk.freeSmall.map((ad) => (
                                                        <Link
                                                            key={ad._id}
                                                            href={getAdUrl(ad)}
                                                            scroll={false}
                                                            className="bg-white rounded-lg p-3 pb-0 flex gap-2 cursor-pointer transition-colors hover:bg-slate-50"
                                                        >
                                                            <div className="w-[200px] h-[130px] bg-black rounded-lg overflow-hidden shrink-0 relative group-hover:bg-black transition-colors">
                                                                {getImageUrl(ad.images?.[0]) && (
                                                                    <img src={getImageUrl(ad.images?.[0]) || undefined} alt={ad.headline} className="w-full h-full object-contain" loading="lazy" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                <div className="flex items-center gap-1 text-[10px] text-black mb-0.5">
                                                                    <span>Post By</span>
                                                                    <span className="font-bold text-black hover:text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId: ad.user?._id } })); }}>{ad.user?.storeName || ad.user?.name || 'User'}</span>
                                                                    {ad.user?.mVerified && <VerifiedBadge />}
                                                                </div>
                                                                <h4 className="text-sm text-black truncate mb-0.5">{ad.headline}</h4>
                                                                <div className="text-sm text-black mb-1">৳ {ad.price?.toLocaleString() || 'N/A'}</div>
                                                                <div className="flex items-center gap-2 text-[10px] text-black">
                                                                    <div className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /><span className="truncate max-w-[80px]">{ad.location}</span></div>
                                                                    <div className="flex items-center gap-0.5"><Grid className="w-2.5 h-2.5" /><span className="truncate max-w-[80px]">{ad.category}</span></div>
                                                                    <div className="ml-auto text-black">{timeAgo(ad.createdAt, language as 'en' | 'bn')}</div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Category Slider for this chunk */}
                                            {categoryToShow && (
                                                <div className="bg-white relative group/cat rounded-lg p-2 pb-0 mt-2">
                                                    <div className="bg-white flex items-center justify-between px-2 mb-2">
                                                        <h3 className="text-sm font-medium text-black">{categoryToShow.name}</h3>
                                                        <button
                                                            onClick={() => {
                                                                const params = new URLSearchParams(searchParams.toString());
                                                                params.set('category', categoryToShow.name);
                                                                router.push(`/dashboard?${params.toString()}`, { scroll: false });
                                                                setFilters(prev => ({ ...prev, category: categoryToShow.name }));
                                                            }}
                                                            className="text-xs text-black hover:underline"
                                                        >
                                                            {language === 'bn' ? 'সব দেখুন' : 'See All'}
                                                        </button>
                                                    </div>
                                                    <div className="relative">
                                                        <div
                                                            id={`feed-scroll-${categoryToShow._id}-${chunkIndex}`}
                                                            className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2"
                                                        >
                                                            {ads.filter(ad => ad.category === categoryToShow.name).map(ad => (
                                                                <div
                                                                    key={ad._id}
                                                                    className="min-w-[240px] w-[240px] bg-white border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                                                    onClick={() => router.push(getAdUrl(ad), { scroll: false })}
                                                                >
                                                                    <div className="h-40 bg-black relative">
                                                                        {getImageUrl(ad.images?.[0]) && (
                                                                            <img src={getImageUrl(ad.images?.[0]) || undefined} alt={ad.headline} className="w-full h-full object-contain" loading="lazy" />
                                                                        )}
                                                                    </div>
                                                                    <div className="p-2.5">
                                                                        <h4 className="text-black truncate text-sm mb-0.5">{ad.headline}</h4>
                                                                        <p className="text-black text-sm">TK {ad.price?.toLocaleString() || 'N/A'}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const el = document.getElementById(`feed-scroll-${categoryToShow._id}-${chunkIndex}`);
                                                                if (el) el.scrollBy({ left: 250, behavior: 'smooth' });
                                                            }}
                                                            className="absolute -right-3 top-[43%] -translate-y-1/2 w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-black z-20 border border-slate-100 hover:bg-slate-50"
                                                        >
                                                            <ChevronRight className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()
                )}



                <AdDetailsModal
                    isOpen={!!selectedAd}
                    onClose={() => {
                        setSelectedAd(null);
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('ad');
                        const queryString = params.toString();
                        router.push(queryString ? `/dashboard?${queryString}` : '/dashboard', { scroll: false });
                    }}
                    ad={selectedAd}
                />

                <FilterModal
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    categories={categories}
                    locations={locations}
                    initialFilters={filters}
                    onApply={(newFilters) => {
                        setFilters(newFilters);
                        setIsFilterModalOpen(false);

                        // Sync sidebar expansion
                        if (newFilters.category) {
                            const cat = categories.find(c => c.name === newFilters.category);
                            if (cat) setExpandedCategory(cat._id);
                        }
                        if (newFilters.location) {
                            const loc = locations.find(l => l.name === newFilters.location);
                            if (loc) setExpandedLocation(loc._id);
                        }
                    }}
                />
            </div>

            {/* Gap 2: 50px */}
            <div className="hidden lg:block w-[50px] flex-none relative self-stretch">
                <div className="sticky top-[85vh] pl-1">
                    <button
                        onClick={() => document.getElementById('main-dashboard-scroller')?.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="w-10 h-10 bg-[#0088cc] rounded-full shadow-md flex items-center justify-center hover:bg-[#0077b5] transition-colors"
                    >
                        <ArrowUp className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Right Sidebar - Popular Seller: 230px */}
            <div className="hidden lg:block w-[230px] flex-none sticky top-4 h-[calc(100vh-32px)] overflow-y-auto no-scrollbar pb-10 z-40">
                <div className="bg-white rounded-lg w-full">
                    <div className="p-3 pb-1">
                        <h3 className="text-sm text-black">{t('popular_seller')}</h3>
                    </div>

                    <div className="space-y-3 px-3 pb-3">
                        {premiumUsers.length === 0 ? (
                            <div className="py-8 text-center text-black text-sm italic">
                                <p>{t('no_premium_merchants')}</p>
                            </div>
                        ) : (
                            premiumUsers.map((user, idx) => (
                                <div key={user._id} className="flex gap-3">
                                    <div className="shrink-0 cursor-pointer" onClick={() => handleProfileClick(user._id)}>
                                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 bg-slate-50 relative group">
                                            {user.photo ? (
                                                <img
                                                    src={getImageUrl(user.photo) || undefined}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-black font-bold text-xl uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div
                                            className="flex items-center gap-1.5 leading-tight cursor-pointer group/name"
                                            onClick={() => handleProfileClick(user._id)}
                                        >
                                            <h4 className="font-bold text-black text-[15px] truncate group-hover/name:text-[#0088cc] transition-colors">
                                                {user.name.split(' ')[0]}
                                            </h4>
                                            {user.mVerified && <VerifiedBadge />}
                                        </div>
                                        <p className="text-[11px] text-black -mt-0.5">
                                            {user.profileViews || 0} {t('visited')}
                                        </p>
                                        <button
                                            onClick={(e) => handleFollowUser(e, user._id)}
                                            className={cn(
                                                "mt-1 flex items-center justify-center gap-1 px-3 py-1 border rounded-full text-[11px] font-bold transition-all w-fit",
                                                user.isFollowing
                                                    ? "bg-slate-100 text-black border-black"
                                                    : "border-black text-black hover:bg-slate-50 hover:border-slate-300"
                                            )}
                                        >
                                            {!user.isFollowing && <span className="text-base leading-none -mt-0.5">+</span>}
                                            {user.isFollowing ? t('Unfollow') : t('Follow')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Balancing Spacer: 70px (Legacy Left=350, Right=280, Diff=70) */}
            <div className="hidden lg:block w-[70px] flex-none" />
        </div >
    );
}
