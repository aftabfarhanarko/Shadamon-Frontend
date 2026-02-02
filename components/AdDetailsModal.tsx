"use client";

import React, { useState } from 'react';
import { ArrowLeft, Maximize2, MapPin, Grid, Eye, Share2, Phone, MessageCircle, FileText, ChevronUp, ChevronDown, Rocket, CheckCircle2, Truck, Undo2, Timer, ExternalLink, ChevronRight, Star } from 'lucide-react';
import { FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';
import { API_BASE_URL } from '../utils/apiConfig';
import { formatDistanceToNow } from 'date-fns';

interface AdDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    ad: any; // Using any for flexibility with existing ad object structure
}

export default function AdDetailsModal({ isOpen, onClose, ad }: AdDetailsModalProps) {
    if (!isOpen || !ad) return null;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showPhone, setShowPhone] = useState(false);
    const [isShippingOpen, setIsShippingOpen] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    // Real Data States
    const [promotedAds, setPromotedAds] = useState<any[]>([]);
    const [similarAds, setSimilarAds] = useState<any[]>([]);

    const images = ad.images || [];
    const hasImages = images.length > 0;

    const getImageUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // Fetch Ads Effect
    React.useEffect(() => {
        if (isOpen && ad) {
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
        }
    }, [isOpen, ad]);

    const nextImage = (e: React.MouseEvent) => {
        // ... existing nextImage logic ...
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
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-[565px] rounded-lg md:rounded-lg overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl h-[95vh] font-sans">

                {/* 1. Header */}
                <div className="bg-slate-200 px-1 py-0 flex items-center gap-2 shrink-0">
                    <button onClick={onClose} className="flex items-center gap-1 text-slate-600">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                    </button>
                    {/* Spacer to push potential right actions */}
                    <div className="flex-1" />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-white no-scrollbar">

                    {/* 2. Image Gallery */}
                    <div className="relative w-full aspect-[16/9] bg-slate-900 group">
                        {hasImages ? (
                            <img
                                src={getImageUrl(images[currentImageIndex])}
                                alt={ad.headline}
                                className="w-full h-full object-contain cursor-pointer"
                                onClick={() => setIsExpanded(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100">
                                No Image Available
                            </div>
                        )}

                        {/* Expand Icon */}
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md hover:bg-black/70 transition-colors z-10"
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
                            <div className="flex items-center gap-1 text-orange-500">
                                <Eye className="w-3 h-3" />
                                <span>{ad.views} Views</span>
                            </div>
                        </div>

                        {/* 4. Title & Price */}
                        <h1 className="text-base text-slate-800 leading-snug mb-0.5">
                            {ad.headline}
                        </h1>
                        <p className="text-xs text-slate-900">
                            {ad.price ? `$ ${ad.price.toLocaleString()}` : 'Price on ask'}
                        </p>

                        {/* 5. Contact Section */}
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            {/* Phone & Socials */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#1A202C] flex items-center justify-center text-white shrink-0">
                                        <Phone className="w-4 h-4 fill-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-slate-800 text-sm">
                                                {showPhone ? (ad.phone) : '01XXXXXXXX'}
                                            </span>
                                            <CheckCircle2 className="w-3 h-3 text-blue-500 fill-white" />
                                        </div>
                                        <button
                                            onClick={() => setShowPhone(!showPhone)}
                                            className="text-[10px] text-slate-500 hover:text-blue-600 hover:underline"
                                        >
                                            Click to show number
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="h-5 w-[1px] bg-slate-300 mx-1" />
                                    <button className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                                        <FaWhatsapp className="w-4 h-4" />
                                    </button>
                                    <button className="w-7 h-7 rounded-full bg-[#0088cc] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                                        <FaTelegramPlane className="w-3.5 h-3.5 pr-0.5" />
                                    </button>
                                    <button className="w-7 h-7 rounded-full bg-[#004c99] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                                        <BsChatDotsFill className="w-3.5 h-3.5 pb-0.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons Row */}
                            <div className="grid grid-cols-4 gap-2">
                                <button className="col-span-1 bg-[#1A202C] text-white text-xs font-bold py-1.5 rounded-md hover:bg-slate-800 transition-colors">
                                    Call
                                </button>
                                <button className="col-span-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-1.5 rounded-md hover:bg-slate-50 transition-colors">
                                    Chat
                                </button>
                                <button className="col-span-1 bg-white border border-slate-200 text-slate-400 flex items-center justify-center py-1.5 rounded-md hover:bg-slate-50 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* 6. Tabs & Content */}
                        <div className="">
                            <div className="flex items-center justify-between mb-2 border-b border-slate-200">
                                <div className="flex items-center gap-4">
                                    <button className="pb-1.5 border-b-2 border-slate-900 font-bold text-xs text-slate-900">
                                        Details
                                    </button>
                                    <button className="pb-1.5 border-b-2 border-transparent font-bold text-xs text-slate-500 hover:text-slate-800 transition-colors">
                                        Shipping & Safety
                                    </button>
                                </div>
                                <button onClick={() => setIsShippingOpen(!isShippingOpen)}>
                                    <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${isShippingOpen ? '' : 'rotate-180'}`} />
                                </button>
                            </div>

                            {/* Description */}
                            <div className="text-xs text-slate-500 leading-relaxed mb-4">
                                <p className="line-clamp-3">
                                    {ad.description}
                                </p>
                            </div>

                            {/* Shipping & Safety Section */}
                            {isShippingOpen && (
                                <div className="animate-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-sm text-slate-800">Shipping & Safety</h3>
                                        <button>
                                            <ChevronUp className="w-4 h-4 text-slate-800" />
                                        </button>
                                    </div>

                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3">
                                            <Truck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <span className="text-xs text-slate-600 font-medium">This merchant can ship to BD</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Undo2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <span className="text-xs text-slate-600 font-medium leading-tight">
                                                You can return new and unused items wsed items within 30 days
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Timer className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div className="text-xs text-slate-600 font-medium leading-tight">
                                                <span>You can cancel within 30 minutes of merchant</span>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* 7. Promote Button (Moved inside scroll) */}
                        <div className="mt-4 mb-4">
                            <button className="w-full bg-[#F6AD55] text-black text-sm rounded-lg py-2 flex flex-col items-center justify-center transition-colors shadow-sm active:scale-[0.99]">
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
                                                <div
                                                    className="w-full h-full bg-cover bg-center"
                                                    style={{ backgroundImage: `url(${getImageUrl(pad.images?.[0] || '')})` }}
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
                                                    {pad.price ? `$${pad.price.toLocaleString()}` : 'Price on ask'}
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
                        <div className=" border-t border-b border-slate-100 py-4">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-500">Seller Information</span>
                                <button className="text-xs text-slate-600 hover:text-blue-600">Visit Shop</button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                    {(ad as any).user?.storeLogo ? (
                                        <img src={(ad as any).user.storeLogo} alt="Seller" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                                            {(ad as any).user?.storeName?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{(ad as any).user?.storeName}</h4>
                                    <div className="text-[10px] text-slate-500 mb-1">{(ad as any).user?.followers}</div>
                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-3 h-3 fill-blue-500 text-blue-500" />)}
                                        <span className="text-[10px] text-slate-400 ml-1">{(ad as any).user?.ratings}</span>
                                    </div>
                                </div>
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
                                            <div className="w-24 h-20 bg-slate-100 rounded bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${getImageUrl(sad.images?.[0] || '')})` }} />
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
                                                    {sad.price ? `${sad.price.toLocaleString()}` : 'Price on ask'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Footer Removed - Content moved inside scrollable area to match requested design flow */}
            </div>

            {/* EXPANDED IMAGE OVERLAY */}
            {isExpanded && (
                <div className="fixed inset-0 z-[300] bg-black flex flex-col animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 text-white">
                        <span className="text-sm font-medium">{currentImageIndex + 1} / {images.length}</span>
                        <button onClick={() => setIsExpanded(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <ChevronDown className="w-6 h-6" />
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
                                src={getImageUrl(images[currentImageIndex])}
                                alt="Expanded View"
                                className="max-w-full max-h-full object-contain"
                            />
                        )}

                        {images.length > 1 && (
                            <button onClick={nextImage} className="absolute right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors z-20">
                                <ArrowLeft className="w-6 h-6 rotate-180" />
                            </button>
                        )}
                    </div>

                    {/* Thumbnails (Optional, simplified for now) */}
                    <div className="h-20 bg-black/50 overflow-x-auto flex items-center gap-2 px-4 pb-6 pt-2">
                        {images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-12 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === idx ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                            >
                                <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
