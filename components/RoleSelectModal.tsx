"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Grid, ChevronRight } from 'lucide-react';

interface RoleSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRole?: 'invest' | 'seek' | null;
    onSelectRole?: (role: 'invest' | 'seek') => void;
    onOpenAuth?: () => void;
}

export default function RoleSelectModal({ isOpen, onClose, selectedRole, onSelectRole, onOpenAuth }: RoleSelectModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-7"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose} 
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header row */}
                        <div className="flex items-center justify-between mb-6 pr-8">
                            <div>
                                <span className="text-xs text-slate-500 font-medium">Already Registered?</span>
                                <h3 className="text-xl font-bold text-slate-900">Login / সাইন ইন</h3>
                            </div>
                            {onOpenAuth && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { onClose(); onOpenAuth(); }}
                                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md shadow-purple-600/20 transition-all"
                                >
                                    লগইন
                                </motion.button>
                            )}
                        </div>

                        {/* Question */}
                        <div className="mb-5">
                            <h4 className="text-lg font-bold text-slate-900 mb-1">
                                আপনার পছন্দ
                            </h4>
                            <p className="text-xs text-slate-500">
                                এগিয়ে যেতে নিচে ক্লিক করুন:
                            </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3 mb-6">
                            {/* Option 1: Invest */}
                            {(!selectedRole || selectedRole === 'invest') && (
                                <motion.button
                                    whileHover={{ scale: 1.02, x: 2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (onSelectRole) onSelectRole('invest');
                                        window.location.href = '/dashboard/post-ad?autoSelect=invest';
                                    }}
                                    className="w-full bg-slate-50 hover:bg-purple-50/80 border border-slate-200 hover:border-purple-300 rounded-2xl p-4 flex items-center justify-between transition-all group cursor-pointer text-left shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-900 text-sm group-hover:text-[#7C3AED] transition-colors">
                                                বিনিয়োগ করতে চাই
                                            </h5>
                                            <p className="text-xs text-slate-500">নতুন ইনভেস্টমেন্ট সুযোগ খুঁজুন</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all" />
                                </motion.button>
                            )}

                            {/* Option 2: Need money */}
                            {(!selectedRole || selectedRole === 'seek') && (
                                <motion.button
                                    whileHover={{ scale: 1.02, x: 2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (onSelectRole) onSelectRole('seek');
                                        window.location.href = '/dashboard/post-ad?autoSelect=seek';
                                    }}
                                    className="w-full bg-slate-50 hover:bg-purple-50/80 border border-slate-200 hover:border-purple-300 rounded-2xl p-4 flex items-center justify-between transition-all group cursor-pointer text-left shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-10 h-10 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Grid className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-900 text-sm group-hover:text-[#7C3AED] transition-colors">
                                                ব্যবসার জন্য টাকা দরকার
                                            </h5>
                                            <p className="text-xs text-slate-500">বিনিয়োগকারীর কাছে অফার পোস্ট করুন</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all" />
                                </motion.button>
                            )}
                        </div>

                        {/* Footer links */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                            <Link href="/info/about" className="hover:text-purple-600 transition-colors">ABOUT SHADAMON</Link>
                            <span>•</span>
                            <Link href="/dashboard" className="hover:text-purple-600 transition-colors">MARKET</Link>
                            <span>•</span>
                            <Link href="/info/privacy" className="hover:text-purple-600 transition-colors">PREFERENCE</Link>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
