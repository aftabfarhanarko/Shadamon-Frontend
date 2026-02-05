"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsPage() {
    const { t, language, setLanguage } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-black transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-lg text-black">{t('settings')}</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-black flex items-center gap-2">
                            <Globe className="w-5 h-5 text-brand-600" />
                            {t('change_language')}
                        </h2>
                    </div>

                    <div className="divide-y divide-slate-100">
                        <button
                            onClick={() => setLanguage('bn')}
                            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
                        >
                            <div>
                                <p className="font-medium text-black">বাংলা (Bangla)</p>
                                <p className="text-sm text-black">Local Language</p>
                            </div>
                            {language === 'bn' && <Check className="w-5 h-5 text-brand-600" />}
                        </button>

                        <button
                            onClick={() => setLanguage('en')}
                            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left"
                        >
                            <div>
                                <p className="font-medium text-black">English</p>
                                <p className="text-sm text-black">International</p>
                            </div>
                            {language === 'en' && <Check className="w-5 h-5 text-brand-600" />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
