"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ArrowLeft, Star, Heart, MapPin, Share2, MoreVertical, Edit2, Plus, ArrowRight, Grid, User, Clock, Settings, FileText, Activity, Trash2, CheckCircle2, ChevronDown, Check, LogOut, ExternalLink, Search, Bell, Copy } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/apiConfig';
import { getImageUrl } from '../utils/imageUrl';
import { useLanguage } from '../app/context/LanguageContext';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import PromoteModal from './PromoteModal';
import AdDetailsModal from './AdDetailsModal';
import VerifyProfileModal from './VerifyProfileModal';
import { RiCheckboxCircleFill } from 'react-icons/ri';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const VerifiedBadge = () => (
    <div className="relative group/badge flex items-center justify-center -mt-0.5 ml-1">
        <RiCheckboxCircleFill className="w-5 h-5 text-[#0088cc] shrink-0 cursor-pointer" />
        <div className="absolute bottom-full left-1/2 -translate-x-[20%] lg:-translate-x-1/2 mb-2 hidden group-hover/badge:block w-[240px] bg-slate-50 border border-slate-200 shadow-xl rounded-xl p-3 z-[100] animate-in fade-in zoom-in-95 duration-200 pointer-events-none text-left">
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed whitespace-normal break-words">
                <span className="font-bold text-black">Verified</span> by mobile number & additional checks to ensure authenticity.
            </p>
            <div className="absolute top-full left-[20%] lg:left-1/2 -translate-x-1/2 -mt-[1px]">
                <div className="w-3 h-3 bg-slate-50 border-b border-r border-slate-200 transform rotate-45" />
            </div>
        </div>
    </div>
);

interface AccountActivityModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId?: string; // If provided, viewing another user. If null, viewing self (logged in user)
    onOpenPostAd?: () => void;
    onEditAd?: (ad: any) => void;
    initialTab?: 'Page' | 'Profile' | 'Settings' | 'Post' | 'Activity';
}

