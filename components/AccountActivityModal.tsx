"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, Star, Heart, MapPin, Share2, MoreVertical, Edit2, Plus, ArrowRight, Grid, User, Clock, Settings, FileText, Activity, Trash2, CheckCircle2, ChevronDown, Check, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/apiConfig';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import PromoteModal from './PromoteModal';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface AccountActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string; // If provided, viewing another user. If null, viewing self (logged in user)
    onOpenPostAd?: () => void;
}

export default function AccountActivityModal({ isOpen, onClose, userId, onOpenPostAd }: AccountActivityModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Page' | 'Profile' | 'Settings' | 'Post' | 'Activity'>('Page');
    const [productTab, setProductTab] = useState<'All' | 'Popular'>('All');
    const [expandedSetting, setExpandedSetting] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // User Data State
    const [userData, setUserData] = useState<any>(null);
    const [isOwnAccount, setIsOwnAccount] = useState(false);
    const [userAds, setUserAds] = useState<any[]>([]);

    // Promote Modal State
    const [promoteAd, setPromoteAd] = useState<any>(null);
    const [showPromoteModal, setShowPromoteModal] = useState(false);

    const handlePromoteClick = (ad: any) => {
        setPromoteAd(ad);
        setShowPromoteModal(true);
    };

    // Activity State
    const [activityData, setActivityData] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [expandedActivity, setExpandedActivity] = useState<string | null>('followed');

    useEffect(() => {
        if (activeTab === 'Activity') {
            fetchActivityData();
            fetchCategories();
        }
    }, [activeTab]);

    const fetchActivityData = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/api/user/activity`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setActivityData(data);
        } catch (error) {
            console.error("Error fetching activity", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/categories`);
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const toggleActivitySection = (section: string) => {
        setExpandedActivity(expandedActivity === section ? null : section);
    };

    const handleNotifyChange = async (categoryName: string) => {
        if (!activityData) return;
        const current = activityData.notifyCategories || [];
        let newCategories;
        if (current.includes(categoryName)) {
            newCategories = current.filter((c: string) => c !== categoryName);
        } else {
            newCategories = [...current, categoryName];
        }

        // Optimistic update
        setActivityData({ ...activityData, notifyCategories: newCategories });

        try {
            const token = Cookies.get('token');
            if (!token) return;
            await fetch(`${API_BASE_URL}/api/user/notify-settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ categories: newCategories })
            });
            // toast.success("Notification settings updated"); 
            // maybe silent update is better or toast
        } catch (error) {
            console.error("Error updating notify settings", error);
            // Revert on error if needed
        }
    };

    // Profile Form State
    const [profileForm, setProfileForm] = useState({
        name: '',
        dob: '',
        gender: '',
        location: '',
        education: '',
        aboutYourself: '',
        profession: '',
        professionalExperience: '',
        email: '',
        mobile: '',
        additionalMobiles: [''],
        storeName: '',
        actionType: 'call',
        sellerPageUrl: '',
        aboutBusiness: ''
    });

    // Refs for file inputs
    const bannerInputRef = React.useRef<HTMLInputElement>(null);
    const logoInputRef = React.useRef<HTMLInputElement>(null);

    // Sync form with userData
    useEffect(() => {
        if (userData && isOwnAccount) {
            setProfileForm({
                name: userData.name || '',
                dob: userData.dob ? new Date(userData.dob).toISOString().split('T')[0] : '',
                gender: userData.gender || '',
                location: userData.location || '',
                education: userData.education || '',
                aboutYourself: userData.aboutYourself || '',
                profession: userData.profession || '',
                professionalExperience: userData.professionalExperience || '',
                email: userData.email || '',
                mobile: userData.mobile || '',
                additionalMobiles: userData.additionalMobiles?.length ? [...userData.additionalMobiles, ''] : [''],
                storeName: userData.storeName || '',
                actionType: userData.actionType || 'call',
                sellerPageUrl: userData.sellerPageUrl || '',
                aboutBusiness: userData.aboutBusiness || ''
            });
        }
    }, [userData, isOwnAccount]);

    const handleProfileChange = (field: string, value: any) => {
        setProfileForm(prev => ({ ...prev, [field]: value }));
    };

    const handleMobileArrayChange = (index: number, value: string) => {
        const newMobiles = [...profileForm.additionalMobiles];
        newMobiles[index] = value;
        setProfileForm(prev => ({ ...prev, additionalMobiles: newMobiles }));
    };

    const addMobileSlot = () => {
        setProfileForm(prev => ({ ...prev, additionalMobiles: [...prev.additionalMobiles, ''] }));
    };

    const removeMobileSlot = (index: number) => {
        const newMobiles = profileForm.additionalMobiles.filter((_, i) => i !== index);
        setProfileForm(prev => ({ ...prev, additionalMobiles: newMobiles }));
    };

    const saveProfile = async () => {
        // Filter empty mobiles
        const filteredMobiles = profileForm.additionalMobiles.filter(m => m.trim() !== '');

        try {
            const token = Cookies.get('token');
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/api/user/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...profileForm,
                    additionalMobiles: filteredMobiles
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Profile updated successfully!');
                // Merge existing user data with form data (optimistic/source of truth) AND backend response
                // This ensures that even if backend returns partial data, we show what valid inputs the user just saved.
                setUserData((prev: any) => ({
                    ...prev,
                    ...profileForm,
                    additionalMobiles: filteredMobiles,
                    ...(data.user || {})
                }));
            } else {
                toast.error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchUserData();
        }
    }, [isOpen, userId]);

    const fetchUserData = async () => {
        setLoading(true);
        setUserData(null); // Clear previous data to avoid flickering
        try {
            const token = Cookies.get('token');
            let currentUser = null;

            // 1. Determine if viewing own account
            if (token) {
                const res = await fetch(`${API_BASE_URL}/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    currentUser = data;
                }
            }

            // 2. Decide whose data to fetch
            let targetUserId = userId;
            if (!targetUserId && currentUser) {
                targetUserId = currentUser._id;
                setIsOwnAccount(true);
            } else if (targetUserId && currentUser && targetUserId === currentUser._id) {
                setIsOwnAccount(true);
            } else {
                setIsOwnAccount(false);
            }

            // 3. Fetch Target User Data Details
            if (targetUserId) {
                if (isOwnAccount && currentUser) {
                    setUserData(currentUser);
                }

                // Update URL if missing or different (for own account mostly)
                const params = new URLSearchParams(window.location.search);
                const currentProfileParam = params.get('profile');
                if (isOpen && currentProfileParam !== targetUserId) {
                    params.set('profile', targetUserId);
                    const newUrl = `${window.location.pathname}?${params.toString()}`;
                    window.history.pushState({}, '', newUrl);
                }

                if (isOwnAccount) {
                    const adsRes = await fetch(`${API_BASE_URL}/api/ads/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const adsData = await adsRes.json();
                    if (adsData.success) setUserAds(adsData.data);
                } else {
                    const adsRes = await fetch(`${API_BASE_URL}/api/ads/public/all`);
                    const adsData = await adsRes.json();
                    if (adsData.success) {
                        const userPublicAds = adsData.data.filter((ad: any) => ad.user?._id === targetUserId || ad.user === targetUserId);
                        setUserAds(userPublicAds);
                        if (!userData && userPublicAds.length > 0) {
                            setUserData(userPublicAds[0].user);
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Error fetching account activity", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = (setting: string) => {
        setExpandedSetting(expandedSetting === setting ? null : setting);
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('user'); // Also custom user cookie if any
        window.dispatchEvent(new Event('auth-change')); // customized event if used
        toast.success("Logged out successfully");
        onClose();
        router.push('/dashboard');
        router.refresh();
    };

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size too large (Max 5MB)");
            return;
        }

        // Optimistic Update with Object URL
        const objectUrl = URL.createObjectURL(file);
        setUserData((prev: any) => ({
            ...prev,
            [type === 'banner' ? 'storeBanner' : 'photo']: objectUrl
        }));

        try {
            const token = Cookies.get('token');
            if (!token) return;

            const formData = new FormData();
            // Backend expects 'storeBanner' or 'photo' (matching the upload.fields config)
            const fieldName = type === 'banner' ? 'storeBanner' : 'photo';
            formData.append(fieldName, file);

            const res = await fetch(`${API_BASE_URL}/api/user/update`, {
                method: 'PUT',
                headers: {
                    // Content-Type is set automatically for FormData
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(`${type === 'banner' ? 'Banner' : 'Profile photo'} updated!`);
                if (data.user) {
                    setUserData((prev: any) => ({ ...prev, ...data.user }));
                }
            } else {
                // Revert on failure? For now just error
                throw new Error(data.message || 'Update failed');
            }
        } catch (error: any) {
            toast.error(error.message);
            console.error("Upload error:", error);
        }
    };

    if (!isOpen) return null;

    // Helper to process image URLs
    const getImageUrl = (path: string | null | undefined) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
        return `${API_BASE_URL}${path}`;
    };

    const displayUser = userData ? {
        ...userData,
        photo: getImageUrl(userData.photo),
        coverPhoto: getImageUrl(userData.storeBanner), // Backend uses storeBanner
    } : {
        name: "User",
        storeName: "My Store",
        photo: null,
        coverPhoto: null,
        verifiedBy: null,
        followers: 0,
        rating: 0
    };

    // Filter ads logic
    const promotedAds = userAds.filter(ad => ad.promoteType); // Filter by promoteType existence
    const displayAds = productTab === 'Popular' ? promotedAds : userAds;

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-[#F4F6F8] w-full max-w-[420px] rounded-lg overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl h-[95vh] font-sans">

                {/* Header */}
                <div className="bg-white px-3 py-2 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <h2 className="text-[15px] text-slate-700">Account Activity</h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                        {['Page', 'Profile', 'Settings', 'Post', 'Activity'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-3 py-1 rounded text-[12px] transition-colors whitespace-nowrap border",
                                    activeTab === tab
                                        ? "bg-orange-400 text-black border-orange-400"
                                        : "bg-white text-black border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar bg-[#F1F5F9] relative">
                    {loading && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {activeTab === 'Page' && (
                        <div className="pb-10">
                            {/* Banner & Profile Section */}
                            <div className="bg-white mb-2 pb-3 shadow-sm">
                                {/* Banner */}
                                <div className="h-[100px] w-full bg-slate-200 relative group">
                                    {displayUser.coverPhoto ? (
                                        <img src={displayUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200" />
                                    )}
                                    {isOwnAccount && (
                                        <>
                                            <input
                                                type="file"
                                                ref={bannerInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'banner')}
                                            />
                                            <button
                                                onClick={() => bannerInputRef.current?.click()}
                                                className="absolute bottom-2 right-2 w-6 h-6 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 shadow-sm hover:scale-110 transition-transform"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Profile Info */}
                                <div className="px-3 relative">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-2.5">
                                            {/* Profile Pic */}
                                            <div className="-mt-6 relative z-10">
                                                <div className="w-16 h-16 rounded-full border-[3px] border-white bg-white shadow-sm overflow-hidden relative group">
                                                    {displayUser.photo ? (
                                                        <img src={displayUser.photo} alt={displayUser.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-xl font-bold">
                                                            {displayUser.name?.charAt(0) || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                {isOwnAccount && (
                                                    <>
                                                        <input
                                                            type="file"
                                                            ref={logoInputRef}
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(e, 'logo')}
                                                        />
                                                        <button
                                                            onClick={() => logoInputRef.current?.click()}
                                                            className="absolute bottom-0 right-0 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm hover:scale-110 transition-transform"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            <div className="pt-1.5 flex-1">
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <h3 className="text-[15px] font-black text-slate-800 leading-none">
                                                        {displayUser.storeName || displayUser.name}
                                                    </h3>
                                                    {/* Premium Blue Tick */}
                                                    {displayUser.merchantType === 'Premium' && (
                                                        <span className="text-blue-500 ml-1" title="Premium Verified">
                                                            {/* High Quality Blue Tick SVG */}
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10.59 16.6L7.45 13.46L8.86 12.05L10.59 13.78L15.95 8.41L17.36 9.83L10.59 16.6Z" fill="#3B82F6" />
                                                            </svg>
                                                        </span>
                                                    )}

                                                    {!isOwnAccount && (
                                                        <button className="ml-1 px-2 py-0 border border-slate-300 text-[9px] rounded-full text-slate-600 font-bold hover:bg-slate-50 h-5 flex items-center">
                                                            Unfollow
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5 min-h-[16px]">
                                                    {/* Rating/Followers/Badge Logic */}
                                                    {displayUser.rating && displayUser.rating > 0 ? (
                                                        <div className="flex items-center text-[10px] font-bold text-slate-600">
                                                            {displayUser.rating}☆ Seller
                                                        </div>
                                                    ) : null}

                                                    {!isOwnAccount && (
                                                        <span className="px-1 py-[1px] bg-slate-100 text-[8px] font-bold text-slate-500 rounded border border-slate-200">
                                                            Ratings Seller
                                                        </span>
                                                    )}
                                                </div>
                                                {displayUser.followers > 0 && (
                                                    <div className="text-[10px] font-medium text-slate-500 leading-tight">
                                                        {displayUser.followers} Follower
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {!isOwnAccount && (
                                        <div className="flex items-center gap-2 mt-3">
                                            <button className="flex-1 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full hover:bg-slate-200 transition-colors border border-slate-200">
                                                About
                                            </button>
                                            <button className="flex-1 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full hover:bg-slate-200 transition-colors border border-slate-200">
                                                Send Message
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isOwnAccount && (
                                <button
                                    onClick={onOpenPostAd}
                                    className="w-full bg-white px-3 py-2 mb-2 flex items-center justify-between shadow-sm border-y border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors text-left"
                                >
                                    <span className="text-[12px] text-slate-500 italic">Promote your Business, <span className="font-bold text-slate-800 not-italic border-b border-transparent hover:border-slate-800">Create a post</span></span>
                                </button>
                            )}

                            {/* Products Section */}
                            <div className="bg-white pt-2 min-h-[400px]">
                                <div className="px-3 flex items-center gap-3 mb-2 border-b border-slate-100">
                                    <button
                                        onClick={() => setProductTab('All')}
                                        className={cn(
                                            "pb-1.5 text-[12px] font-bold border-b-2 transition-colors",
                                            productTab === 'All' ? "text-slate-800 border-slate-800" : "text-slate-400 border-transparent hover:text-slate-600"
                                        )}
                                    >
                                        All Product({userAds.length})
                                    </button>
                                    <button
                                        onClick={() => setProductTab('Popular')}
                                        className={cn(
                                            "pb-1.5 text-[12px] font-bold border-b-2 transition-colors",
                                            productTab === 'Popular' ? "text-slate-800 border-slate-800" : "text-slate-400 border-transparent hover:text-slate-600"
                                        )}
                                    >
                                        Popular Product({promotedAds.length})
                                    </button>
                                </div>

                                {/* Custom Grid Layout */}
                                <div className="p-2 bg-[#F1F5F9] space-y-2">
                                    {displayAds.length > 0 ? (
                                        <>
                                            {/* First Row: Items 1-2 (Small) */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {displayAds.slice(0, 2).map(ad => (
                                                    <div key={ad._id} className="bg-white rounded shadow-sm overflow-hidden flex flex-col">
                                                        <div className="h-24 bg-slate-100 relative">
                                                            {/* Image */}
                                                            {ad.images && ad.images.length > 0 && (
                                                                <img src={`${API_BASE_URL}${ad.images[0]}`} className="w-full h-full object-cover" />
                                                            )}
                                                        </div>
                                                        <div className="p-1.5 flex-1 flex flex-col">
                                                            <div className="font-black text-[13px] text-slate-900 leading-tight mb-0.5">
                                                                {ad.price ? `${(ad.price / 100000).toFixed(1)} L` : 'N/A'}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 leading-tight line-clamp-2 mb-1.5 min-h-[2.5em]">
                                                                {ad.headline}
                                                            </div>
                                                            <button
                                                                onClick={() => handlePromoteClick(ad)}
                                                                className="mt-auto w-full bg-orange-400 text-black text-[10px] font-bold py-1 rounded hover:bg-orange-500 transition-colors"
                                                            >
                                                                Promote This Post
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Second Row: Item 3 (Large) */}
                                            {displayAds.length > 2 && displayAds.slice(2, 3).map(ad => (
                                                <div key={ad._id} className="bg-white rounded shadow-sm overflow-hidden flex flex-col">
                                                    <div className="h-40 bg-slate-100 relative">
                                                        {ad.images && ad.images.length > 0 && (
                                                            <img src={`${API_BASE_URL}${ad.images[0]}`} className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div className="p-2">
                                                        <div className="font-black text-[14px] text-slate-900 mb-0.5">
                                                            {ad.price ? `${(ad.price / 100000).toFixed(1)} L` : 'N/A'}
                                                        </div>
                                                        <div className="text-[12px] font-bold text-slate-700 mb-2 truncate">
                                                            {ad.headline}
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-orange-400 rounded px-1 py-0.5">
                                                            <button
                                                                onClick={() => handlePromoteClick(ad)}
                                                                className="flex-1 text-black text-[11px] font-bold pl-1"
                                                            >
                                                                Promote This Post
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Remaining Items 4+ (Fallback Grid) */}
                                            {displayAds.length > 3 && (
                                                <div className="grid grid-cols-2 gap-2">
                                                    {displayAds.slice(3).map(ad => (
                                                        <div key={ad._id} className="bg-white rounded shadow-sm overflow-hidden flex flex-col">
                                                            <div className="h-24 bg-slate-100 relative">
                                                                {ad.images && ad.images.length > 0 && (
                                                                    <img src={`${API_BASE_URL}${ad.images[0]}`} className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <div className="p-1.5 flex-1 flex flex-col">
                                                                <div className="font-black text-[13px] text-slate-900 leading-tight mb-0.5">
                                                                    {ad.price ? `৳ ${ad.price.toLocaleString()}` : 'N/A'}
                                                                </div>
                                                                <div className="text-[10px] text-slate-500 leading-tight line-clamp-2 mb-1.5 min-h-[2.5em]">
                                                                    {ad.headline}
                                                                </div>
                                                                <button
                                                                    onClick={() => handlePromoteClick(ad)}
                                                                    className="mt-auto w-full bg-orange-400 text-black text-[10px] font-bold py-1 rounded hover:bg-orange-500 transition-colors"
                                                                >
                                                                    Promote This Post
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        productTab === 'Popular' ? (
                                            <div className="py-20 text-center text-slate-400 text-sm">
                                                No promoted products found.
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center text-slate-400 text-sm">
                                                No products found.
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Profile' && (
                        <div className="p-4 bg-white pb-20">
                            {/* Top Profile Section */}
                            <div className="flex items-start gap-4 mb-3">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                                        {displayUser.photo ? (
                                            <img src={displayUser.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#1e8e7f]" />
                                            /* Matching the green color in image roughly */
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'logo')}
                                    />
                                    <button
                                        onClick={() => isOwnAccount && logoInputRef.current?.click()}
                                        className={cn(
                                            "absolute bottom-0 right-0 w-5 h-5 bg-[#FF004D] rounded-full flex items-center justify-center border-[2px] border-white text-white shadow-sm",
                                            !isOwnAccount && "hidden"
                                        )}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-[16px] font-bold text-slate-700">{displayUser.name}</h2>
                                    {/* <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                        <span>{profileForm.mobile}</span>
                                        <User className="w-3 h-3 ml-1" />
                                    </div> */}
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                        Add a Verification Badge to your profile to become a trusted Customer or Seller.
                                    </p>
                                </div>
                            </div>

                            {isOwnAccount && (
                                <button className="w-full bg-[#EBF5FF] text-slate-800 text-sm py-2 rounded mb-3 hover:bg-blue-100 transition-colors">
                                    Get Verified Badge
                                </button>
                            )}

                            {/* Personal Information */}
                            <div className="mb-4">
                                <h3 className="text-base text-slate-800 mb-2">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {/* Name */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Name</label>
                                        <input
                                            type="text"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.name}
                                            onChange={(e) => handleProfileChange('name', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50"
                                        />
                                    </div>
                                    {/* DOB */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Date of Birth</label>
                                        <input
                                            type="date"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.dob}
                                            onChange={(e) => handleProfileChange('dob', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Gender</label>
                                        <div className="relative">
                                            <select
                                                disabled={!isOwnAccount}
                                                value={profileForm.gender}
                                                onChange={(e) => handleProfileChange('gender', e.target.value)}
                                                className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50 appearance-none"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    {/* Location */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Location</label>
                                        <input
                                            type="text"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.location}
                                            onChange={(e) => handleProfileChange('location', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50"
                                        />
                                    </div>

                                    {/* Education */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Education</label>
                                        <input
                                            type="text"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.education}
                                            onChange={(e) => handleProfileChange('education', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50"
                                        />
                                    </div>
                                    {/* About Yourself */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Write About Yourself</label>
                                        <textarea
                                            readOnly={!isOwnAccount}
                                            value={profileForm.aboutYourself}
                                            onChange={(e) => handleProfileChange('aboutYourself', e.target.value)}
                                            rows={1}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50 resize-none overflow-hidden"
                                        />
                                    </div>

                                    {/* Profession */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Current Profession</label>
                                        <input
                                            type="text"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.profession}
                                            onChange={(e) => handleProfileChange('profession', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50"
                                        />
                                    </div>
                                    {/* Experience */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Professional Experiance detail</label>
                                        <textarea
                                            readOnly={!isOwnAccount}
                                            value={profileForm.professionalExperience}
                                            onChange={(e) => handleProfileChange('professionalExperience', e.target.value)}
                                            rows={1}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50 resize-none overflow-hidden"
                                        />
                                    </div>

                                    {/* Mobile (Editable) */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Mobile</label>
                                        <div className="flex items-center relative">
                                            <input
                                                type="tel"
                                                readOnly={!isOwnAccount}
                                                value={profileForm.mobile}
                                                onChange={(e) => handleProfileChange('mobile', e.target.value)}
                                                className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50 pr-8"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                {/* Keep the toggle or indicator if needed, or just the check if strictly verified. 
                                                    User just said 'cant edit', implying they want to. 
                                                    If previously it was a div with checkcircle, I'll keep the checkcircle if it was meaningful, 
                                                    but maybe as an icon inside the input? 
                                                */}
                                                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Email</label>
                                        <input
                                            type="email"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.email}
                                            onChange={(e) => handleProfileChange('email', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50"
                                        />
                                    </div>
                                </div>

                                {/* Additional Mobiles */}
                                <div className="mb-3">
                                    {profileForm.additionalMobiles.map((mob, idx) => (
                                        <div key={idx} className="flex items-center gap-2 mb-2">
                                            <input
                                                type="tel"
                                                readOnly={!isOwnAccount}
                                                placeholder="Add Another Mobile/WhatsApp"
                                                value={mob}
                                                onChange={(e) => handleMobileArrayChange(idx, e.target.value)}
                                                className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50"
                                            />
                                            {isOwnAccount && (
                                                idx === profileForm.additionalMobiles.length - 1 ? (
                                                    <button onClick={addMobileSlot} className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-transform"><Plus className="w-4 h-4" /></button>
                                                ) : (
                                                    <button onClick={() => removeMobileSlot(idx)} className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300"><Trash2 className="w-4 h-4" /></button>
                                                )
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {isOwnAccount && (
                                    <button onClick={saveProfile} className="w-full bg-orange-400 text-black py-2.5 rounded-lg text-sm hover:bg-orange-500 transition-colors shadow-sm">
                                        Save
                                    </button>
                                )}
                            </div>

                            <hr className="border-slate-100 my-4" />

                            {/* Business Information */}
                            <div>
                                <h3 className="text-base text-slate-800 mb-2">Business Information</h3>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {/* Shop Name */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Shop Name</label>
                                        <input
                                            type="text"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.storeName}
                                            onChange={(e) => handleProfileChange('storeName', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50"
                                        />
                                    </div>
                                    {/* Action Button */}
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Page Communicate buttion</label>
                                        <div className="relative">
                                            <select
                                                disabled={!isOwnAccount}
                                                value={profileForm.actionType}
                                                onChange={(e) => handleProfileChange('actionType', e.target.value)}
                                                className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50 appearance-none uppercase font-bold text-xs"
                                            >
                                                <option value="call">Call</option>
                                                <option value="chat">Message</option>
                                                <option value="both">Both</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Seller Page Username */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">Seller Page User Name</label>
                                        <div className="flex rounded border border-slate-200 overflow-hidden bg-slate-50/50 focus-within:border-orange-400">
                                            <span className="px-2 py-1 text-slate-400 text-sm border-r border-slate-200 bg-slate-100">www.shadamon.com/</span>
                                            <input
                                                type="text"
                                                readOnly={!isOwnAccount}
                                                value={profileForm.sellerPageUrl}
                                                onChange={(e) => handleProfileChange('sellerPageUrl', e.target.value)}
                                                className="flex-1 px-2 py-1 text-sm text-black outline-none bg-transparent font-bold"
                                            />
                                            {profileForm.sellerPageUrl && isOwnAccount && (
                                                <button className="px-3 py-1 bg-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-300">Check</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* About Business */}
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-0.5">About Business</label>
                                        <textarea
                                            readOnly={!isOwnAccount}
                                            value={profileForm.aboutBusiness}
                                            onChange={(e) => handleProfileChange('aboutBusiness', e.target.value)}
                                            rows={2}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-orange-400 bg-slate-50/50 resize-none"
                                        />
                                    </div>
                                </div>
                                {isOwnAccount && (
                                    <button onClick={saveProfile} className="w-full bg-orange-400 text-black py-2.5 rounded-lg text-sm hover:bg-orange-500 transition-colors shadow-sm mb-4">
                                        Save
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Settings' && (
                        <div className="p-3 space-y-3 pb-20">
                            {/* App Theme Mode */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleSetting('theme')}
                                >
                                    <span className="text-sm font-medium text-slate-700">App Theme Mode</span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedSetting === 'theme' && "rotate-180")} />
                                </div>
                                {expandedSetting === 'theme' && (
                                    <div className="p-3 pt-0 border-t border-slate-100 bg-slate-50/50">
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-xs text-slate-600">Default Mode</span>
                                            <div className="w-8 h-4 bg-slate-200 rounded-full relative cursor-pointer">
                                                <div className="w-4 h-4 bg-white rounded-full shadow-sm absolute left-0 top-0 border border-slate-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Delete Account */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleSetting('delete')}
                                >
                                    <span className="text-sm font-bold text-slate-800">Delete account</span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedSetting === 'delete' && "rotate-180")} />
                                </div>
                                {expandedSetting === 'delete' && (
                                    <div className="p-3 border-t border-slate-100 bg-slate-50">
                                        <div className="bg-slate-100 p-3 rounded border border-slate-200">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-sm text-slate-800">Account Delete</h4>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mb-2 leading-tight">
                                                You Can Delete Your Account After 7 Days from Registration Time.
                                            </p>
                                            <div className="relative">
                                                <select className="w-full text-[11px] border border-slate-200 rounded p-1.5 outline-none bg-white appearance-none pr-6">
                                                    <option>I Reason</option>
                                                    <option>No longer need account</option>
                                                    <option>Privacy concerns</option>
                                                    <option>Other</option>
                                                </select>
                                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Clear Cache */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleSetting('cache')}
                                >
                                    <span className="text-sm font-medium text-slate-700">Clear Cache</span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedSetting === 'cache' && "rotate-180")} />
                                </div>
                                {expandedSetting === 'cache' && (
                                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                                        <button className="text-xs bg-slate-200 text-slate-600 px-4 py-1.5 rounded font-bold hover:bg-slate-300 transition-colors">
                                            Clear Data
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* About Us */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleSetting('about')}
                                >
                                    <span className="text-sm font-medium text-slate-700">About Us</span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedSetting === 'about' && "rotate-180")} />
                                </div>
                                {expandedSetting === 'about' && (
                                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 leading-relaxed">
                                        <p>Shadamon is an online marketplace connecting people for buying, selling, and exchanging goods and services. Our mission is to provide equal opportunities for everyone.</p>
                                    </div>
                                )}
                            </div>

                            {/* Privacy Policy */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleSetting('privacy')}
                                >
                                    <span className="text-sm font-medium text-slate-700">Privacy-Policy, Term & condition</span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedSetting === 'privacy' && "rotate-180")} />
                                </div>
                                {expandedSetting === 'privacy' && (
                                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 space-y-2">
                                        <p><strong>Privacy Policy:</strong> We protect your data securely.</p>
                                        <p><strong>Terms:</strong> By using our service, you agree to our terms.</p>
                                    </div>
                                )}
                            </div>

                            {/* Logout */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-red-50 group"
                                    onClick={() => toggleSetting('logout')}
                                >
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-red-600">Logout</span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform group-hover:text-red-500", expandedSetting === 'logout' && "rotate-180")} />
                                </div>
                                {expandedSetting === 'logout' && (
                                    <div className="p-3 border-t border-slate-100 bg-red-50 flex flex-col items-center gap-2">
                                        <p className="text-xs text-red-600 font-medium">Are you sure you want to log out?</p>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full bg-red-500 text-white font-bold py-2 rounded text-xs hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <LogOut className="w-3 h-3" />
                                            Yes, Logout
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                    {activeTab === 'Post' && (
                        <div className="p-2 bg-[#F1F5F9] space-y-2 pb-20">
                            {userAds.length > 0 ? (
                                <>
                                    {/* First Row: Items 1-2 (Small) */}
                                    <div className="grid grid-cols-2 gap-2">
                                        {userAds.slice(0, 2).map(ad => (
                                            <div key={ad._id} className="bg-white rounded shadow-sm overflow-hidden flex flex-col">
                                                <div className="h-24 bg-slate-100 relative">
                                                    {ad.images && ad.images.length > 0 && (
                                                        <img src={`${API_BASE_URL}${ad.images[0]}`} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="p-1.5 flex-1 flex flex-col">
                                                    <div className="font-black text-[13px] text-slate-900 leading-tight mb-0.5">
                                                        {ad.price ? `${(ad.price / 100000).toFixed(1)} L` : 'N/A'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 leading-tight line-clamp-2 mb-1.5 min-h-[2.5em]">
                                                        {ad.headline}
                                                    </div>
                                                    <button
                                                        onClick={() => handlePromoteClick(ad)}
                                                        className="mt-auto w-full bg-orange-400 text-black text-[10px] font-bold py-1 rounded hover:bg-orange-500 transition-colors"
                                                    >
                                                        Promote This Post
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Second Row: Item 3 (Large) */}
                                    {userAds.length > 2 && userAds.slice(2, 3).map(ad => (
                                        <div key={ad._id} className="bg-white rounded shadow-sm overflow-hidden flex flex-col">
                                            <div className="h-40 bg-slate-100 relative">
                                                {ad.images && ad.images.length > 0 && (
                                                    <img src={`${API_BASE_URL}${ad.images[0]}`} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="p-2">
                                                <div className="font-black text-[14px] text-slate-900 mb-0.5">
                                                    {ad.price ? `${(ad.price / 100000).toFixed(1)} L` : 'N/A'}
                                                </div>
                                                <div className="text-[12px] font-bold text-slate-700 mb-2 truncate">
                                                    {ad.headline}
                                                </div>
                                                <div className="flex items-center gap-2 bg-orange-400 rounded px-1 py-0.5">
                                                    <button
                                                        onClick={() => handlePromoteClick(ad)}
                                                        className="flex-1 text-black text-[11px] font-bold pl-1"
                                                    >
                                                        Promote This Post
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Remaining Items 4+ (Fallback Grid) */}
                                    {userAds.length > 3 && (
                                        <div className="grid grid-cols-2 gap-2">
                                            {userAds.slice(3).map(ad => (
                                                <div key={ad._id} className="bg-white rounded shadow-sm overflow-hidden flex flex-col">
                                                    <div className="h-24 bg-slate-100 relative">
                                                        {ad.images && ad.images.length > 0 && (
                                                            <img src={`${API_BASE_URL}${ad.images[0]}`} className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div className="p-1.5 flex-1 flex flex-col">
                                                        <div className="font-black text-[13px] text-slate-900 leading-tight mb-0.5">
                                                            {ad.price ? `${(ad.price / 100000).toFixed(1)} L` : 'N/A'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 leading-tight line-clamp-2 mb-1.5 min-h-[2.5em]">
                                                            {ad.headline}
                                                        </div>
                                                        <button
                                                            onClick={() => handlePromoteClick(ad)}
                                                            className="mt-auto w-full bg-orange-400 text-black text-[10px] font-bold py-1 rounded hover:bg-orange-500 transition-colors"
                                                        >
                                                            Promote This Post
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-20 text-center text-slate-400 text-sm">
                                    No posts found.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Activity' && (
                        <div className="p-3 space-y-3 pb-20">
                            {/* Followed List */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleActivitySection('followed')}
                                >
                                    <span className="text-sm font-bold text-slate-800">
                                        Followed List <span className="text-xs font-normal text-slate-500">({activityData?.following?.length || 0})</span>
                                    </span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedActivity === 'followed' && "rotate-180")} />
                                </div>
                                {expandedActivity === 'followed' && (
                                    <div className="p-2 border-t border-slate-100 bg-slate-50 space-y-2">
                                        {activityData?.following?.map((user: any) => (
                                            <div key={user._id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded overflow-hidden bg-slate-200">
                                                        {user.photo ? <img src={getImageUrl(user.photo) || ''} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-300" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-800">{user.storeName || user.name}</h4>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-500 font-bold">FOLLOWING</span>
                                                    <button className="p-1 hover:bg-slate-100 rounded-full" title="Visit">
                                                        <Activity className="w-4 h-4 text-slate-700" /> {/* Using Activity icon as placeholder for Eye/Visit if Eye not imported, wait Eye is likely not imported or I need to check. Icons imported: ... 'Eye' is NOT in the list at top of file view 1, but 'Activity' is. I'll use ArrowRight or similar if Eye missing. I'll use 'ArrowRight' for visit. */}
                                                        {/* Actually I can use imported icons. 'User' is there. 'LogOut' is there. 
                                                          I will check imports again. 
                                                          Line 5: X, ArrowLeft, Star, Heart, MapPin, Share2, MoreVertical, Edit2, Plus, ArrowRight, Grid, User, Clock, Settings, FileText, Activity, Trash2, CheckCircle2, ChevronDown, Check, LogOut. 
                                                          No 'Eye'. I will use 'ArrowRight' for visit. 
                                                        */}
                                                        <ArrowRight className="w-4 h-4 text-slate-700" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(!activityData?.following || activityData.following.length === 0) && (
                                            <div className="text-center text-xs text-slate-400 py-2">No followed users.</div>
                                        )}
                                        <div className="text-center">
                                            <button className="text-[10px] text-slate-500 hover:text-slate-700 py-1">See More</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Favourite List */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleActivitySection('favorites')}
                                >
                                    <span className="text-sm font-bold text-slate-800">
                                        Favourite List <span className="text-xs font-normal text-slate-500">({activityData?.favorites?.length || 0})</span>
                                    </span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedActivity === 'favorites' && "rotate-180")} />
                                </div>
                                {expandedActivity === 'favorites' && (
                                    <div className="p-2 border-t border-slate-100 bg-slate-50 space-y-2">
                                        {activityData?.favorites?.map((ad: any) => (
                                            <div key={ad._id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded overflow-hidden bg-slate-200">
                                                        {ad.images && ad.images[0] ? <img src={`${API_BASE_URL}${ad.images[0]}`} alt="Ad" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-300" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{ad.headline}</h4>
                                                        <span className="text-[10px] text-slate-500">{ad.price ? `TK ${ad.price}` : 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <button className="p-1 hover:bg-slate-100 rounded-full">
                                                    <ArrowRight className="w-4 h-4 text-slate-700" />
                                                </button>
                                            </div>
                                        ))}
                                        {(!activityData?.favorites || activityData.favorites.length === 0) && (
                                            <div className="text-center text-xs text-slate-400 py-2">No favorite items.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleActivitySection('payment')}
                                >
                                    <span className="text-sm font-bold text-slate-800">Payment Info</span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedActivity === 'payment' && "rotate-180")} />
                                </div>
                                {expandedActivity === 'payment' && (
                                    <div className="p-2 border-t border-slate-100 bg-slate-50 space-y-2">
                                        {activityData?.payments?.map((payment: any) => (
                                            <div key={payment._id} className="bg-white p-2 rounded border border-slate-200 shadow-sm text-xs">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {/* Avatar placeholder for Payment Method if needed */}
                                                    <div className="font-bold text-slate-700">TK {payment.amount}, Pay By {payment.method}</div>
                                                </div>
                                                <div className="text-[10px] text-slate-500 space-y-0.5 ml-0">
                                                    <div>Post ID : {payment.ad || 'N/A'}, TId : {payment.transactionId}</div>
                                                    <div>Valid : {payment.validTill ? new Date(payment.validTill).toLocaleDateString() : 'N/A'}</div>
                                                    <div>Result : {payment.result || 'N/A'}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!activityData?.payments || activityData.payments.length === 0) && (
                                            <div className="text-center text-xs text-slate-400 py-2">No payment history.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Set 'Notify Me' Product */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleActivitySection('notify')}
                                >
                                    <span className="text-sm font-bold text-slate-800">Set 'Notify Me' Product</span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedActivity === 'notify' && "rotate-180")} />
                                </div>
                                {expandedActivity === 'notify' && (
                                    <div className="p-2 border-t border-slate-100 bg-slate-50">
                                        <div className="bg-white p-2 rounded border border-slate-200 min-h-[50px] flex flex-wrap gap-2 mb-2">
                                            {activityData?.notifyCategories?.map((cat: string) => (
                                                <span key={cat} className="bg-slate-100 border border-slate-300 rounded px-2 py-1 text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                                    {cat}
                                                    <button onClick={() => handleNotifyChange(cat)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                        </div>

                                        <div className="relative">
                                            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Select Categories to get notified</label>
                                            <div className="max-h-[150px] overflow-y-auto border border-slate-200 rounded bg-white p-1 grid grid-cols-2 gap-1">
                                                {categories.map((cat: any) => {
                                                    const isSelected = activityData?.notifyCategories?.includes(cat.name);
                                                    return (
                                                        <button
                                                            key={cat._id}
                                                            onClick={() => handleNotifyChange(cat.name)}
                                                            className={cn(
                                                                "text-left text-[11px] px-2 py-1.5 rounded transition-colors truncate",
                                                                isSelected ? "bg-orange-100 text-orange-700 font-bold" : "hover:bg-slate-50 text-slate-600"
                                                            )}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                    {activeTab !== 'Page' && activeTab !== 'Profile' && activeTab !== 'Settings' && activeTab !== 'Post' && activeTab !== 'Activity' && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Activity className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm font-medium">Coming Soon</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Promote Modal */}
            {showPromoteModal && promoteAd && (
                <PromoteModal
                    isOpen={showPromoteModal}
                    onClose={() => setShowPromoteModal(false)}
                    ad={promoteAd}
                />
            )}
        </div>
    );
}
