"use client";

import React, { useState } from 'react';
import { ArrowLeft, X, Maximize2, MapPin, Grid, Eye, Share2, Phone, MessageCircle, FileText, ChevronUp, ChevronDown, Rocket, CheckCircle2, Truck, Undo2, Timer, ExternalLink, ChevronRight, Star, Bell, Search, Heart, AlertCircle, Contact, UserSquare2, SquareArrowOutUpRight } from 'lucide-react';
import { FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';
import { API_BASE_URL } from '../utils/apiConfig';
// Use centralized url helper
import { getImageUrl } from '../utils/imageUrl';
import { formatDistanceToNow } from 'date-fns';
import { useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useLanguage } from '../app/context/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiCheckboxCircleFill } from 'react-icons/ri';
import InfoModal from './InfoModal';

const VerifiedBadge = () => (
    <div className="relative group/badge flex items-center justify-center -mt-0.5 ml-1">
        <RiCheckboxCircleFill className="w-5 h-5 text-[#0088cc] shrink-0 cursor-pointer" />
        <div className="absolute bottom-full left-1/2 -translate-x-[20%] lg:-translate-x-1/2 mb-2 hidden group-hover/badge:block w-[240px] bg-slate-50 border border-slate-200 shadow-xl rounded-xl p-3 z-[100] animate-in fade-in zoom-in-95 duration-200 pointer-events-none text-left">
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed whitespace-normal break-words normal-case">
                <span className="font-bold text-black">Verified</span> by mobile number & additional checks to ensure authenticity.
            </p>
            <div className="absolute top-full left-[20%] lg:left-1/2 -translate-x-1/2 -mt-[1px]">
                <div className="w-3 h-3 bg-slate-50 border-b border-r border-slate-200 transform rotate-45" />
            </div>
        </div>
    </div>
);

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}


interface AdDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    ad: any; // Using any for flexibility with existing ad object structure
}

