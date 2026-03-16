"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Home, CheckCircle2, Store, Smartphone, Grid, Package, ChevronDown, ChevronRight, ChevronLeft,
    Search, MapPin, Menu, X, Plus, Inbox, User, Globe, Clock, Eye, ArrowRight, ArrowLeft, ArrowUp, SlidersHorizontal, Bookmark
} from 'lucide-react';
import { FaAndroid, FaFacebookF, FaTiktok, FaInstagram, FaYoutube } from 'react-icons/fa';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import VerifiedBadge from '../../components/VerifiedBadge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
import { API_BASE_URL } from '../../utils/apiConfig';
import { useLanguage } from '../context/LanguageContext';
import { timeAgo } from '../../utils/timeAgo';
import { getImageUrl } from '../../utils/imageUrl';
import { getNonHighlightLabels, hasHighlightLabel } from '../../utils/labels';
import Image from 'next/image';
import LatestFreeAdPromo from '../../components/LatestFreeAdPromo';
import AdDetailsModal from '../../components/AdDetailsModal';
import FilterModal, { FilterState } from '../../components/FilterModal';
import Cookies from 'js-cookie';
import { useSettings } from '../context/SettingsContext';

interface SubItem {
    _id: string;
    name: string;
    slug: string;
    image?: string;
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
        followers?: any[];
    };

    deliveryCount: number;
    createdAt: string;
    adType: 'Free' | 'Promoted';
    promoteTag?: string;
    promoteType?: 'call_msg' | 'traffic';
    trafficLink?: string;
    trafficButtonType?: string;
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
    followers?: any[];
    isFollowing?: boolean;
}