export default function AccountActivityModal({ isOpen, onClose, userId, onOpenPostAd, onEditAd, initialTab = 'Page' }: AccountActivityModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'Page' | 'Profile' | 'Settings' | 'Post' | 'Activity'>(initialTab);
    const { t } = useLanguage();
    const [productTab, setProductTab] = useState<'All' | 'Popular'>('All');
    const [expandedSetting, setExpandedSetting] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // User Data State
    const [userData, setUserData] = useState<any>(null);
    const [isOwnAccount, setIsOwnAccount] = useState(false);
    const [userAds, setUserAds] = useState<any[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [selectedAdForDeletion, setSelectedAdForDeletion] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUrlChecking, setIsUrlChecking] = useState(false);
    const [urlStatus, setUrlStatus] = useState<'idle' | 'available' | 'taken'>('idle');

    // Password Change State
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showAboutInfo, setShowAboutInfo] = useState(false);


    // Promote Modal State
    const [promoteAd, setPromoteAd] = useState<any>(null);
    const [showPromoteModal, setShowPromoteModal] = useState(false);

    // CV Send State
    const [pendingCvAd, setPendingCvAd] = useState<any>(null);
    const [highlightCvFields, setHighlightCvFields] = useState(false);

    useEffect(() => {
        const handleInitSendCv = (e: CustomEvent) => {
            const ad = e.detail?.ad;
            setPendingCvAd(ad);
            setHighlightCvFields(true);
            setActiveTab('Profile');
            window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { activeTab: 'Profile' } }));
        };
        window.addEventListener('init-send-cv', handleInitSendCv as EventListener);
        return () => window.removeEventListener('init-send-cv', handleInitSendCv as EventListener);
    }, []);

    const handleDeleteAd = async (adId: string) => {
        const token = Cookies.get('token');
        if (!token) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/ads/${adId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success || res.ok) {
                toast.success(data.message || "Ad marked as deleted");
                setUserAds(prev => prev.map(ad => ad._id === adId ? { ...ad, status: 'deleted' } : ad));
                setSelectedAdForDeletion(null);
            } else {
                toast.error(data.message || "Failed to delete ad");
            }
        } catch (error) {
            console.error("Error deleting ad", error);
            toast.error("An error occurred while deleting ad");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (adId: string, currentStatus: string) => {
        if (!isOwnAccount) return;
        if (currentStatus === 'deleted') {
            toast.error("Cannot toggle status of deleted ads");
            return;
        }

        const token = Cookies.get('token');
        if (!token) {
            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/ads/${adId}/toggle-status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                const newStatus = data.data.status;
                setUserAds(prev => prev.map(ad => ad._id === adId ? { ...ad, status: newStatus } : ad));
                toast.success(data.message || `Ad is now ${newStatus === 'active' ? 'Active' : 'Paused'}`);
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error toggling ad status", error);
            toast.error("An error occurred while updating status");
        }
    };

    const handlePromoteClick = (ad: any) => {
        const token = Cookies.get('token');
        if (!token) {
            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
            return;
        }

        if (isOwnAccount) {
            setPromoteAd(ad);
            setShowPromoteModal(true);
        } else {
            if (onOpenPostAd) onOpenPostAd();
        }
    };

    // Ad Details Modal State
    const [selectedDetailAd, setSelectedDetailAd] = useState<any>(null);

    const handleSeeLiveClick = async (ad: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/ads/public/${ad._id}`);
            const data = await res.json();
            if (data.success) {
                setSelectedDetailAd(data.data);
                return;
            }
        } catch (e) {
            console.error("Error fetching ad for live view:", e);
        }
        setSelectedDetailAd(ad);
    };

    // Activity State
    const [activityData, setActivityData] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [expandedActivity, setExpandedActivity] = useState<string | null>('followed');

    // Rating State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);

    // Verify Profile Modal State
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

    const handleSubmitRating = async () => {
        if (ratingValue === 0) {
            toast.error("Please select a rating");
            return;
        }

        const token = Cookies.get('token');
        if (!token) {
            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
            setIsRatingModalOpen(false);
            return;
        }

        if (!userData || !userData._id) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/user/rate/${userData._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ stars: ratingValue })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Rating submitted successfully");
                setIsRatingModalOpen(false);
                setUserData((prev: any) => ({
                    ...prev,
                    rating: data.rating
                }));
            } else {
                toast.error(data.message || "Failed to submit rating");
            }
        } catch (error) {
            console.error("Error submitting rating", error);
            toast.error("Failed to submit rating");
        }
    };

    useEffect(() => {
        setShowAboutInfo(false);
        if (activeTab === 'Activity') {
            fetchActivityData();
            fetchCategories();
        }
        if (activeTab === 'Profile') {
            fetchLocations();
        }
    }, [activeTab]);

    useEffect(() => {
        // Check for profile tab request param
        const params = new URLSearchParams(window.location.search);
        if (isOpen && params.get('openUsersProfile') === 'true') {
            setActiveTab('Profile');
            // Clean up param
            params.delete('openUsersProfile');
            router.replace(`${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
        }
    }, [isOpen]);

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

    const fetchLocations = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/locations`);
            const data = await res.json();
            if (data.success) {
                setLocations(data.data);
            }
        } catch (error) {
            console.error("Error fetching locations", error);
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

    const handleRemoveNotifyPreference = async (prefId: string) => {
        try {
            const token = Cookies.get('token');
            if (!token) return;

            // Optimistic update
            setActivityData((prev: any) => ({
                ...prev,
                notifyPreferences: prev.notifyPreferences.filter((p: any) => p._id !== prefId)
            }));

            const res = await fetch(`${API_BASE_URL}/api/user/notify-preference/${prefId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Preference removed");
            } else {
                fetchActivityData(); // Revert/Sync on error
            }
        } catch (error) {
            console.error("Error removing preference", error);
            fetchActivityData();
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
        aboutBusiness: '',
        contact: ''
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
                aboutBusiness: userData.aboutBusiness || '',
                contact: userData.contact || ''
            });
        } else if (!userData) {
            // Reset to empty values when no user is selected or logged in
            setProfileForm({
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
                aboutBusiness: '',
                contact: ''
            });
        }
    }, [userData, isOwnAccount]);

    const handleProfileChange = (field: string, value: any) => {
        setProfileForm(prev => ({ ...prev, [field]: value }));
        if (field === 'sellerPageUrl') setUrlStatus('idle');
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

    const sendCvMessage = async (userProfileData: any, adData: any) => {
        const token = Cookies.get('token');
        if (!token) return;

        const adOwnerId = typeof adData.user === 'object' ? adData.user?._id : adData.user;
        const userName = userProfileData.name || 'User';
        const userPhone = userProfileData.mobile || (userProfileData.additionalMobiles?.[0]) || 'Not provided';
        const userEmail = userProfileData.email || 'Not provided';
        const userGender = userProfileData.gender || 'Not specified';
        const userLocation = userProfileData.location || 'Not specified';
        const userEducation = userProfileData.education || 'Not specified';
        const userProfession = userProfileData.profession || 'Not specified';

        const message = `Hello, I am interested in your ad: "${adData.headline}". Here is my contact info:
Name: ${userName}
Gender: ${userGender}
Location: ${userLocation}
Education: ${userEducation}
Profession: ${userProfession}
Phone: ${userPhone}
Email: ${userEmail}

I have sent my CV for your review.`;

        try {
            const formData = new FormData();
            formData.append('receiverId', adOwnerId);
            formData.append('adId', adData._id);
            formData.append('text', message);

            const res = await fetch(`${API_BASE_URL}/api/messages`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                toast.success("CV sent successfully!");
                setPendingCvAd(null);
                setHighlightCvFields(false);
            } else {
                toast.error("Failed to send CV. Please try again.");
            }
        } catch (error) {
            console.error("Error sending CV:", error);
            toast.error("Error sending CV");
        }
    };

    const saveProfile = async () => {
        // Filter empty mobiles
        const filteredMobiles = profileForm.additionalMobiles.filter(m => m.trim() !== '');

        if (pendingCvAd && highlightCvFields) {
            const hasMobile = profileForm.mobile || filteredMobiles.length > 0;
            if (!profileForm.gender || !profileForm.location || !profileForm.education || !profileForm.profession || !hasMobile || !profileForm.email) {
                toast.error("Please fill all mandatory fields (marked in red) to send CV.");
                return;
            }
        }

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

                if (pendingCvAd) {
                    await sendCvMessage({ ...userData, ...profileForm, additionalMobiles: filteredMobiles }, pendingCvAd);
                }
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
            setShowAboutInfo(false);
            if (initialTab) {
                setActiveTab(initialTab);
            }
            fetchUserData();
        } else {
            // Aggressively reset all states when closed to prevent stale data
            setProductTab('All');
            setShowAboutInfo(false);
            setUserData(null);
            setUserAds([]);
            setIsOwnAccount(false);
            setIsFollowing(false);
            setActiveTab(initialTab);
        }

        const handleRefresh = () => {
            if (isOpen) fetchUserData();
        };

        const handleAuthSync = () => {
            if (isOpen) fetchUserData();
        };

        window.addEventListener('refresh-ads', handleRefresh);
        window.addEventListener('auth-change', handleAuthSync);
        return () => {
            window.removeEventListener('refresh-ads', handleRefresh);
            window.removeEventListener('auth-change', handleAuthSync);
        };
    }, [isOpen, userId, initialTab, t]);

    const fetchUserData = async () => {
        setLoading(true);
        setUserData(null); // Clear previous data to avoid flickering
        setUserAds([]); // Clear previous ads
        setIsOwnAccount(false); // Reset account ownership status
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
            let own = false;

            if (!targetUserId && currentUser) {
                targetUserId = currentUser._id;
                own = true;
            } else if (targetUserId && currentUser && targetUserId === currentUser._id) {
                own = true;
            }

            setIsOwnAccount(own);

            let finalUser = null;
            if (targetUserId) {
                if (own && currentUser) {
                    finalUser = currentUser;
                    setUserData(currentUser);
                } else {
                    // Fetch fresh public profile for target user
                    try {
                        const profileRes = await fetch(`${API_BASE_URL}/api/user/profile/${targetUserId}`);
                        if (profileRes.ok) {
                            const profileData = await profileRes.json();
                            finalUser = profileData;
                            setUserData(profileData);

                            // Check if current user is following this target user
                            const actualId = profileData._id;
                            if (currentUser && currentUser.following && currentUser.following.includes(actualId)) {
                                setIsFollowing(true);
                            } else {
                                setIsFollowing(false);
                            }
                        }
                    } catch (err) {
                        console.error("Failed to fetch public profile", err);
                    }
                }

                // Update URL if missing or different
                const currentPath = window.location.pathname;
                const searchStr = window.location.search;
                const resolvedUser = finalUser || userData || (own ? currentUser : null);

                if (isOpen && resolvedUser) {
                    const userIdVal = resolvedUser._id;
                    const params = new URLSearchParams(searchStr);
                    if (params.get('profile') !== userIdVal && currentPath === '/dashboard') {
                        params.set('profile', userIdVal);
                        router.push(`/dashboard?${params.toString()}`, { scroll: false });
                    }
                }

                if (own) {
                    const adsRes = await fetch(`${API_BASE_URL}/api/ads/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const adsData = await adsRes.json();
                    if (adsData.success) setUserAds(adsData.data);
                } else {
                    const adsRes = await fetch(`${API_BASE_URL}/api/ads/public/all`);
                    const adsData = await adsRes.json();
                    if (adsData.success) {
                        const userPublicAds = adsData.data.filter((ad: any) => {
                            const adUser = ad.user || {};
                            const adUserId = adUser._id || ad.user;
                            const adUserUrl = adUser.sellerPageUrl;

                            // If we have resolved user data, use the unique _id
                            if (userData?._id) return adUserId === userData._id;

                            // Otherwise fallback to targetUserId which might be ID or username
                            if (targetUserId.match(/^[0-9a-fA-F]{24}$/)) {
                                return adUserId === targetUserId;
                            } else {
                                return adUserUrl === targetUserId;
                            }
                        });
                        setUserAds(userPublicAds);
                    }
                }
            }


        } catch (error) {
            console.error("Error fetching account activity", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!userData || !userData._id) return;
        setFollowLoading(true);

        const token = Cookies.get('token');
        if (!token) {
            // Trigger mobile entry modal
            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
            setFollowLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/user/follow/${userData._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (res.ok) {
                const newStatus = data.isFollowing;
                setIsFollowing(newStatus);

                // Update followers from backend response
                setUserData((prev: any) => ({
                    ...prev,
                    followers: data.followers
                }));

                // Dispatch event for other components to sync
                window.dispatchEvent(new CustomEvent('user-followed', {
                    detail: {
                        userId: userData._id,
                        isFollowing: newStatus,
                        followers: data.followers
                    }
                }));

                toast.success(newStatus ? "Followed successfully" : "Unfollowed successfully");
            } else {
                toast.error(data.message || "Something went wrong");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update follow status");
        } finally {
            setFollowLoading(false);
        }
    };

    const toggleSetting = (setting: string) => {
        setExpandedSetting(expandedSetting === setting ? null : setting);
    };

    const handleSendMessage = () => {
        const token = Cookies.get('token');
        if (!token) {
            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
            return;
        }
        // Placeholder for future implementation
        toast.success("Message feature coming soon");
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        window.dispatchEvent(new Event('auth-change'));
        toast.success("Logged out successfully");
        onClose();
        window.location.href = '/dashboard';
    };

    const handleCheckUrl = async () => {
        if (!profileForm.sellerPageUrl) return;
        setIsUrlChecking(true);
        setUrlStatus('idle');
        try {
            const token = Cookies.get('token');
            const res = await fetch(`${API_BASE_URL}/api/user/check-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url: profileForm.sellerPageUrl })
            });
            const data = await res.json();
            if (data.available) {
                setUrlStatus('available');
                toast.success("URL is available!");
            } else {
                setUrlStatus('taken');
                toast.error("URL is already taken.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to check URL");
        } finally {
            setIsUrlChecking(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            toast.error("Both current and new passwords are required");
            return;
        }
        setIsChangingPassword(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch(`${API_BASE_URL}/api/user/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordData)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Password changed successfully");
                setPasswordData({ currentPassword: '', newPassword: '' });
                setExpandedSetting(null);
            } else {
                toast.error(data.message || "Failed to change password");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleRequestDelete = async () => {
        setIsDeletingAccount(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch(`${API_BASE_URL}/api/user/delete-request`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("Account delete requested successfully");
                setExpandedSetting(null);
                // Optionally update local user status or log out
                setUserData((prev: any) => ({ ...prev, accountStatus: 'r_delete' }));
            } else {
                toast.error(data.message || "Failed to request delete");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsDeletingAccount(false);
        }
    };

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo' | 'storeLogo') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size too large (Max 5MB)");
            return;
        }

        // Optimistic Update with Object URL
        const objectUrl = URL.createObjectURL(file);

        let stateKey = 'photo';
        if (type === 'banner') stateKey = 'storeBanner';
        else if (type === 'storeLogo') stateKey = 'storeLogo';

        setUserData((prev: any) => ({
            ...prev,
            [stateKey]: objectUrl
        }));

        try {
            const token = Cookies.get('token');
            if (!token) return;

            const formData = new FormData();
            // Backend expects 'storeBanner', 'storeLogo' or 'photo'
            const fieldName = type === 'banner' ? 'storeBanner' : (type === 'storeLogo' ? 'storeLogo' : 'photo');
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
                const label = type === 'banner' ? 'Banner' : (type === 'storeLogo' ? 'Store Logo' : 'Profile photo');
                toast.success(`${label} updated!`);
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
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const displayUser = userData ? {
        ...userData,
        photo: getImageUrl(userData.photo),
        storeLogo: getImageUrl(userData.storeLogo),
        coverPhoto: getImageUrl(userData.storeBanner), // Backend uses storeBanner
        followersCount: Array.isArray(userData.followers) ? userData.followers.length : (typeof userData.followers === 'number' ? userData.followers : 0)
    } : {
        name: "User",
        storeName: "My Store",
        storeLogo: null,
        photo: null,
        coverPhoto: null,
        verifiedBy: null,
        followersCount: 0,
        rating: 0
    };

    // Filter ads logic
    const sortedByViews = [...userAds].sort((a, b) => (b.views || 0) - (a.views || 0));
    const promotedAds = sortedByViews.slice(0, 5); // Top 5 viewed
    const displayAds = productTab === 'Popular' ? promotedAds : userAds;

    const isCvFieldMissing = (field: string) => {
        if (!pendingCvAd || !highlightCvFields) return false;
        if (field === 'mobile') {
            const hasMobile = profileForm.mobile || profileForm.additionalMobiles.some(m => m.trim() !== '');
            return !hasMobile;
        }
        return !(profileForm as any)[field];
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-start justify-center pt-20">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-[#F4F6F8] w-full max-w-[565px] rounded-t-lg rounded-b-none overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl h-[calc(100vh-20px)]">

                {/* Header */}
                <div className="bg-white border-b border-slate-200 shrink-0">
                    <div className="flex items-center justify-between p-2 px-4 bg-white">
                        <div className="flex items-center gap-3">
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-black hover:bg-slate-50 rounded-full transition-colors">
                                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            <h2 className="text-[16px] text-black font-medium">Account Activity</h2>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full">
                            <X className="w-5 h-5 text-black" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="px-4 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {(isOwnAccount ? ['Page', 'Profile', 'Settings', 'Post', 'Activity'] : ['Page']).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-4 py-1.5 rounded text-[14px] font-medium transition-colors whitespace-nowrap border",
                                    activeTab === tab
                                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                                        : "bg-white text-black border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#F1F5F9] relative">
                    {loading && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#F1F5F9]">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {activeTab === 'Page' && (
                        <div className="pb-40">
                            {/* Banner & Profile Section */}
                            <div className="bg-white mb-2 pb-3 shadow-sm">
                                {/* Banner */}
                                <div className="h-[100px] mx-4 rounded-lg bg-slate-200 relative group overflow-hidden">
                                    {displayUser.coverPhoto ? (
                                        <img src={displayUser.coverPhoto} alt="Cover" className="w-full h-full object-cover" loading="lazy" />
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
                                                className="absolute bottom-2 right-2 w-6 h-6 bg-[#0088cc] backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Profile Info */}
                                <div className="px-4 pt-2 pb-2 relative">
                                    <div className="flex items-start gap-3">
                                        {/* Profile Pic - Left Aligned */}
                                        <div className="relative shrink-0">
                                            <div className="w-16 h-16 rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden relative group">
                                                {displayUser.storeLogo ? (
                                                    <img src={displayUser.storeLogo} alt={displayUser.name} className="w-full h-full object-cover" loading="lazy" />
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
                                                        onChange={(e) => handleImageUpload(e, 'storeLogo')}
                                                    />
                                                    <button
                                                        onClick={() => logoInputRef.current?.click()}
                                                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#0088cc] border border-white rounded-full flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* Info - Right of Logo */}
                                        <div className="flex-1 min-w-0 pt-1">
                                            {/* Row 1: Name, Verified, Follow */}
                                            <div className="flex items-center justify-between mb-0.5">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <h3 className="text-lg font-bold text-black leading-tight truncate">
                                                        {displayUser.storeName || displayUser.name}
                                                    </h3>
                                                    {displayUser.mVerified && <VerifiedBadge />}

                                                    {/* Get Verified Badge */}
                                                    {isOwnAccount && !displayUser.mVerified && (
                                                        <span
                                                            onClick={() => setIsVerifyModalOpen(true)}
                                                            className="px-2 py-[2px] bg-white border border-slate-200 text-xs text-black rounded-full shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                                                        >
                                                            Get Verified
                                                        </span>
                                                    )}
                                                </div>

                                                {!isOwnAccount && (
                                                    <button
                                                        onClick={handleFollowToggle}
                                                        disabled={followLoading}
                                                        className={cn(
                                                            "ml-2 px-3 py-1 text-xs rounded-full transition-all border shrink-0",
                                                            isFollowing
                                                                ? "bg-slate-100 text-black border-slate-300 hover:bg-slate-200"
                                                                : "bg-slate-100 text-black border-slate-300 hover:bg-slate-200"
                                                        )}
                                                    >
                                                        {followLoading ? '...' : (isFollowing ? t('Unfollow') : t('Follow'))}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Row 2: Ratings */}
                                            <div className="flex items-center gap-2 text-sm text-black leading-tight mb-0.5">
                                                <div className="text-black flex items-center">
                                                    {displayUser.rating || 0}
                                                    <span className="text-black font-normal ml-0.5">☆ Seller</span>
                                                </div>

                                                {!isOwnAccount && (
                                                    <button
                                                        onClick={() => {
                                                            const token = Cookies.get('token');
                                                            if (!token) {
                                                                window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
                                                            } else {
                                                                setIsRatingModalOpen(true);
                                                            }
                                                        }}
                                                        className="px-2 py-[1px] bg-white text-xs text-black rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
                                                    >
                                                        Ratings Seller
                                                    </button>
                                                )}
                                            </div>

                                            {/* Row 3: Followers */}
                                            <div className="text-black text-sm">
                                                <span className="text-black">{displayUser.followersCount}</span> {t('follower')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="mt-3 mb-3 border-t border-slate-200"></div>

                                    {/* Action Buttons */}
                                    {/* {!isOwnAccount && ( */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setShowAboutInfo(!showAboutInfo)}
                                                className="px-4 py-1.5 bg-slate-100 text-black text-xs font-bold rounded-full hover:bg-slate-200 transition-colors border border-slate-300"
                                            >
                                                About
                                            </button>
                                            {!isOwnAccount && (
                                                <button
                                                    onClick={handleSendMessage}
                                                    className="px-4 py-1.5 bg-slate-100 text-black text-xs font-bold rounded-full hover:bg-slate-200 transition-colors border border-slate-300"
                                                >
                                                    Send Message
                                                </button>
                                            )}
                                        </div>

                                        {showAboutInfo && displayUser.aboutBusiness && (
                                            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <h4 className="text-[13px] font-bold text-slate-800 mb-1">Business Information</h4>
                                                <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                    {displayUser.aboutBusiness}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {/* )} */}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const token = Cookies.get('token');
                                    if (!token) {
                                        window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
                                        return;
                                    }
                                    if (onOpenPostAd) onOpenPostAd();
                                }}
                                className="w-full bg-white px-3 py-2 mb-2 flex items-center justify-between shadow-sm border-y border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors text-left"
                            >
                                <span className="text-[12px] text-slate-500 italic">Promote your Business, <span className="font-bold text-slate-800 not-italic border-b border-transparent hover:border-slate-800">Create a post</span></span>
                            </button>

                            {/* Products Section */}
                            <div className="bg-white pt-2 min-h-[400px]">
                                <div className="px-4 flex items-center gap-3 mb-2 border-b border-slate-100">
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
                                <div className="p-4 bg-[#F1F5F9] space-y-3">
                                    {displayAds.length > 0 ? (
                                        <>
                                            {/* First Row: Items 1-2 (Small) */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {displayAds.slice(0, 2).map(ad => (
                                                    <div
                                                        key={ad._id}
                                                        onClick={() => handleSeeLiveClick(ad)}
                                                        className="bg-white rounded shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="h-24 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                                                            {/* Image */}
                                                            {ad.images && ad.images.length > 0 && (
                                                                <>
                                                                    <div className="absolute inset-0">
                                                                        <img src={getImageUrl(ad.images[0]) || undefined} className="w-full h-full object-cover blur-md opacity-50 scale-105" loading="lazy" />
                                                                    </div>
                                                                    <img src={getImageUrl(ad.images[0]) || undefined} className="relative max-w-full max-h-full object-contain z-10" loading="lazy" />
                                                                </>
                                                            )}
                                                            {(ad.status === 'pause' || ad.status === 'review' || ad.userUpdated || ad.userNewPhotos) && (
                                                                <div className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                                                    {ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos)
                                                                        ? 'Preparing'
                                                                        : ((ad.userUpdated || ad.userNewPhotos) ? 'Update in Review' : 'In Review')}
                                                                </div>
                                                            )}
                                                            {productTab === 'Popular' && (
                                                                <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                                    {ad.views || 0}
                                                                </div>
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos)) {
                                                                        toast("This ad is being prepared and is currently under review.");
                                                                        return;
                                                                    }
                                                                    handlePromoteClick(ad);
                                                                }}
                                                                className={cn(
                                                                    "mt-auto w-full text-white text-[10px] font-bold py-2.5 rounded transition-colors",
                                                                    ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos)
                                                                        ? "bg-amber-500 hover:bg-amber-600"
                                                                        : "bg-[#0088cc] hover:bg-[#0077b5]"
                                                                )}
                                                            >
                                                                {ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos) ? 'Preparing' : 'Promote This Post'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Second Row: Item 3 (Large) */}
                                            {displayAds.length > 2 && displayAds.slice(2, 3).map(ad => (
                                                <div
                                                    key={ad._id}
                                                    onClick={() => handleSeeLiveClick(ad)}
                                                    className="bg-white rounded shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                                                >
                                                    <div className="h-40 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                                                        {ad.images && ad.images.length > 0 && (
                                                            <>
                                                                <div className="absolute inset-0">
                                                                    <img src={getImageUrl(ad.images[0]) || undefined} className="w-full h-full object-cover blur-md opacity-50 scale-105" loading="lazy" />
                                                                </div>
                                                                <img src={getImageUrl(ad.images[0]) || undefined} className="relative max-w-full max-h-full object-contain z-10" loading="lazy" />
                                                            </>
                                                        )}
                                                        {(ad.status === 'pause' || ad.status === 'review' || ad.userUpdated || ad.userNewPhotos) && (
                                                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                                {ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos)
                                                                    ? 'Preparing'
                                                                    : ((ad.userUpdated || ad.userNewPhotos) ? 'Update in Review' : 'In Review')}
                                                            </div>
                                                        )}
                                                        {productTab === 'Popular' && (
                                                            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                                {ad.views || 0}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-2">
                                                        <div className="font-black text-[14px] text-slate-900 mb-0.5">
                                                            {ad.price ? `${(ad.price / 100000).toFixed(1)} L` : 'N/A'}
                                                        </div>
                                                        <div className="text-[12px] font-bold text-slate-700 mb-2 truncate">
                                                            {ad.headline}
                                                        </div>
                                                        <div className={cn(
                                                            "flex items-center gap-2 rounded px-1 py-1.5",
                                                            ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos)
                                                                ? "bg-amber-500"
                                                                : "bg-[#0088cc]"
                                                        )}>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos)) {
                                                                        toast("This ad is being prepared and is currently under review.");
                                                                        return;
                                                                    }
                                                                    handlePromoteClick(ad);
                                                                }}
                                                                className="flex-1 text-white text-[11px] font-bold pl-1 py-1.5"
                                                            >
                                                                {ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos) ? 'Preparing' : 'Promote This Post'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Remaining Items 4+ (Fallback Grid) */}
                                            {displayAds.length > 3 && (
                                                <div className="grid grid-cols-2 gap-3">
                                                    {displayAds.slice(3).map(ad => (
                                                        <div
                                                            key={ad._id}
                                                            onClick={() => handleSeeLiveClick(ad)}
                                                            className="bg-white rounded shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="h-24 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                                                                {ad.images && ad.images.length > 0 && (
                                                                    <>
                                                                        <div className="absolute inset-0">
                                                                            <img src={getImageUrl(ad.images[0]) || undefined} className="w-full h-full object-cover blur-md opacity-30 scale-105" loading="lazy" />
                                                                        </div>
                                                                        <img src={getImageUrl(ad.images[0]) || undefined} className="relative max-w-full max-h-full object-contain z-10" loading="lazy" />
                                                                    </>
                                                                )}
                                                                {(ad.status === 'pause' || ad.status === 'review' || ad.userUpdated || ad.userNewPhotos) && (
                                                                    <div className="absolute top-1 left-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                                                        {ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos)
                                                                            ? 'Preparing'
                                                                            : ((ad.userUpdated || ad.userNewPhotos) ? 'Update in Review' : 'In Review')}
                                                                    </div>
                                                                )}
                                                                {productTab === 'Popular' && (
                                                                    <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                                        {ad.views || 0}
                                                                    </div>
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
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos)) {
                                                                            toast("This ad is being prepared and is currently under review.");
                                                                            return;
                                                                        }
                                                                        handlePromoteClick(ad);
                                                                    }}
                                                                    className={cn(
                                                                        "mt-auto w-full text-white text-[10px] font-bold py-2.5 rounded transition-colors",
                                                                        ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos)
                                                                            ? "bg-amber-500 hover:bg-amber-600"
                                                                            : "bg-[#0088cc] hover:bg-[#0077b5]"
                                                                    )}
                                                                >
                                                                    {ad.adType === 'Promoted' && (ad.status === 'review' || ad.userUpdated || ad.userNewPhotos) ? 'Preparing' : 'Promote This Post'}
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
                                                No popular products found.
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
                                    <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-100 relative flex items-center justify-center">
                                        {displayUser.photo ? (
                                            <>
                                                <div className="absolute inset-0">
                                                    <img src={displayUser.photo} className="w-full h-full object-cover blur-sm opacity-30 scale-105" loading="lazy" />
                                                </div>
                                                <img src={displayUser.photo} className="relative max-w-full max-h-full object-contain z-10" loading="lazy" />
                                            </>
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
                                    <h2 className="text-[16px] text-slate-700">{displayUser.name}</h2>
                                    {/* <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                        <span>{profileForm.mobile}</span>
                                        <User className="w-3 h-3 ml-1" />
                                    </div> */}
                                    <p className="text-[14px] text-slate-400 leading-tight mt-0.5">
                                        Add a Verification Badge to your profile to become a trusted Customer or Seller.
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[14px] font-bold text-slate-400 leading-tight shrink-0">
                                            {displayUser._id}
                                        </p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(displayUser._id);
                                                toast.success("User ID copied to clipboard");
                                            }}
                                            className="p-1 text-slate-400 hover:text-[#0088cc] hover:bg-blue-50 rounded transition-all group"
                                            title="Copy ID"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {isOwnAccount && !displayUser.mVerified && (
                                <button
                                    onClick={() => setIsVerifyModalOpen(true)}
                                    className="w-full bg-[#EBF5FF] text-slate-800 text-sm py-2 rounded mb-3 hover:bg-blue-100 transition-colors"
                                >
                                    Get Verified Badge
                                </button>
                            )}

                            {/* Personal Information */}
                            <div className="mb-4">
                                <h3 className="text-base text-slate-800 mb-2">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {/* Name */}
                                    <div className="col-span-1">
                                        <label className="block text-xs text-slate-500 mb-0.5">Name</label>
                                        <input
                                            type="text"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.name}
                                            onChange={(e) => handleProfileChange('name', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-blue-500 bg-slate-50/50"
                                        />
                                    </div>
                                    {/* DOB */}
                                    <div className="col-span-1">
                                        <label className="block text-xs text-slate-500 mb-0.5">Date of Birth</label>
                                        <input
                                            type="date"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.dob}
                                            onChange={(e) => handleProfileChange('dob', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-blue-500 bg-slate-50/50"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="col-span-1">
                                        <label className="block text-xs text-slate-500 mb-0.5">Gender</label>
                                        <div className="relative">
                                            <select
                                                disabled={!isOwnAccount}
                                                value={profileForm.gender}
                                                onChange={(e) => handleProfileChange('gender', e.target.value)}
                                                className={cn(
                                                    "w-full border rounded px-2 py-1 text-sm text-black outline-none bg-slate-50/50 appearance-none",
                                                    isCvFieldMissing('gender') ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:border-blue-500"
                                                )}
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
                                        <label className="block text-xs text-slate-500 mb-0.5">Location</label>
                                        <div className="relative">
                                            <select
                                                disabled={!isOwnAccount}
                                                value={profileForm.location}
                                                onChange={(e) => handleProfileChange('location', e.target.value)}
                                                className={cn(
                                                    "w-full border rounded px-2 py-1 text-sm text-black outline-none bg-slate-50/50 appearance-none",
                                                    isCvFieldMissing('location') ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:border-blue-500"
                                                )}
                                            >
                                                <option value="">Select Location</option>
                                                {locations.map((loc: any) => (
                                                    <option key={loc._id} value={loc.name}>{loc.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Education */}
                                    <div className="col-span-1">
                                        <label className="block text-xs text-slate-500 mb-0.5">Education</label>
                                        <div className="relative">
                                            <select
                                                disabled={!isOwnAccount}
                                                value={profileForm.education}
                                                onChange={(e) => handleProfileChange('education', e.target.value)}
                                                className={cn(
                                                    "w-full border rounded px-2 py-1 text-sm text-black outline-none bg-slate-50/50 appearance-none",
                                                    isCvFieldMissing('education') ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:border-blue-500"
                                                )}
                                            >
                                                <option value="">Select Education</option>
                                                {['Less than high school', 'SSC', 'Inter', 'Diploma', 'Undergraduate', 'Associate degree', 'Bachelor', 'Masters', 'Doctorate'].map(edu => (
                                                    <option key={edu} value={edu}>{edu}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    {/* About Yourself */}
                                    <div className="col-span-1">
                                        <label className="block text-xs text-slate-500 mb-0.5">Write About Yourself</label>
                                        <textarea
                                            readOnly={!isOwnAccount}
                                            value={profileForm.aboutYourself}
                                            onChange={(e) => handleProfileChange('aboutYourself', e.target.value)}
                                            rows={2}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-blue-500 bg-slate-50/50 resize-y min-h-[40px]"
                                        />
                                    </div>

                                    {/* Profession */}
                                    <div className="col-span-1">
                                        <label className="block text-xs text-slate-500 mb-0.5">Current Profession</label>
                                        <input
                                            type="text"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.profession}
                                            onChange={(e) => handleProfileChange('profession', e.target.value)}
                                            className={cn(
                                                "w-full border rounded px-2 py-1 text-sm text-black outline-none bg-slate-50/50",
                                                isCvFieldMissing('profession') ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:border-blue-500"
                                            )}
                                        />
                                    </div>
                                    {/* Experience */}
                                    <div className="col-span-1">
                                        <label className="block text-xs text-slate-500 mb-0.5">Professional Experiance detail</label>
                                        <textarea
                                            readOnly={!isOwnAccount}
                                            value={profileForm.professionalExperience}
                                            onChange={(e) => handleProfileChange('professionalExperience', e.target.value)}
                                            rows={2}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-blue-500 bg-slate-50/50 resize-y min-h-[40px]"
                                        />
                                    </div>

                                    {/* Mobile (Editable) */}
                                    <div className="col-span-1">
                                        <label className="block text-xs text-slate-500 mb-0.5">Mobile</label>
                                        <div className="flex items-center relative">
                                            <input
                                                type="tel"
                                                readOnly={!!userData?.mobile || !isOwnAccount}
                                                value={profileForm.mobile}
                                                onChange={(e) => handleProfileChange('mobile', e.target.value)}
                                                className={cn(
                                                    "w-full border rounded px-2 py-1 text-xs text-slate-500 outline-none pr-8 bg-slate-50/50",
                                                    isCvFieldMissing('mobile') ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:border-blue-500"
                                                )}
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
                                        <label className="block text-xs text-slate-500 mb-0.5">Email</label>
                                        <input
                                            type="email"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.email}
                                            onChange={(e) => handleProfileChange('email', e.target.value)}
                                            className={cn(
                                                "w-full border rounded px-2 py-1 text-xs text-slate-500 outline-none bg-slate-50/50",
                                                isCvFieldMissing('email') ? "border-red-500 ring-1 ring-red-500" : "border-slate-200 focus:border-blue-500"
                                            )}
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
                                                className="flex-1 border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-blue-500 bg-slate-50/50"
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
                                    <button onClick={saveProfile} className="w-full bg-blue-500 text-white py-2.5 rounded-lg text-sm hover:bg-blue-600 transition-colors shadow-sm font-medium">
                                        {(pendingCvAd && highlightCvFields) ? 'Save and Send CV' : 'Save'}
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
                                        <label className="block text-xs text-slate-500 mb-0.5">Shop Name</label>
                                        <input
                                            type="text"
                                            readOnly={!isOwnAccount}
                                            value={profileForm.storeName}
                                            onChange={(e) => handleProfileChange('storeName', e.target.value)}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-blue-500 bg-slate-50/50"
                                        />
                                    </div>
                                    {/* Action Button */}
                                    {/* <div className="col-span-1">
                                        <label className="block text-xs text-slate-500 mb-0.5">Page Communicate buttion</label>
                                        <div className="relative">
                                            <select
                                                disabled={!isOwnAccount}
                                                value={profileForm.actionType}
                                                onChange={(e) => handleProfileChange('actionType', e.target.value)}
                                                className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-blue-500 bg-slate-50/50 appearance-none uppercase text-xs"
                                            >
                                                <option value="call">Call</option>
                                                <option value="chat">Message</option>
                                                <option value="both">Both</option>
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div> */}



                                    {/* Seller Page Username */}
                                    <div className="col-span-2">
                                        <label className="block text-xs text-slate-500 mb-0.5">Seller Page User Name</label>
                                        <div className="flex rounded border border-slate-200 overflow-hidden bg-slate-50/50 focus-within:border-blue-500">
                                            <span className="px-2 py-1 text-slate-400 text-sm border-r border-slate-200 bg-slate-100">www.shadamon.com/</span>
                                            <input
                                                type="text"
                                                readOnly={!isOwnAccount}
                                                value={profileForm.sellerPageUrl}
                                                onChange={(e) => handleProfileChange('sellerPageUrl', e.target.value)}
                                                className="flex-1 px-2 py-1 text-sm text-black outline-none bg-transparent font-bold"
                                            />
                                            {profileForm.sellerPageUrl && isOwnAccount && (
                                                <button
                                                    onClick={handleCheckUrl}
                                                    disabled={isUrlChecking}
                                                    className={cn(
                                                        "px-3 py-1 text-xs transition-colors",
                                                        urlStatus === 'available' ? "bg-green-100 text-green-700 hover:bg-green-200" :
                                                            urlStatus === 'taken' ? "bg-red-100 text-red-700 hover:bg-red-200" :
                                                                "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                                    )}
                                                >
                                                    {isUrlChecking ? "..." : urlStatus === 'available' ? "Available" : urlStatus === 'taken' ? "Taken" : "Check"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* About Business */}
                                    <div className="col-span-2">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <label className="block text-xs text-slate-500">About Business</label>
                                            <span className={cn(
                                                "text-[10px]",
                                                (profileForm.aboutBusiness?.trim().split(/\s+/).filter(Boolean).length || 0) > 200 ? "text-red-500 font-bold" : "text-slate-400"
                                            )}>
                                                {profileForm.aboutBusiness?.trim().split(/\s+/).filter(Boolean).length || 0}/200 words
                                            </span>
                                        </div>
                                        <textarea
                                            readOnly={!isOwnAccount}
                                            value={profileForm.aboutBusiness}
                                            onChange={(e) => {
                                                const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                                                if (words.length <= 200 || e.target.value.length < profileForm.aboutBusiness.length) {
                                                    handleProfileChange('aboutBusiness', e.target.value);
                                                } else {
                                                    // Truncate to 200 words
                                                    const truncated = e.target.value.trim().split(/\s+/).filter(Boolean).slice(0, 200).join(' ');
                                                    handleProfileChange('aboutBusiness', truncated);
                                                }
                                            }}
                                            rows={2}
                                            className="w-full border border-slate-200 rounded px-2 py-1 text-sm text-black outline-none focus:border-blue-500 bg-slate-50/50 resize-none"
                                        />
                                    </div>

                                </div>
                                {isOwnAccount && (
                                    <button onClick={saveProfile} className="w-full bg-blue-500 text-white py-2.5 rounded-lg text-sm hover:bg-blue-600 transition-colors shadow-sm mb-4">
                                        Save
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Settings' && (
                        <div className="p-4 space-y-3 pb-20">
                            {/* Change Password */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleSetting('password')}
                                >
                                    <span className="text-sm font-medium text-slate-700">Change Password</span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedSetting === 'password' && "rotate-180")} />
                                </div>
                                {expandedSetting === 'password' && (
                                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
                                        <div>
                                            <input
                                                type="password"
                                                placeholder="Current Password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-black outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="password"
                                                placeholder="New Password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-black outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isChangingPassword}
                                            className="w-full bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {isChangingPassword ? "Saving..." : "Change Password"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Delete Account */}
                            <div className="bg-white rounded border border-red-200 overflow-hidden">
                                <div className="p-3 bg-red-50 flex items-center justify-between">
                                    <div className="pr-4">
                                        <span className="text-sm font-bold text-red-600 block">Delete account</span>
                                        <span className="text-[10px] text-red-500 leading-tight block mt-0.5">You can delete your account after 7 days from registration.</span>
                                    </div>
                                    <button
                                        onClick={handleRequestDelete}
                                        disabled={isDeletingAccount}
                                        className="shrink-0 bg-red-500 text-white px-3 py-1.5 rounded text-xs hover:bg-red-600 font-bold disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {isDeletingAccount ? "Requesting..." : "Delete Request"}
                                    </button>
                                </div>
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
                        <div className="px-4 py-4 bg-white space-y-2 pb-20">
                            {userAds.length > 0 ? (
                                <div className="space-y-0">
                                    {userAds.map((ad, idx) => (
                                        <React.Fragment key={ad._id || idx}>
                                            <div className={cn(
                                                "bg-white rounded-lg overflow-hidden transition-all duration-200 mb-2",
                                                ad.status === 'deleted' && "grayscale opacity-60 bg-slate-50 pointer-events-none"
                                            )}>
                                                {/* Admin Notification Dialogue */}
                                                {ad.notificationDialogue && ad.notificationDialogue.trim() !== '' && (
                                                    <div className="bg-amber-50 p-2 px-3 flex items-center gap-2 border-b border-amber-100">
                                                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                                                            <Bell className="w-3.5 h-3.5 text-white fill-white" />
                                                        </div>
                                                        <p className="text-[11px] text-amber-900 leading-tight font-bold">
                                                            {ad.notificationDialogue}
                                                        </p>
                                                    </div>
                                                )}
                                                {/* Review Notice - Top of Post */}
                                                {(ad.status === 'pause' || ad.status === 'review') && (
                                                    <div className="bg-[#EEF2FF] p-2 px-3 flex items-center gap-2 border-b border-[#E0E7FF]">
                                                        <div className="w-6 h-6 rounded-full bg-[#3B82F6] flex items-center justify-center shrink-0">
                                                            <Search className="w-3.5 h-3.5 text-white stroke-[3]" />
                                                        </div>
                                                        <p className="text-[11px] leading-tight font-bold">
                                                            পোস্টটি রিভিউতে আছে, যাচাই করে পাবলিশ করা হবে। এখনই পাবলিশ করে বেশি কাস্টমার পেতে- প্রমোট করুন
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="p-3 flex gap-3">
                                                    {/* Left: Image (Spans height of details + performance) */}
                                                    <div className="w-[150px] shrink-0">
                                                        <div className="h-[120px] bg-slate-100 relative rounded overflow-hidden group mb-2 flex items-center justify-center">
                                                            {ad.images && ad.images.length > 0 ? (
                                                                <>
                                                                    <div className="absolute inset-0">
                                                                        <img src={getImageUrl(ad.images[0]) || undefined} className="w-full h-full object-cover blur-md opacity-30 scale-105" loading="lazy" />
                                                                    </div>
                                                                    <img
                                                                        src={getImageUrl(ad.images[0]) || undefined}
                                                                        className="relative max-w-full max-h-full object-contain z-10"
                                                                        alt={ad.headline}
                                                                        loading="lazy"
                                                                    />
                                                                </>
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No Image</div>
                                                            )}
                                                            {ad.status !== 'deleted' && ad.status !== 'pause' && ad.status !== 'review' && (
                                                                <button
                                                                    onClick={() => handleSeeLiveClick(ad)}
                                                                    className="absolute top-1 left-1 z-20 bg-white/90 text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm text-slate-700 hover:bg-white"
                                                                >
                                                                    See Live <ExternalLink className="w-2 h-2" />
                                                                </button>
                                                            )}
                                                            {isOwnAccount && ad.status !== 'deleted' && (
                                                                <div
                                                                    className="absolute bottom-1 left-1 z-20 bg-white rounded-full w-4 h-4 flex items-center justify-center cursor-pointer shadow-sm border border-slate-300"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedAdForDeletion(selectedAdForDeletion === ad._id ? null : ad._id);
                                                                    }}
                                                                >
                                                                    {selectedAdForDeletion === ad._id && (
                                                                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right: Info & Performance */}
                                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                        {/* Top Details */}
                                                        <div className="flex flex-col gap-0">
                                                            <h3 className="text-sm text-black line-clamp-1" title={ad.headline}>
                                                                {ad.headline}
                                                            </h3>
                                                            <div className="text-[11px] text-black truncate">
                                                                {ad.category || 'Category'}, {ad.location || 'Location'}
                                                            </div>
                                                            <div className="text-[10px] text-black">
                                                                Publish {ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.') : 'N/A'}
                                                            </div>
                                                        </div>


                                                        {/* Horizontal Divider */}
                                                        <div className="h-px bg-slate-500 w-[80%] my-0"></div>

                                                        {/* Bottom Subsection: Performance + Actions */}
                                                        <div className="flex items-start justify-between gap-1">
                                                            {/* Promote Performance Stats */}
                                                            <div className="text-[10px] text-black flex-1">
                                                                {ad.adType === 'Promoted' ? (
                                                                    <>
                                                                        <div className="mb-0.5 font-bold">Promote Performance</div>
                                                                        <div className="text-black leading-tight space-y-0.5">
                                                                            <div className="flex flex-wrap gap-x-2">
                                                                                <span>Budget : <span className="text-black">{ad.promoteBudget || 0}</span></span>
                                                                                <span>From : <span className="text-black">{ad.createdAt ? new Date(ad.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.') : 'N/A'}</span> to <span className="text-black">{ad.promoteEndDate ? new Date(ad.promoteEndDate).toLocaleDateString('en-GB').replace(/\//g, '.') : 'N/A'}</span></span>
                                                                            </div>
                                                                            <div className="flex gap-x-2">
                                                                                <span>View : <span className="text-black">{ad.promotedViews || 0}</span></span>
                                                                                <span>Delivery : <span className="text-black">{ad.promotedDeliveryCount || 0}</span></span>
                                                                                <span>Rate : <span className="text-black">{ad.promotedDeliveryCount > 0 ? ((ad.promotedViews / ad.promotedDeliveryCount) * 100).toFixed(0) : 0}%</span></span>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="mb-0.5 font-bold">Performance</div>
                                                                )}
                                                                <div className="mt-0.5">
                                                                    Lifetime View : <span className="text-black">{(ad.views || 0) + (ad.deliveryCount || 0)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Actions: Badge & Edit */}
                                                            <div className="flex flex-col items-end gap-1.5 shrink-0 pt-1">
                                                                <span
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (ad.adType === 'Promoted') {
                                                                            handleToggleStatus(ad._id, ad.status);
                                                                        }
                                                                    }}
                                                                    className={cn(
                                                                        "text-[10px] font-bold py-0.5 rounded-full w-[65px] inline-flex items-center justify-center transition-all duration-200",
                                                                        ad.adType === 'Promoted' && ad.status !== 'deleted' && "cursor-pointer hover:opacity-80 active:scale-95",
                                                                        ad.status === 'pause' ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200" :
                                                                            ad.status === 'deleted' ? "bg-red-100 text-red-600" : "bg-[#0088cc] text-white shadow-sm"
                                                                    )}
                                                                >
                                                                    {ad.status === 'pause' ? (ad.adType === 'Promoted' ? 'PAUSED' : 'In Review') :
                                                                        ad.status === 'deleted' ? 'Deleted' : (ad.adType === 'Promoted' ? 'AD On' : 'Free Ad')}
                                                                </span>
                                                                <div className="flex items-center gap-1.5">
                                                                    {selectedAdForDeletion === ad._id && isOwnAccount && ad.status !== 'deleted' && (
                                                                        <button
                                                                            onClick={() => handleDeleteAd(ad._id)}
                                                                            disabled={isDeleting}
                                                                            className="text-[10px] text-white bg-red-500 font-bold border border-red-500 px-3 py-0.5 rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
                                                                        >
                                                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                                                        </button>
                                                                    )}
                                                                    {ad.status !== 'deleted' && (
                                                                        <button
                                                                            onClick={() => onEditAd?.(ad)}
                                                                            className="text-[10px] text-slate-500 font-bold border border-slate-300 w-[65px] py-0.5 rounded-full hover:bg-slate-50 flex items-center justify-center"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Full Width Button */}
                                                <div className="px-3 pb-3 pt-0">
                                                    <button
                                                        onClick={() => handlePromoteClick(ad)}
                                                        disabled={ad.status === 'deleted'}
                                                        className={cn(
                                                            "w-full text-white text-[13px] font-medium py-1.5 rounded-md text-center transition-colors shadow-sm",
                                                            ad.status === 'deleted' ? "bg-slate-400 cursor-not-allowed" : "bg-[#3B82F6] hover:bg-blue-600"
                                                        )}
                                                    >
                                                        {ad.status === 'deleted' ? 'Post Deleted' :
                                                            ad.adType === 'Promoted' ? (
                                                                userData?.merchantTrustStatus === 'Trusted' ? 'Promotion Live' : 'Preparing'
                                                            ) : 'Promote'}
                                                    </button>
                                                </div>
                                            </div>
                                            {idx < userAds.length - 1 && <div className="h-[6px] bg-slate-300 my-0" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-slate-400 text-sm">
                                    No posts found.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Activity' && (
                        <div className="p-4 space-y-3 pb-20">
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
                                                        {user.photo ? <img src={getImageUrl(user.photo) || ''} alt={user.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-slate-300" />}
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
                                                        {ad.images && ad.images[0] ? <img src={getImageUrl(ad.images[0]) || undefined} alt="Ad" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-slate-300" />}
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

                            {/* Saved Notify Preferences (Subcategory + Location) */}
                            <div className="bg-white rounded border border-slate-200 overflow-hidden">
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50"
                                    onClick={() => toggleActivitySection('notifyPrefs')}
                                >
                                    <span className="text-sm font-bold text-slate-800">
                                        Saved Notify Preferences <span className="text-xs font-normal text-slate-500">({activityData?.notifyPreferences?.length || 0})</span>
                                    </span>
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedActivity === 'notifyPrefs' && "rotate-180")} />
                                </div>
                                {expandedActivity === 'notifyPrefs' && (
                                    <div className="p-2 border-t border-slate-100 bg-slate-50 space-y-2">
                                        {activityData?.notifyPreferences?.map((pref: any) => (
                                            <div key={pref._id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-blue-600">{pref.subCategory}</span>
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                                        <MapPin className="w-3 h-3" />
                                                        {pref.location}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveNotifyPreference(pref._id)}
                                                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {(!activityData?.notifyPreferences || activityData.notifyPreferences.length === 0) && (
                                            <div className="text-center text-xs text-slate-400 py-4 italic">
                                                সরাসরি প্রডাক্ট পেইজ থেকে 'Notify' বাটনে টাচ করে আপনার পছন্দের প্রডাক্ট সেভ করে রাখুন।
                                            </div>
                                        )}
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
            {showPromoteModal && (
                <PromoteModal
                    isOpen={showPromoteModal}
                    onClose={() => setShowPromoteModal(false)}
                    ad={promoteAd}
                />
            )}

            {/* Ad Details Modal */}
            {selectedDetailAd && (
                <AdDetailsModal
                    isOpen={!!selectedDetailAd}
                    onClose={() => setSelectedDetailAd(null)}
                    ad={selectedDetailAd}
                />
            )}

            {/* Rating Modal */}
            {isRatingModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRatingModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsRatingModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Rate this Seller</h3>
                            <p className="text-sm text-slate-500">How would you rate your experience?</p>
                        </div>

                        <div className="flex justify-center gap-3 mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRatingValue(star)}
                                    className="transition-transform hover:scale-110 active:scale-95 focus:outline-none group"
                                >
                                    <Star
                                        className={cn(
                                            "w-10 h-10 transition-colors",
                                            star <= ratingValue ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-50 group-hover:text-amber-200"
                                        )}
                                        strokeWidth={1.5}
                                    />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmitRating}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                        >
                            Submit Review
                        </button>
                    </div>
                </div>
            )}

            {isVerifyModalOpen && userData && (
                <VerifyProfileModal
                    isOpen={isVerifyModalOpen}
                    onClose={() => setIsVerifyModalOpen(false)}
                    user={userData}
                />
            )}
        </div>
    );
}
