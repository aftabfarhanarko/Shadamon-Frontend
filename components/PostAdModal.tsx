"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft, Plus, ChevronDown, Check, Trash2, Loader2, Camera, Search, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/apiConfig';
import { getImageUrl } from '../utils/imageUrl';
import { useSettings } from '../app/context/SettingsContext';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface PostAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    editAd?: any;
    onSuccess?: (ad?: any) => void;
    initialMobile?: string;
}

interface SubItem {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    icon?: string;
    priceBoxShow?: boolean;
    priceBoxName?: string;
    features?: Feature[];
}

interface Feature {
    _id: string;
    name: string;
    inputType: string;
    buttonType: string;
    selectionType?: 'Single' | 'Multi';
    boxFadeName?: string;
    buttonItemNames: string[];
}

interface Category {
    _id: string;
    name: string;
    image?: string;
    icon?: string;
    subcategories: SubItem[];
}

interface Location {
    _id: string;
    name: string;
    image?: string;
    subLocations: SubItem[];
}

export default function PostAdModal({ isOpen, onClose, editAd, onSuccess, initialMobile }: PostAdModalProps) {
    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const { settings, fetchPostAdSettings } = useSettings();

    // Form State
    const [headline, setHeadline] = useState("");
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [hidePhone, setHidePhone] = useState(false);
    const [price, setPrice] = useState("");
    const [priceType, setPriceType] = useState("Negotiable");
    const [hasReadRules, setHasReadRules] = useState(true);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [mobileCheckResult, setMobileCheckResult] = useState<{ exists: boolean; verifiedBy: string | null } | null>(null);

    // Categories & Locations
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedSubLocation, setSelectedSubLocation] = useState("");

    // Wizard State
    const [view, setView] = useState<'form' | 'category' | 'category-sub' | 'location' | 'location-sub' | 'features' | 'loading' | 'status'>('loading');
    const [submissionStatus, setSubmissionStatus] = useState<{ status: 'review' | 'active' | 'limit-reached', limit?: number, ad?: any } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [tempCategory, setTempCategory] = useState<string>("");
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [tempSubCategory, setTempSubCategory] = useState<string>("");
    const [tempLocation, setTempLocation] = useState<string>("");
    const [tempSubLocations, setTempSubLocations] = useState<string[]>([]);

    const [newAdditionalNumber, setNewAdditionalNumber] = useState("");
    const [newAdditionalType, setNewAdditionalType] = useState("whatsapp");
    const [additionalPhones, setAdditionalPhones] = useState<{ number: string, types: string[] }[]>([]);
    const [featureValues, setFeatureValues] = useState<Record<string, any>>({});

    // OTP State
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [otpTimer, setOtpTimer] = useState(300);
    const [isEditingPhone, setIsEditingPhone] = useState(false);
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const headlineInputRef = useRef<HTMLInputElement>(null);

    const fillFormData = (ad: any) => {
        setHeadline(ad.headline || "");
        setDescription(ad.description || "");
        setPhone(ad.phone || "");
        setAdditionalPhones(ad.additionalPhones || []);
        setHidePhone(ad.hidePhone === true);
        setSelectedCategory(ad.category || "");
        setSelectedSubCategory(ad.subCategory || "");
        setSelectedLocation(ad.location || "");
        setSelectedSubLocation(ad.subLocation || "");
        setPrice(ad.price ? String(ad.price) : "");
        setPriceType(ad.priceType || "Negotiable");
        setExistingImages(ad.images || []);
        setFeatureValues(ad.features || {});
    };

    const fetchAdData = async (id: string) => {
        setLoadingData(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/ads/public/${id}`);
            const data = await res.json();
            if (data.success && data.data) {
                fillFormData(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch ad details:", error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (isOpen && view === 'form' && !loadingData && !showOtpVerification && headlineInputRef.current) {
            const timer = setTimeout(() => {
                headlineInputRef.current?.focus();
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isOpen, view, loadingData, showOtpVerification]);

    useEffect(() => {
        if (isOpen) {
            fetchPostAdSettings();
            fetchData();
            checkUser();
            if (editAd) {
                fillFormData(editAd);
                fetchAdData(editAd._id);
                setHasReadRules(true);
                setView('form');
            } else {
                setHeadline("");
                setDescription("");
                setPassword("");
                setName("");
                setAdditionalPhones([]);
                setHidePhone(false);
                setSelectedCategory("");
                setSelectedSubCategory("");
                setSelectedLocation("");
                setSelectedSubLocation("");
                setTempCategory("");
                setTempSubCategory("");
                setTempLocation("");
                setTempSubLocations([]);
                setExpandedCategory(null);
                setPrice("");
                setPriceType("Negotiable");
                setFeatureValues({});
                setImages([]);
                setExistingImages([]);
                setShowOtpVerification(false);
                setOtp(["", "", "", "", "", ""]);
                setOtpTimer(300);
                setIsEditingPhone(false);
                setMobileCheckResult(null);

                if (initialMobile) {
                    setPhone(initialMobile);
                } else {
                    setPhone("");
                }
                setSubmissionStatus(null);
                // View reset handled in checkUser
            }
        }
    }, [isOpen, editAd, initialMobile]);

    // OTP Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showOtpVerification && otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showOtpVerification, otpTimer]);

    useEffect(() => {
        if (!isOpen || isUserLoggedIn) return;

        if (/^\d{11}$/.test(phone.trim())) {
            checkMobileStatus(phone);
            return;
        }

        setMobileCheckResult(null);
    }, [isOpen, isUserLoggedIn, phone]);

    const fetchData = async () => {
        setLoadingData(true);
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
            console.error("Failed to load data", error);
        } finally {
            setLoadingData(false);
        }
    };

    const checkUser = async () => {
        const token = Cookies.get('token');

        let foundUser = false;

        if (token) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userData = await res.json();
                if (userData) {
                    setIsUserLoggedIn(true);
                    setUserData(userData);
                    if (userData.mobile) setPhone(userData.mobile);
                    if (userData.name) setName(userData.name);

                    if (!editAd) {
                        // Pre-fill preferences if available
                        if (userData.category && userData.location) {
                            setSelectedCategory(userData.category);
                            setSelectedLocation(userData.location);
                        }
                    }
                    setView('form');
                    return;
                }
            } catch (error) { }
        }

        setIsUserLoggedIn(false);
        // If we have an initial mobile (from MobileEntryModal), we go straigth to form
        // If we are editing, we go to form
        // Otherwise, previous logic might have asked for mobile, but now we assume MobileEntryModal handles entry.
        // So we default to form, but let the form handle "Unauth + No Phone" if that case ever happens (it shouldn't with correct parent logic)
        setView('form');
    };

    const handleCategorySelect = (cat: string, sub: string) => {
        setTempCategory(cat);
        setTempSubCategory(sub);

        // Update main state too just in case we skip
        setSelectedCategory(cat);
        setSelectedSubCategory(sub);

        setView('location');
    };

    const handleLocationSelect = (sub?: string) => {
        if (!tempLocation) {
            toast.error("Please select a location");
            return;
        }
        setSelectedLocation(tempLocation);

        // Single selection logic
        const subLoc = typeof sub === 'string' ? sub : tempSubLocations[0] || "";
        setSelectedSubLocation(subLoc);

        // Check if current subcategory has features
        const currentCat = categories.find(c => c.name === selectedCategory);
        const currentSub = currentCat?.subcategories.find(s => s.name === selectedSubCategory);

        if (currentSub?.features && currentSub.features.length > 0) {
            setView('features');
        } else {
            setView('form');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const limit = settings.productPhotoLimit || 10;
            if (images.length + existingImages.length + newFiles.length > limit) {
                toast.error(`Maximum ${limit} images allowed`);
                return;
            }
            setImages([...images, ...newFiles]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imgUrl: string) => {
        setExistingImages(existingImages.filter(img => img !== imgUrl));
    };

    const normalizeVerifiedBy = (value?: string | null) => String(value || "").trim().toLowerCase();

    const checkMobileStatus = async (mobileNumber: string) => {
        const trimmedMobile = mobileNumber.trim();

        if (!/^\d{11}$/.test(trimmedMobile)) {
            setMobileCheckResult(null);
            return null;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/user/check-mobile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: trimmedMobile })
            });
            const data = await res.json();

            if (res.ok) {
                const result = {
                    exists: !!data.exists,
                    verifiedBy: data.verifiedBy || null
                };
                setMobileCheckResult(result);
                return result;
            }
        } catch (error) {
            console.error("Failed to check mobile status:", error);
        }

        return null;
    };

    const addAdditionalPhone = () => {
        if (!newAdditionalNumber) {
            toast.error("Enter a number first");
            return;
        }
        setAdditionalPhones([...additionalPhones, { number: newAdditionalNumber, types: [newAdditionalType] }]);
        setNewAdditionalNumber("");
    };

    // OTP Handlers
    const handleOtpChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto move to next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        }
    };

    const handlePhoneEditSubmit = () => {
        setIsEditingPhone(false);
        setOtp(["", "", "", "", "", ""]);
        sendMobileOtp();
    };

    // Actual submission logic moved here
    const submitAd = async (authToken?: string, wasOtpVerified: boolean = false) => {
        let token = authToken || Cookies.get('token');

        // Auto-Auth if needed
        if (!token && !isUserLoggedIn) {
            try {
                const currentMobileCheck = mobileCheckResult || await checkMobileStatus(phone);
                const trimmedPhone = phone.trim();
                const loginPayload = /^\d{11}$/.test(trimmedPhone)
                    ? { mobile: trimmedPhone, password }
                    : { email: trimmedPhone, password };

                let res;
                let data;

                if (currentMobileCheck?.exists !== false) {
                    res = await fetch(`${API_BASE_URL}/api/user/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(loginPayload)
                    });
                    data = await res.json();

                    if (!res.ok || !data.token) {
                        toast.error(data.message || "Invalid mobile number or password");
                        setLoading(false);
                        return;
                    }
                } else {
                    res = await fetch(`${API_BASE_URL}/api/user/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, mobile: trimmedPhone, password })
                    });
                    data = await res.json();

                    if (!res.ok || !data.token) {
                        toast.error(data.message || "Authentication failed");
                        setLoading(false);
                        return;
                    }
                }

                token = data.token;
                Cookies.set('token', token as string, { expires: 7 }); // Save token
            } catch (err) {
                toast.error("Authentication Error");
                setLoading(false);
                return;
            }
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('headline', headline);
            formData.append('description', description);
            formData.append('category', selectedCategory);
            formData.append('subCategory', selectedSubCategory);
            formData.append('location', selectedLocation);
            formData.append('subLocation', selectedSubLocation);
            formData.append('phone', phone);
            formData.append('name', name);
            formData.append('hidePhone', String(hidePhone));
            formData.append('additionalPhones', JSON.stringify(additionalPhones));
            formData.append('remainingImages', JSON.stringify(existingImages));
            formData.append('features', JSON.stringify(featureValues));
            formData.append('price', price);
            formData.append('priceType', priceType);

            if (wasOtpVerified) {
                formData.append('verificationInfo', JSON.stringify({
                    number: phone,
                    at: new Date().toISOString()
                }));
            }

            images.forEach((file) => {
                formData.append('images', file);
            });

            const method = editAd ? 'PUT' : 'POST';
            const endpoint = editAd ? `${API_BASE_URL}/api/ads/${editAd._id}` : `${API_BASE_URL}/api/ads`;

            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (data.limitReached) {
                    toast.success("Ad posted! It's currently paused as you've reached the free limit for this category.");
                } else {
                    toast.success(editAd ? "Ad updated!" : "Ad posted successfully!");
                }
                if (onSuccess) onSuccess(data.data || data.ad);
                onClose();
            } else {
                toast.error(data.message || "Failed to process ad");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const sendMobileOtp = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/user/otp/mobile/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("OTP sent to your mobile");
                setShowOtpVerification(true);
                setOtpTimer(300);
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch (error) {
            toast.error("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const fullOtp = otp.join("");
        if (fullOtp.length !== 6) {
            toast.error("Please enter 6-digit OTP");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/user/otp/mobile/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp: fullOtp })
            });
            const data = await res.json();
            if (data.success) {
                submitAd(undefined, true);
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch (error) {
            toast.error("Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasReadRules) {
            toast.error("Please accept the Terms and Conditions");
            return;
        }

        // Basic validation before OTP
        if (!headline || !phone || (!isUserLoggedIn && !password)) {
            toast.error("Please fill in required fields");
            return;
        }

        // Check blocked words
        const headlineLower = headline.toLowerCase();
        const descLower = description.toLowerCase();

        const blockedHeadlineFound = (settings.blockCheckInHeadline || []).find(word => headlineLower.includes(word.toLowerCase()));
        if (blockedHeadlineFound) {
            toast.error(`Headline contains restricted word: ${blockedHeadlineFound}`);
            return;
        }

        const blockedDescFound = (settings.blockCheckInDescription || []).find(word => descLower.includes(word.toLowerCase()));
        if (blockedDescFound) {
            toast.error(`Description contains restricted word: ${blockedDescFound}`);
            return;
        }

        if (editAd) {
            submitAd();
            return;
        }

        const currentMobileCheck = !isUserLoggedIn ? (mobileCheckResult || await checkMobileStatus(phone)) : null;

        // If already verified by Mobile, skip OTP
        if (
            (isUserLoggedIn && normalizeVerifiedBy(userData?.verifiedBy) === 'mobile') ||
            (!isUserLoggedIn && currentMobileCheck?.exists && normalizeVerifiedBy(currentMobileCheck.verifiedBy) === 'mobile')
        ) {
            submitAd();
            return;
        }

        // For unverified users or new users, show OTP
        sendMobileOtp();
    };

    const subCat = categories
        .find(c => c.name === selectedCategory)
        ?.subcategories.find(s => s.name === selectedSubCategory);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1100] flex items-start justify-center pt-20">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            <div className="relative bg-[#F4F6F8] w-full max-w-[565px] rounded-t-lg rounded-b-none overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-full duration-300 shadow-2xl h-[calc(100vh-80px)]">

                {view === 'loading' && (
                    <div className="flex-1 flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                )}

                {view === 'category' && (
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-2.5 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => setView('form')}><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
                            <h2 className="text-[16px] text-slate-800">Pick a Category</h2>
                        </div>
                        <div className="p-2.5 bg-slate-50">
                            <div className="bg-white rounded-lg border border-slate-200 flex items-center px-3 py-2 gap-2">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search for a category"
                                    className="flex-1 text-sm outline-none placeholder:text-slate-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="divide-y divide-slate-100">
                                {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(cat => (
                                    <div key={cat._id} className="flex flex-col bg-white">
                                        <button
                                            onClick={() => setExpandedCategory(expandedCategory === cat._id ? null : cat._id)}
                                            className={cn(
                                                "w-full flex items-center justify-between py-1.5 px-4 hover:bg-slate-50 transition-colors",
                                                expandedCategory === cat._id && "bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center p-0.5">
                                                    {(cat.icon || cat.image) ? (
                                                        <img src={getImageUrl(cat.icon || cat.image || "") || ''} alt="" className="w-full h-full object-contain" loading="lazy" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs font-bold">
                                                            {cat.name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                                            </div>
                                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expandedCategory === cat._id && "rotate-180")} />
                                        </button>

                                        {/* Subcategories Accordion */}
                                        {expandedCategory === cat._id && (
                                            <div className="bg-slate-50 border-t border-slate-100">

                                                {cat.subcategories.map(sub => (
                                                    <button
                                                        key={sub._id}
                                                        onClick={() => {
                                                            setSelectedCategory(cat.name);
                                                            setSelectedSubCategory(sub.name);
                                                            setView('location');
                                                        }}
                                                        className="w-full flex items-center gap-3 py-1 pl-14 pr-4 hover:bg-slate-100 transition-colors text-left"
                                                    >
                                                        <div className="w-6 h-6 rounded shrink-0 flex items-center justify-center overflow-hidden">
                                                            {(sub.image || sub.icon) ? (
                                                                <img src={getImageUrl(sub.image || sub.icon || "") || ''} className="w-full h-full object-contain" loading="lazy" />
                                                            ) : (
                                                                <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-slate-400 text-[10px] font-bold">
                                                                    {sub.name[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-slate-600">{sub.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'location' && (
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-2.5 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => setView('category')}><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
                            <h2 className="text-[16px] text-slate-800">Pick a Location</h2>
                        </div>
                        <div className="p-2.5 bg-slate-50">
                            <div className="bg-white rounded-lg border border-slate-200 flex items-center px-3 py-2 gap-2">
                                <Search className="w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search for a location"
                                    className="flex-1 text-sm outline-none placeholder:text-slate-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="divide-y divide-slate-100">
                                {locations.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map(loc => (
                                    <button
                                        key={loc._id}
                                        onClick={() => {
                                            setTempLocation(loc.name);
                                            setSearchQuery("");
                                            setView('location-sub');
                                        }}
                                        className="w-full flex items-center justify-between py-1.5 px-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded shrink-0 flex items-center justify-center overflow-hidden">
                                                {loc.image ? (
                                                    <img src={getImageUrl(loc.image) || ''} alt="" className="w-full h-full object-contain" loading="lazy" />
                                                ) : (
                                                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">{loc.name}</span>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-slate-400 -rotate-90" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {view === 'location-sub' && (
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-2.5 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => setView('location')}><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
                            <h2 className="text-[16px] text-slate-800">{tempLocation}</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4">
                                <h3 className="text-sm mb-4 font-bold text-slate-800">Select Area</h3>
                                <div className="divide-y divide-slate-100">
                                    {locations.find(l => l.name === tempLocation)?.subLocations.map(sub => (
                                        <button
                                            key={sub._id}
                                            onClick={() => handleLocationSelect(sub.name)}
                                            className="w-full flex items-center justify-between py-3 px-2 hover:bg-slate-50 transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                {sub.image && (
                                                    <div className="w-6 h-6 shrink-0 rounded overflow-hidden">
                                                        <img src={getImageUrl(sub.image) || ''} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                    </div>
                                                )}
                                                <span className="text-sm text-slate-700 font-medium group-hover:text-black transition-colors">{sub.name}</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-slate-300 -rotate-90 group-hover:text-black transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {view === 'features' && (
                    <div className="flex flex-col h-full bg-white">
                        <div className="p-2.5 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => setView('location')}><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
                            <h2 className="text-[16px] text-slate-800">Add Details</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {categories.find(c => c.name === selectedCategory)?.subcategories.find(s => s.name === selectedSubCategory)?.features?.map((feature) => (
                                <div key={feature._id} className="space-y-2">
                                    <label className="text-sm font-bold text-slate-800 block">{feature.name}</label>

                                    {feature.buttonType === 'Radio' && (
                                        <div className="flex flex-wrap gap-3">
                                            {feature.buttonItemNames.map((item) => (
                                                <label key={item} className="flex items-center gap-2 cursor-pointer">
                                                    {feature.selectionType === 'Multi' ? (
                                                        <>
                                                            <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors shadow-sm", (featureValues[feature.name] || []).includes(item) ? 'bg-black border-black text-white' : 'border-slate-300 bg-white')}>
                                                                {(featureValues[feature.name] || []).includes(item) && <Check className="w-3 h-3 stroke-[4]" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={(featureValues[feature.name] || []).includes(item)}
                                                                onChange={() => {
                                                                    const currentVal = featureValues[feature.name] || [];
                                                                    if (currentVal.includes(item)) {
                                                                        setFeatureValues(prev => ({ ...prev, [feature.name]: currentVal.filter((i: string) => i !== item) }));
                                                                    } else {
                                                                        setFeatureValues(prev => ({ ...prev, [feature.name]: [...currentVal, item] }));
                                                                    }
                                                                }}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center transition-colors", featureValues[feature.name] === item ? 'border-black' : 'border-slate-300')}>
                                                                {featureValues[feature.name] === item && <div className="w-2 h-2 rounded-full bg-black" />}
                                                            </div>
                                                            <input
                                                                type="radio"
                                                                name={feature.name}
                                                                className="hidden"
                                                                checked={featureValues[feature.name] === item}
                                                                onChange={() => setFeatureValues(prev => ({ ...prev, [feature.name]: item }))}
                                                            />
                                                        </>
                                                    )}
                                                    <span className="text-sm text-slate-700 font-medium">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {feature.buttonType === 'Box' && feature.buttonItemNames.length === 1 && (
                                        <input
                                            type={feature.inputType === 'Number' ? 'number' : 'text'}
                                            placeholder={feature.boxFadeName || feature.buttonItemNames[0]}
                                            value={featureValues[feature.name] || ''}
                                            onChange={(e) => setFeatureValues(prev => ({ ...prev, [feature.name]: e.target.value }))}
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-black transition-colors"
                                        />
                                    )}

                                    {feature.buttonType === 'Box' && feature.buttonItemNames.length > 1 && (
                                        feature.selectionType === 'Multi' ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {feature.buttonItemNames.map(item => (
                                                    <label key={item} className="flex items-center gap-2 p-2 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer transition-colors">
                                                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors shadow-sm", (featureValues[feature.name] || []).includes(item) ? 'bg-black border-black text-white' : 'border-slate-300 bg-white')}>
                                                            {(featureValues[feature.name] || []).includes(item) && <Check className="w-3 h-3 stroke-[4]" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            className="hidden"
                                                            checked={(featureValues[feature.name] || []).includes(item)}
                                                            onChange={() => {
                                                                const currentVal = featureValues[feature.name] || [];
                                                                if (currentVal.includes(item)) {
                                                                    setFeatureValues(prev => ({ ...prev, [feature.name]: currentVal.filter((i: string) => i !== item) }));
                                                                } else {
                                                                    setFeatureValues(prev => ({ ...prev, [feature.name]: [...currentVal, item] }));
                                                                }
                                                            }}
                                                        />
                                                        <span className="text-xs text-slate-700 truncate font-medium">{item}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    value={featureValues[feature.name] || ''}
                                                    onChange={(e) => setFeatureValues(prev => ({ ...prev, [feature.name]: e.target.value }))}
                                                    className="w-full appearance-none border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:border-black bg-white transition-colors"
                                                >
                                                    <option value="" disabled>Select {feature.name}</option>
                                                    {feature.buttonItemNames.map(item => (
                                                        <option key={item} value={item}>{item}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50">
                            <button
                                onClick={() => setView('form')}
                                className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {view === 'form' && (
                    <>
                        <div className="flex items-center justify-between p-2 px-4 border-b border-slate-200 bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-black hover:bg-slate-50 rounded-full transition-colors">
                                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                                </button>
                                <h2 className="text-[16px] text-black font-medium">{editAd ? "Edit your AD" : "Post your AD"}</h2>
                            </div>
                            <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full">
                                <X className="w-5 h-5 text-black" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-3 pt-2 space-y-2 pb-40">
                            {/* Summary Card REMOVED */}

                            {loadingData ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                                </div>
                            ) : showOtpVerification ? (
                                <div className="bg-white rounded-lg p-5 border border-slate-100 min-h-[300px] flex flex-col items-center justify-center font-sans animate-in fade-in slide-in-from-right duration-300">
                                    <div className="w-full max-w-xs space-y-4">
                                        <h3 className="text-[17px] font-bold text-slate-800 text-left">Enter the OTP</h3>
                                        {isEditingPhone ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm text-slate-700 font-bold focus:outline-none focus:border-black"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handlePhoneEditSubmit}
                                                    className="bg-black text-white text-[11px] px-3 py-1.5 rounded font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
                                                >
                                                    Resend OTP
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-[14px] text-slate-500 text-left">
                                                Enter the OTP sent to <span className="font-bold text-slate-700">{phone}</span>
                                                {!(userData?.mobile || initialMobile || editAd?.phone) && (
                                                    <button
                                                        onClick={() => setIsEditingPhone(true)}
                                                        className="text-[#0088cc] hover:underline cursor-pointer font-medium ml-1"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </p>
                                        )}
                                        <div className="flex gap-2 justify-between pt-2">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={(el) => { otpInputRefs.current[index] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                    className="w-10 h-10 border border-slate-300 rounded text-center text-lg font-bold focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-slate-700"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="text-[13px] text-slate-400 font-medium">
                                                Resend OTP <span className="text-slate-800 font-bold ml-1">
                                                    {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-4">
                                            <button
                                                onClick={handleVerifyOtp}
                                                disabled={loading}
                                                className="w-full bg-[#1A1A1A] text-white py-3 rounded-lg text-sm font-bold tracking-wider hover:bg-black transition-colors disabled:opacity-50"
                                            >
                                                {loading ? "VERIFYING..." : "VERIFY & POST"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white rounded-lg p-3 border border-slate-100">
                                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                                            {existingImages.map((imgUrl, i) => (
                                                <div key={imgUrl} className="relative min-w-[80px] h-[80px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group">
                                                    <img src={getImageUrl(imgUrl) || ''} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                    <button onClick={() => removeExistingImage(imgUrl)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {images.map((file, i) => (
                                                <div key={i} className="relative min-w-[80px] h-[80px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group">
                                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" loading="lazy" />
                                                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {images.length + existingImages.length < 10 && (
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="min-w-[80px] h-[80px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 bg-slate-50/50 hover:bg-slate-100/80 transition-all"
                                                >
                                                    <div className="bg-slate-200 p-1.5 rounded-lg shadow-sm">
                                                        <Camera className="w-4 h-4 text-slate-600" />
                                                    </div>
                                                    <span className="text-[10px] font-bold leading-none">Add Photos</span>
                                                    <span className="text-[8px] font-medium opacity-70 text-center">or drag and drop</span>
                                                </button>
                                            )}
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                    </div>

                                    <div className="space-y-2 font-sans bg-slate-100">
                                        <div className="bg-white rounded-lg border border-slate-500 px-3 py-2 relative">
                                            <input
                                                ref={headlineInputRef}
                                                type="text"
                                                placeholder="Headline"
                                                value={headline}
                                                onChange={(e) => setHeadline(e.target.value)}
                                                onBlur={(e) => {
                                                    const val = e.target.value.toLowerCase();
                                                    const blocked = settings.blockCheckInHeadline || [];
                                                    const found = blocked.find(word => val.includes(word.toLowerCase()));
                                                    if (found) {
                                                        toast.error(`Headline contains restricted word: ${found}`);
                                                    }
                                                }}
                                                className="w-full pl-4 py-1 text-sm text-black placeholder:text-slate-400 focus:outline-none bg-white"
                                            />
                                        </div>

                                        <div className="bg-white rounded-lg border border-slate-500 px-3 py-3">
                                            <textarea
                                                placeholder="Description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                onBlur={(e) => {
                                                    const val = e.target.value.toLowerCase();
                                                    const blocked = settings.blockCheckInDescription || [];
                                                    const found = blocked.find(word => val.includes(word.toLowerCase()));
                                                    if (found) {
                                                        toast.error(`Description contains restricted word: ${found}`);
                                                    }
                                                }}
                                                className="w-full text-sm text-black placeholder:text-slate-400 focus:outline-none px-1 bg-white resize-y min-h-[100px] block"
                                            />
                                            <p className="text-[10px] text-black mt-2 px-1 leading-tight">*A nice & Detail Description Might Help your Product Sell Faster</p>
                                        </div>
                                    </div>

                                    {/* Category & Location Selection Section */}
                                    <div className="bg-white rounded-lg border border-slate-500 p-3 shadow-sm font-sans space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-[13px] text-slate-600 font-medium">
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-1 transition-colors",
                                                        !editAd ? "cursor-pointer hover:text-black" : "cursor-default"
                                                    )}
                                                    onClick={() => !editAd && setView('category')}
                                                >
                                                    <span className={selectedCategory ? "text-black font-bold" : "text-slate-400"}>
                                                        {selectedCategory || 'Category'}
                                                    </span>
                                                    {!editAd && <ChevronDown className="w-3 h-3 text-slate-400" />}
                                                </div>
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-1 transition-colors",
                                                        !editAd ? "cursor-pointer hover:text-black" : "cursor-default"
                                                    )}
                                                    onClick={() => !editAd && setView('category')}
                                                >
                                                    <span className={selectedLocation ? "text-black font-bold" : "text-slate-400"}>
                                                        {selectedLocation || 'Location'}
                                                    </span>
                                                    {!editAd && <ChevronDown className="w-3 h-3 text-slate-400" />}
                                                </div>
                                            </div>
                                            {!editAd && (
                                                <button
                                                    onClick={() => setView('category')}
                                                    className="text-[12px] text-[#0088cc] font-bold hover:underline"
                                                >
                                                    {(selectedCategory || selectedLocation) ? 'Change' : 'Select'}
                                                </button>
                                            )}
                                        </div>

                                        {Object.keys(featureValues).length > 0 && (
                                            <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {Object.entries(featureValues).map(([key, value]) => (
                                                        <div key={key} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-600 flex items-center gap-1">
                                                            <span className="font-bold">{key}:</span>
                                                            <span>{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {subCat?.priceBoxShow && (
                                        <div className="bg-slate-100 rounded-lg border border-slate-500 flex items-center overflow-hidden h-10 px-3">
                                            <div className="flex-1 flex items-center pr-2">
                                                <span className="text-[13px] text-slate-800 pr-2 border-r border-slate-300 whitespace-nowrap">
                                                    {subCat.priceBoxName || "দাম"}
                                                </span>
                                                <input
                                                    type="number"
                                                    placeholder=""
                                                    value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    className="w-full bg-transparent pl-2 text-[13px] text-black placeholder:text-slate-400 focus:outline-none"
                                                />
                                            </div>
                                            <div className="relative h-full flex items-center pl-2 border-l border-slate-300">
                                                <select
                                                    value={priceType}
                                                    onChange={(e) => setPriceType(e.target.value)}
                                                    className="bg-transparent text-[12px] text-slate-700 font-medium pr-6 focus:outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value="Negotiable">আলোচনা সাপেক্ষে</option>
                                                    <option value="Fixed">ফিক্সড</option>
                                                </select>
                                                <ChevronDown className="absolute right-0 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-white rounded-lg border border-slate-500 p-3.5 space-y-2 shadow-sm font-sans">
                                        <div className="space-y-1">
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Name"
                                                className="w-full text-[13px] text-black focus:outline-none placeholder:text-black px-1 border-b border-slate-500 pb-1"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 border-b border-slate-500 pb-1">
                                            <div className="flex items-center justify-center w-4 h-4 rounded-full bg-cyan-400 text-white shrink-0">
                                                <Check className="w-2.5 h-2.5 stroke-[4]" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={phone}
                                                readOnly={!!(userData?.mobile || initialMobile || editAd?.phone)}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="Phone Number"
                                                className={cn(
                                                    "flex-1 text-[14px] text-black tracking-wide focus:outline-none bg-transparent",
                                                    (userData?.mobile || initialMobile || editAd?.phone) ? "cursor-not-allowed" : "cursor-text"
                                                )}
                                            />
                                            {!(userData?.mobile || initialMobile || editAd?.phone) && (
                                                <button
                                                    onClick={() => {
                                                        if (additionalPhones.length > 0) {
                                                            setPhone(additionalPhones[0].number);
                                                            setAdditionalPhones(prev => prev.slice(1));
                                                        } else {
                                                            setPhone("");
                                                        }
                                                    }}
                                                    className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors shrink-0"
                                                >
                                                    <X className="w-3 h-3 stroke-[3]" />
                                                </button>
                                            )}
                                        </div>

                                        {!isUserLoggedIn && (
                                            <div className="space-y-1 pt-2">
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Password"
                                                    className="w-full text-[13px] text-black focus:outline-none placeholder:text-black px-1 border-b border-slate-500 pb-1"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2 pt-1">
                                            <div className="space-y-2">
                                                {additionalPhones.map((ap, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-500 group">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[13px] font-medium text-black">{ap.number}</span>
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-black text-white rounded uppercase">{ap.types[0]}</span>
                                                        </div>
                                                        <button onClick={() => setAdditionalPhones(prev => prev.filter((_, i) => i !== idx))}>
                                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-2 pt-2 pb-0">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="tel"
                                                        id="additional_phone"
                                                        className="block px-3 pb-2 pt-3 w-full text-[13px] text-black bg-transparent rounded-lg border border-slate-500 appearance-none focus:outline-none focus:ring-0 focus:border-black peer"
                                                        placeholder=" "
                                                        value={newAdditionalNumber}
                                                        onChange={(e) => setNewAdditionalNumber(e.target.value)}
                                                    />
                                                    <label
                                                        htmlFor="additional_phone"
                                                        className="absolute text-[12px] text-slate-400 duration-300 transform -translate-y-3 scale-90 top-1 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1 peer-focus:scale-90 peer-focus:-translate-y-3 left-2"
                                                    >
                                                        Add Another Number
                                                    </label>
                                                </div>

                                                <div className="relative h-[42px] w-[90px] border border-slate-500 rounded-lg flex items-center bg-white overflow-hidden shrink-0">
                                                    <select
                                                        value={newAdditionalType}
                                                        onChange={(e) => setNewAdditionalType(e.target.value)}
                                                        className="w-full h-full bg-transparent text-[11px] text-black font-medium pl-2 focus:outline-none appearance-none cursor-pointer"
                                                    >
                                                        <option value="whatsapp">WhatsApp</option>
                                                        <option value="telegram">Telegram</option>
                                                        <option value="imo">Imo</option>
                                                        <option value="mobile">Mobile</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-1 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={addAdditionalPhone}
                                                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center active:scale-90 transition-transform shrink-0 shadow-sm"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <label className="flex items-center gap-2 cursor-pointer pt-0">
                                                <input
                                                    type="checkbox"
                                                    className="w-3.5 h-3.5 rounded border-slate-300 text-slate-800 focus:ring-0"
                                                    checked={hidePhone}
                                                    onChange={(e) => setHidePhone(e.target.checked)}
                                                />
                                                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Hide Number, Only Message</span>
                                            </label>
                                        </div>

                                    </div>

                                    {/* Submission Section */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={
                                                loading ||
                                                (images.length === 0 && existingImages.length === 0) ||
                                                !headline.trim() ||
                                                !description.trim() ||
                                                !phone.trim() ||
                                                (!isUserLoggedIn && !password.trim()) ||
                                                (subCat?.priceBoxShow && !price.trim())
                                            }
                                            className={cn(
                                                "w-full py-3.5 rounded-lg text-[13px] font-bold tracking-widest active:scale-[0.98] transition-all",
                                                (loading || (images.length === 0 && existingImages.length === 0) || !headline.trim() || !description.trim() || !phone.trim() || (!isUserLoggedIn && !password.trim()) || (subCat?.priceBoxShow && !price.trim()))
                                                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                                    : "bg-[#1A1A1A] text-white hover:bg-black"
                                            )}
                                        >
                                            {loading ? (editAd ? "UPDATING..." : "POSTING...") : (editAd ? "EDIT AD" : "POST AD")}
                                        </button>
                                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="w-3.5 h-3.5 rounded-sm border-slate-300 text-slate-800 focus:ring-0"
                                                checked={hasReadRules}
                                                onChange={(e) => setHasReadRules(e.target.checked)}
                                            />
                                            <span className="text-[10px] text-slate-500 font-medium leading-none">
                                                I have read and accept the <span className="text-cyan-500 underline">Terms and Conditions</span>
                                            </span>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
                {/* Floating Chat Icon */}
                <div
                    className="absolute right-5 bottom-20 z-[210] cursor-pointer"
                    onClick={() => window.open('https://m.me/shadamon.bd', '_blank')}
                >
                    <div className="flex flex-col items-center">
                        <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all mb-1">
                            <MessageCircle className="w-5 h-5 fill-white" />
                        </button>
                        <button className="text-[11px] text-black font-bold">HelpChat</button>
                    </div>
                </div>
                {view === 'status' && submissionStatus && (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center font-sans">
                        {submissionStatus.status === 'review' ? (
                            <>
                                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                                    <Loader2 className="w-10 h-10 text-amber-500 animate-[spin_3s_linear_infinite]" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-3">আপনার বিজ্ঞাপনটি রিভিউতে আছে</h2>
                                <p className="text-slate-600 mb-8 leading-relaxed max-w-sm mx-auto">
                                    অ্যাডমিন আপনার বিজ্ঞাপনটি সফলভাবে চেক করলে এটি পাবলিশ হবে। বিজ্ঞাপন টি সরাসরি পাবলিশ করতে হলে ট্রাস্টেড মার্চেন্ট হতে পারেন। অথবা দ্রুত বিক্রয় করতে চাইলে বিজ্ঞাপনটি প্রমোট করতে পারেন।
                                </p>
                                <div className="w-full space-y-3">
                                    <button
                                        onClick={() => {
                                            if (onSuccess) onSuccess(submissionStatus.ad);
                                            onClose();
                                        }}
                                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                                    >
                                        আপনার অ্যাডটি প্রমোট করুন
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                                    >
                                        পরে করব
                                    </button>
                                </div>
                            </>
                        ) : submissionStatus.status === 'limit-reached' ? (
                            <>
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                    <X className="w-10 h-10 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800 mb-3">ফ্রি অ্যাড লিমিট শেষ হবেছে!</h2>
                                <p className="text-slate-600 mb-8 leading-relaxed max-w-sm mx-auto">
                                    আপনি আপনার ফ্রি অ্যাডের সীমা ({submissionStatus.limit}) অতিক্রম করেছেন। বিজ্ঞাপন জারি রাখতে এবং সরাসরি পাবলিশ করতে হলে অনুগ্রহ করে বিজ্ঞাপনটি এখন প্রমোট করুন।
                                </p>
                                <div className="w-full space-y-3">
                                    <button
                                        onClick={() => {
                                            if (onSuccess) onSuccess(submissionStatus.ad);
                                            onClose();
                                        }}
                                        className="w-full py-4 bg-[#FF4F01] text-white rounded-xl font-bold text-sm tracking-widest hover:bg-[#e64600] transition-all flex items-center justify-center gap-2"
                                    >
                                        অ্যাডটি প্রমোট করুন
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                                    >
                                        ফিরে যান
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
