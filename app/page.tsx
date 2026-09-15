"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, Users, Map, Briefcase } from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import { getImageUrl } from '../utils/imageUrl';
import { formatAdPrice } from '../utils/formatPrice';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [recentAds, setRecentAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentAds = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/ads/public/feed?limit=8`);
                if (res.ok) {
                    const data = await res.json();
                    setRecentAds(data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch ads", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentAds();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/dashboard?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navigation / Header */}
            <header className="w-full bg-[#1A103C] py-4 px-6 flex items-center justify-between z-50">
                <div className="flex items-center">
                    <Link href="/">
                        <h1 className="text-white text-2xl font-bold tracking-tight">shadamon</h1>
                    </Link>
                </div>
                <div className="flex gap-4">
                    <Link href="/dashboard/post-ad" className="bg-[#6B46C1] hover:bg-[#553C9A] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        প্রমোশন
                    </Link>
                    <Link href="/dashboard" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        ড্যাশবোর্ড
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative w-full bg-[#1A103C] overflow-hidden">
                {/* Background gradient/stars effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#100A26] pointer-events-none" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        বিনিয়োগ নিয়ে বা দিয়ে,<br />
                        লাভের পথে এগিয়ে যান
                    </h1>
                    
                    <p className="text-purple-200 text-lg md:text-xl mb-10 max-w-2xl">
                        উদ্যোক্তা এবং বিনিয়োগকারীদের সংযোগের বিশ্বস্ত প্ল্যাটফর্ম
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full max-w-2xl relative flex items-center shadow-2xl">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="খুঁজুন..."
                            className="w-full h-14 pl-6 pr-16 rounded-full text-lg focus:outline-none border-2 border-transparent focus:border-purple-400 bg-white text-black"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </section>

            {/* Statistics Banner */}
            <section className="w-full bg-white border-b border-slate-200 py-10 relative z-10 -mt-6 rounded-t-3xl shadow-lg">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="flex flex-col items-center p-4">
                        <Users className="w-8 h-8 text-purple-600 mb-3" />
                        <h3 className="text-2xl font-bold text-slate-800">১০+</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">উদ্যোক্তা যুক্ত হয়েছেন</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
                        <h3 className="text-2xl font-bold text-slate-800">১+ কোটি</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">বিনিয়োগ</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <Briefcase className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="text-2xl font-bold text-slate-800">১০+ বিলিয়ন</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">ইনভেস্টমেন্ট</p>
                    </div>
                    <div className="flex flex-col items-center p-4">
                        <Map className="w-8 h-8 text-orange-500 mb-3" />
                        <h3 className="text-2xl font-bold text-slate-800">১০+ একর</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">জমি</p>
                    </div>
                </div>
            </section>

            {/* Recent Ads Section */}
            <section className="w-full max-w-7xl mx-auto px-6 py-16 flex-1">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-800">দেখুন প্রমোশন বিজ্ঞাপনগুলো</h2>
                    <Link href="/dashboard" className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center">
                        সবগুলো দেখুন
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : recentAds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentAds.map((ad: any) => (
                            <Link href={`/dashboard?ad=${ad._id}`} key={ad._id} className="block group">
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 transition-all hover:shadow-md h-full flex flex-col">
                                    <div className="relative aspect-[4/3] bg-slate-100">
                                        <img 
                                            src={getImageUrl(ad.images?.[0]) || '/placeholder.png'} 
                                            alt={ad.headline || 'Ad'} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                                        />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
                                            {ad.headline}
                                        </h3>
                                        <div className="mt-auto">
                                            {formatAdPrice(ad) && (
                                                <div className="text-lg font-bold text-slate-900 mb-1">
                                                    {formatAdPrice(ad)}
                                                </div>
                                            )}
                                            <div className="text-xs text-slate-500 flex items-center justify-between">
                                                <span className="truncate pr-2">{ad.location || ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-500 bg-white rounded-lg border border-slate-200">
                        কোনো বিজ্ঞাপন পাওয়া যায়নি
                    </div>
                )}
            </section>
        </div>
    );
}
