"use client";

import React, { useEffect, useState } from 'react';
import { ArrowRight, Grid, MapPin, Zap, Clock } from 'lucide-react';
import { RiLockFill } from 'react-icons/ri';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../utils/apiConfig';
import { useLanguage } from '../app/context/LanguageContext';
import PromoteModal from './PromoteModal';


export default function LatestFreeAdPromo() {
    const { t, language } = useLanguage();
    const [latestAd, setLatestAd] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);


    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchInfo = async () => {
            try {
                // Fetch User
                const userRes = await fetch(`${API_BASE_URL}/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setUser(userData);
                }

                // Fetch My Ads
                const adsRes = await fetch(`${API_BASE_URL}/api/ads/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (adsRes.ok) {
                    const adsData = await adsRes.json();
                    if (adsData.success && Array.isArray(adsData.data) && adsData.data.length > 0) {
                        const mostRecentFreeAd = adsData.data.find((ad: any) => ad.adType !== 'Promoted');
                        setLatestAd(mostRecentFreeAd || null);
                    }
                }
            } catch (error) {
                console.error("Failed to load promo ad data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, []);

    if (loading || !latestAd) return null;

    const handlePromoteClick = () => {
        setIsPromoteModalOpen(true);
    };



    const mainImage = latestAd.images && latestAd.images.length > 0
        ? `${API_BASE_URL}${latestAd.images[0].startsWith('/') ? '' : '/'}${latestAd.images[0]}`
        : null;

    return (
        <>
            <div className="bg-white rounded-lg overflow-hidden group">
                {/* 1. Preview Header */}
                <div className="bg-white px-3 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <RiLockFill className="w-4 h-4 text-slate-500" />
                        <span className="text-[14px] text-slate-700 font-medium">Your Post Preview, only you can See that</span>
                    </div>
                    <button className="text-[14px] text-slate-600 font-medium hover:underline">All Post</button>
                </div>

                {/* 2. Main Image Section */}
                <div className="relative aspect-[16/9] bg-slate-100 mx-1 rounded-lg overflow-hidden mt-1">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            className="w-full h-full object-cover"
                            alt="Preview"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase">No Image</div>
                    )}

                    {/* Top Pill Buttons (Centred) */}
                    <div className="absolute top-4 inset-x-0 flex items-center justify-center gap-3">
                        <button onClick={() => window.location.reload()} className="bg-[#0066CC] text-white flex items-center gap-2 px-4 py-2 rounded-full text-[13px]">
                            <span>↑</span> New posts
                        </button>
                        <button onClick={() => window.location.reload()} className="bg-[#0066CC] text-white flex items-center gap-2 px-4 py-2 rounded-full text-[13px]">
                            <span>↻</span> Refresh
                        </button>
                    </div>

                    {/* Bottom Left Title/Price Overlay */}
                    <div className="absolute bottom-6 left-6 flex">
                        <div className="w-1 bg-white mr-3 self-stretch rounded-full" />
                        <div className="text-white drop-shadow-lg">
                            <h2 className="text-[22px] leading-tight">{latestAd.headline}</h2>
                            <p className="text-[18px] mt-1">$ {latestAd.price || '0.00'}</p>
                        </div>
                    </div>
                </div>

                {/* 3. Promotion Footer */}
                <div className="px-5 py-2 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[15px] text-slate-700">Want More Customer Responce?</span>
                        <span className="text-[17px] text-slate-900">Promote this Post</span>
                    </div>
                    <button
                        onClick={handlePromoteClick}
                        className="bg-[#F6C358] text-slate-900 px-6 py-2.5 rounded-lg text-[14px]"
                    >
                        Promote Post
                    </button>
                </div>
            </div>

            <PromoteModal
                isOpen={isPromoteModalOpen}
                onClose={() => setIsPromoteModalOpen(false)}
                ad={latestAd}
            />


        </>
    );
}
