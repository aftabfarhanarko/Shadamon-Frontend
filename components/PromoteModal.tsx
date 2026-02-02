"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Target, MessageCircle, Phone, ArrowRight, Minus, Plus, TrendingUp, AlertCircle, Camera, Gift, Edit2, ChevronDown, HelpCircle, PhoneCall, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../app/context/LanguageContext';
import { API_BASE_URL } from '../utils/apiConfig';
import Cookies from 'js-cookie';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

// Helper for class merging
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PromoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    ad: any;
}

const DIVISIONS = [
    "Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal", "Sylhet", "Rangpur", "Mymensingh"
];

export default function PromoteModal({ isOpen, onClose, ad }: PromoteModalProps) {
    const { t } = useLanguage();

    // Form States
    const [promoteType, setPromoteType] = useState<'call_msg' | 'traffic'>('call_msg');
    const [isAllBangladesh, setIsAllBangladesh] = useState(true);
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [durationDays, setDurationDays] = useState(1);
    const [endDate, setEndDate] = useState<string>("");
    const [amount, setAmount] = useState(500);
    const [isVerifyBadge, setIsVerifyBadge] = useState(false);
    const [isHighlight, setIsHighlight] = useState(false);
    const [highlightType, setHighlightType] = useState<'Hot Sale' | 'Discount' | 'Urgent'>('Hot Sale');
    const [isPostLevel, setIsPostLevel] = useState(false);
    const [showPremier, setShowPremier] = useState(false);
    const [premierSettings, setPremierSettings] = useState({
        verifyBadgePrice: 200,
        highlightPostPrice: 300,
        addLabelPrice: 100,
        freeAdCredit: 200
    });
    const [minAmount, setMinAmount] = useState(140);
    const [maxAmount, setMaxAmount] = useState(8435);

    // Initialize/Reset & Fetch Configs
    useEffect(() => {
        if (isOpen) {
            setPromoteType('call_msg');
            setIsAllBangladesh(true);
            setSelectedLocations([]);
            setDurationDays(1);
            setAmount(500);
            updateEndDate(1);
            fetchConfigs();
        }
    }, [isOpen]);

    const fetchConfigs = async () => {
        try {
            const [premierRes, plansRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/premier-opportunity`).then(res => res.json()),
                fetch(`${API_BASE_URL}/api/ads/public/promotion-plans`).then(res => res.json())
            ]);

            if (premierRes.success && premierRes.data) {
                setPremierSettings(premierRes.data);
            }

            if (plansRes.success && plansRes.data && plansRes.data.length > 0) {
                // Determine min/max from plans if applicable, or just keep default logic?
                // Assuming plans have 'amount' which is string or number.
                // Let's find min and max from the plan amounts.
                const amounts = plansRes.data.map((p: any) => Number(p.amount)).filter((n: number) => !isNaN(n));
                if (amounts.length > 0) {
                    setMinAmount(Math.min(...amounts));
                    setMaxAmount(Math.max(...amounts));
                }
            }
        } catch (error) {
            console.error("Failed to fetch configs:", error);
        }
    };

    // Duration Logic
    const updateEndDate = (days: number) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        setEndDate(date.toISOString().split('T')[0]);
    };

    const handleDurationChange = (type: 'inc' | 'dec') => {
        let newDays = durationDays;
        if (type === 'inc') newDays++;
        if (type === 'dec' && newDays > 1) newDays--;
        setDurationDays(newDays);
        updateEndDate(newDays);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = new Date(e.target.value);
        const today = new Date();
        const diffTime = Math.abs(selected.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 1) {
            toast.error("Duration must be at least 1 day");
            return;
        }
        setEndDate(e.target.value);
        setDurationDays(diffDays);
    };

    // ESTIMATION LOGIC
    const estimatedMinViews = Math.floor(amount * 0.2);
    const estimatedMaxViews = Math.floor(amount * 0.4);

    const handlePromote = async () => {
        try {
            const token = Cookies.get('token');
            const payload = {
                promoteType,
                targetLocations: isAllBangladesh ? ['All Bangladesh'] : selectedLocations,
                promoteDuration: durationDays,
                promoteEndDate: endDate,
                promoteBudget: amount,
                estimatedReach: `${estimatedMinViews}-${estimatedMaxViews}`
            };

            const response = await fetch(`${API_BASE_URL}/api/ads/${ad._id}/promote`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(t('promote_success') || "Ad promoted successfully!");
                onClose();
                window.location.reload();
            } else {
                toast.error(data.message || "Failed to promote ad");
            }

        } catch (error) {
            console.error("Promotion Error:", error);
            toast.error("Failed to submit promotion");
        }
    };

    if (!isOpen || !ad) return null;

    const mainImage = ad.images && ad.images.length > 0 ? `${API_BASE_URL}${ad.images[0]}` : "https://via.placeholder.com/150";

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Container */}
            <div className="relative bg-[#F4F6F8] w-full max-w-[565px] rounded-lg sm:rounded-lg overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-full duration-300 shadow-2xl h-[95vh] sm:max-h-[850px] font-sans">

                {/* Header */}
                <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <h2 className="text-[16px] text-black">Promote Ad</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                        <X className="w-4 h-4 stroke-[2]" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-3 space-y-3 pb-20">

                    {/* 1. Notifications Stack */}
                    <div className="space-y-2">
                        {/* Policy Violation - Red */}
                        <div className="bg-[#F0FDF4] rounded-lg p-2 flex gap-2 items-start">
                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <Minus className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-[11px] text-slate-700 leading-tight">
                                This Post run is off for <span className="font-bold text-red-500">Policy Violation</span>. You Can Edit & submit it early as possible. Or, For help <span className="text-orange-500 font-bold cursor-pointer">Contact us</span>
                            </p>
                        </div>

                        {/* Free Post Access - Orange */}
                        <div className="bg-[#F0FDF4] rounded-lg p-2 flex gap-2 items-start">
                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <Camera className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-[11px] text-slate-700 leading-tight">
                                This post is Creat but not Publish. Because, Your <span className="font-bold text-orange-500">FREE POST ACCESS</span> is over. If You Promote, it will Publish & Promot.
                            </p>
                        </div>

                        {/* Potential Customer - Yellow */}
                        <div className="bg-[#F0FDF4] rounded-lg p-2 flex gap-2 items-start">
                            <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <TrendingUp className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-[11px] text-slate-700 leading-tight">
                                How many Potential customer you need? We can serve, Just Promote.
                            </p>
                        </div>

                        {/* Ad Free Voucher - Green */}
                        <div className="bg-[#F0FDF4] border border-green-100 rounded-lg p-2 flex gap-2 items-start">
                            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <Gift className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-[11px] text-slate-700 leading-tight">
                                You Get $100 Ad Free boucher. Promote this Post. <span className="font-bold">Valid Till Today</span>
                            </p>
                        </div>
                    </div>

                    {/* 2. Ad Preview Card (Stats) */}
                    <div className="bg-white rounded-lg p-2 shadow-sm border border-slate-200">
                        <div className="flex gap-3 mb-2">
                            <div className="w-20 h-16 rounded overflow-hidden shrink-0 relative">
                                <img src={mainImage} className="w-full h-full object-cover" alt="ad" />
                                <div className="absolute top-1 left-1 bg-white px-1 py-0.5 rounded text-[8px] text-black shadow-sm">See Live</div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-black truncate mb-1">{ad.headline}</h4>
                                <div className="text-[10px] text-black leading-tight space-y-0.5 border-b border-slate-100 pb-1 mb-1">
                                    <div className="flex justify-between">
                                        <span>Publish {ad.createdAt ? format(new Date(ad.createdAt), 'dd.MM.yyyy') : format(new Date(), 'dd.MM.yyyy')}</span>
                                    </div>
                                    <div>Promote Performance</div>
                                    <div>Budget : {amount} From : {format(new Date(), 'dd.MM.yyyy')} to {endDate ? format(new Date(endDate), 'dd.MM.yyyy') : '...'}</div>
                                    <div className="flex gap-2">
                                        <span>View: 452</span>
                                        <span>Delivery: 897</span>
                                        <span>Rate 50%</span>
                                    </div>
                                    <div>Lifetime View : 10256</div>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-[#0088cc] text-white px-1.5 py-0.5 rounded text-[9px] font-bold">AD On</span>
                                    <button className="border border-slate-300 px-2 py-0.5 rounded text-[9px] font-bold hover:bg-slate-50">Edit</button>
                                </div>
                            </div>
                        </div>
                        <button className="w-full bg-[#4285F4] text-white text-xs py-1.5 rounded font-medium shadow-sm hover:bg-blue-600 transition-colors">
                            Promote / Learning / Promoting
                        </button>
                    </div>

                    {/* 3. Ad Config Card */}
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                        <div className="flex gap-3 mb-3">
                            <div className="w-24 h-16 rounded overflow-hidden shrink-0 relative">
                                <img src={mainImage} className="w-full h-full object-cover" alt="ad" />
                                <div className="absolute bottom-1 left-1 w-3 h-3 bg-white rounded-full border border-slate-300"></div>
                                <div className="absolute top-1 left-1 bg-white px-1 py-0.5 rounded text-[8px] text-black shadow-sm">See Live</div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-black truncate mb-1">{ad.headline}</h4>
                                <div className="text-[10px] text-black leading-tight">
                                    <div>Publish {ad.createdAt ? format(new Date(ad.createdAt), 'dd.MM.yyyy') : format(new Date(), 'dd.MM.yyyy')}</div>
                                    <div>Duration {format(new Date(), 'dd.MM.yyyy')} to {endDate ? format(new Date(endDate), 'dd.MM.yyyy') : '...'}</div>
                                    <div className="font-bold text-slate-700">Promote Amount ${amount}</div>
                                </div>
                                <div className="font-bold text-xs text-slate-900 mt-1">View : 55214</div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-3">
                            {/* Inputs Row */}
                            <div className="grid grid-cols-2 gap-2">
                                {/* Promote Type */}
                                <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-500 font-bold">Promote Type</span>
                                        <span className="text-[11px] font-bold text-slate-700">{promoteType === 'call_msg' ? 'Call & Message' : 'Visit Traffic'}</span>
                                    </div>
                                    <button onClick={() => setPromoteType(promoteType === 'call_msg' ? 'traffic' : 'call_msg')} className="text-slate-400 hover:text-slate-600">
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                </div>
                                {/* Location */}
                                <div className="bg-slate-50 border border-slate-200 rounded px-2 py-1.5 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] text-slate-500 font-bold">Location Priority</span>
                                        <span className="text-[11px] font-bold text-slate-700 truncate max-w-[80px]">
                                            {isAllBangladesh ? 'All Bangladesh' : selectedLocations.join(', ') || 'Select'}
                                        </span>
                                    </div>
                                    <button onClick={() => setIsAllBangladesh(!isAllBangladesh)} className="text-slate-400 hover:text-slate-600">
                                        <Edit2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {/* Duration & Date Row */}
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-slate-400">Duration</span>
                                        <span className="text-[12px] font-bold text-slate-800">{durationDays} Days</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleDurationChange('dec')} className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50">
                                            <Minus className="w-3 h-3 text-slate-500" />
                                        </button>
                                        <button onClick={() => handleDurationChange('inc')} className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center hover:bg-slate-50">
                                            <Plus className="w-3 h-3 text-slate-500" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <div className="flex flex-col flex-1 relative">
                                        <span className="text-[8px] text-slate-400">End date</span>
                                        <div className="text-[11px] font-bold text-slate-800">
                                            {endDate ? format(new Date(endDate), 'MMM d, yyyy') : 'Select Date'}
                                        </div>
                                        <input
                                            type="date"
                                            value={endDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={handleDateChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Estimated Views */}
                            <div className="bg-white border border-slate-200 rounded px-3 py-2">
                                <p className="text-[10px] text-slate-500">Promotional Performance Estimated</p>
                                <p className="text-sm font-bold text-slate-800">{estimatedMinViews}-{estimatedMaxViews} Views</p>
                            </div>

                            {/* Budget Slider */}
                            <div className="pt-2">
                                <div className="flex items-center gap-1 mb-2">
                                    <span className="text-sm font-bold text-slate-800">Budget</span>
                                </div>
                                <div className="flex flex-col items-center mb-4">
                                    <div className="flex items-center gap-1 text-2xl font-black text-orange-500 mb-2">
                                        <span className="text-sm pt-1">$</span>
                                        {amount}
                                        <Edit2 className="w-3 h-3 text-slate-400 ml-1 cursor-pointer" />
                                    </div>

                                    <div className="w-full relative h-1 bg-slate-200 rounded-full mb-6">
                                        <input
                                            type="range"
                                            min={minAmount}
                                            max={maxAmount}
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                            className="absolute w-full h-full opacity-0 z-10 cursor-pointer"
                                        />
                                        <div
                                            className="absolute left-0 top-0 h-full bg-orange-400 rounded-full"
                                            style={{ width: `${((amount - minAmount) / (maxAmount - minAmount)) * 100}%` }}
                                        ></div>
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-sm pointer-events-none"
                                            style={{ left: `${((amount - minAmount) / (maxAmount - minAmount)) * 100}%` }}
                                        ></div>
                                    </div>

                                    <div className="w-full flex justify-between text-[10px] text-slate-400 -mt-4">
                                        <span>${minAmount.toFixed(2)}</span>
                                        <span>${maxAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Premier Opportunity Dropdown */}
                            <div
                                className="border border-slate-200 rounded px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => setShowPremier(!showPremier)}
                            >
                                <span className="text-xs font-bold text-slate-700">Premier Opportunity</span>
                                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", showPremier && "rotate-180")} />
                            </div>

                            {/* Premier Options - Collapsible Content */}
                            {showPremier && (
                                <div className="space-y-3 pt-2 bg-slate-50 border border-slate-200 border-t-0 -mt-[1px] rounded-b px-3 py-3 animate-in fade-in zoom-in-95 duration-200">
                                    {/* Verify Badge */}
                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center mt-0.5 transition-colors", isVerifyBadge ? 'bg-brand-600 border-brand-600' : 'border-slate-300 bg-white')}>
                                            {isVerifyBadge && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={isVerifyBadge} onChange={() => setIsVerifyBadge(!isVerifyBadge)} />
                                        <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
                                            প্রোফাইলে ভেরিফাই ব্যাজ যোগ (+ ${premierSettings.verifyBadgePrice}/বছর)
                                        </span>
                                    </label>

                                    {/* Highlight Post */}
                                    <div>
                                        <label className="flex items-start gap-2 cursor-pointer group mb-2">
                                            <div className={cn("w-4 h-4 rounded border flex items-center justify-center mt-0.5 transition-colors", isHighlight ? 'bg-brand-600 border-brand-600' : 'border-slate-300 bg-white')}>
                                                {isHighlight && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={isHighlight} onChange={() => setIsHighlight(!isHighlight)} />
                                            <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900 flex items-center gap-2">
                                                পোস্টটি হাইলাইট করুন (+ ${premierSettings.highlightPostPrice})
                                                <ChevronDown className="w-3 h-3 text-slate-400" />
                                            </span>
                                        </label>

                                        {isHighlight && (
                                            <div className="pl-6 space-y-1.5 mb-2 animate-in slide-in-from-top-2 fade-in">
                                                {['Hot Sale', 'Discount', 'Urgent'].map((type) => (
                                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                                        <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center", highlightType === type ? 'border-brand-600' : 'border-slate-300')}>
                                                            {highlightType === type && <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                                                        </div>
                                                        <input
                                                            type="radio"
                                                            name="highlightType"
                                                            className="hidden"
                                                            checked={highlightType === type}
                                                            onChange={() => setHighlightType(type as any)}
                                                        />
                                                        <span className="text-[10px] text-slate-600">{type}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Post Level */}
                                    <label className="flex items-start gap-2 cursor-pointer group">
                                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center mt-0.5 transition-colors", isPostLevel ? 'bg-brand-600 border-brand-600' : 'border-slate-300 bg-white')}>
                                            {isPostLevel && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={isPostLevel} onChange={() => setIsPostLevel(!isPostLevel)} />
                                        <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
                                            পোস্ট লেভেল যোগ করুন (+ ${premierSettings.addLabelPrice})
                                        </span>
                                    </label>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                                        <span className="text-[10px] font-bold text-slate-800">You Have ${premierSettings.freeAdCredit} Free Ad Credit!</span>
                                        <button className="bg-[#FF3B30] text-white text-[10px] font-bold px-3 py-1.5 rounded shadow-sm hover:bg-red-600 transition-colors">
                                            Apply Offer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Payment Action */}
                    <div className="mt-2 rounded-lg overflow-hidden flex shadow-lg">
                        <div className="bg-[#B8CCF2] w-1/3 flex items-center justify-center p-3">
                            <span className="text-sm font-bold text-slate-800">Total : ${amount}</span>
                        </div>
                        <button
                            onClick={handlePromote}
                            className="bg-[#4285F4] flex-1 p-3 text-white font-bold text-sm hover:bg-blue-600 transition-colors"
                        >
                            Pay Now
                        </button>
                    </div>
                    <p className="text-[8px] text-slate-400 text-center mt-1">
                        By Proceeding you agree to the Privacy, T & C, Return & Refund
                    </p>

                    {/* 5. Support & Manual Pay */}
                    <div className="mt-6 pt-4 border-t border-slate-200 space-y-4">
                        <div className="flex justify-between px-4 text-[11px] text-slate-500 font-medium">
                            <span className="cursor-pointer hover:text-slate-800">HelpChat</span>
                            <span className="cursor-pointer hover:text-slate-800">Pay Manual</span>
                            <span className="cursor-pointer hover:text-slate-800">Helpline</span>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                            <h4 className="font-bold text-sm text-slate-800 mb-1">Manual Payment</h4>
                            <p className="text-[11px] text-slate-600 mb-2">
                                যে প্যাকেজটি কিনতে চান, সমপরিমান টাকা পাঠিয়ে
                                জুট কম কে সরাণরি।
                            </p>
                            <div className="space-y-0.5 text-xs text-slate-700">
                                <div><span className="font-bold">বিকাশ নাম্বার:</span> 0173 266 1224</div>
                                <div><span className="font-bold">রকেট নাম্বার:</span> 0173 266 1224-3</div>
                            </div>
                        </div>

                        <button className="w-full bg-[#FFB82E] text-slate-900 font-bold py-3 rounded-lg shadow-sm hover:bg-[#FFA500] transition-colors mb-6">
                            Message us
                        </button>


                    </div>

                </div>
            </div>
        </div>
    );
}
