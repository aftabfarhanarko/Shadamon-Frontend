"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import Cookies from 'js-cookie';

interface Package {
    _id: string;
    name: string;
    price: number;
    total_connects: number;
    isActive: boolean;
    valid_days?: number;
}

interface PackageUpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PackageUpgradeModal({ isOpen, onClose }: PackageUpgradeModalProps) {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchPackages = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = Cookies.get('token');
                // The API doesn't require token for GET /api/packages but let's pass it just in case
                const res = await fetch(`${API_BASE_URL}/api/packages`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                
                if (!res.ok) {
                    throw new Error("Failed to fetch packages");
                }

                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    // Filter only active packages
                    setPackages(data.data.filter((p: Package) => p.isActive));
                } else {
                    throw new Error("Invalid response format");
                }
            } catch (err) {
                console.error("Error fetching packages:", err);
                setError("Failed to load packages. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBuyNow = (pkgName: string) => {
        const text = encodeURIComponent(`I want to buy the ${pkgName} package.`);
        window.open(`https://m.me/shadamonDotCom?text=${text}`, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-slate-800">Upgrade to See</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <p className="mt-4 text-slate-500 font-medium">Loading packages...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Oops!</h3>
                            <p className="text-slate-600 mb-6">{error}</p>
                            <button 
                                onClick={() => handleBuyNow('Standard')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                Contact Support
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {packages.map((pkg) => (
                                <div key={pkg._id} className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-emerald-500 transition-colors bg-white">
                                    <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{pkg.name}</h3>
                                        <div className="text-3xl font-extrabold text-emerald-600 mb-1">
                                            ৳ {pkg.price}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <ul className="space-y-4 flex-1 mb-8">
                                            <li className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-slate-600 text-sm">
                                                    <strong className="text-slate-800">{pkg.total_connects}</strong> Connects
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-slate-600 text-sm">
                                                    Validity <strong className="text-slate-800">{pkg.valid_days || 30} Days</strong>
                                                </span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-slate-600 text-sm">Unlock Chat & Call features</span>
                                            </li>
                                        </ul>
                                        <button 
                                            onClick={() => handleBuyNow(pkg.name)}
                                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