export default function AdDetailsModal({ isOpen, onClose, ad }: AdDetailsModalProps) {
    if (!isOpen || !ad) return null;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPhone, setShowPhone] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'shipping'>('details');
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(true);
    const [showOptionsPopup, setShowOptionsPopup] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isFavorited, setIsFavorited] = useState(false);
    const [isNotifying, setIsNotifying] = useState(false);
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [subcategories, setSubcategories] = useState<any[]>([]);

    const [actionButtons, setActionButtons] = useState<string[]>(['Call', 'Chat']);
    const { t } = useLanguage();
    const popupRef = useRef<HTMLDivElement>(null);
    const optionsButtonRef = useRef<HTMLButtonElement>(null);

    // Close popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
                optionsButtonRef.current && !optionsButtonRef.current.contains(event.target as Node)) {
                setShowOptionsPopup(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Real Data States
    const [promotedAds, setPromotedAds] = useState<any[]>([]);
    const [similarAds, setSimilarAds] = useState<any[]>([]);

    const images = ad.images || [];
    const hasImages = images.length > 0;

    // Reset states when ad changes
    useEffect(() => {
        setIsDescriptionExpanded(false);
        setCurrentImageIndex(0);
        setShowPhone(false);
        // Reset favorited/notifying local states until re-fetched
        setIsFavorited(false);
        setIsNotifying(false);
    }, [ad?._id]);

    // Fetch Ads Effect and Subcategory Info
    React.useEffect(() => {
        if (isOpen && ad) {
            // Fetch All Ads
            fetch(`${API_BASE_URL}/api/ads/public/all`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const allAds = data.data;

                        // Filter Promoted Ads
                        const promoted = allAds.filter((a: any) => a.adType === 'Promoted' && a._id !== ad._id);
                        setPromotedAds(promoted);

                        // Filter Similar Ads (Same Category)
                        const similar = allAds.filter((a: any) => a.category === ad.category && a._id !== ad._id);
                        setSimilarAds(similar);
                    }
                })
                .catch(err => console.error("Error fetching modal ads:", err));

            // Fetch Subcategories to determine button types
            fetch(`${API_BASE_URL}/api/categories/sub`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        let buttonTypeRaw = '';

                        // 1. Try to find buttonType directly if subCategory is fully populated object
                        if (typeof ad.subCategory === 'object' && ad.subCategory?.buttonType) {
                            buttonTypeRaw = ad.subCategory.buttonType;
                        }
                        // 2. Otherwise find in fetched list
                        else {
                            const identifier = typeof ad.subCategory === 'object' ? ad.subCategory?._id : ad.subCategory;

                            // Finds match by ID or Name (in case ad store subcategory name)
                            const matchedSub = data.data.find((s: any) =>
                                s._id === identifier || s.name === identifier
                            );

                            if (matchedSub) {
                                buttonTypeRaw = matchedSub.buttonType;
                            }
                        }

                        setSubcategories(data.data);

                        if (buttonTypeRaw) {
                            const buttons = buttonTypeRaw.split(',').map((s: string) => s.trim());
                            setActionButtons(buttons);
                        } else {
                            // Fallback default
                            setActionButtons(['Call', 'Message']);
                        }
                    }
                })
                .catch(err => console.error("Error fetching subcategories:", err));

            // Fetch current user if token exists to check ownership and favorites
            const token = Cookies.get('token');
            if (token) {
                fetch(`${API_BASE_URL}/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data && data._id) {
                            setCurrentUserId(data._id);
                            setCurrentUser(data);

                            // Set favorite status
                            const favorited = (data.favorites || []).some((favId: any) =>
                                (typeof favId === 'string' ? favId : favId?._id) === ad._id
                            );
                            setIsFavorited(favorited);

                            // Set notify status
                            const adSubCat = typeof ad.subCategory === 'object' ? ad.subCategory?.name : ad.subCategory;
                            const adLoc = typeof ad.location === 'object' ? ad.location?.name : ad.location;

                            const notifying = (data.notifyPreferences || []).some((p: any) =>
                                p.subCategory === adSubCat && p.location === adLoc
                            );
                            setIsNotifying(notifying);
                        }
                    })
                    .catch(err => console.error("Error fetching current user:", err));
            }
        }
    }, [isOpen, ad?._id, currentUserId]);


    const handlePromotePost = () => {
        const adOwnerId = typeof ad.user === 'object' ? ad.user?._id : ad.user;
        const isOwnAd = currentUserId === adOwnerId;

        if (isOwnAd) {
            window.dispatchEvent(new CustomEvent('open-promote-modal', { detail: { ad } }));
        } else {
            window.dispatchEvent(new CustomEvent('open-post-ad-modal'));
        }
        onClose();
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasImages) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-20">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-[565px] rounded-t-lg rounded-b-none overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl h-[calc(100vh-80px)] font-sans">

                {/* 1. Header */}
                <div className="flex items-center justify-between p-2 px-4 border-b border-slate-200 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-black hover:bg-slate-50 rounded-full transition-colors">
                            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <h2 className="text-[16px] text-black font-medium">Ad Details</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full">
                        <X className="w-5 h-5 text-black" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-white pb-32">

                    {/* 2. Image Gallery */}
                    <div className="relative w-full aspect-[16/9] bg-black group">
                        {hasImages ? (
                            <img
                                src={getImageUrl(images[currentImageIndex]) || undefined}
                                alt={ad.headline}
                                className="w-full h-full object-contain cursor-pointer"
                                onClick={() => setIsExpanded(true)}
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                                No Image Available
                            </div>
                        )}

                        {/* Expand Icon */}
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="absolute top-4 right-4 w-8 h-8 bg-white text-black border-2 border-black rounded-md flex items-center justify-center z-10 shadow-sm hover:bg-slate-50 transition-transform hover:scale-105"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>

                        {/* Pagination Dots */}
                        {hasImages && images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-black/30 rounded-full backdrop-blur-sm z-10">
                                {images.map((_: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(idx);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3">
                        {/* 3. Meta Info Bar */}
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{ad.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Grid className="w-3 h-3" />
                                    <span>{ad.category}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-[#0088cc]">
                                <Eye className="w-3 h-3" />
                                <span className="mr-1">{ad.deliveryCount || 0} Delivered</span>
                                <span>{ad.views || 0} Views</span>
                            </div>
                        </div>

                        {/* 4. Title & Price */}
                        <h1 className="text-base text-slate-800 leading-none mb-0.5">
                            {ad.headline}
                        </h1>
                        <p className="text-xs text-slate-900">
                            {ad.price ? `৳ ${ad.price.toLocaleString()}` : '0.00'}
                        </p>

                        {/* 5. Contact Section */}
                        <div className="bg-slate-200 rounded-lg mt-2 mb-2 p-3 border border-slate-100">
                            {/* Phone & Socials */}
                            <div className="flex items-center gap-2 mb-4">
                                {!(ad.hidePhone === true || ad.hidePhone === 'true') && (
                                    <>
                                        {/* Phone Section */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-[#1A202C] flex items-center justify-center text-white shrink-0">
                                                <Phone className="w-4 h-4 fill-white" />
                                            </div>
                                            <div className="flex flex-col leading-none justify-center">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-800 text-sm leading-none">
                                                        {showPhone ? (ad.phone || 'N/A') : '017 XXXXXXXX'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setShowPhone(!showPhone)}
                                                    className="text-[10px] text-slate-500 hover:text-blue-600 hover:underline text-left mt-0.5"
                                                >
                                                    Click to show number
                                                </button>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="h-6 w-[3px] bg-slate-400 mx-1 shrink-0" />
                                    </>
                                )}

                                {/* Socials */}
                                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                    {ad.additionalPhones && ad.additionalPhones.length > 0 ? (
                                        ad.additionalPhones.flatMap((ap: any) => {
                                            const apObj = typeof ap === 'string' ? JSON.parse(ap) : ap;
                                            return (apObj?.types || []).map((type: string) => ({ type, number: apObj?.number || '' }));
                                        }).filter((s: any) => s.number).map((social: any, sIdx: number, allSocials: any[]) => {
                                            let icon = null;
                                            let bgColor = "";
                                            let link = "";
                                            let title = "";

                                            const rawNum = social.number;
                                            if (!rawNum || String(rawNum) === "undefined") return null;
                                            const numStr = String(rawNum).trim();
                                            const formattedNumber = numStr.startsWith('+') ? numStr : `+88${numStr}`;

                                            if (social.type === 'whatsapp') {
                                                icon = <FaWhatsapp className="w-5 h-5" />;
                                                bgColor = "bg-[#25D366]";
                                                link = `https://wa.me/${formattedNumber}`;
                                                title = `WhatsApp: ${social.number}`;
                                            } else if (social.type === 'telegram') {
                                                icon = <FaTelegramPlane className="w-4 h-4 pr-0.5" />;
                                                bgColor = "bg-[#0088cc]";
                                                link = `https://t.me/${formattedNumber}`;
                                                title = `Telegram: ${social.number}`;
                                            } else if (social.type === 'imo') {
                                                icon = <BsChatDotsFill className="w-4 h-4 pb-0.5" />;
                                                bgColor = "bg-[#004c99]";
                                                link = `tel:${social.number}`; // Fallback for Imo
                                                title = `Imo: ${social.number}`;
                                            } else if (social.type === 'mobile') {
                                                icon = <Phone className="w-4 h-4" />;
                                                bgColor = "bg-slate-700";
                                                link = `tel:${social.number}`;
                                                title = `Call: ${social.number}`;
                                            }

                                            if (!icon) return null;

                                            return (
                                                <React.Fragment key={sIdx}>
                                                    <button
                                                        onClick={() => window.open(link, '_blank')}
                                                        className={`w-8 h-8 rounded-full text-white flex items-center justify-center shadow-sm shrink-0 ${bgColor}`}
                                                        title={title}
                                                    >
                                                        {icon}
                                                    </button>
                                                    {sIdx < allSocials.length - 1 && (
                                                        <div className="h-6 w-[2px] bg-slate-300 mx-0.5 shrink-0" />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <>
                                            {ad.phone && String(ad.phone) !== "undefined" && !(ad.hidePhone === true || ad.hidePhone === 'true') && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            const num = String(ad.phone).trim();
                                                            const formatted = num.startsWith('+') ? num : `+88${num}`;
                                                            window.open(`https://wa.me/${formatted}`, '_blank');
                                                        }}
                                                        className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm shrink-0"
                                                    >
                                                        <FaWhatsapp className="w-5 h-5" />
                                                    </button>

                                                    <div className="h-6 w-[2px] bg-slate-300 mx-0.5 shrink-0" />

                                                    <button
                                                        onClick={() => {
                                                            const num = String(ad.phone).trim();
                                                            const formatted = num.startsWith('+') ? num : `+88${num}`;
                                                            window.open(`https://t.me/${formatted}`, '_blank');
                                                        }}
                                                        className="w-8 h-8 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-sm shrink-0"
                                                    >
                                                        <FaTelegramPlane className="w-4 h-4 pr-0.5" />
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons Row */}
                            <div className="grid grid-cols-4 gap-2 relative">
                                {(() => {
                                    const otherButtons = actionButtons.filter(b => b !== 'Chat' && b !== 'Message');

                                    return (
                                        <>
                                            {/* Call Button - Only if requested and phone available */}
                                            {otherButtons.includes('Call') && !((ad.hidePhone === true || ad.hidePhone === 'true') || !ad.phone || String(ad.phone) === 'undefined') && (
                                                <button
                                                    onClick={() => window.location.href = `tel:${ad.phone}`}
                                                    className="col-span-1 bg-[#1A202C] text-white text-xs py-2 rounded-md hover:bg-slate-800 transition-colors"
                                                >
                                                    Call
                                                </button>
                                            )}

                                            {/* Chat Button - ALWAYS SHOW */}
                                            <button
                                                className="col-span-1 bg-white border border-slate-500 text-slate-700 text-xs py-2 rounded-md hover:bg-slate-50 transition-colors"
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent('open-chat-modal', { detail: { ad } }));
                                                }}
                                            >
                                                Chat
                                            </button>

                                            {/* Send CV Button - Only if requested */}
                                            {otherButtons.includes('Send CV') && (
                                                <button
                                                    onClick={async () => {
                                                        const token = Cookies.get('token');
                                                        if (!token) {
                                                            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
                                                            return;
                                                        }

                                                        const adOwnerId = typeof ad.user === 'object' ? ad.user?._id : ad.user;

                                                        const missingMobile = !currentUser?.mobile && !currentUser?.phone;
                                                        if (!currentUser?.gender || !currentUser?.location || !currentUser?.education || !currentUser?.profession || missingMobile || !currentUser?.email) {
                                                            window.dispatchEvent(new CustomEvent('init-send-cv', { detail: { ad } }));
                                                            onClose();
                                                            return;
                                                        }

                                                        const userName = currentUser?.name || 'User';
                                                        const userPhone = currentUser?.phone || currentUser?.mobile || 'Not provided';
                                                        const userEmail = currentUser?.email || 'Not provided';
                                                        const userGender = currentUser?.gender || 'Not specified';
                                                        const userLocation = currentUser?.location || 'Not specified';
                                                        const userEducation = currentUser?.education || 'Not specified';
                                                        const userProfession = currentUser?.profession || 'Not specified';

                                                        const message = `Hello, I am interested in your ad: "${ad.headline}". Here is my contact info:
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
                                                            formData.append('adId', ad._id);
                                                            formData.append('text', message);

                                                            const res = await fetch(`${API_BASE_URL}/api/messages`, {
                                                                method: 'POST',
                                                                headers: { 'Authorization': `Bearer ${token}` },
                                                                body: formData
                                                            });

                                                            const data = await res.json();
                                                            if (data.success) {
                                                                // Open chat modal immediately
                                                                window.dispatchEvent(new CustomEvent('open-chat-modal', { detail: { ad } }));
                                                                // Optionally close this modal
                                                                // onClose();
                                                            } else {
                                                                alert(data.message || "Failed to send CV. Please try again.");
                                                            }
                                                        } catch (err) {
                                                            console.error("Error sending CV:", err);
                                                            alert("An error occurred while sending your information.");
                                                        }
                                                    }}
                                                    className="col-span-1 bg-white border border-slate-500 text-slate-700 text-xs py-2 rounded-md hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span className="truncate">Send CV</span>
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                                <div className="col-span-1 relative">
                                    <button
                                        ref={optionsButtonRef}
                                        onClick={() => setShowOptionsPopup(!showOptionsPopup)}
                                        className="col-span-1 flex items-center justify-center h-full"
                                    >
                                        <SquareArrowOutUpRight className="w-10 h-10 stroke-[1.5]" color="#64748b" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            {/* Tabs Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setActiveTab('details');
                                            setIsDetailsOpen(true);
                                        }}
                                        className={`px-3 py-1.5 text-xs font-bold border rounded-md transition-all ${activeTab === 'details' ? 'border-slate-400 text-slate-800 bg-white shadow-sm' : 'border-transparent text-slate-400 hover:bg-slate-50'}`}
                                    >
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setShowShippingModal(true)}
                                        className="px-3 py-1.5 text-xs font-bold border border-transparent text-slate-400 hover:bg-slate-50 rounded-md transition-all"
                                    >
                                        Shipping & Safety
                                    </button>
                                </div>
                                <button onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
                                    <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${isDetailsOpen ? '' : 'rotate-180'}`} />
                                </button>
                            </div>

                            {/* Tab Content */}
                            {isDetailsOpen && (
                                <div className="animate-in slide-in-from-top-2 duration-200 min-h-[80px]">
                                    <div className="space-y-3">
                                        {(() => {
                                            const featuresObj = typeof ad.features === 'string' ? JSON.parse(ad.features) : (ad.features || {});
                                            if (Object.keys(featuresObj).length === 0) return null;

                                            // Find subcategory to get feature order
                                            const subCatIdentifier = typeof ad.subCategory === 'object' ? ad.subCategory?._id : ad.subCategory;
                                            const matchedSub = subcategories.find((s: any) => s._id === subCatIdentifier || s.name === subCatIdentifier);
                                            const orderedFeatureNames = matchedSub?.features?.map((f: any) => f.name) || [];

                                            // Sort features based on subcategory feature order
                                            const sortedFeatures = Object.entries(featuresObj).sort(([keyA], [keyB]) => {
                                                const indexA = orderedFeatureNames.indexOf(keyA);
                                                const indexB = orderedFeatureNames.indexOf(keyB);
                                                if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                                                if (indexA !== -1) return -1;
                                                if (indexB !== -1) return 1;
                                                return 0;
                                            });

                                            return (
                                                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 mb-2 p-0 pt-1 rounded-lg">
                                                    {sortedFeatures.map(([key, value]) => (
                                                        <div key={key} className="flex items-center gap-1.5">
                                                            <span className="text-xs text-black whitespace-nowrap shrink-0">{key}:</span>
                                                            <span className="text-xs text-black">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}
                                        <div className="text-xs text-slate-500 leading-relaxed relative">
                                            <p className={`whitespace-pre-wrap ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                                                {ad.description}
                                                {isDescriptionExpanded && (
                                                    <button
                                                        onClick={() => setIsDescriptionExpanded(false)}
                                                        className="ml-2 text-xs font-bold text-black hover:underline"
                                                    >
                                                        {t('show_less')}
                                                    </button>
                                                )}
                                            </p>
                                            {!isDescriptionExpanded && (
                                                <button
                                                    onClick={() => setIsDescriptionExpanded(true)}
                                                    className="absolute bottom-0 right-0 bg-white pl-1 text-xs font-bold text-black"
                                                >
                                                    ...{t('read_more')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 7. Promote Button (Moved inside scroll) */}
                        <div className="mt-4 mb-4">
                            <button
                                onClick={handlePromotePost}
                                className="w-full bg-[#0088cc] text-white text-sm rounded-lg py-2 flex flex-col items-center justify-center transition-colors shadow-sm hover:bg-[#0077b5] active:scale-[0.99]"
                            >
                                Promote This Post
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-200 w-full mb-1" />

                        {/* 8. Promoted Section */}
                        {promotedAds.length > 0 && (
                            <div className="mb-2 relative group/promoted">
                                <h3 className="text-black text-sm mb-2">Promoted</h3>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 scroll-smooth px-0.5" id="promoted-scroll">
                                    {promotedAds.map((pad) => (
                                        <div
                                            key={pad._id}
                                            className="min-w-[260px] max-w-[260px] bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer shrink-0 snap-center"
                                            onClick={() => window.location.href = `/dashboard?ad=${pad._id}`}
                                        >
                                            <div className="relative h-40 bg-slate-100">
                                                <img
                                                    src={getImageUrl(pad.images?.[0] || '')}
                                                    alt={pad.headline}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                {/* Top Left Badge */}
                                                <div className="absolute top-2 left-2 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                                                    FEATURED
                                                </div>
                                                {/* Top Right Star */}
                                                <button className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-[2px] transition-colors">
                                                    <Star className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="p-2">
                                                <h4 className="text-sm text-black truncate mb-1.5">{pad.headline}</h4>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1.5">
                                                    <div className="flex items-center gap-1 min-w-0">
                                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="truncate max-w-[100px]">{pad.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 min-w-0">
                                                        <Grid className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="truncate max-w-[100px]">{pad.category}</span>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-black">
                                                    {pad.price ? `৳${pad.price.toLocaleString()}` : 'Price on ask'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {promotedAds.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const el = document.getElementById('promoted-scroll');
                                            if (el) el.scrollBy({ left: 270, behavior: 'smooth' });
                                        }}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-slate-600 z-10"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="h-px bg-slate-200 w-full mb-1" />
                        {/* 9. Seller Information */}
                        <div className="border-t border-b border-slate-100 py-3">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div
                                    className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => {
                                        onClose();
                                        window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId: (ad as any).user?._id } }));
                                    }}
                                >
                                    {(ad as any).user?.storeLogo ? (
                                        <img
                                            src={getImageUrl((ad as any).user?.storeLogo)}
                                            alt="Seller"
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-red-600 flex items-center justify-center text-white text-xl font-bold">
                                            {(ad as any).user?.storeName?.charAt(0) || 'S'}
                                        </div>
                                    )}
                                </div>

                                {/* Info Column */}
                                <div className="flex-1 flex flex-col pt-0.5">
                                    <span className="text-[10px] text-slate-500 leading-none mb-0.5">Seller Information</span>

                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <h4
                                            className="font-bold text-slate-900 text-sm leading-tight cursor-pointer hover:text-blue-600 hover:underline"
                                            onClick={() => {
                                                onClose();
                                                window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId: (ad as any).user?._id } }));
                                            }}
                                        >
                                            {(ad as any).user?.storeName || 'Store Name'}
                                        </h4>
                                        {(ad as any).user?.mVerified && <VerifiedBadge />}
                                    </div>

                                    <div className="text-[11px] text-slate-500 leading-none mb-1">
                                        {(ad as any).user?.followers || 0} Follower
                                    </div>

                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`w-3 h-3 ${s <= Math.round((ad as any).user?.rating || 4) ? 'fill-[#0088cc] text-[#0088cc]' : 'fill-slate-200 text-slate-200'}`}
                                            />
                                        ))}
                                        <span className="text-[10px] text-slate-400 ml-1">
                                            ({(ad as any).user?.ratingCount || 9})
                                        </span>
                                    </div>
                                </div>

                                {/* Visit Shop Button */}
                                <button
                                    className="text-xs text-slate-600 hover:text-[#0088cc] whitespace-nowrap self-center pr-2 font-bold"
                                    onClick={() => {
                                        onClose();
                                        window.dispatchEvent(new CustomEvent('open-account-modal', { detail: { userId: (ad as any).user?._id } }));
                                    }}
                                >
                                    Visit Shop
                                </button>
                            </div>
                        </div>
                        <div className="h-px bg-slate-200 w-full mb-1" />

                        {/* 10. Similar Product */}
                        {similarAds.length > 0 && (
                            <div className="">
                                <h3 className="text-black text-sm mb-1">Similar Product</h3>
                                <div className="space-y-3">
                                    {similarAds.slice(0, 5).map((sad) => (
                                        <div key={sad._id} className="flex gap-3 bg-white border border-slate-100 rounded-lg overflow-hidden shadow-sm p-2 pt-0 cursor-pointer" onClick={() => window.location.href = `/dashboard?ad=${sad._id}`}>
                                            <div className="w-24 h-20 bg-slate-100 rounded bg-cover bg-center shrink-0">
                                                {getImageUrl(sad.images?.[0]) && (
                                                    <img
                                                        src={getImageUrl(sad.images?.[0]) || ''}
                                                        alt={sad.headline}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="text-xs text-slate-800 line-clamp-2 mb-1">{sad.headline}</h4>
                                                <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-1">
                                                    <div className="flex items-center gap-1 min-w-0">
                                                        <MapPin className="w-2.5 h-2.5 shrink-0" />
                                                        <span className="truncate max-w-[80px]">{sad.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 min-w-0">
                                                        <Grid className="w-2.5 h-2.5 shrink-0" />
                                                        <span className="truncate max-w-[80px]">{sad.category}</span>
                                                    </div>
                                                </div>
                                                <div className="text-sm text-slate-900">
                                                    {sad.price ? `৳ ${sad.price.toLocaleString()}` : 'Price on ask'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Options Popup Overlay */}
                {showOptionsPopup && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/20 animate-in fade-in duration-200">
                        <div
                            ref={popupRef}
                            className="w-[280px] bg-[#F8F9FB] rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)] border border-slate-200 p-4 animate-in zoom-in-95 duration-200"
                        >
                            {/* Top Row */}
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                <div
                                    onClick={async () => {
                                        const token = Cookies.get('token');
                                        if (!token) {
                                            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
                                            return;
                                        }
                                        try {
                                            const res = await fetch(`${API_BASE_URL}/api/user/notify-preference/toggle`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({
                                                    subCategory: typeof ad.subCategory === 'object' ? ad.subCategory?.name : ad.subCategory,
                                                    location: typeof ad.location === 'object' ? ad.location?.name : ad.location,
                                                    adId: ad._id
                                                })
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                setIsNotifying(data.isNotifying);
                                                // toast.success(data.message);
                                            } else {
                                                alert(data.message || 'Failed to update preference');
                                            }
                                        } catch (err) {
                                            console.error("Error toggling notify preference:", err);
                                        }
                                    }}
                                    className="flex flex-col items-center gap-1 cursor-pointer group"
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full shadow-sm border flex items-center justify-center transition-colors",
                                        isNotifying
                                            ? "bg-teal-500 border-teal-600 text-white"
                                            : "bg-slate-200 border-slate-200 text-slate-700 group-hover:bg-slate-300"
                                    )}>
                                        <Bell className={cn("w-5 h-5", isNotifying && "fill-current")} />
                                    </div>
                                    <span className={cn("text-[10px] font-medium whitespace-nowrap", isNotifying ? "text-teal-600" : "text-slate-600")}>
                                        {isNotifying ? 'Notifying' : 'Notify'}
                                    </span>
                                </div>
                                <div
                                    onClick={async () => {
                                        const token = Cookies.get('token');
                                        if (!token) {
                                            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
                                            return;
                                        }
                                        try {
                                            const res = await fetch(`${API_BASE_URL}/api/messages/call-me`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ adId: ad._id })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                setShowOptionsPopup(false);
                                                // Open chat window after sending
                                                window.dispatchEvent(new CustomEvent('open-chat-modal', { detail: { ad } }));
                                            } else {
                                                alert(data.message || 'Failed to send request');
                                            }
                                        } catch (err) {
                                            console.error("Error sending call-me request:", err);
                                        }
                                    }}
                                    className="flex flex-col items-center gap-1 cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-200 shadow-sm border border-slate-200 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                                        <Phone className="w-5 h-5 text-slate-700 fill-black" />
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-medium whitespace-nowrap">Call Me</span>
                                </div>
                                <div
                                    onClick={() => {
                                        // Scroll to similar ads
                                        setShowOptionsPopup(false);
                                        const el = document.getElementById('similar-section');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="flex flex-col items-center gap-1 cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-200 shadow-sm border border-slate-200 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                                        <Search className="w-5 h-5 text-slate-700" />
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-medium">Similar</span>
                                </div>
                                <div
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: ad.headline,
                                                url: window.location.href
                                            });
                                        }
                                    }}
                                    className="flex flex-col items-center gap-1 cursor-pointer group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-slate-200 shadow-sm border border-slate-200 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                                        <Share2 className="w-5 h-5 text-slate-700 fill-black" />
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-medium">Share</span>
                                </div>
                            </div>

                            {/* Bottom Row */}
                            <div className="grid grid-cols-4 gap-2">
                                <div
                                    onClick={async () => {
                                        const token = Cookies.get('token');
                                        if (!token) {
                                            window.dispatchEvent(new CustomEvent('open-mobile-entry-modal'));
                                            return;
                                        }
                                        try {
                                            const res = await fetch(`${API_BASE_URL}/api/user/favorite/${ad._id}`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                }
                                            });
                                            const data = await res.json();
                                            if (res.ok) {
                                                setIsFavorited(data.isFavorited);
                                                // toast.success(data.message);
                                            } else {
                                                alert(data.message || 'Failed to update preferences');
                                            }
                                        } catch (err) {
                                            console.error("Error toggling favorite:", err);
                                        }
                                    }}
                                    className="flex flex-col items-center gap-1 cursor-pointer group"
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-full shadow-sm border flex items-center justify-center transition-colors",
                                        isFavorited
                                            ? "bg-rose-500 border-rose-600 text-white"
                                            : "bg-slate-200 border-slate-100 group-hover:bg-slate-300 text-slate-700"
                                    )}>
                                        <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
                                    </div>
                                    <span className={cn("text-[10px] font-medium", isFavorited ? "text-rose-600" : "text-slate-600")}>
                                        {isFavorited ? 'Saved' : 'Save'}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center gap-1 cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                                        <AlertCircle className="w-5 h-5 text-slate-700" />
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-medium">Report</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                                        <UserSquare2 className="w-5 h-5 text-slate-700" />
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-medium">Post ID</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* EXPANDED IMAGE OVERLAY */}
            {isExpanded && (
                <div className="fixed inset-0 z-[300] bg-black flex flex-col animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 text-white">
                        <span className="text-sm font-medium">{currentImageIndex + 1} / {images.length}</span>
                        <button onClick={() => setIsExpanded(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Main Image Area */}
                    <div className="flex-1 flex items-center justify-center relative overflow-hidden p-4">
                        {images.length > 1 && (
                            <button onClick={prevImage} className="absolute left-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-20">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        )}

                        {hasImages && (
                            <img
                                src={getImageUrl(images[currentImageIndex]) || undefined}
                                alt="Expanded View"
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                            />
                        )}

                        {images.length > 1 && (
                            <button onClick={nextImage} className="absolute right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-20">
                                <ArrowLeft className="w-6 h-6 rotate-180" />
                            </button>
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div className="h-20 bg-black/50 overflow-x-auto flex items-center gap-2 px-4 pb-6 pt-2">
                        {images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-12 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === idx ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                            >
                                <img src={getImageUrl(img) || undefined} className="w-full h-full object-cover" loading="lazy" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {/* Shipping & Safety Info Modal */}
            <InfoModal
                isOpen={showShippingModal}
                onClose={() => setShowShippingModal(false)}
                title="Shipping & Safety"
                content={
                    <div className="space-y-4 pt-4">
                        <div className="flex items-start gap-4">
                            <Truck className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-[15px] font-bold text-slate-900 mb-1">Shipping Policy</h4>
                                <p className="text-sm text-slate-600">This merchant can ship to all locations in Bangladesh (BD).</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Undo2 className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-[15px] font-bold text-slate-900 mb-1">Return Policy</h4>
                                <p className="text-sm text-slate-600">You can return new and unused items within 30 days of delivery.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Timer className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                            <div>
                                <h4 className="text-[15px] font-bold text-slate-900 mb-1">Cancellation Policy</h4>
                                <p className="text-sm text-slate-600">You can cancel your order within 30 minutes after purchase.</p>
                            </div>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
