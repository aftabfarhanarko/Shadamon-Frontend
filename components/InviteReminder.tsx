"use client";

import React, { useState } from 'react';
import { Mail, ArrowRight, X } from 'lucide-react';
import InviteModal from './InviteModal';

export default function InviteReminder() {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isDismissed) return null;

    return (
        <>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 sm:p-6 mb-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4">
                    <button 
                        onClick={() => setIsDismissed(true)}
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                        aria-label="Dismiss reminder"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                        <Mail className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Grow your network! Invite friends...
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 sm:mb-0 max-w-xl">
                            Help us grow the community by inviting your friends. They will receive a notification instantly if they are already registered.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                        Invite Now
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Decorative background elements */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute top-4 right-1/4 w-16 h-16 bg-indigo-200 rounded-full opacity-20 blur-lg"></div>
            </div>

            <InviteModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
