"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
    Sparkles, 
    Grid, 
    ShieldCheck, 
    Lock, 
    Umbrella, 
    MapPin, 
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    Compass
} from 'lucide-react';
import { API_BASE_URL } from '../utils/apiConfig';
import { formatAdPrice } from '../utils/formatPrice';
import AuthModal from '../components/AuthModal';
import RoleSelectModal from '../components/RoleSelectModal';
import InfoModal from '../components/InfoModal';
import { INFO_CONTENT, getInfoContentForLanguage, type InfoPageType } from '../utils/infoContent';
import PromoteModal from '../components/PromoteModal';

export default function Home() {
    const [recentAds, setRecentAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'invest' | 'seek' | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; content: string }>({
        isOpen: false,
        title: "",
        content: ""
    });

    const openInfoModal = (type: InfoPageType) => {
        const selected = INFO_CONTENT[type];
        if (selected) {
            const localized = getInfoContentForLanguage(selected, 'bn');
            setInfoModal({
                isOpen: true,
                title: localized.title,
                content: localized.content,
            });
        }
    };

    useEffect(() => {
        const fetchRecentAds = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/ads/public/feed?limit=4`);
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

    // Sample items matching design screenshot if fetch has < 4 ads
    const sampleAds = [
        {
            _id: 'sample-1',
            badge: 'বিনিয়োগ',
            badgeType: 'purple',
            title: '৫০ লাখ টাকা প্রয়োজন',
            location: 'উত্তরা • ঢাকা',
            returnRate: '২৫% রিটার্ন/বছর'
        },
        {
            _id: 'sample-2',
            badge: 'বিনিয়োগকারী',
            badgeType: 'green',
            title: '১.২ কোটি মিউচুয়াল',
            location: 'ধানমন্ডি • ঢাকা',
            returnRate: '২০% রিটার্ন/বছর'
        },
        {
            _id: 'sample-3',
            badge: 'বিনিয়োগ',
            badgeType: 'purple',
            title: '১০ লাখ টাকা প্রয়োজন',
            location: 'মিরপুর • ঢাকা',
            returnRate: '৩০% রিটার্ন/বছর'
        },
        {
            _id: 'sample-4',
            badge: 'বিনিয়োগকারী',
            badgeType: 'green',
            title: '৭৫ লাখ - ১ কোটি',
            location: 'গুলশান • ঢাকা',
            returnRate: '২২% রিটার্ন/বছর'
        }
    ];

    const displayAds = recentAds.length > 0 ? recentAds : sampleAds;

    // Framer Motion Stagger Variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 30, scale: 0.96 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 260, damping: 20 }
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FE] flex flex-col text-slate-800 font-sans">
            {/* Header / Navbar */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="sticky top-0 z-50 w-full bg-[#0B071E]/95 backdrop-blur-md py-3.5 px-4 md:px-8 border-b border-purple-950/40 shadow-lg"
            >
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3 group">
                            <motion.div 
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] rounded-xl flex items-center justify-center text-white shadow-md shadow-purple-600/30"
                            >
                                <TrendingUp className="w-5 h-5 text-white" />
                            </motion.div>
                            <span className="text-white text-xl sm:text-2xl font-bold tracking-tight">
                                বিনিয়োগি
                            </span>
                        </Link>
                    </div>

                    {/* Right Items */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link 
                            href="/info/blog" 
                            className="text-white text-sm font-medium hover:text-purple-200 transition-colors"
                        >
                            বাংলা
                        </Link>

                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsAuthModalOpen(true)}
                            className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] hover:from-[#6D28D9] hover:to-[#5B21B6] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-purple-600/30 border border-purple-400/20"
                        >
                            লগইন
                        </motion.button>
                    </div>
                </div>
            </motion.header>

            {/* Hero Section */}
            <section className="relative w-full bg-gradient-to-r from-[#0C081F] via-[#140E33] to-[#251949] text-white pt-10 pb-16 md:pt-16 md:pb-24 px-5 sm:px-8 overflow-hidden">
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative max-w-5xl mx-auto flex flex-col items-center text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 px-3.5 py-1 rounded-full text-purple-200 text-xs sm:text-sm font-medium mb-4 backdrop-blur-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>বিনিয়োগের সহজ প্ল্যাটফর্ম</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.25] sm:leading-[1.25] tracking-tight mb-4 text-center px-2 sm:px-0"
                    >
                        বিনিয়োগ নিয়ে বা দিয়ে,<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">লাভের পথে এগিয়ে যান</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-purple-100/90 text-xs sm:text-sm md:text-base font-normal mb-6 sm:mb-8 max-w-xl opacity-90 text-center px-2 sm:px-0"
                    >
                        আপনি যা খুঁজছেন, তা পোস্ট করুন — সুযোগ আসুক আপনার কাছে
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="flex flex-row items-center justify-center gap-1.5 sm:gap-3.5 w-full max-w-full px-1 sm:px-0"
                    >
                        <motion.button 
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                window.location.href = '/dashboard/post-ad?autoSelect=invest';
                            }}
                            className="bg-white text-slate-900 rounded-xl px-2.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-xl transition-all border border-white/40 cursor-pointer group shrink"
                        >
                            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center shrink-0 group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                            <span className="font-bold text-[11px] sm:text-sm text-slate-900 leading-tight whitespace-nowrap">
                                বিনিয়োগ করতে চাই
                            </span>
                        </motion.button>

                        <motion.button 
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                                window.location.href = '/dashboard/post-ad?autoSelect=seek';
                            }}
                            className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white rounded-xl px-2.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-center gap-1.5 sm:gap-2 shadow-md hover:shadow-xl transition-all border border-purple-400/30 cursor-pointer shrink"
                        >
                            <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0">
                                <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                            <span className="font-bold text-[11px] sm:text-sm text-white leading-tight whitespace-nowrap">
                                ব্যবসার জন্য টাকা দরকার
                            </span>
                        </motion.button>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="flex items-center justify-center gap-1.5 text-xs text-purple-200/80 mt-4"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                        <span>✓ সম্পূর্ণ ফ্রিতে পোস্ট করুন</span>
                    </motion.div>
                </div>
            </section>

            {/* Featured / Recent Posts Section */}
            <section className="w-full max-w-5xl mx-auto px-5 sm:px-6 py-10 sm:py-16">
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.2 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between mb-6 sm:mb-8"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                            <Compass className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                            আপনি যেভাবে খুঁজছেন...
                        </h2>
                    </div>
                    <Link 
                        href="/dashboard" 
                        className="text-xs sm:text-sm font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors flex items-center gap-1 group bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-100"
                    >
                        সব দেখুন 
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-3 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ amount: 0.15 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
                    >
                        {displayAds.slice(0, 4).map((ad: any, index: number) => {
                            const isPurpleBadge = ad.badgeType ? ad.badgeType === 'purple' : (index % 2 === 0);
                            return (
                                <motion.div 
                                    key={ad._id || index}
                                    variants={cardVariants}
                                    whileHover={{ y: -6, scale: 1.015 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`h-full ${index >= 2 ? 'hidden sm:block' : ''}`}
                                >
                                    <Link 
                                        href={ad._id && !ad._id.startsWith('sample') ? `/dashboard?ad=${ad._id}` : '/dashboard'} 
                                        className="block h-full group"
                                    >
                                        <div className="relative bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 h-full flex flex-col justify-between hover:border-purple-300 overflow-hidden">
                                            {/* Top accent bar on hover */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            
                                            <div>
                                                {/* Category Tag */}
                                                <div className="flex items-center justify-between mb-1.5 sm:mb-2.5">
                                                    <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] sm:text-[11px] font-semibold tracking-wide ${
                                                        isPurpleBadge 
                                                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60' 
                                                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isPurpleBadge ? 'bg-purple-600' : 'bg-emerald-600'}`}></span>
                                                        {ad.badge || (ad.category ? ad.category : (index % 2 === 0 ? 'বিনিয়োগ' : 'বিনিয়োগকারী'))}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <h3 className="font-bold text-slate-900 text-[11px] sm:text-sm md:text-base mb-1 line-clamp-2 group-hover:text-[#7C3AED] transition-colors leading-snug">
                                                    {ad.title || ad.headline}
                                                </h3>

                                                {/* Location */}
                                                <p className="text-[9.5px] sm:text-[11px] text-slate-500 font-medium mb-2.5 sm:mb-3 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate">{ad.location || 'ঢাকা • বাংলাদেশ'}</span>
                                                </p>
                                            </div>

                                            {/* Bottom Price / Return Rate */}
                                            <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-medium uppercase tracking-wider">অফার / রিটার্ন</span>
                                                    <span className="text-[11px] sm:text-sm md:text-base font-bold text-purple-700 group-hover:text-purple-900 transition-colors">
                                                        {ad.returnRate || formatAdPrice(ad) || 'আলোচনা সাপেক্ষে'}
                                                    </span>
                                                </div>
                                                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-purple-50 group-hover:bg-[#7C3AED] text-[#7C3AED] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm shrink-0">
                                                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </section>

            {/* Why Search Here Section */}
            <section className="w-full py-10 sm:py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.h2 
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ amount: 0.2 }}
                        transition={{ duration: 0.5 }}
                        className="text-lg sm:text-3xl font-bold text-slate-900 text-center mb-6 sm:mb-12"
                    >
                        কেন এখানে খুঁজবেন?
                    </motion.h2>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ amount: 0.15 }}
                        className="grid grid-cols-4 gap-2 sm:gap-8"
                    >
                        {/* Feature 1 */}
                        <motion.div 
                            variants={cardVariants}
                            whileHover={{ y: -4, scale: 1.05 }}
                            className="flex flex-col items-center text-center p-1.5 sm:p-3 rounded-2xl transition-all"
                        >
                            <motion.div 
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-100/70 text-[#7C3AED] flex items-center justify-center mb-2 sm:mb-3 shadow-sm border border-purple-200/60"
                            >
                                <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" />
                            </motion.div>
                            <span className="font-bold text-slate-800 text-[10px] sm:text-sm leading-tight">
                                স্বচ্ছতার নিশ্চয়তা
                            </span>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div 
                            variants={cardVariants}
                            whileHover={{ y: -4, scale: 1.05 }}
                            className="flex flex-col items-center text-center p-1.5 sm:p-3 rounded-2xl transition-all"
                        >
                            <motion.div 
                                whileHover={{ rotate: -10, scale: 1.1 }}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-100/70 text-[#7C3AED] flex items-center justify-center mb-2 sm:mb-3 shadow-sm border border-purple-200/60"
                            >
                                <Lock className="w-5 h-5 sm:w-7 sm:h-7" />
                            </motion.div>
                            <span className="font-bold text-slate-800 text-[10px] sm:text-sm leading-tight">
                                গোপনীয়তা সুরক্ষিত
                            </span>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div 
                            variants={cardVariants}
                            whileHover={{ y: -4, scale: 1.05 }}
                            className="flex flex-col items-center text-center p-1.5 sm:p-3 rounded-2xl transition-all"
                        >
                            <motion.div 
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-100/70 text-[#7C3AED] flex items-center justify-center mb-2 sm:mb-3 shadow-sm border border-purple-200/60"
                            >
                                <Umbrella className="w-5 h-5 sm:w-7 sm:h-7" />
                            </motion.div>
                            <span className="font-bold text-slate-800 text-[10px] sm:text-sm leading-tight">
                                ঝুঁকি ব্যবস্থাপনা
                            </span>
                        </motion.div>

                        {/* Feature 4 */}
                        <motion.div 
                            variants={cardVariants}
                            whileHover={{ y: -4, scale: 1.05 }}
                            className="flex flex-col items-center text-center p-1.5 sm:p-3 rounded-2xl transition-all"
                        >
                            <motion.div 
                                whileHover={{ rotate: -10, scale: 1.1 }}
                                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-purple-100/70 text-[#7C3AED] flex items-center justify-center mb-2 sm:mb-3 shadow-sm border border-purple-200/60"
                            >
                                <MapPin className="w-5 h-5 sm:w-7 sm:h-7" />
                            </motion.div>
                            <span className="font-bold text-slate-800 text-[10px] sm:text-sm leading-tight">
                                সহজ যোগাযোগ
                            </span>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-[#EFF1F9] text-slate-600 py-5 px-4 mt-auto border-t border-slate-200/60 text-[11px] sm:text-xs">
                <div className="max-w-5xl mx-auto flex flex-wrap justify-center items-center gap-x-3 gap-y-2 text-slate-600 font-medium">
                    <button onClick={() => openInfoModal('about')} className="hover:text-purple-700 transition-colors cursor-pointer">About</button>
                    <span>|</span>
                    <button onClick={() => openInfoModal('privacy')} className="hover:text-purple-700 transition-colors cursor-pointer">Privacy & Policy</button>
                    <span>|</span>
                    <button onClick={() => openInfoModal('terms')} className="hover:text-purple-700 transition-colors cursor-pointer">Terms & Condition</button>
                    <span>|</span>
                    <button onClick={() => openInfoModal('safety')} className="hover:text-purple-700 transition-colors cursor-pointer">Safety tips</button>
                    <span>|</span>
                    <button onClick={() => openInfoModal('contact')} className="hover:text-purple-700 transition-colors cursor-pointer">Contact Us</button>
                    <span>|</span>
                    <button onClick={() => setIsPromoteModalOpen(true)} className="hover:text-purple-700 transition-colors cursor-pointer">Promote</button>
                </div>
            </footer>

            {/* Info Modal */}
            <InfoModal 
                isOpen={infoModal.isOpen} 
                onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
                title={infoModal.title}
                content={infoModal.content}
            />

            {/* Promote Modal */}
            <PromoteModal 
                isOpen={isPromoteModalOpen} 
                onClose={() => setIsPromoteModalOpen(false)}
                ad={null}
            />

            {/* Role Select Modal */}
            <RoleSelectModal 
                isOpen={isRoleModalOpen} 
                onClose={() => setIsRoleModalOpen(false)}
                selectedRole={selectedRole}
                onOpenAuth={() => setIsAuthModalOpen(true)}
            />

            {/* Auth Modal */}
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)}
            />
        </div>
    );
}
