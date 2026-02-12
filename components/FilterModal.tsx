"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowLeft, ChevronRight, Loader2, Search, Check, Plus } from 'lucide-react';
import { useLanguage } from '../app/context/LanguageContext';
import { API_BASE_URL } from '../utils/apiConfig';
import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    initialFilters: FilterState;
    categories: any[];
    locations: any[];
}

export interface FilterState {
    category: string;
    subCategory: string;
    location: string;
    subLocation: string;
    promoteTag: string;
    sort: string;
    search?: string;
}

export default function FilterModal({
    isOpen,
    onClose,
    onApply,
    initialFilters,
    categories,
    locations
}: FilterModalProps) {
    const { language } = useLanguage();
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [adCount, setAdCount] = useState<number>(0);
    const [loadingCount, setLoadingCount] = useState(false);

    const [view, setView] = useState<'main' | 'location' | 'location-sub' | 'category' | 'category-sub'>('main');
    const [searchQuery, setSearchQuery] = useState("");
    const [tempLocation, setTempLocation] = useState<string>("");
    const [tempCategory, setTempCategory] = useState<string>("");

    // Reset filters when modal opens with initialFilters
    useEffect(() => {
        if (isOpen) {
            setFilters(initialFilters);
            setView('main');
        }
    }, [isOpen, initialFilters]);

    const fetchCount = useCallback(async (currentFilters: FilterState) => {
        setLoadingCount(true);
        try {
            const params = new URLSearchParams();
            if (currentFilters.category) params.append('category', currentFilters.category);
            if (currentFilters.subCategory) params.append('subCategory', currentFilters.subCategory);
            if (currentFilters.location) params.append('location', currentFilters.location);
            if (currentFilters.subLocation) params.append('subLocation', currentFilters.subLocation);
            if (currentFilters.promoteTag && currentFilters.promoteTag !== 'All') params.append('promoteTag', currentFilters.promoteTag);

            const res = await fetch(`${API_BASE_URL}/api/ads/public/count?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setAdCount(data.count);
            }
        } catch (error) {
            console.error("Error fetching count:", error);
        } finally {
            setLoadingCount(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchCount(filters);
        }
    }, [filters, isOpen, fetchCount]);

    const handleReset = () => {
        const resetFilters: FilterState = {
            category: "",
            subCategory: "",
            location: "",
            subLocation: "",
            promoteTag: "All",
            sort: "newest"
        };
        setFilters(resetFilters);
    };

    if (!isOpen) return null;

    const translate = (en: string, bn: string) => language === 'bn' ? bn : en;

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-20">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-[565px] rounded-t-lg rounded-b-none overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-300 shadow-2xl h-[calc(100vh-80px)] font-sans">

                {/* Header */}
                <div className="flex items-center justify-between p-3 px-4 border-b border-slate-100 bg-white shrink-0">
                    <div className="flex items-center gap-0">
                        <button
                            onClick={() => {
                                if (view === 'main') onClose();
                                else if (view === 'location-sub') setView('location');
                                else if (view === 'category-sub') setView('category');
                                else setView('main');
                            }}
                            className="w-8 h-8 flex items-center justify-center text-black hover:bg-slate-50 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                        <h2 className="text-[17px] text-black font-medium">{translate("Filter", "ফিল্টার")}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full">
                        <X className="w-6 h-6 text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {view === 'main' && (
                        <div className="p-4 space-y-0 pb-0">
                            <p className="text-slate-900 text-[13px]">{translate("Filter according to preference", "পছন্দ অনুযায়ী ফিল্টার করুন")}</p>

                            {/* Location Selector */}
                            <div
                                className="flex items-center justify-between py-3 border-b border-slate-400 cursor-pointer group"
                                onClick={() => setView('location')}
                            >
                                <div className="space-y-0.5">
                                    <span className="text-[15px] text-[#0088cc] font-medium group-hover:underline">
                                        {filters.location ? `${filters.location}${filters.subLocation ? `, ${filters.subLocation}` : ''}` : translate("Select Location", "লোকেশন নির্বাচন করুন")}
                                    </span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-black stroke-[3]" />
                            </div>

                            {/* Category Selector */}
                            <div
                                className="flex items-center justify-between py-3 border-b border-slate-400 cursor-pointer group"
                                onClick={() => setView('category')}
                            >
                                <div className="space-y-0.5">
                                    <span className="text-[15px] text-[#0088cc] font-medium group-hover:underline">
                                        {filters.category ? `${filters.category}${filters.subCategory ? `, ${filters.subCategory}` : ''}` : translate("Select Category", "ক্যাটাগরি নির্বাচন করুন")}
                                    </span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-black stroke-[3]" />
                            </div>

                            {/* Promoted Listing */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-[14px] font-bold text-black">{translate("Promoted Listing", "প্রোমোটেড লিস্টিং")}</h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-3">
                                    {['All', 'Urgent', 'Discount', 'Offer'].map((tag) => (
                                        <label key={tag} className="flex items-center gap-2.5 cursor-pointer group">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                filters.promoteTag === tag ? "border-[#0088cc] bg-white" : "border-slate-300 group-hover:border-slate-400"
                                            )}>
                                                {filters.promoteTag === tag && <div className="w-2.5 h-2.5 rounded-full bg-[#0088cc]" />}
                                            </div>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                checked={filters.promoteTag === tag}
                                                onChange={() => setFilters({ ...filters, promoteTag: tag })}
                                            />
                                            <span className="text-sm text-black">{translate(tag, tag === 'All' ? 'সব' : (tag === 'Urgent' ? 'আর্জেন্ট' : (tag === 'Discount' ? 'ডিসকাউন্ট' : 'অফার')))}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="pt-1">
                                    <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                            filters.promoteTag === 'Highlights' ? "border-[#0088cc]" : "border-slate-300"
                                        )}>
                                            {filters.promoteTag === 'Highlights' && <div className="w-2.5 h-2.5 rounded-full bg-[#0088cc]" />}
                                        </div>
                                        <input
                                            type="radio"
                                            className="hidden"
                                            checked={filters.promoteTag === 'Highlights'}
                                            onChange={() => setFilters({ ...filters, promoteTag: 'Highlights' })}
                                        />
                                        <div className="bg-[#ff4d4d] text-white px-2 py-0.5 rounded text-[11px]">
                                            {translate("Highlights", "হাইলাইটস")}
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-2 h-px bg-slate-400 w-full" />

                            {/* Sort By */}
                            <div className="space-y-3 pt-2">
                                <h3 className="text-[14px] font-bold text-black">{translate("Sort by", "সর্ট বাই")}</h3>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                                    {[
                                        { id: 'newest', en: 'Date: Newest first', bn: 'তারিখ: নতুন আগে' },
                                        { id: 'oldest', en: 'Date: Oldest first', bn: 'তারিখ: পুরাতন আগে' },
                                        { id: 'price-high', en: 'Price: Highest to Lowest', bn: 'দাম: বেশি থেকে কম' },
                                        { id: 'price-low', en: 'Price: Lowest to Highest', bn: 'দাম: কম থেকে বেশি' },
                                    ].map((option) => (
                                        <label key={option.id} className="flex items-center gap-2.5 cursor-pointer group">
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                                filters.sort === option.id ? "border-[#0088cc]" : "border-slate-300"
                                            )}>
                                                {filters.sort === option.id && <div className="w-2.5 h-2.5 rounded-full bg-[#0088cc]" />}
                                            </div>
                                            <input
                                                type="radio"
                                                className="hidden"
                                                checked={filters.sort === option.id}
                                                onChange={() => setFilters({ ...filters, sort: option.id })}
                                            />
                                            <span className="text-sm text-black">{translate(option.en, option.bn)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-3 h-px bg-slate-400 w-full" />

                            {/* Selected Info */}
                            {/* {filters.category && (
                                <div className="pt-2 border-t border-slate-100 mt-2">
                                    <div className="flex items-center gap-1.5 text-slate-900 text-[13px] font-bold">
                                        <Plus className="w-3.5 h-3.5" strokeWidth={4} />
                                        <span>{translate("Category choice selected", "ক্যাটাগরি চয়েস করলে")}</span>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    )}

                    {view === 'location' && (
                        <div className="p-0">
                            <div className="p-4 bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                                <div className="bg-white rounded-lg border border-slate-200 flex items-center px-3 py-2 gap-2">
                                    <Search className="w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder={translate("Search for a location", "লোকেশন খুঁজুন")}
                                        className="flex-1 text-sm outline-none placeholder:text-slate-400"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                <button
                                    onClick={() => { setFilters({ ...filters, location: "", subLocation: "" }); setView('main'); }}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <span className="text-[15px] font-medium text-[#0088cc]">{translate("All Bangladesh", "পুরো বাংলাদেশ")}</span>
                                    {!filters.location && <Check className="w-5 h-5 text-[#0088cc]" />}
                                </button>
                                {locations.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map(loc => (
                                    <button
                                        key={loc._id}
                                        onClick={() => {
                                            setTempLocation(loc.name);
                                            setSearchQuery("");
                                            setView('location-sub');
                                        }}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <span className="text-[15px] font-medium text-slate-800">{loc.name}</span>
                                        <div className="flex items-center gap-1">
                                            {filters.location === loc.name && !filters.subLocation && <Check className="w-4 h-4 text-[#0088cc] mr-1" />}
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'location-sub' && (
                        <div className="p-0">
                            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800">{tempLocation}</h3>
                                <button
                                    onClick={() => { setFilters({ ...filters, location: tempLocation, subLocation: "" }); setView('main'); }}
                                    className="text-xs text-[#0088cc] font-bold"
                                >
                                    {translate("Select this city", "পুরো শহর")}
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {locations.find(l => l.name === tempLocation)?.subLocations?.map((sub: any) => (
                                    <button
                                        key={sub._id}
                                        onClick={() => {
                                            setFilters({ ...filters, location: tempLocation, subLocation: sub.name });
                                            setView('main');
                                        }}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <span className="text-[15px] text-slate-700">{sub.name}</span>
                                        {filters.location === tempLocation && filters.subLocation === sub.name && <Check className="w-5 h-5 text-[#0088cc]" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'category' && (
                        <div className="p-0">
                            <div className="p-4 bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                                <div className="bg-white rounded-lg border border-slate-200 flex items-center px-3 py-2 gap-2">
                                    <Search className="w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder={translate("Search for a category", "ক্যাটাগরি খুঁজুন")}
                                        className="flex-1 text-sm outline-none placeholder:text-slate-400"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100">
                                <button
                                    onClick={() => { setFilters({ ...filters, category: "", subCategory: "" }); setView('main'); }}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                                >
                                    <span className="text-[15px] font-medium text-[#0088cc]">{translate("All Categories", "সব ক্যাটাগরি")}</span>
                                    {!filters.category && <Check className="w-5 h-5 text-[#0088cc]" />}
                                </button>
                                {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(cat => (
                                    <button
                                        key={cat._id}
                                        onClick={() => {
                                            setTempCategory(cat.name);
                                            setSearchQuery("");
                                            setView('category-sub');
                                        }}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <span className="text-[15px] font-medium text-slate-800">{cat.name}</span>
                                        <div className="flex items-center gap-1">
                                            {filters.category === cat.name && !filters.subCategory && <Check className="w-4 h-4 text-[#0088cc] mr-1" />}
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {view === 'category-sub' && (
                        <div className="p-0">
                            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800">{tempCategory}</h3>
                                <button
                                    onClick={() => { setFilters({ ...filters, category: tempCategory, subCategory: "" }); setView('main'); }}
                                    className="text-xs text-[#0088cc] font-bold"
                                >
                                    {translate("Show all in this category", "এই ক্যাটাগরির সব")}
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {categories.find(c => c.name === tempCategory)?.subcategories?.map((sub: any) => (
                                    <button
                                        key={sub._id}
                                        onClick={() => {
                                            setFilters({ ...filters, category: tempCategory, subCategory: sub.name });
                                            setView('main');
                                        }}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <span className="text-[15px] text-slate-700">{sub.name}</span>
                                        {filters.category === tempCategory && filters.subCategory === sub.name && <Check className="w-5 h-5 text-[#0088cc]" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                {view === 'main' && (
                    <div className="p-4 border-t border-slate-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.03)] flex items-center justify-between shrink-0">
                        <button
                            onClick={handleReset}
                            className="border border-[#00A278] text-[#00A278] px-8 py-2.5 rounded-lg text-sm hover:bg-emerald-50 transition-colors"
                        >
                            {translate("Reset all", "রিসেট করুন")}
                        </button>
                        <button
                            onClick={() => onApply(filters)}
                            className="bg-[#1A202C] text-white px-14 py-2.5 rounded-lg text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 min-w-[180px]"
                        >
                            {loadingCount ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <span>{translate(`${adCount} View Posts`, `${adCount.toLocaleString('bn-BD')} টি পোস্ট দেখুন`)}</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


