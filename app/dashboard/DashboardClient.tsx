"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Home, CheckCircle2, Store, Smartphone, Grid, Package, ChevronDown, ChevronRight,
    Search, MapPin, Menu, X, Plus, Inbox, User, Globe, Clock, Eye, ArrowRight, ArrowUp, SlidersHorizontal
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
    subcategory?: string;
    location: string;
    subLocation?: string;
    user: {
        _id: string;
        name: string;
        storeName?: string;
        photo?: string;
        verifiedBy?: string;
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
    merchantType: 'Premium';
}

export default function DashboardClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();

    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([]);
    const [ads, setAds] = useState<ActiveAd[]>([]);
    const [loading, setLoading] = useState(true);

    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
    const [activeSelectorTab, setActiveSelectorTab] = useState<'category' | 'location'>('category');
    const [showLocationFilter, setShowLocationFilter] = useState(false);
    const [selectedAd, setSelectedAd] = useState<ActiveAd | null>(null);

    // Effect to handle URL-based modal opening
    useEffect(() => {
        const adId = searchParams.get('ad');
        if (adId) {
            // Check if ad is already available in the loaded list
            const foundAd = ads.find(a => a._id === adId);
            if (foundAd) {
                setSelectedAd(foundAd);
            } else {
                // Fetch specific ad if not in list (e.g. direct link)
                fetch(`${API_BASE_URL}/api/ads/public/${adId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setSelectedAd(data.data);
                        }
                    })
                    .catch(err => console.error("Error fetching specific ad:", err));
            }
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
            const [catRes, subCatRes, locRes, subLocRes, userRes, adsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/categories`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/categories/sub`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/locations`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/locations/sub`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/user/premium`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/ads/public/all`).then(res => res.json())
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

            if (userRes.success) setPremiumUsers(userRes.data);
            if (adsRes.success) setAds(adsRes.data);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [language]);

    useEffect(() => {
        fetchData();

        // Listen for refresh event from other components (like PostAdModal)
        window.addEventListener('refresh-ads', fetchData);
        return () => {
            window.removeEventListener('refresh-ads', fetchData);
        };
    }, [fetchData]);

    const toggleCategory = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    const toggleLocation = (id: string) => {
        setExpandedLocation(expandedLocation === id ? null : id);
    };

    return (
        <div className="h-full flex flex-col lg:flex-row items-start justify-center overflow-hidden">
            {/* Left Sidebar - 300px */}
            <div className="hidden lg:block w-[300px] flex-none h-full overflow-y-auto no-scrollbar space-y-4 pb-10">

                {/* 1. All Categories & Locations Card */}
                <div className="bg-white rounded-lg overflow-hidden">
                    <div className="p-2 space-y-2">
                        {/* Categories Section */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => setExpandedCategory(expandedCategory === 'main' ? null : 'main')}>
                                <h3 className="text-sm text-black">{t('all_categories')}</h3>
                                <ChevronDown className={cn("w-5 h-5 text-black group-hover:text-black transition-all", (expandedCategory === 'main' || expandedCategory !== null) && "rotate-180")} />
                            </div>

                            <div className="pl-1 space-y-1">
                                <h4 className="text-sm text-black ml-4 tracking-wider">{t('sell')}</h4>

                                {categories.map((cat, idx) => {
                                    // Assign icons based on name or index to match image
                                    const CategoryIcon = idx === 0 ? Smartphone : (idx === 1 ? Grid : Package);

                                    return (
                                        <div key={cat._id} className="space-y-1">
                                            <div
                                                className="flex items-center justify-between group cursor-pointer"
                                                onClick={() => toggleCategory(cat._id)}
                                            >
                                                <div className="flex items-center gap-1 text-sm text-[#0088cc] font-medium hover:underline">
                                                    {cat.icon && getImageUrl(cat.icon) ? (
                                                        <img
                                                            src={getImageUrl(cat.icon) || undefined}
                                                            className="w-4 h-4 object-cover shrink-0"
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <CategoryIcon className="w-4 h-4 text-black shrink-0" />
                                                    )}
                                                    <span className={cn(expandedCategory === cat._id && "font-bold text-black")}>{cat.name}</span>
                                                    <span className="text-black font-normal ml-0.5">({ads.filter(ad => ad.category === cat.name).length.toLocaleString()})</span>
                                                </div>
                                                {cat.subcategories.length > 0 && (
                                                    <ChevronDown className={cn("w-3.5 h-3.5 text-black transition-all", expandedCategory === cat._id && "rotate-180")} />
                                                )}
                                            </div>

                                            {/* Subcategories with correct indentation and bullet points */}
                                            {expandedCategory === cat._id && cat.subcategories.length > 0 && (
                                                <div className="pl-6 space-y-1 border-l border-slate-100 ml-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {cat.subcategories.map(sub => (
                                                        <div key={sub._id} className="flex items-center gap-1 text-sm text-[#0088cc] hover:underline cursor-pointer group">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#0088cc] transition-colors" />
                                                            <span>{sub.name}</span>
                                                            <span className="text-black">({ads.filter(ad => ad.subcategory === sub.name).length.toLocaleString()})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="pl-6 pt-2 space-y-1">
                                    <div className="text-sm font-medium text-black cursor-pointer hover:text-[#0088cc] transition-colors">{t('rent')}</div>
                                    <div className="text-sm font-medium text-black cursor-pointer hover:text-[#0088cc] transition-colors">{t('jobs')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[1px] bg-slate-100 w-full" />

                        {/* Location Section */}
                        <div className="">
                            <div className="flex items-center justify-between group cursor-pointer" onClick={() => setExpandedLocation(expandedLocation === 'main' ? null : 'main')}>
                                <h3 className="text-sm text-black">{t('location')}</h3>
                                <ChevronDown className={cn("w-5 h-5 text-black group-hover:text-black transition-all", (expandedLocation === 'main' || expandedLocation !== null) && "rotate-180")} />
                            </div>

                            <div className="pl-1 space-y-1">
                                <div className="text-sm text-black ml-4 tracking-wider cursor-pointer hover:text-[#0088cc] transition-colors">
                                    {t('all_bangladesh')}
                                </div>

                                {locations.map(loc => (
                                    <div key={loc._id} className="space-y-1">
                                        <div
                                            className="flex items-center justify-between group cursor-pointer"
                                            onClick={() => toggleLocation(loc._id)}
                                        >
                                            <div className="flex items-center gap-1 text-sm text-[#0088cc] font-medium hover:underline">
                                                <span className={cn(expandedLocation === loc._id && "font-bold text-black")}>{loc.name}</span>
                                                <span className="text-black font-normal ml-0.5">({ads.filter(ad => ad.location === loc.name).length.toLocaleString()})</span>
                                            </div>
                                            {loc.subLocations.length > 0 && (
                                                <ChevronDown className={cn("w-3.5 h-3.5 text-black transition-all", expandedLocation === loc._id && "rotate-180")} />
                                            )}
                                        </div>

                                        {/* Dynamic Sub-locations matching image style */}
                                        {expandedLocation === loc._id && loc.subLocations.length > 0 && (
                                            <div className="pl-6 space-y-1 border-l border-slate-100 ml-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                {loc.subLocations.map(sub => (
                                                    <div key={sub._id} className="flex items-center gap-1 text-sm text-[#0088cc] hover:underline cursor-pointer group">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#0088cc] transition-colors" />
                                                        <span>{sub.name}</span>
                                                        <span className="text-black">({ads.filter(ad => ad.subLocation === sub.name).length.toLocaleString()})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Filters Card */}
                <div className="bg-white rounded-lg p-3 space-y-2">
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
                </div>

                {/* 3. Footer Links & Apps Card */}
                <div className="bg-white rounded-lg p-3 space-y-4">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-black font-medium">
                        <Link href="/about" className="hover:text-black transition-colors">{t('about_us')}</Link>
                        <span>•</span>
                        <Link href="/terms" className="hover:text-black transition-colors">{t('terms_and_con')}</Link>
                        <span>•</span>
                        <Link href="/privacy" className="hover:text-black transition-colors">{t('privacy_policy')}</Link>
                        <Link href="/contact" className="hover:text-black transition-colors">{t('contact_us')}</Link>
                        <span>•</span>
                        <Link href="/promote" className="hover:text-black transition-colors">Promote</Link>
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

                    <div className="space-y-2.5 pt-2">
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
                    </div>
                </div>

            </div>

            {/* Gap 1: 50px */}
            <div className="hidden lg:block w-[50px] flex-none"></div>

            {/* Center Content - Feed / Ads: 565px */}
            <div id="center-feed-container" className="w-full lg:w-[565px] flex-none h-full overflow-y-auto no-scrollbar space-y-4 pb-24 lg:pb-10">

                {/* Secondary Filter Bar */}
                <div className="bg-white rounded-lg flex divide-x divide-slate-100 overflow-hidden sticky top-0 z-30 shadow-sm">
                    <button className="flex-1 px-4 py-2.5 flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                        <Grid className="w-5 h-5 text-black" />
                        <span className="text-sm text-black">Categorie</span>
                    </button>
                    <button className="flex-1 px-4 py-2.5 flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                        <MapPin className="w-5 h-5 text-black" />
                        <span className="text-sm text-black">Location</span>
                    </button>
                    <button className="flex-1 px-4 py-2.5 flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                        <SlidersHorizontal className="w-5 h-5 text-black" />
                        <span className="text-sm text-black">Filter</span>
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
                                categories.slice(0, 5).map((cat) => (
                                    <div key={cat._id} className="flex flex-col items-center gap-2 flex-none group cursor-pointer">
                                        <div className="w-[72px] h-[72px] rounded-full border-2 border-[#0088cc] p-1">
                                            <div className="w-full h-full rounded-full bg-blue-50 overflow-hidden flex items-center justify-center">
                                                {cat.icon ? (
                                                    <img
                                                        src={cat.icon.startsWith('data:') ? cat.icon : `${API_BASE_URL}${cat.icon.startsWith('/') ? '' : '/'}${cat.icon}`}
                                                        alt={cat.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={`https://placehold.co/100x100?text=${cat.name.charAt(0)}`}
                                                        alt={cat.name}
                                                        className="w-full h-full object-cover opacity-50"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold text-black group-hover:text-black text-center max-w-[72px] truncate">{cat.name}</span>
                                    </div>
                                ))
                            ) : (
                                locations.slice(0, 5).map((loc) => (
                                    <div key={loc._id} className="flex flex-col items-center gap-2 flex-none group cursor-pointer">
                                        <div className="w-[72px] h-[72px] rounded-full border-2 border-[#0088cc] p-1">
                                            <div className="w-full h-full rounded-full bg-blue-50 overflow-hidden flex items-center justify-center">
                                                {loc.image ? (
                                                    <img
                                                        src={loc.image.startsWith('data:') ? loc.image : `${API_BASE_URL}${loc.image.startsWith('/') ? '' : '/'}${loc.image}`}
                                                        alt={loc.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={`https://placehold.co/100x100?text=${loc.name.charAt(0)}`}
                                                        alt={loc.name}
                                                        className="w-full h-full object-cover opacity-50"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-bold text-black group-hover:text-black text-center max-w-[72px] truncate">{loc.name}</span>
                                    </div>
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

                <LatestFreeAdPromo />

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
                        // 1. Sort: Promoted First
                        const sortedAds = [...ads].sort((a, b) => {
                            if (a.adType === 'Promoted' && b.adType !== 'Promoted') return -1;
                            if (a.adType !== 'Promoted' && b.adType === 'Promoted') return 1;
                            return 0;
                        });

                        // 2. Chunking Logic (1 Big + 3 Small pattern)
                        const chunks = [];
                        for (let i = 0; i < sortedAds.length; i += 4) {
                            chunks.push(sortedAds.slice(i, i + 4));
                        }

                        return (
                            <div className="space-y-1">
                                {/* Feed Header */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-black">
                                        <span className="text-black">All Category</span> Ads From <span className="text-black">All Bangladesh</span>
                                    </div>
                                    <button className="flex items-center gap-1.5 text-xs text-black px-3 py-1.5 rounded-full">
                                        <div className="w-2.5 h-2.5 rounded-full border-2 border-[#0088cc]"></div>
                                        Save Search
                                    </button>
                                </div>

                                {chunks.map((chunk, chunkIndex) => (
                                    <div key={chunkIndex} className="flex flex-col gap-4">

                                        {/* Big Card (First item of chunk) */}
                                        {chunk[0] && (
                                            <div
                                                className="bg-white rounded-xl overflow-hidden cursor-pointer group"
                                                onClick={() => router.push(`?ad=${chunk[0]._id}`, { scroll: false })}
                                            >
                                                {/* Image */}
                                                <div className="relative h-[315px] w-full bg-slate-900">
                                                    {getImageUrl(chunk[0].images?.[0]) && (
                                                        <img
                                                            src={getImageUrl(chunk[0].images?.[0]) || undefined}
                                                            alt={chunk[0].headline}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    )}
                                                    {/* Corner Icon */}
                                                    <div className="absolute bottom-0 right-0 p-2">
                                                        <div className="bg-[#0088cc] p-1.5 rounded-tl-lg rounded-br-lg">
                                                            <User className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-3">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-1 text-[11px] text-black mb-0.5">
                                                                <span>{chunk[0].adType === 'Promoted' ? 'Promoted By' : 'Post By'}</span>
                                                                <span className="font-bold text-black">{chunk[0].user?.name || 'User'}</span>
                                                                {/* {premiumUsers.some((u: any) => u._id === chunk[0].user?._id && u.merchantType === 'Premium') && (
                                                                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                                                )} */}
                                                            </div>
                                                            <h3 className="font-bold text-lg text-black leading-tight mb-0.5">
                                                                {chunk[0].headline}
                                                            </h3>
                                                            <div className="font-bold text-base text-black mb-1">
                                                                $ {chunk[0].price?.toLocaleString() || 'N/A'}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-[10px] text-black">
                                                                <div className="flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3 text-black" />
                                                                    {chunk[0].location}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Grid className="w-3 h-3 text-black" />
                                                                    {chunk[0].category}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button className="border border-slate-300 text-black bg-gray-200 px-3 py-1 rounded text-xs font-bold hover:bg-slate-50">
                                                            Detail
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Small Cards Wrapper (Next 3 items) */}
                                        {chunk.length > 1 && (
                                            <div className="flex flex-col gap-2 bg-white rounded-lg pb-2">
                                                {chunk.slice(1).map((ad) => (
                                                    <div
                                                        key={ad._id}
                                                        className="bg-white rounded-lg p-3 pb-0 flex gap-2 cursor-pointer"
                                                        onClick={() => router.push(`?ad=${ad._id}`, { scroll: false })}
                                                    >
                                                        {/* Image */}
                                                        <div className="w-[200px] h-[130px] bg-slate-900 rounded-lg overflow-hidden shrink-0 relative group-hover:bg-black transition-colors">
                                                            {getImageUrl(ad.images?.[0]) && (
                                                                <img
                                                                    src={getImageUrl(ad.images?.[0]) || undefined}
                                                                    alt={ad.headline}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            <div className="flex items-center gap-1 text-[10px] text-black mb-0.5">
                                                                <span>{ad.adType === 'Promoted' ? 'Promoted By' : 'Post By'}</span>
                                                                <span className="font-bold text-black">{ad.user?.name || 'User'}</span>
                                                                {/* {premiumUsers.some((u: any) => u._id === ad.user?._id && u.merchantType === 'Premium') && (
                                                                    <CheckCircle2 className="w-2.5 h-2.5 text-blue-500" />
                                                                )} */}
                                                            </div>
                                                            <h4 className="text-sm text-black truncate mb-0.5">{ad.headline}</h4>
                                                            <div className="text-sm text-black mb-1">
                                                                $ {ad.price?.toLocaleString() || 'N/A'}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-black">
                                                                <div className="flex items-center gap-0.5">
                                                                    <MapPin className="w-2.5 h-2.5" />
                                                                    <span className="truncate max-w-[80px]">{ad.location}</span>
                                                                </div>
                                                                <div className="flex items-center gap-0.5">
                                                                    <Grid className="w-2.5 h-2.5" />
                                                                    <span className="truncate max-w-[80px]">{ad.category}</span>
                                                                </div>
                                                                <div className="ml-auto text-black">
                                                                    {timeAgo(ad.createdAt, language as 'en' | 'bn')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                    </div>
                                ))}
                            </div>
                        );
                    })()
                )}

                {/* Category Based Ads Section */}
                {(() => {
                    const [visibleCategoryCount, setVisibleCategoryCount] = React.useState(1);
                    const categoriesWithAds = categories.filter(cat =>
                        ads.some(ad => ad.category === cat.name)
                    );
                    const visibleCategories = categoriesWithAds.slice(0, visibleCategoryCount);

                    return (
                        <div className="mt-2 space-y-2">
                            {visibleCategories.map(cat => {
                                const categoryAds = ads.filter(ad => ad.category === cat.name);
                                return (
                                    <div key={cat._id} className="bg-white relative group/cat rounded-lg p-2 pb-0">
                                        <div className="bg-white flex items-center justify-between px-2 mb-2">
                                            <h3 className="text-sm font-medium text-black">{cat.name}</h3>
                                            <button className="text-xs text-black ">See All</button>
                                        </div>

                                        <div className="relative">
                                            <div
                                                id={`scroll-${cat._id}`}
                                                className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth"
                                            >
                                                {categoryAds.map(ad => (
                                                    <div
                                                        key={ad._id}
                                                        className="min-w-[240px] w-[240px] bg-white border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                                        onClick={() => router.push(`?ad=${ad._id}`, { scroll: false })}
                                                    >
                                                        <div className="h-40 bg-slate-100 relative">
                                                            {getImageUrl(ad.images?.[0]) && (
                                                                <img
                                                                    src={getImageUrl(ad.images?.[0]) || undefined}
                                                                    alt={ad.headline}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="p-2.5">
                                                            <h4 className="text-black truncate text-sm mb-0.5">{ad.headline}</h4>
                                                            <p className="text-black text-sm">TK {ad.price?.toLocaleString() || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Right Scroll Button - Fixed & Always Visible */}
                                            {categoryAds.length > 2 && (
                                                <button
                                                    onClick={() => {
                                                        const el = document.getElementById(`scroll-${cat._id}`);
                                                        if (el) el.scrollBy({ left: 250, behavior: 'smooth' });
                                                    }}
                                                    className="absolute -right-3 top-[40%] -translate-y-1/2 w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-black z-20 border border-slate-100 hover:bg-slate-50 opacity-100"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {visibleCategoryCount < categoriesWithAds.length && (
                                <div className="pt-2">
                                    <button
                                        onClick={() => setVisibleCategoryCount(prev => prev + 1)}
                                        className="w-full flex items-center justify-center gap-2 bg-white py-3 rounded-lg"
                                    >
                                        <div className="w-4 h-4 rounded-full bg-white border border-black flex items-center justify-center">
                                            <ChevronRight className="w-3 h-3 text-black" />
                                        </div>
                                        <span className="text-black font-medium text-sm">Load More</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })()}

                <AdDetailsModal
                    isOpen={!!selectedAd}
                    onClose={() => {
                        setSelectedAd(null);
                        router.push('/dashboard', { scroll: false });
                    }}
                    ad={selectedAd}
                />
            </div>

            {/* Gap 2: 50px */}
            <div className="hidden lg:block w-[50px] flex-none relative self-stretch">
                <div className="sticky top-[82vh] pl-1">
                    <button
                        onClick={() => document.getElementById('center-feed-container')?.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="w-10 h-10 bg-[#0088cc] rounded-full shadow-md flex items-center justify-center hover:bg-[#0077b5] transition-colors"
                    >
                        <ArrowUp className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Right Sidebar - Popular Seller: 230px */}
            <div className="hidden lg:block w-[230px] flex-none h-full overflow-y-auto no-scrollbar pb-10">
                <div className="bg-white rounded-lg overflow-hidden w-full">
                    <div className="p-3 pb-1">
                        <h3 className="text-base text-black">{t('popular_seller')}</h3>
                    </div>

                    <div className="space-y-3 px-3 pb-3">
                        {premiumUsers.length === 0 ? (
                            <div className="py-8 text-center text-black text-sm italic">
                                <p>{t('no_premium_merchants')}</p>
                            </div>
                        ) : (
                            premiumUsers.map((user, idx) => (
                                <div key={user._id} className="flex gap-3">
                                    <div className="shrink-0 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId: user._id } }))}>
                                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 bg-slate-50 relative group">
                                            {user.photo ? (
                                                <img
                                                    src={user.photo}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-black font-bold text-xl uppercase">
                                                    {user.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex items-center gap-1.5 leading-tight">
                                            <h4 className="font-bold text-black text-[15px] truncate">
                                                {user.name.split(' ')[0]}
                                            </h4>
                                            <RiCheckboxCircleFill className="w-4 h-4 text-[#0088cc] shrink-0" />
                                        </div>
                                        <p className="text-[11px] text-black -mt-0.5">
                                            {7000 + (idx * 137)} {t('visited')}
                                        </p>
                                        <button className="mt-1 flex items-center justify-center gap-1 px-3 py-1 border border-slate-200 rounded-full text-[11px] font-bold text-black hover:bg-slate-50 hover:border-slate-300 transition-all w-fit">
                                            <span className="text-base leading-none -mt-0.5">+</span>
                                            {t('follow')}
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
