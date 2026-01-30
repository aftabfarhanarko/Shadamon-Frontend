"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft, Plus, MessageCircle, ChevronDown, Check, Trash2, Loader2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLanguage } from '../app/context/LanguageContext';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/apiConfig';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface PostAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    editAd?: any;
    onSuccess?: (ad?: any) => void;
}

interface SubItem {
    _id: string;
    name: string;
    slug: string;
}

interface Category {
    _id: string;
    name: string;
    subcategories: SubItem[];
}

interface Location {
    _id: string;
    name: string;
    subLocations: SubItem[];
}

export default function PostAdModal({ isOpen, onClose, editAd, onSuccess }: PostAdModalProps) {
    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [showCategoryLocation, setShowCategoryLocation] = useState(false);

    // Form State
    const [headline, setHeadline] = useState("");
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [hidePhone, setHidePhone] = useState(false);
    const [hasReadRules, setHasReadRules] = useState(false);

    // Categories & Locations
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedSubLocation, setSelectedSubLocation] = useState("");

    const [newAdditionalNumber, setNewAdditionalNumber] = useState("");
    const [newAdditionalType, setNewAdditionalType] = useState("call");
    const [additionalPhones, setAdditionalPhones] = useState<{ number: string, types: string[] }[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            checkUser();
            if (editAd) {
                setHeadline(editAd.headline || "");
                setDescription(editAd.description || "");
                setPhone(editAd.phone || "");
                setAdditionalPhones(editAd.additionalPhones || []);
                setHidePhone(editAd.hidePhone === true);
                setSelectedCategory(editAd.category || "");
                setSelectedSubCategory(editAd.subCategory || "");
                setSelectedLocation(editAd.location || "");
                setSelectedSubLocation(editAd.subLocation || "");
                setExistingImages(editAd.images || []);
                setHasReadRules(true);
            } else {
                setHeadline("");
                setDescription("");
                setAdditionalPhones([]);
                setHidePhone(false);
                setSelectedCategory("");
                setSelectedSubCategory("");
                setSelectedLocation("");
                setSelectedSubLocation("");
                setImages([]);
                setExistingImages([]);
                setHasReadRules(false);
            }
        }
    }, [isOpen, editAd]);

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
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoadingData(false);
        }
    };

    const checkUser = async () => {
        const token = Cookies.get('token');
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/user/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await res.json();
            if (userData && userData.mobile) setPhone(userData.mobile);
            if (userData && userData.name) setName(userData.name);
        } catch (error) { }
    };

    if (!isOpen) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (images.length + existingImages.length + newFiles.length > 10) {
                toast.error("Maximum 10 images allowed");
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

    const addAdditionalPhone = () => {
        if (!newAdditionalNumber) {
            toast.error("Enter a number first");
            return;
        }
        setAdditionalPhones([...additionalPhones, { number: newAdditionalNumber, types: [newAdditionalType] }]);
        setNewAdditionalNumber("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasReadRules) {
            toast.error("Please accept the Terms and Conditions");
            return;
        }

        const token = Cookies.get('token');
        if (!token) {
            toast.error("Please login to post an ad.");
            return;
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
                toast.success(editAd ? "Ad updated!" : "Ad posted successfully!");
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

    const currentCategoryObj = categories.find(c => c.name === selectedCategory);
    const currentLocationObj = locations.find(l => l.name === selectedLocation);

    return (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} />

            {/* Modal Container - Slightly free on top, bottom-to-top feel */}
            <div className="relative bg-[#F4F6F8] w-full max-w-[420px] rounded-lg overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-300 shadow-2xl h-[94vh] sm:h-auto">

                {/* Header */}
                <div className="flex items-center justify-between p-2 px-4 border-b border-slate-200 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
                            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <h2 className="text-[16px] text-slate-800 font-medium">Post your AD</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Main Content Area - Single screen feel */}
                <div className="flex-1 overflow-y-auto no-scrollbar px-3 pt-2 space-y-2 pb-[70px]">
                    {loadingData ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <>
                            {/* Image Area */}
                            <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                                    {existingImages.map((imgUrl, i) => (
                                        <div key={imgUrl} className="relative min-w-[80px] h-[80px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group">
                                            <img src={`${API_BASE_URL}${imgUrl}`} alt="" className="w-full h-full object-cover" />
                                            <button onClick={() => removeExistingImage(imgUrl)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {images.map((file, i) => (
                                        <div key={i} className="relative min-w-[80px] h-[80px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group">
                                            <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
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

                            {/* Headline and Description Card */}
                            <div className="bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm font-sans">
                                <div className="relative px-3 py-2 border-b border-slate-50">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-slate-300" />
                                    <input
                                        type="text"
                                        placeholder="Headline"
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        className="w-full pl-4 py-1 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                                    />
                                </div>
                                <div className="px-3 py-3 min-h-[120px] flex flex-col">
                                    <textarea
                                        placeholder="Description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full flex-1 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none px-1 bg-transparent"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 px-1 leading-tight">*A nice & Detail Description Might Help your Product Sell Faster</p>
                                </div>
                            </div>

                            {/* User Details Section */}
                            <div className="bg-white rounded-lg border border-slate-100 p-3.5 space-y-2 shadow-sm font-sans">
                                <div className="space-y-1">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Name"
                                        className="w-full text-[13px] text-slate-800 focus:outline-none placeholder:text-slate-300 px-1 border-b border-slate-100 pb-1"
                                    />
                                </div>

                                <div className="flex items-center gap-2 border-b border-slate-50 pb-1">
                                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-cyan-400 text-white shrink-0">
                                        <Check className="w-2.5 h-2.5 stroke-[4]" />
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Phone Number"
                                        className="flex-1 text-[14px] font-bold text-slate-800 tracking-wide focus:outline-none bg-transparent placeholder:text-slate-300"
                                    />
                                    {phone && (
                                        <button onClick={() => setPhone("")} className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                                            <X className="w-3 h-3 stroke-[3]" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2 pt-1">
                                    <h4 className="text-[12px] font-medium text-slate-400">Add Another Number</h4>

                                    {/* List of added numbers */}
                                    <div className="space-y-2">
                                        {additionalPhones.map((ap, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100 group">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[13px] font-medium text-slate-700">{ap.number}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded uppercase">{ap.types[0]}</span>
                                                </div>
                                                <button onClick={() => setAdditionalPhones(prev => prev.filter((_, i) => i !== idx))}>
                                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Corrected Add Section: Now with input field for typing the number */}
                                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                                        <div className="flex-1 flex gap-2 items-center">
                                            <div className="w-[1px] h-4 bg-slate-200" />
                                            <input
                                                type="tel"
                                                placeholder="Enter Phone Number"
                                                value={newAdditionalNumber}
                                                onChange={(e) => setNewAdditionalNumber(e.target.value)}
                                                className="flex-1 bg-transparent text-[12px] focus:outline-none placeholder:text-slate-300"
                                            />
                                            <select
                                                value={newAdditionalType}
                                                onChange={(e) => setNewAdditionalType(e.target.value)}
                                                className="bg-transparent text-[12px] text-slate-400 focus:outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="call">Call</option>
                                                <option value="whatsapp">WhatsApp</option>
                                                <option value="telegram">Telegram</option>
                                            </select>
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addAdditionalPhone}
                                            className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center active:scale-90 transition-transform ml-2"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                                        <input
                                            type="checkbox"
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-slate-800 focus:ring-0"
                                            checked={hidePhone}
                                            onChange={(e) => setHidePhone(e.target.checked)}
                                        />
                                        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Hide Number, Only Message</span>
                                    </label>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full bg-[#1A1A1A] text-white py-3.5 rounded-lg text-[13px] font-bold tracking-widest active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        {loading ? "POSTING..." : "POST AD"}
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
                            </div>
                        </>
                    )}
                </div>

                {/* Bottom Bar + Bottom-to-Top Drawer for Categories/Location */}
                <div className="absolute bottom-0 w-full z-[210]">
                    {/* The Trigger Bar */}
                    <div className="bg-[#E9EEF3] border-t border-slate-200">
                        <button
                            onClick={() => setShowCategoryLocation(!showCategoryLocation)}
                            className="w-full h-[50px] px-5 flex items-center justify-between text-[13px] font-bold text-slate-700 active:bg-slate-200 transition-colors"
                        >
                            <span>ক্যাটাগরি-লোকেশন নির্বাচন করুন</span>
                            <div className="flex items-center gap-3">
                                <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showCategoryLocation && "rotate-180")} />
                                <div className="w-5 h-5 bg-black rounded-full text-white flex items-center justify-center">
                                    <X className="w-3 h-3" onClick={(e) => { e.stopPropagation(); setShowCategoryLocation(false); }} />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* The Drawer Content - Sliding from bottom to top */}
                    <div className={cn(
                        "bg-white border-t border-slate-200 transition-all duration-300 ease-out flex flex-col overflow-hidden",
                        showCategoryLocation ? "h-[320px] opacity-100" : "h-0 opacity-0"
                    )}>
                        <div className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 px-1 capitalize">Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(""); }}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[12px] p-2.5 rounded-lg focus:outline-none"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                {currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 px-1">Subcategory</label>
                                        <select
                                            value={selectedSubCategory}
                                            onChange={(e) => setSelectedSubCategory(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[12px] p-2.5 rounded-lg focus:outline-none"
                                        >
                                            <option value="">Select Sub</option>
                                            {currentCategoryObj.subcategories.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-400 px-1 capitalize">Location</label>
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => { setSelectedLocation(e.target.value); setSelectedSubLocation(""); }}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[12px] p-2.5 rounded-lg focus:outline-none"
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map(l => <option key={l._id} value={l.name}>{l.name}</option>)}
                                    </select>
                                </div>
                                {currentLocationObj && currentLocationObj.subLocations.length > 0 && (
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-400 px-1">Area</label>
                                        <select
                                            value={selectedSubLocation}
                                            onChange={(e) => setSelectedSubLocation(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-[12px] p-2.5 rounded-lg focus:outline-none"
                                        >
                                            <option value="">Select Area</option>
                                            {currentLocationObj.subLocations.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowCategoryLocation(false)}
                                className="w-full py-3 bg-slate-100 text-slate-700 text-[13px] font-bold rounded-lg hover:bg-slate-200 transition-colors mt-2"
                            >
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Chat Icon (Fake/Static UI) */}
                <div className="absolute right-5 bottom-[65px] z-[205]">
                    <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform">
                        <MessageCircle className="w-5 h-5 fill-white" />
                    </button>
                    <div className="text-center mt-3 mr-2">
                        <button className="text-[11px] text-slate-400 font-medium hover:text-slate-600">HelpChat</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