export default function DashboardClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();
    const { settings } = useSettings();

    const getFiltersFromSearchParams = (): FilterState => {
        const urlCategory = searchParams.get('category');
        const urlSubCategory = searchParams.get('subCategory');
        const urlLocation = searchParams.get('location');
        const urlSubLocation = searchParams.get('subLocation');
        const urlSearch = searchParams.get('search');

        return {
            category: urlCategory || "",
            subCategory: urlSubCategory || "",
            location: urlLocation || "",
            subLocation: urlSubLocation || "",
            search: urlSearch || "",
            promoteTag: searchParams.get('promoteTag') || "All",
            sort: searchParams.get('sort') || "newest"
        };
    };

    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([]);
    const [ads, setAds] = useState<ActiveAd[]>([]);
    const [totalAds, setTotalAds] = useState<ActiveAd[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [feedAdsCategories, setFeedAdsCategories] = useState<any[]>([]);

    const [expandedCategory, setExpandedCategory] = useState<string | null>('main');
    const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
    const [activeSelectorTab, setActiveSelectorTab] = useState<'category' | 'location'>('category');
    const [showLocationFilter, setShowLocationFilter] = useState(false);
    const [selectedAd, setSelectedAd] = useState<ActiveAd | null>(null);
    const [headerOffset, setHeaderOffset] = useState(0);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>(() => getFiltersFromSearchParams());

    const [isViewingSavedSearch, setIsViewingSavedSearch] = useState(false);
    const [savedAdsData, setSavedAdsData] = useState<ActiveAd[]>([]);

    const hasFetchedMetaRef = useRef(false);
    const seenAdIdsRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        seenAdIdsRef.current = new Set(ads.map(a => a._id));
    }, [ads]);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = React.useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 2);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            // Initial check after items render
            const timer = setTimeout(checkScroll, 500);
            return () => {
                el.removeEventListener('scroll', checkScroll);
                clearTimeout(timer);
            };
        }
    }, [categories, locations, activeSelectorTab, checkScroll]);

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
        params.set('ad', ad._id);
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
        const currentFilters = getFiltersFromSearchParams();

        // Only update state if values actually changed to avoid cycles
        if (
            currentFilters.category !== filters.category ||
            currentFilters.subCategory !== filters.subCategory ||
            currentFilters.location !== filters.location ||
            currentFilters.subLocation !== filters.subLocation ||
            currentFilters.search !== filters.search ||
            currentFilters.promoteTag !== filters.promoteTag ||
            currentFilters.sort !== filters.sort
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
    }, [searchParams, categories.length, locations.length, filters, categories, locations]);

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
        if (filters.promoteTag && filters.promoteTag !== 'All') params.set('promoteTag', filters.promoteTag);
        if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort);

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
                        const ad = data.data;
                        if (ad.promoteType === 'traffic' && ad.trafficLink) {
                            const directLink = ad.trafficLink.startsWith('http') ? ad.trafficLink : `https://${ad.trafficLink}`;
                            window.open(directLink, '_blank');
                            // Clear the param and stay on dashboard
                            const params = new URLSearchParams(searchParams.toString());
                            params.delete('ad');
                            router.replace(params.toString() ? `/dashboard?${params.toString()}` : '/dashboard', { scroll: false });
                            // Don't return, so setSelectedAd(ad) is also called
                        }
                        setSelectedAd(ad);
                    } else {
                        // Fallback to local data if fetch fails
                        const foundAd = ads.find(a => a._id === adId);
                        if (foundAd) {
                            if (foundAd.promoteType === 'traffic' && foundAd.trafficLink) {
                                const directLink = foundAd.trafficLink.startsWith('http') ? foundAd.trafficLink : `https://${foundAd.trafficLink}`;
                                window.open(directLink, '_blank');
                                // Clear the param and stay on dashboard
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete('ad');
                                router.replace(params.toString() ? `/dashboard?${params.toString()}` : '/dashboard', { scroll: false });
                                // Don't return, so setSelectedAd(foundAd) is also called
                            }
                            setSelectedAd(foundAd);
                        }
                    }
                })
                .catch(err => {
                    console.error("Error fetching specific ad:", err);
                    const foundAd = ads.find(a => a._id === adId);
                    if (foundAd) {
                        if (foundAd.promoteType === 'traffic' && foundAd.trafficLink) {
                            const directLink = foundAd.trafficLink.startsWith('http') ? foundAd.trafficLink : `https://${foundAd.trafficLink}`;
                            window.open(directLink, '_blank');
                            setSelectedAd(foundAd);
                            return;
                        }
                        setSelectedAd(foundAd);
                    }
                });
        } else {
            setSelectedAd(null);
        }
    }, [searchParams, ads, router]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };
    // I will stack them: Categories first, then Locations.

    const fetchData = React.useCallback(async (pageNum = 1, append = false) => {
        if (!append) {
            setLoading(true);
            setAds([]);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const AD_SESSION_VIEWS_KEY = 'ad_session_views';
            const AD_SESSION_VIEW_TOKENS_KEY = 'ad_session_view_tokens';

            const readSessionJson = <T,>(key: string, fallback: T): T => {
                try {
                    const raw = sessionStorage.getItem(key);
                    if (!raw) return fallback;
                    return JSON.parse(raw) as T;
                } catch {
                    return fallback;
                }
            };

            const writeSessionJson = (key: string, value: unknown) => {
                try {
                    sessionStorage.setItem(key, JSON.stringify(value));
                } catch { }
            };

            const pageToken = String(
                (window as any)?.performance?.timeOrigin ?? ((window as any).__shadamonAdPageToken ??= Date.now())
            );

            const params = new URLSearchParams();
            if (filters.category) params.append('category', filters.category);
            if (filters.subCategory) params.append('subCategory', filters.subCategory);
            if (filters.location) params.append('location', filters.location);
            if (filters.subLocation) params.append('subLocation', filters.subLocation);
            if (filters.promoteTag && filters.promoteTag !== 'All') params.append('promoteTag', filters.promoteTag);
            if (filters.sort) params.append('sort', filters.sort);
            if (filters.search) params.append('search', filters.search);

            const shouldFetchMeta = !append && !hasFetchedMetaRef.current;
            const metaPromises: Promise<any>[] = [];
            if (shouldFetchMeta) {
                metaPromises.push(
                    fetch(`${API_BASE_URL}/api/categories`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/categories/sub`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/locations`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/locations/sub`).then(res => res.json())
                );
            }

            const [catRes, subCatRes, locRes, subLocRes] = metaPromises.length > 0
                ? await Promise.all(metaPromises)
                : [undefined, undefined, undefined, undefined];

            if (catRes?.success && subCatRes?.success) {
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

            if (locRes?.success && subLocRes?.success) {
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

            if (catRes?.success && subCatRes?.success && locRes?.success && subLocRes?.success) {
                hasFetchedMetaRef.current = true;
            }

            const limit = settings.userRepeatAdViewTime || 0;
            const isFiltering = !!(filters.category || filters.location || filters.search || (filters.promoteTag && filters.promoteTag !== 'All'));

            type SessionViews = Record<string, number>;
            type SessionViewTokens = Record<string, string>;
            const sessionViews = readSessionJson<SessionViews>(AD_SESSION_VIEWS_KEY, {});
            const sessionTokens = readSessionJson<SessionViewTokens>(AD_SESSION_VIEW_TOKENS_KEY, {});

            const collectAds: ActiveAd[] = [];
            const collectedIds = new Set<string>();
            const maxAutoPages = 6;
            let currentPage = pageNum;
            let lastHasMore = false;
            let allFeedCategories: any[] = [];

            for (let i = 0; i < maxAutoPages; i++) {
                const pageParams = new URLSearchParams(params.toString());
                pageParams.set('page', currentPage.toString());

                const adsRes = await fetch(`${API_BASE_URL}/api/ads/public/feed?${pageParams.toString()}`).then(res => res.json());
                if (!adsRes?.success) break;

                lastHasMore = !!adsRes.hasMore;
                if (adsRes.feedCategories) allFeedCategories.push(...adsRes.feedCategories);
                const rawAds: ActiveAd[] = adsRes.data || [];

                let eligible = rawAds;
                if (limit > 0 && !isFiltering) {
                    eligible = rawAds.filter((ad: ActiveAd) => (sessionViews[ad._id] || 0) < limit);
                }

                const alreadySeen = append ? seenAdIdsRef.current : new Set<string>();
                const deduped = eligible.filter((ad: ActiveAd) => !alreadySeen.has(ad._id) && !collectedIds.has(ad._id));

                deduped.forEach(ad => collectedIds.add(ad._id));
                collectAds.push(...deduped);

                if (collectAds.length > 0 || !lastHasMore) {
                    break;
                }

                currentPage += 1;
            }

            if (limit > 0 && !isFiltering) {
                collectAds.forEach((ad: ActiveAd) => {
                    if (sessionTokens[ad._id] === pageToken && (sessionViews[ad._id] || 0) > 0) return;
                    sessionViews[ad._id] = Math.min(limit, (sessionViews[ad._id] || 0) + 1);
                    sessionTokens[ad._id] = pageToken;
                });

                writeSessionJson(AD_SESSION_VIEWS_KEY, sessionViews);
                writeSessionJson(AD_SESSION_VIEW_TOKENS_KEY, sessionTokens);
            }

            setAds(prev => (append ? [...prev, ...collectAds] : collectAds));
            if (allFeedCategories.length > 0) {
                setFeedAdsCategories(prev => (append ? [...prev, ...allFeedCategories] : allFeedCategories));
            }
            setHasMore(lastHasMore);
            setPage(currentPage);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            if (!append) setLoading(false);
            else setIsLoadingMore(false);
        }
    }, [filters, settings.userRepeatAdViewTime]);

    const fetchInitialData = React.useCallback(async () => {
        try {
            // 1. Fetch All Ads for global state
            const allAdsRes = await fetch(`${API_BASE_URL}/api/ads/public/all`).then(res => res.json());
            if (allAdsRes.success) {
                setTotalAds(allAdsRes.data);
            }

            // 2. Fetch Popular Sellers from Backend
            const premiumRes = await fetch(`${API_BASE_URL}/api/user/premium`).then(res => res.json());

            if (premiumRes.success) {
                let sellers = premiumRes.data;

                // 3. Check following status if logged in
                const token = Cookies.get('token');
                if (token) {
                    try {
                        const meRes = await fetch(`${API_BASE_URL}/api/user/me`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const meData = await meRes.json();
                        if (meRes.ok && meData.following) {
                            sellers = sellers.map((u: any) => ({
                                ...u,
                                isFollowing: meData.following.includes(u._id)
                            }));
                        }
                    } catch (e) { }
                }

                setPremiumUsers(sellers);
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
                    u._id === userId ? { ...u, isFollowing: data.isFollowing, followers: data.followers } : u
                ));

                // Sync with other components
                window.dispatchEvent(new CustomEvent('user-followed', {
                    detail: {
                        userId: userId,
                        isFollowing: data.isFollowing,
                        followers: data.followers
                    }
                }));
            }
        } catch (error) {
            console.error("Follow error", error);
        }
    };

    const observerOptions = {
        root: null,
        rootMargin: '20px',
        threshold: 1.0
    };

    const handleObserver = React.useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !loading && !isLoadingMore && !isViewingSavedSearch) {
                fetchData(page + 1, true);
            }
        },
        [hasMore, loading, isLoadingMore, page, fetchData, isViewingSavedSearch]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, observerOptions);
        const target = document.getElementById('load-more-trigger');
        if (target) observer.observe(target);

        return () => {
            if (target) observer.unobserve(target);
        };
    }, [handleObserver]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        if (!isViewingSavedSearch) {
            fetchData(1, false);
        }
    }, [fetchData, isViewingSavedSearch]);

    useEffect(() => {
        const handleRefresh = () => {
            if (!isViewingSavedSearch) {
                fetchData(1, false);
            }
            fetchInitialData();
        };

        const handleSearch = (e: any) => {
            const query = e.detail?.query || "";
            setFilters(prev => ({ ...prev, search: query }));
        };

        const handleGlobalFollow = (e: any) => {
            const { userId, isFollowing, followers } = e.detail;
            setPremiumUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, isFollowing, followers } : u
            ));
            setAds(prev => prev.map(ad => {
                const adUserId = ad.user?._id || ad.user;
                if (adUserId === userId) {
                    return { ...ad, user: { ...ad.user, followers } };
                }
                return ad;
            }));
        };

        window.addEventListener('refresh-ads', handleRefresh);
        window.addEventListener('user-followed', handleGlobalFollow as EventListener);
        window.addEventListener('show-search-results', handleSearch as EventListener);
        window.addEventListener('reset-saved-search', handleResetSavedSearch);
        return () => {
            window.removeEventListener('refresh-ads', handleRefresh);
            window.removeEventListener('user-followed', handleGlobalFollow as EventListener);
            window.removeEventListener('show-search-results', handleSearch as EventListener);
            window.removeEventListener('reset-saved-search', handleResetSavedSearch);
        };
    }, [fetchData, fetchInitialData, handleResetSavedSearch, isViewingSavedSearch]);

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
                                        <h3 className="text-[13px] text-black">{t('category')}</h3>
                                        <ChevronDown className={cn("w-5 h-5 text-black group-hover:text-black transition-all", (expandedCategory === 'main' || expandedCategory !== null) && "rotate-180")} />
                                    </div>

                                    {expandedCategory !== null && (
                                        <div className="pl-1 space-y-1">
                                            <Link
                                                href={getCategoryUrl("")}
                                                scroll={false}
                                                className="block text-[13px] text-black ml-4 tracking-wider cursor-pointer hover:text-[#0088cc] transition-colors"
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
                                                    <div key={cat._id} className="space-y-0.5">
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
                                                            <div className="flex items-center gap-1 text-[13px] text-[#0088cc] font-medium hover:underline">
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
                                                                <div className="pl-6 space-y-0.5 border-l border-slate-100 ml-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    {cat.subcategories.map(sub => (
                                                                        <Link
                                                                            key={sub._id}
                                                                            href={getCategoryUrl(cat.name, sub.name)}
                                                                            scroll={false}
                                                                            className="flex items-center gap-1 text-[13px] text-[#0088cc] hover:underline cursor-pointer group"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setFilters({ ...filters, category: cat.name, subCategory: sub.name });
                                                                                setActiveSelectorTab('category');
                                                                            }}
                                                                        >
                                                                            {sub.image && getImageUrl(sub.image) ? (
                                                                                <img
                                                                                    src={getImageUrl(sub.image) || undefined}
                                                                                    className="w-4 h-4 object-cover shrink-0"
                                                                                    alt=""
                                                                                    loading="lazy"
                                                                                />
                                                                            ) : (
                                                                                <div className={cn("w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#0088cc] transition-colors", filters.subCategory === sub.name && "bg-[#0088cc]")} />
                                                                            )}
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
                                        <h3 className="text-[13px] text-black">{t('location')}</h3>
                                        <ChevronDown className={cn("w-5 h-5 text-black group-hover:text-black transition-all", expandedLocation !== null && "rotate-180")} />
                                    </div>

                                    {expandedLocation !== null && (
                                        <div className="pl-1 space-y-0.5">
                                            <Link
                                                href={getLocationUrl("")}
                                                scroll={false}
                                                className="block text-[13px] text-black ml-4 tracking-wider cursor-pointer hover:text-[#0088cc] transition-colors"
                                                onClick={() => {
                                                    setFilters({ ...filters, location: "", subLocation: "" });
                                                    handleResetSavedSearch();
                                                }}
                                            >
                                                {t('all_bangladesh')}
                                            </Link>

                                            {locations.map(loc => (
                                                <div key={loc._id} className="space-y-0.5">
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
                                                        <div className="flex items-center gap-1 text-[13px] text-[#0088cc] font-medium hover:underline">
                                                            <span className={cn((expandedLocation === loc._id || filters.location === loc.name) && "text-black")}>{loc.name}</span>
                                                            <span className="text-black font-normal ml-0.5">({totalAds.filter(ad => ad.location === loc.name).length.toLocaleString()})</span>
                                                        </div>
                                                        {loc.subLocations.length > 0 && (
                                                            <ChevronDown className={cn("w-3.5 h-3.5 text-black transition-all", expandedLocation === loc._id && "rotate-180")} />
                                                        )}
                                                    </Link>

                                                    {/* Dynamic Sub-locations matching image style */}
                                                    {expandedLocation === loc._id && loc.subLocations.length > 0 && (
                                                        <div className="pl-6 space-y-0.5 border-l border-slate-100 ml-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                            {loc.subLocations.map(sub => (
                                                                <Link
                                                                    key={sub._id}
                                                                    href={getLocationUrl(loc.name, sub.name)}
                                                                    scroll={false}
                                                                    className="flex items-center gap-1 text-[13px] text-[#0088cc] hover:underline cursor-pointer group"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setFilters({ ...filters, location: loc.name, subLocation: sub.name });
                                                                        setActiveSelectorTab('location');
                                                                    }}
                                                                >
                                                                    {sub.image && getImageUrl(sub.image) ? (
                                                                        <img
                                                                            src={getImageUrl(sub.image) || undefined}
                                                                            className="w-4 h-4 object-cover shrink-0"
                                                                            alt=""
                                                                            loading="lazy"
                                                                        />
                                                                    ) : (
                                                                        <div className={cn("w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-[#0088cc] transition-colors", filters.subLocation === sub.name && "bg-[#0088cc]")} />
                                                                    )}
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
                    <div className="bg-white rounded-lg p-3 space-y-4 mt-auto shadow-sm border border-slate-50">
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
                            <p className="text-[12px] text-black font-semibold">{t('follow_us')}</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => window.open('https://www.facebook.com/ShadamonDotCom', '_blank')} className="w-9 h-9 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <FaFacebookF className="w-5 h-5" />
                                </button>
                                <button onClick={() => window.open('https://www.tiktok.com/@shadamondotcom', '_blank')} className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <FaTiktok className="w-4 h-4" />
                                </button>
                                <button onClick={() => window.open('https://www.instagram.com/shadamondotcom/', '_blank')} className="w-9 h-9 bg-gradient-to-tr from-[#FFB344] via-[#F43C78] to-[#9932CC] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <FaInstagram className="w-5 h-5" />
                                </button>
                                <button onClick={() => window.open('https://www.youtube.com/@ShadaMondotcom', '_blank')} className="w-9 h-9 bg-[#FF0000] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <FaYoutube className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <p className="text-[12px] text-black font-semibold">{t('get_our_app')}</p>
                            <div className="flex items-center gap-2">
                                <button className="w-9 h-9 bg-[#A4C639] rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                                    <FaAndroid className="w-5 h-5 fill-white" />
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col gap-0.5 border-t border-slate-100">
                            <p className="text-[11px] text-slate-500 font-medium tracking-tight">
                                &copy; {new Date().getFullYear()} shadamon.com
                            </p>
                            <p className="text-[11px] text-slate-500 leading-tight">
                                A Product added by Shadamon
                            </p>
                        </div>
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
                <div className="bg-white rounded-none lg:rounded-lg flex divide-x divide-slate-100 overflow-hidden sticky top-0 lg:top-4 z-30 shadow-sm">
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
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="text-xs sm:text-sm text-black truncate">{filters.category ? (filters.subCategory || filters.category) : (language === 'bn' ? 'ক্যাটাগরি' : 'Category')}</span>
                            {filters.category && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFilters(prev => ({ ...prev, category: "", subCategory: "" }));
                                    }}
                                    className="p-1 rounded-full hover:bg-slate-200 transition-colors shrink-0"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
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
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="text-xs sm:text-sm text-black truncate">{filters.location ? (filters.subLocation || filters.location) : (language === 'bn' ? 'লোকেশন' : 'Location')}</span>
                            {filters.location && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFilters(prev => ({ ...prev, location: "", subLocation: "" }));
                                    }}
                                    className="p-1 rounded-full hover:bg-slate-200 transition-colors shrink-0"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </div>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex-1 px-4 py-2.5 flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
                    >
                        <SlidersHorizontal className="w-5 h-5 text-black" />
                        <span className="text-xs sm:text-sm text-black">{language === 'bn' ? 'ফিল্টার' : 'Filter'}</span>
                    </button>
                </div>

                {/* Category Selector Card */}
                <div className="bg-white rounded-none lg:rounded-lg overflow-hidden">
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
                                    Select Category
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
                    <div className="px-2 lg:px-5 pb-5 pt-2 relative group/bubbles flex items-center">
                        {/* Left Scroll Arrow */}
                        <button
                            onClick={scrollLeft}
                            className={
                                cn(
                                    "absolute left-4 top-[42px] w-9 h-9 rounded-full bg-white shadow-md border border-slate-100 items-center justify-center text-black hover:bg-slate-50 hover:scale-110 active:scale-95 transition-all z-20",
                                    canScrollLeft ? "flex" : "hidden"
                                )
                            }
                        >
                            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                        </button >

                        <div
                            ref={scrollContainerRef}
                            className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth w-full py-1"
                        >
                            {activeSelectorTab === 'category' ? (
                                <>
                                    {/* All Category Bubble */}
                                    <Link
                                        key="all-cat"
                                        href={getCategoryUrl("")}
                                        scroll={false}
                                        className={cn(
                                            "flex flex-col items-center gap-2 flex-none group cursor-pointer",
                                            !filters.category && "relative"
                                        )}
                                        onClick={() => {
                                            setFilters({ ...filters, category: "", subCategory: "" });
                                            setExpandedCategory('main');
                                        }}
                                    >
                                        <div className={cn(
                                            "w-[70px] h-[70px] rounded-full border-2 p-1 transition-all",
                                            !filters.category ? "border-[#0088cc] bg-blue-50" : "border-slate-200"
                                        )}>
                                            <div className="w-full h-full rounded-full bg-slate-50 overflow-hidden flex items-center justify-center">
                                                <Grid className="w-8 h-8 text-[#0088cc] opacity-60" strokeWidth={2} />
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-[11px] font-bold text-center max-w-[70px] truncate transition-colors",
                                            !filters.category ? "text-[#0088cc]" : "text-black"
                                        )}>{language === 'bn' ? 'সব বিজ্ঞাপন' : 'All Categories'}</span>
                                    </Link>

                                    {categories
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
                                                    "w-[70px] h-[70px] rounded-full border-2 p-1 transition-all",
                                                    cat.name === filters.category ? "border-[#0088cc] bg-blue-50" : "border-slate-200"
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
                                                    "text-[11px] font-bold text-center max-w-[70px] truncate transition-colors",
                                                    cat.name === filters.category ? "text-[#0088cc]" : "text-black"
                                                )}>{cat.name}</span>
                                            </Link>
                                        ))
                                    }
                                </>
                            ) : (
                                <>
                                    {/* All Location Bubble */}
                                    <Link
                                        key="all-loc"
                                        href={getLocationUrl("")}
                                        scroll={false}
                                        className={cn(
                                            "flex flex-col items-center gap-2 flex-none group cursor-pointer",
                                            !filters.location && "relative"
                                        )}
                                        onClick={() => {
                                            setFilters({ ...filters, location: "", subLocation: "" });
                                            setExpandedLocation(null);
                                        }}
                                    >
                                        <div className={cn(
                                            "w-[70px] h-[70px] rounded-full border-2 p-1 transition-all",
                                            !filters.location ? "border-[#0088cc] bg-blue-50" : "border-slate-200"
                                        )}>
                                            <div className="w-full h-full rounded-full bg-slate-50 overflow-hidden flex items-center justify-center">
                                                <MapPin className="w-8 h-8 text-[#0088cc] opacity-60" strokeWidth={2} />
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-[11px] font-bold text-center max-w-[70px] truncate transition-colors",
                                            !filters.location ? "text-[#0088cc]" : "text-black"
                                        )}>{language === 'bn' ? 'সব এলাকা' : 'All Location'}</span>
                                    </Link>

                                    {locations
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
                                                    "w-[70px] h-[70px] rounded-full border-2 p-1 transition-all",
                                                    loc.name === filters.location ? "border-[#0088cc] bg-blue-50" : "border-slate-200"
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
                                                    "text-[11px] font-bold text-center max-w-[70px] truncate transition-colors",
                                                    loc.name === filters.location ? "text-[#0088cc]" : "text-black"
                                                )}>{loc.name}</span>
                                            </Link>
                                        ))
                                    }
                                </>
                            )}
                        </div>

                        {/* Right Scroll Arrow */}
                        <button
                            onClick={scrollRight}
                            className={cn(
                                "absolute right-4 top-[42px] w-9 h-9 rounded-full bg-white shadow-md border border-slate-100 items-center justify-center text-black hover:bg-slate-50 hover:scale-110 active:scale-95 transition-all z-20",
                                canScrollRight ? "flex" : "hidden"
                            )}
                        >
                            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {!filters.category && !filters.location && !filters.search && filters.promoteTag === 'All' && <LatestFreeAdPromo />
                }

                {loading ? (
                    <div className="text-center py-20 pb-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
                        <p className="text-black text-sm">{t('loading_feed')}</p>
                    </div>
                ) : ads.length === 0 ? (
                    <div className="bg-white rounded-none lg:rounded-2xl p-8 border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-black">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <Home className="w-8 h-8 text-black" />
                        </div>
                        <h3 className="text-lg font-bold text-black">{t('no_ads_yet')}</h3>
                    </div>
                ) : (
                    (() => {
                        const displayAdsList = isViewingSavedSearch ? savedAdsData : ads;

                        const filteredTotalAdsCount = (() => {
                            if (isViewingSavedSearch) return savedAdsData.length;
                            return totalAds.filter(ad => {
                                if (filters.category && ad.category !== filters.category) return false;
                                if (filters.subCategory && ad.subCategory !== filters.subCategory) return false;
                                if (filters.location && ad.location !== filters.location) return false;
                                if (filters.subLocation && ad.subLocation !== filters.subLocation) return false;
                                if (filters.promoteTag && filters.promoteTag !== 'All') {
                                    if (filters.promoteTag === 'Verified') {
                                        if (!ad.user?.mVerified) return false;
                                    } else {
                                        if (ad.promoteTag !== filters.promoteTag) return false;
                                    }
                                }
                                if (filters.search) {
                                    const q = filters.search.toLowerCase();
                                    const matched = (ad.headline?.toLowerCase().includes(q) ||
                                        ad.description?.toLowerCase().includes(q) ||
                                        ad._id === filters.search ||
                                        ad.user?._id === filters.search);
                                    if (!matched) return false;
                                }
                                return true;
                            }).length;
                        })();

                        const promotedPool = [...displayAdsList.filter(ad => ad.adType === 'Promoted')];
                        const freePool = [...displayAdsList.filter(ad => ad.adType !== 'Promoted')];
                        const chunks = [];

                        // 1. Process Promoted Ads until pool is empty
                        while (promotedPool.length > 0) {
                            const b1 = promotedPool.shift() || null;
                            const s1 = promotedPool.splice(0, 5);
                            const b2 = promotedPool.shift() || null;
                            const s2 = promotedPool.splice(0, 5);

                            chunks.push({
                                type: 'promoted',
                                blocks: [
                                    { bigAd: b1, smallAds: s1 },
                                    { bigAd: b2, smallAds: s2 }
                                ].filter(b => b.bigAd || b.smallAds.length > 0),
                                showCategoryBatch: true
                            });
                        }

                        // 2. Process Free Ads (Small only)
                        while (freePool.length > 0) {
                            const s1 = freePool.splice(0, 10);
                            const s2 = freePool.splice(0, 10);

                            if (s1.length > 0 || s2.length > 0) {
                                chunks.push({
                                    type: 'free',
                                    blocks: [
                                        { bigAd: null, smallAds: s1 },
                                        { bigAd: null, smallAds: s2 }
                                    ].filter(b => b.smallAds.length > 0),
                                    showCategoryBatch: freePool.length > 0 // Maybe show category row between free chunks too?
                                });
                            }
                        }

                        const categoriesWithAds = categories.filter(cat =>
                            ads.some(ad => ad.category === cat.name)
                        );

                        return (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between px-4 lg:px-0">
                                    <div className="text-sm text-black flex items-center gap-1">
                                        <span className="font-medium">
                                            {language === 'bn'
                                                ? `${filteredTotalAdsCount.toLocaleString('bn-BD')} টি বিজ্ঞাপন দেখছেন`
                                                : `Viewing ${filteredTotalAdsCount.toLocaleString('en-US')} ads`}
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
                                    const categoryToShow = feedAdsCategories[chunkIndex % feedAdsCategories.length];

                                    return (
                                        <div key={chunkIndex} className="flex flex-col gap-4">
                                            {chunk.blocks.map((block, blockIndex) => {
                                                return (
                                                    <React.Fragment key={blockIndex}>
                                                        {block.bigAd && (
                                                            <div
                                                                onClick={(e) => {
                                                                    if (block.bigAd) {
                                                                        router.push(getAdUrl(block.bigAd), { scroll: false });
                                                                    }
                                                                }}
                                                                className={cn(
                                                                    "bg-white rounded-none lg:rounded-xl cursor-pointer group block border shadow-sm",
                                                                    hasHighlightLabel(block.bigAd)
                                                                        ? "border-orange-500 shadow-[0_12px_30px_rgba(249,115,22,0.25)] ring-1 ring-orange-400/40"
                                                                        : "border-slate-100"
                                                                )}
                                                            >
                                                                <div className="relative h-[315px] w-full rounded-none lg:rounded-t-xl overflow-hidden group">
                                                                    {getImageUrl(block.bigAd.images?.[0]) && (
                                                                        <>
                                                                            <img
                                                                                src={getImageUrl(block.bigAd.images?.[0]) || undefined}
                                                                                alt=""
                                                                                className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70"
                                                                            />
                                                                            <img
                                                                                src={getImageUrl(block.bigAd.images?.[0]) || undefined}
                                                                                alt={block.bigAd.headline}
                                                                                className="relative z-10 w-full h-full object-contain"
                                                                                loading="lazy"
                                                                            />
                                                                        </>
                                                                    )}
                                                                    {getNonHighlightLabels(block.bigAd).length > 0 && (
                                                                        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                                                                            {getNonHighlightLabels(block.bigAd).map((label: string) => (
                                                                                <span
                                                                                    key={label}
                                                                                    className="bg-white/90 text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded border border-slate-200 shadow-sm"
                                                                                >
                                                                                    {label}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="p-3">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="min-w-0">
                                                                            <div className="flex items-center gap-1 text-[11px] text-black mb-0.5">
                                                                                <span>{block.bigAd.adType === 'Promoted' ? 'Promoted By' : 'Post By'}</span>
                                                                                <span
                                                                                    className="font-bold text-black cursor-pointer hover:text-blue-600 hover:underline"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId: block.bigAd?.user?._id } }));
                                                                                    }}
                                                                                >
                                                                                    {block.bigAd.user?.storeName || block.bigAd.user?.name || 'User'}
                                                                                </span>
                                                                                {block.bigAd.user?.mVerified && <VerifiedBadge className="translate-y-[0.5px]" />}
                                                                            </div>
                                                                            <h3 className="font-bold text-lg text-black leading-tight mb-0.5 truncate">{block.bigAd.headline}</h3>
                                                                            <div className="font-bold text-base text-black mb-1">৳ {block.bigAd.price?.toLocaleString() || 'N/A'}</div>
                                                                            <div className="flex items-center gap-3 text-[10px] text-black">
                                                                                <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-black" />{block.bigAd.location}</div>
                                                                                <div className="flex items-center gap-1"><Grid className="w-3 h-3 text-black" />{block.bigAd.category}</div>
                                                                            </div>
                                                                        </div>
                                                                        {block.bigAd.adType === 'Promoted' && block.bigAd.promoteType === 'traffic' && block.bigAd.trafficLink ? (
                                                                            <a
                                                                                href={block.bigAd.trafficLink}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="border border-slate-300 text-black bg-gray-200 px-3 py-1 rounded text-xs font-bold hover:bg-slate-50"
                                                                            >
                                                                                {block.bigAd.trafficButtonType || 'Visit'}
                                                                            </a>
                                                                        ) : (
                                                                            <button className="border border-slate-300 text-black bg-gray-200 px-3 py-1 rounded text-xs font-bold hover:bg-slate-50">Detail</button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {block.smallAds.length > 0 && (
                                                            <div className="flex flex-col gap-2 bg-white rounded-none lg:rounded-lg pb-2">
                                                                {block.smallAds.map((ad) => (
                                                                    <div
                                                                        key={ad._id}
                                                                        onClick={() => {
                                                                            router.push(getAdUrl(ad), { scroll: false });
                                                                        }}
                                                                        className={cn(
                                                                            "bg-white rounded-none lg:rounded-lg p-3 pb-0 flex gap-2 cursor-pointer transition-colors hover:bg-slate-50 border",
                                                                            hasHighlightLabel(ad)
                                                                                ? "border-orange-500 shadow-[0_10px_25px_rgba(249,115,22,0.18)] ring-1 ring-orange-400/30"
                                                                                : "border-transparent"
                                                                        )}
                                                                    >
                                                                        <div className="w-[200px] h-[130px] rounded-none lg:rounded-lg overflow-hidden shrink-0 relative group-hover:scale-[1.02] transition-transform">
                                                                            {getImageUrl(ad.images?.[0]) && (
                                                                                <>
                                                                                    <img
                                                                                        src={getImageUrl(ad.images?.[0]) || undefined}
                                                                                        alt=""
                                                                                        className="absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-60"
                                                                                    />
                                                                                    <img src={getImageUrl(ad.images?.[0]) || undefined} alt={ad.headline} className="relative z-10 w-full h-full object-contain" loading="lazy" />
                                                                                </>
                                                                            )}
                                                                            {getNonHighlightLabels(ad).length > 0 && (
                                                                                <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                                                                                    {getNonHighlightLabels(ad).map((label: string) => (
                                                                                        <span
                                                                                            key={label}
                                                                                            className="bg-white/90 text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded border border-slate-200 shadow-sm"
                                                                                        >
                                                                                            {label}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                                            <div className="flex max-[390px]:flex-col items-center max-[390px]:items-start gap-1 text-[10px] text-black mb-0.5">
                                                                                <span>{ad.adType === 'Promoted' ? 'Promoted By' : 'Post By'}</span>
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="font-bold text-black hover:text-blue-600 hover:underline" onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId: ad.user?._id } })); }}>{ad.user?.storeName || ad.user?.name || 'User'}</span>
                                                                                    {ad.user?.mVerified && <VerifiedBadge className="translate-y-[0.5px]" />}
                                                                                </div>
                                                                            </div>
                                                                            <h4 className="text-sm text-black truncate mb-0.5">{ad.headline}</h4>
                                                                            <div className="text-sm text-black mb-1">৳ {ad.price?.toLocaleString() || 'N/A'}</div>
                                                                            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 text-[10px] text-black group-hover:text-black">
                                                                                <div className="flex max-[390px]:flex-col items-center max-[390px]:items-start gap-2 max-[390px]:gap-1">
                                                                                    <div className="flex items-center gap-0.5 shrink-0"><MapPin className="w-2.5 h-2.5" /><span className="truncate max-w-[100px] md:max-w-[120px]">{ad.location}</span></div>
                                                                                    <div className="flex items-center gap-0.5 shrink-0"><Grid className="w-2.5 h-2.5" /><span className="truncate max-w-[100px] md:max-w-[120px]">{ad.category}</span></div>
                                                                                </div>
                                                                                {ad.adType !== 'Promoted' && (
                                                                                    <div className="md:ml-auto text-black/60 text-[10px] whitespace-nowrap">
                                                                                        {timeAgo(ad.createdAt, language as 'en' | 'bn')}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Category row moved outside block map */}
                                                    </React.Fragment>
                                                );
                                            })}

                                            {/* Render Category Row after the chunk (every 2 blocks) */}
                                            {chunk.showCategoryBatch && categoryToShow && (
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
                                                            id={`feed-scroll-cat-${categoryToShow._id}-${chunkIndex}`}
                                                            className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2"
                                                        >
                                                            {(totalAds.filter(ad => ad.category === categoryToShow.name)).slice(0, 10).map((ad) => (
                                                                <div
                                                                    key={ad._id}
                                                                    className={cn(
                                                                        "min-w-[240px] w-[240px] bg-white border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
                                                                        hasHighlightLabel(ad)
                                                                            ? "border-orange-500 shadow-[0_10px_25px_rgba(249,115,22,0.18)] ring-1 ring-orange-400/30"
                                                                            : "border-slate-200"
                                                                    )}
                                                                    onClick={() => {
                                                                        router.push(getAdUrl(ad), { scroll: false });
                                                                    }}
                                                                >
                                                                    <div className="h-40 relative rounded-t-lg overflow-hidden bg-slate-100">
                                                                        {getImageUrl(ad.images?.[0]) && (
                                                                            <>
                                                                                <img
                                                                                    src={getImageUrl(ad.images?.[0]) || undefined}
                                                                                    alt=""
                                                                                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70"
                                                                                />
                                                                                <img src={getImageUrl(ad.images?.[0]) || undefined} alt={ad.headline} className="relative z-10 w-full h-full object-contain" loading="lazy" />
                                                                            </>
                                                                        )}
                                                                        {getNonHighlightLabels(ad).length > 0 && (
                                                                            <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                                                                                {getNonHighlightLabels(ad).map((label: string) => (
                                                                                    <span
                                                                                        key={label}
                                                                                        className="bg-white/90 text-[10px] font-bold text-slate-800 px-2 py-0.5 rounded border border-slate-200 shadow-sm"
                                                                                    >
                                                                                        {label}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="p-2.5 flex items-center justify-between gap-2">
                                                                        <div className="min-w-0">
                                                                            <h4 className="text-black truncate text-sm mb-0.5">{ad.headline}</h4>
                                                                            <p className="text-black text-sm">TK {ad.price?.toLocaleString() || 'N/A'}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const el = document.getElementById(`feed-scroll-cat-${categoryToShow._id}-${chunkIndex}`);
                                                                if (el) el.scrollBy({ left: -250, behavior: 'smooth' });
                                                            }}
                                                            className="absolute -left-3 top-[43%] -translate-y-1/2 w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-black z-20 border border-slate-100 hover:bg-slate-50"
                                                        >
                                                            <ChevronLeft className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const el = document.getElementById(`feed-scroll-cat-${categoryToShow._id}-${chunkIndex}`);
                                                                if (el) el.scrollBy({ left: 250, behavior: 'smooth' });
                                                            }}
                                                            className="absolute -right-3 top-[43%] -translate-y-1/2 w-9 h-9 bg-white shadow-md rounded-full flex items-center justify-center text-black z-20 border border-slate-100 hover:bg-slate-50"
                                                        >
                                                            <ChevronRight className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Popular Sellers for Mobile - Horizontal Scroll */}
                                            {chunk.showCategoryBatch && premiumUsers.length > 0 && (
                                                <div className="lg:hidden mt-2 bg-white rounded-lg p-2 pb-4">
                                                    <div className="flex items-center justify-between px-2 mb-3">
                                                        <h3 className="text-sm font-semibold text-black">{language === 'bn' ? 'জনপ্রিয় বিক্রেতা' : 'Popular Seller'}</h3>
                                                    </div>
                                                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 px-1">
                                                        {premiumUsers.map((user) => (
                                                            <div
                                                                key={user._id}
                                                                className="flex-none flex flex-col items-center w-[90px] gap-2 cursor-pointer"
                                                                onClick={() => handleProfileClick(user._id)}
                                                            >
                                                                <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-100 bg-slate-200 relative shrink-0">
                                                                    {user.photo ? (
                                                                        <img
                                                                            src={getImageUrl(user.photo) || undefined}
                                                                            alt={user.storeName || user.name}
                                                                            className="w-full h-full object-cover"
                                                                            loading="lazy"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-black font-bold text-lg uppercase">
                                                                            {(user.storeName || user.name).charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col items-center w-full text-center">
                                                                    <h4 className="font-bold text-black text-[11px] leading-tight line-clamp-1 w-full">
                                                                        {user.storeName || user.name}
                                                                    </h4>
                                                                    <p className="text-[9px] text-slate-500 -mt-1 mb-1">
                                                                        {user.followers?.length || 0} {t('follower')}
                                                                    </p>
                                                                    <button
                                                                        onClick={(e) => handleFollowUser(e, user._id)}
                                                                        className={cn(
                                                                            "mt-1 px-3 py-1 rounded-full text-[10px] font-bold transition-all w-full",
                                                                            user.isFollowing
                                                                                ? "bg-slate-100 text-slate-500 border border-slate-200"
                                                                                : "bg-[#0088cc] text-white"
                                                                        )}
                                                                    >
                                                                        {user.isFollowing ? t('Unfollow') : t('Follow')}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {isLoadingMore && (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                                    </div>
                                )}
                                <div id="load-more-trigger" className="h-4 w-full" />
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
                <div className="sticky top-[90vh] pl-1">
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
                            premiumUsers.map((user) => (
                                <div key={user._id} className="flex gap-3">
                                    <div className="shrink-0 cursor-pointer" onClick={() => handleProfileClick(user._id)}>
                                        <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-100 bg-slate-200 relative group">
                                            {user.photo ? (
                                                <img
                                                    src={getImageUrl(user.photo) || undefined}
                                                    alt={user.storeName || user.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-black font-bold text-xl uppercase">
                                                    {(user.storeName || user.name).charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 h-14 flex flex-col justify-between py-0.5">
                                        <div className="flex flex-col">
                                            <div
                                                className="flex items-center gap-1.5 leading-tight cursor-pointer group/name"
                                                onClick={() => handleProfileClick(user._id)}
                                            >
                                                <h4 className="font-bold text-black text-[14px] truncate group-hover/name:text-[#0088cc] transition-colors">
                                                    {user.storeName || user.name}
                                                </h4>
                                                {user.mVerified && <VerifiedBadge className="translate-y-[0.5px]" />}
                                            </div>
                                            <p className="text-[10px] text-slate-500 -mt-0.5">
                                                {user.followers?.length || 0} {t('follower')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleFollowUser(e, user._id)}
                                            className={cn(
                                                "flex items-center justify-center gap-1 px-2.5 h-5 border rounded-full text-[10px] font-bold transition-all w-fit",
                                                user.isFollowing
                                                    ? "bg-slate-100 text-slate-500 border-slate-300"
                                                    : "border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-slate-400"
                                            )}
                                        >
                                            {!user.isFollowing && <span className="text-sm leading-none -mt-0.5">+</span>}
                                            {user.isFollowing ? t('Unfollow') : t('Follow')}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Balancing Spacer: 70px */}
            <div className="hidden lg:block w-[70px] flex-none" />
        </div>
    );
}
