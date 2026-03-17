"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import {
    User, Search, Bell, MessageSquare, Globe,
    Home, Plus, Inbox, LogOut, Settings, Menu, X,
    Grid, MapPin, ChevronRight, ChevronDown, Megaphone
} from 'lucide-react';
import { RiMailFill, RiMailLine, RiUser3Fill, RiHome5Line, RiSearchLine, RiAddLine, RiUser3Line } from 'react-icons/ri';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { useLanguage } from '../context/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../context/SettingsContext';
import PostAdModal from '../../components/PostAdModal';
import PromoteModal from '../../components/PromoteModal';
import LoginModal from '../../components/LoginModal';
import RegisterModal from '../../components/RegisterModal';
import AccountActivityModal from '../../components/AccountActivityModal';
import MobileEntryModal from '../../components/MobileEntryModal';
import VerificationModal from '../../components/VerificationModal';
import AdDetailsModal from '../../components/AdDetailsModal';
import MessageModal from '../../components/MessageModal';
import ChatMessageModal from '../../components/ChatMessageModal';
import InfoModal from '../../components/InfoModal';
import AdDisplay from '../../components/AdDisplay';
import AdPopup from '../../components/AdPopup';
import SearchModal from '../../components/SearchModal';
import { toast } from 'react-hot-toast';


import { API_BASE_URL } from '../../utils/apiConfig';
import { getImageUrl } from '../../utils/imageUrl';
import { div } from 'framer-motion/client';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}


interface SubItem {
    _id: string;
    name: string;
    slug: string;
    image?: string;
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

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const { t, language, setLanguage } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [isPostAdModalOpen, setIsPostAdModalOpen] = useState(false);
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isMobileEntryModalOpen, setIsMobileEntryModalOpen] = useState(false);
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [initialMobile, setInitialMobile] = useState('');
    const [tempMobile, setTempMobile] = useState<string>(""); // Store mobile from entry modal
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [accountModalInitialTab, setAccountModalInitialTab] = useState<'Page' | 'Profile' | 'Settings' | 'Post' | 'Activity'>('Page');
    const [viewingUserId, setViewingUserId] = useState<string | undefined>(undefined);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isChatMessageModalOpen, setIsChatMessageModalOpen] = useState(false);
    const [chatAd, setChatAd] = useState<any>(null);
    const [chatOtherUser, setChatOtherUser] = useState<any>(null);


    const [adToPromote, setAdToPromote] = useState<any>(null);
    const [adToEdit, setAdToEdit] = useState<any>(null);
    const [verificationToken, setVerificationToken] = useState<string | undefined>(undefined);
    const [user, setUser] = useState<any>(null);

    const [mobileEntryReason, setMobileEntryReason] = useState<'post_ad' | 'account' | 'message' | 'report' | 'promote'>('post_ad');
    const [reportAd, setReportAd] = useState<any>(null);
    const [shouldOpenReportAfterLogin, setShouldOpenReportAfterLogin] = useState(false);


    const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; content: string }>({
        isOpen: false,
        title: '',
        content: ''
    });

    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        const token = Cookies.get('token');
        if (!token) {
            setUnreadCount(0);
            return;
        }
        try {
            const [convRes, notifRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/messages/conversations`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/api/user/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const convData = await convRes.json();
            const notifData = await notifRes.json();

            let total = 0;

            if (convData.success && Array.isArray(convData.data)) {
                // Count how many conversations have at least one unread message
                total += convData.data.filter((conv: any) => (conv.unreadCount || 0) > 0).length;
            }

            if (Array.isArray(notifData)) {
                // Count unread admin notifications
                total += notifData.filter((n: any) => !n.isRead).length;
            }

            setUnreadCount(total);
        } catch (err) {
            console.error("Unread count fetch error:", err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Every 30s
        window.addEventListener('refresh-unread-count', fetchUnreadCount);
        return () => {
            clearInterval(interval);
            window.removeEventListener('refresh-unread-count', fetchUnreadCount);
        };
    }, []);

    const openInfoModal = (type: 'about' | 'terms' | 'privacy' | 'contact' | 'safety' | 'return') => {
        const contentMap: Record<string, { title: string; content: string }> = {
            about: {
                title: 'Shadamon.com সম্পর্কে',
                content: `Shadamon.com একটি আধুনিক অনলাইন মার্কেটপ্লেস, যেখানে আপনি খুব সহজে ও নিরাপদে বিভিন্ন ধরনের পণ্য কেনাবেচা করতে পারেন। আপনি আপনার আশেপাশের এলাকা কিংবা সারা বাংলাদেশের মধ্যে থেকে সহজেই পছন্দের পণ্য খুঁজে নিতে পারবেন।

আপনি কি কিছু বিক্রি করতে চান?
Shadamon.com-এ একটি অ্যাকাউন্ট খোলা সম্পূর্ণ ফ্রি এবং খুব সহজ। মাত্র কয়েক মিনিটেই আপনি আপনার পণ্যের বিজ্ঞাপন পোস্ট করতে পারবেন এবং আগ্রহী ক্রেতাদের কাছে পৌঁছে যেতে পারবেন। দ্রুত বিক্রির জন্য আপনার বিজ্ঞাপনটি পরিষ্কার, তথ্যবহুল ও আকর্ষণীয়ভাবে তৈরি করুন। যদি আপনার একাধিক পণ্য থাকে বা ব্যবসায়িকভাবে বিক্রি করেন, তাহলে Shadamon.com-এর প্রিমিয়াম ফিচার ব্যবহার করে আরও বেশি মানুষের কাছে পৌঁছাতে পারবেন।

আপনি কি কিছু কিনতে চান?
Shadamon.com-এ বিভিন্ন ক্যাটাগরিতে সারা বাংলাদেশ জুড়ে অসংখ্য পণ্যের সংগ্রহ রয়েছে। ইলেকট্রনিক্স, গাড়ি, বাসা-বাড়ি থেকে শুরু করে দৈনন্দিন প্রয়োজনীয় জিনিস—সবকিছুই এক জায়গায় খুঁজে পাবেন। সহজ সার্চ ও ফিল্টার অপশন আপনাকে দ্রুত আপনার প্রয়োজন অনুযায়ী পণ্য খুঁজে পেতে সাহায্য করবে।
Shadamon.com-এর প্রতিটি বিজ্ঞাপন প্রকাশের আগে যাচাই করা হয় যাতে মান বজায় থাকে।`
            },
            terms: {
                title: 'Shadamon.com এর টার্ম ও কণ্ডিশন',
                content: `Shadamon.com ব্যবহার করার মাধ্যমে আপনি আমাদের নীতিমালা ও শর্তাবলী মেনে চলতে সম্মত হচ্ছেন। দয়া করে এটি মনোযোগ দিয়ে পড়ুন।

১. সাধারণ
ব্যবহারকারী এবং বিজ্ঞাপনদাতারা নিশ্চিত করবেন যে তাদের আপলোড করা সকল কনটেন্ট (লেখা, ছবি, ভিডিও বা গ্রাফিক্স) প্রযোজ্য সকল আইন অনুযায়ী সঠিক। Shadamon.com কোনো আইনি বা তথ্যগত অসঙ্গতির জন্য দায়ভার বহন করে না।
ব্যবহারকারীরা নিশ্চয়তা দেন যে তাদের কনটেন্ট কপিরাইট বা অন্যান্য আইনি অধিকার লঙ্ঘন করে না এবং Shadamon.com কে কোনো দাবী, ক্ষতি বা দায় থেকে মুক্ত রাখবেন।

২. কপিরাইট
ব্যবহারকারীরা Shadamon.com-কে তাদের কনটেন্ট ব্যবহার, প্রকাশ, সম্পাদনা, অনুবাদ, ডেরিভেটিভ তৈরি এবং বিতরণের জন্য আজীবন, রায়াল্টি-ফ্রি, অ-বিশেষ অধিকার প্রদান করছেন।
Shadamon.com-এর সকল কনটেন্ট, সফটওয়্যার এবং সেবাসমূহ আমাদের এবং আমাদের পার্টনারদের সম্পত্তি। লিখিত অনুমতি ছাড়া এগুলো অনুলিপি বা বিতরণ করা যাবে না।

৩. Watermarks ও ছবি
Shadamon.com-এ থাকা ছবিতে ওয়াটারমার্ক থাকতে পারে যাতে অন্যত্র ব্যবহার না হয়। প্রয়োজন হলে Shadamon.com কনটেন্ট সম্পাদনা বা বাতিল করার অধিকার রাখে।

৪. নিরাপত্তা ও আইনি বিষয়
যদি কোনো কনটেন্ট আইন লঙ্ঘন করে, Shadamon.com প্রয়োজন হলে কর্তৃপক্ষের সাথে সহযোগিতা করবে। ব্যবহারকারীর পরিচয় যাচাই করা যেতে পারে।

৫. প্রাইভেসি
Shadamon.com ব্যবহারকারীর তথ্য সংগ্রহ করে সেবা প্রদানের ও উন্নয়নের জন্য। এই তথ্য ব্যবহার, গবেষণা, মার্কেটিং ও প্রোডাক্ট উন্নয়নে ব্যবহারের জন্য আপনি সম্মত হবেন। প্রয়োজনে তথ্য শেয়ার করা হতে পারে।

৬. কুকিজ
Shadamon.com সঠিকভাবে কাজ করার জন্য কুকিজ ব্যবহার করে। কুকিজ ব্যক্তিগত তথ্য সংগ্রহ করে না।

৭. ইমেল, মোবাইল নং ও ব্যাক্তিগত তথ্যাবলি 
বিজ্ঞাপন পোস্ট করার জন্য মোবাইল নাম্বার বা ইমেল ঠিকানা আবশ্যক। ইমেল ঠিকানা গোপন রাখা হবে, তবে ব্যবহারকারীরা Shadamon.com-এর মাধ্যমে বার্তা পাঠাতে পারবেন।

৮. সাইট অ্যাভেলিবিলিটি
Shadamon.com “যেমন আছে” ভিত্তিতে সরবরাহ করা হচ্ছে এবং অনবরত বা নিরাপদ অ্যাক্সেসের নিশ্চয়তা নেই।

৯. তৃতীয় পক্ষের লিঙ্ক
Shadamon.com-এ তৃতীয় পক্ষের ওয়েবসাইটের লিঙ্ক থাকতে পারে। সেগুলোর জন্য Shadamon.com দায়ী নয়। ব্যবহারকারী নিজ দায়িত্বে এগুলো ব্যবহার করবেন।

১০. পেইড কনটেন্ট ও সার্ভিস
কিছু সেবা যেমন প্রিমিয়াম মেম্বারশিপ, বিজ্ঞাপন প্রচারণা এবং ডোরস্টেপ ডেলিভারি পেইড হতে পারে। Shadamon.com এইসব কনটেন্ট নিয়ন্ত্রণ করতে পারে এবং শর্ত লঙ্ঘনের ক্ষেত্রে তা বাতিল করার অধিকার রাখে।

১১. দায়মুক্তি
Shadamon.com কোনো ভুল, ডাউনটাইম, তৃতীয় পক্ষের কনটেন্ট বা ব্যবহার থেকে উদ্ভূত ক্ষতির জন্য দায়ী নয়।

১২. ক্ষতিপূরণ
ব্যবহারকারীরা Shadamon.com এবং তার স্টাফকে শর্তাবলী লঙ্ঘনের কারণে সৃষ্ট যেকোনো ক্ষতি বা দাবী থেকে মুক্ত রাখবেন।

১৩. সংশোধনী
Shadamon.com যে কোনো সময় শর্তাবলী পরিবর্তন করতে পারে। প্ল্যাটফর্ম ব্যবহার চালিয়ে যাওয়া মানে সংশোধিত শর্তাবলী মেনে নেওয়া।

১৪. প্রযোজ্য আইন
Shadamon.com বাংলাদেশের আইন ও নিয়ম অনুযায়ী পরিচালিত হয়।`
            },
            privacy: {
                title: 'Shadamon.com প্রাইভেসি পলিসি',
                content: `Shadamon.com-এ আপনার গোপনীয়তা এবং নিরাপত্তা আমাদের জন্য গুরুত্বপূর্ণ। নিরাপদ এবং কার্যকর সেবা প্রদানের জন্য আমরা কিছু ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং পরিচালনা করি।

১. তথ্য সংগ্রহ
আমরা নিম্নলিখিত তথ্য সংগ্রহ করতে পারি:
• ইমেল, ফোন নম্বর এবং ব্যাক্তিগত ও প্রয়োজন অনুযায়ী আর্থিক তথ্য।
• ডিভাইস ও ব্রাউজার ডেটা, পেজ ভিউ ও ট্রাফিক স্ট্যাটিস্টিক।
• অন্যান্য প্রযুক্তিগত তথ্য, যেমন IP ঠিকানা ও স্ট্যান্ডার্ড ওয়েব লগ।
তথ্য সরবরাহ করলে আপনি Shadamon.com সার্ভারে এর সংরক্ষণ ও ব্যবহারে সম্মত হবেন।

২. তথ্য ব্যবহার
আমরা তথ্য ব্যবহার করি:
• সেবা প্রদানে ও উন্নতিতে।
• সমস্যার সমাধান, ফি সংগ্রহ এবং টেকনিকাল সহায়তায়।
• নিরাপদ লেনদেন নিশ্চিত করতে এবং নীতি বাস্তবায়নে।
• ব্যবহারকারীর অভিজ্ঞতা কাস্টমাইজ করতে ও সেবায় আগ্রহ মাপতে।
• আপডেট, অফার ও প্রচারণা জানাতে।

৩. কুকিজ
কুকিজ কী?
কুকিজ হলো ছোট তথ্য ফাইল যা আপনার ডিভাইসে সংরক্ষিত হয়। এগুলো Shadamon.com-কে আপনার ডিভাইস চিনতে এবং ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে সাহায্য করে।

ব্যব্যবহৃত কুকিজের ধরন:
• সেশন কুকিজ: সেবা চলমান রাখতে।
• প্রেফারেন্স কুকিজ: সেটিংস মনে রাখার জন্য।
• সিকিউরিটি কুকিজ: নিরাপত্তা রক্ষা করতে।
আপনি আপনার ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে বা প্রত্যাখ্যান করতে পারেন। তবে কিছু ফিচার কাজ নাও করতে পারে।

৪. তথ্য শেয়ারিং ও প্রকাশ
Shadamon.com ব্যবহারকারীর অনুমতি ছাড়া তথ্য বিক্রি বা ভাড়া দেয় না। তথ্য শেয়ার করা হতে পারে:
• সেই বিক্রেতাদের সঙ্গে যাদের সাথে আপনি যোগাযোগ করেছেন বা আগ্রহ দেখিয়েছেন।
• আইনি প্রয়োজন অনুযায়ী কর্তৃপক্ষের সঙ্গে।
• পার্টনারদের সঙ্গে সেবা পরিচালনা, বিশ্লেষণ, মার্কেটিং ও উন্নয়নের জন্য।

৫. যোগাযোগ ও ইমেল
আপনি Shadamon.com ব্যবহার করলে বিজ্ঞাপন বা অফার সম্পর্কিত মেসেজ পেতে পারেন। 
ব্যবহারকারীরা আমাদের টুল ব্যবহার করে স্প্যাম পাঠাতে পারবেন না। Shadamon.com মেসেজ মনিটর করে যেকোনো ক্ষতিকর কনটেন্ট প্রতিরোধ করে।

৬. নিরাপত্তা
• আমরা এনক্রিপশন, পাসওয়ার্ড ও অন্যান্য পদ্ধতি ব্যবহার করে ব্যক্তিগত তথ্য রক্ষা করি।
• ব্যক্তিগত তথ্য গোপন রাখা হয় যতক্ষণ না আপনি নিজে শেয়ার করেন। অন্যদের যোগাযোগ তথ্য প্রকাশ করা নিষিদ্ধ।

৭. আনসাবস্ক্রাইব ও তথ্য অপসারণ
আপনি যেকোনো সময় আপনার ব্যক্তিগত তথ্য পর্যালোচনা বা মুছে ফেলার জন্য আমাদের সাথে যোগাযোগ করতে পারেন।

৮. বিজ্ঞাপন ও রিমার্কেটিং
Shadamon.com প্রদর্শনী বিজ্ঞাপন এবং রিমার্কেটিং ব্যবহার করে।`
            },
            safety: {
                title: 'সেফটি টিপস (Safety Tips)',
                content: `Shadamon.com-এ আপনার নিরাপত্তা আমাদের প্রথম অগ্রাধিকার। প্ল্যাটফর্ম ব্যবহার করার সময় নিরাপদ থাকার জন্য কিছু পরামর্শ:

পণ্য সরাসরি যাচাই করুন: পেমেন্ট করার আগে বিক্রেতার সাথে দেখা করুন এবং পণ্যটি ভালোভাবে পরীক্ষা করুন।
চাকরির জন্য আবেদন: নিয়োগকর্তা এবং চাকরির তথ্য যাচাই করুন। ব্যক্তিগত তথ্য শেয়ার করবেন না। দূরের বা অজানা স্থানে সাক্ষাৎ এড়িয়ে চলুন।

পণ্য ও পেমেন্ট একসাথে করুন:
• ক্রেতারা: পণ্য পাওয়ার আগে অর্থ প্রদান করবেন না।
• বিক্রেতারা: পেমেন্ট পাওয়ার আগে পণ্য পাঠাবেন না।

• সাধারণ বুদ্ধি ব্যবহার করুন: খুবই সস্তা অফার বা দ্রুত টাকা আয়ের প্রতিশ্রুতি এড়িয়ে চলুন।
• ব্যাংক বা আর্থিক তথ্য কখনও দেবেন না।

সতর্কতা (Scams)
• ভুয়া পেমেন্ট সার্ভিস: Shadamon.com কোনো পেমেন্ট সেবা বা প্রোটেকশন দেয় না। নিশ্চিত না হলে তৃতীয় পক্ষের পেমেন্ট ব্যবহার করবেন না।
• ভুয়া তথ্যের অনুরোধ: Shadamon.com কখনও ব্যক্তিগত তথ্য ইমেলে চায় না। সন্দেহজনক লিঙ্ক এড়িয়ে চলুন। রিপোর্ট করে ইমেল মুছে দিন।
• অতিরিক্ত ফি দাবি: সাধারণ সেবার জন্য অতিরিক্ত ফি দাবি করা হয় না।
• মানি ট্রান্সফার সার্ভিস (Western Union / MoneyGram): অচেনা ব্যক্তির সাথে ব্যবহার করবেন না।
• ভুয়া ডেলিভারি দাবী: Shadamon.com সরাসরি ডেলিভারি দেয় না। ভুয়া দাবী রিপোর্ট করুন।

Shadamon.com-এর নিরাপত্তা ব্যবস্থা
• ইমেল ঠিকানা লুকানো থাকে।
• ফোন নম্বর লুকানোর অপশন আছে।
• প্রযুক্তি উন্নতি চালু থাকে সন্দেহজনক কার্যকলাপ রোধের জন্য।
• পুনরাবৃত্ত অপরাধী ব্লক করা হয়।

নিরাপত্তা সমস্যা রিপোর্ট
প্রতারণার শিকার হলে দ্রুত রিপোর্ট করুন। প্রয়োজনে স্থানীয় পুলিশ বা আইন প্রয়োগকারীর সঙ্গে যোগাযোগ করুন।

সাবধানী নির্দেশনা: 
• Shadamon.com সর্বোচ্চ চেষ্টা করে নিরাপদ লেনদেন নিশ্চিত করতে, কিন্তু ব্যবহারকারীর কার্যকলাপের জন্য দায়ী নয়।
• ব্যবহারকারীরা সতর্ক থাকবেন এবং ব্যক্তিগত/আর্থিক তথ্য শেয়ার করার আগে যাচাই করবেন।
• ব্যবহারকারীর গোপনীয়তা রক্ষা করা হয়, তবে প্রতারণা বা অপরাধমূলক কার্যক্রমের ক্ষেত্রে আমরা আইন প্রয়োগকারীর সঙ্গে সহযোগিতা করি।`
            },
            contact: {
                title: 'যোগাযোগ',
                content: `আপনার কোনো প্রশ্ন থাকলে প্রথমে আমাদের সেইফটি টিপস সেকশন দেখুন। যদি সেখানে উত্তর না পান, তাহলে আমাদের সাথে যোগাযোগ করুন। আমরা দ্রুত উত্তর দেব।

যোগাযোগের উপায়:
• মেসেজ অথবা চ্যাট: m.me/ShadamonDotCom
• কল করুন: 01752 84 20 84
• ব্যবসায়িক সময়: প্রতিদিন সকাল ১০টা থেকে রাত ৮টা
• ঠিকানা: Road 4, Block J, Banasree, Rampura, Dhaka.`
            },
            return: {
                title: 'রিটার্ন & রিফান্ড পলিসি',
                content: `Shadamon.com-চায় ব্যবহারকারীদের অভিজ্ঞতা সহজ, সুরক্ষিত এবং কার্যকর হোক। প্রমোশনাল কার্যক্রমের ক্ষেত্রে, প্রদত্ত অর্থ এবং প্রমোশনাল ফলাফলের ধরন সম্পর্কে কিছু গুরুত্বপূর্ণ দিক বিবেচনা করা দরকার।

পারফরম্যান্স ও ফলাফলের ধরন:
প্রমোশনাল কার্যক্রমের ফলাফল অনুমানভিত্তিক। আমাদের স্বয়ংক্রিয় সিস্টেম সর্বোচ্চ চেষ্টা করবে আপনার পোস্টকে প্রাসঙ্গিক দর্শকের কাছে পৌঁছে দিতে। তবে দর্শকসংখ্যা, আগ্রহ বা ফলাফল শতভাগ নির্ধারিত নয়। এটি একটি সম্ভাব্যতা ভিত্তিক প্রক্রিয়া যা প্রমোশনাল কার্যক্রমের অবস্থা, সময় এবং দর্শকের প্রতিক্রিয়ার ওপর নির্ভরশীল।

ব্যবহারকারীর দায়িত্ব:
প্রমোট করার আগে নিশ্চিত হোন যে আপনার পোস্টে দেওয়া তথ্য সঠিক, কার্যকর এবং আপডেটেড। কোনো ভুল বা অসম্পূর্ণ তথ্যের কারণে প্রমোশনাল ফলাফলে প্রভাব পড়লে Shadamon.com কোনো ধরনের ক্ষতিপূরণ বা অর্থ ফেরতের জন্য দায়ী নয়। কোনো ভুল বা অসম্পূর্ণ তথ্যের কারণে লাইভ প্রমোশনকে বন্ধ করলে সে অর্থও ফেরত দেয়া সম্ভব হয় না।

ফলাফল ট্র্যাকিং ও স্বচ্ছতা:
প্রমোট করলে আপনি সরাসরি দেখতে পাবেন কতজন দর্শক বা কাস্টমার আপনার পোস্টে আগ্রহ দেখিয়েছে। এই তথ্য ব্যবহার করে আপনি ভবিষ্যতে প্রমোশনাল পরিকল্পনা আরও কার্যকর করতে পারেন।

স্বয়ংক্রিয় এবং সহজ ব্যবহার:
Shadamon.com-এর প্রমোশনাল সিস্টেম স্বয়ংক্রিয়ভাবে সব কার্যক্রম পরিচালনা করে। কোনো জটিল সেটআপ বা আলাদা ফিচার নির্বাচন করার প্রয়োজন নেই। প্রমোট বাটনে ক্লিক করার সঙ্গে সঙ্গে কার্যক্রম শুরু হয় এবং ফলাফল স্বয়ংক্রিয়ভাবে প্রদর্শিত হয়।

প্রমোশনাল অর্থের ব্যবহার:
প্রমোশনের প্রসেসিং শুরু হলে, প্রদত্ত অর্থ স্বয়ংক্রিয়ভাবে কার্যকর হয়। অর্থটি প্রক্রিয়াজাত হয়ে সিস্টেমের শিডিউলিং-এ চলে যায় এবং প্রমোশনাল কার্যক্রমের বিভিন্ন ধাপ অনুযায়ী পোস্ট বা বিজ্ঞাপনকে লক্ষ্য নির্ধারিত দর্শকের কাছে পৌঁছে দেয়া হয়। এর ফলে, প্রসেসিং এ চলে গেলে, সে অর্থ ফেরতের পর্যায়ে থাকে না। 

মোট কথা:
Shadamon.com-এর প্রমোশনাল সিস্টেম ব্যবহার করা সহজ, নিরাপদ এবং কার্যকর। প্রদত্ত অর্থ প্রক্রিয়াজাত হয়ে স্বয়ংক্রিয়ভাবে পোস্ট প্রদর্শনের পথে চলে যায়, সিস্টেম সর্বোচ্চ চেষ্টা করেসবোচ্ছ ভিজিটরের কাছে পোস্টটিকে পৌঁছে দিতে, এবং ব্যবহারকারী সরাসরি ফলাফল দেখতে পান।`
            }
        };

        const selected = contentMap[type];
        if (selected) {
            setInfoModal({
                isOpen: true,
                title: selected.title,
                content: selected.content
            });
        }
    };


    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedAdForDetail, setSelectedAdForDetail] = useState<any | null>(null);

    const searchRef = useRef<HTMLDivElement>(null);

    // Event Listener for opening account modal from children
    useEffect(() => {
        const handleOpenAccount = (e: any) => {
            const userId = e.detail?.userId;
            const activeTab = e.detail?.activeTab;

            setViewingUserId(userId);
            if (activeTab) {
                setAccountModalInitialTab(activeTab);
            } else {
                setAccountModalInitialTab('Page');
            }

            setIsAccountModalOpen(true);

            // Update URL with profile param
            if (userId) {
                const params = new URLSearchParams(window.location.search);
                params.set('profile', userId);
                router.push(`/dashboard?${params.toString()}`, { scroll: false });
            }

        };

        window.addEventListener('open-account-modal', handleOpenAccount as EventListener);

        const handleOpenMobileEntry = (e: any) => {
            if (e.detail?.reason) {
                setMobileEntryReason(e.detail.reason);
                if (e.detail.reason === 'report' && e.detail.ad) {
                    setReportAd(e.detail.ad);
                }
            } else if (e.detail?.reason === 'promote') {
                setMobileEntryReason('promote');
            } else {
                setMobileEntryReason('post_ad');
                setReportAd(null);
            }
            setIsMobileEntryModalOpen(true);
        };

        window.addEventListener('open-mobile-entry-modal', handleOpenMobileEntry as EventListener);


        const handleOpenChat = (e: CustomEvent) => {
            setChatAd(e.detail?.ad);
            setChatOtherUser(e.detail?.otherUser || null);
            setIsChatMessageModalOpen(true);
        };
        window.addEventListener('open-chat-modal', handleOpenChat as EventListener);

        const handleOpenInfo = (e: CustomEvent) => {
            openInfoModal(e.detail?.type);
        };
        window.addEventListener('open-info-modal', handleOpenInfo as EventListener);

        const handleOpenPostAd = (e: CustomEvent) => {
            setAdToEdit(e.detail?.ad || null);
            setIsPostAdModalOpen(true);
        };
        window.addEventListener('open-post-ad-modal', handleOpenPostAd as EventListener);

        const handleOpenPromote = (e: CustomEvent) => {
            setAdToPromote(e.detail?.ad || null);
            setIsPromoteModalOpen(true);
        };
        window.addEventListener('open-promote-modal', handleOpenPromote as EventListener);

        return () => {
            window.removeEventListener('open-account-modal', handleOpenAccount as EventListener);
            window.removeEventListener('open-mobile-entry-modal', handleOpenMobileEntry);
            window.removeEventListener('open-chat-modal', handleOpenChat as EventListener);
            window.removeEventListener('open-info-modal', handleOpenInfo as EventListener);
            window.removeEventListener('open-post-ad-modal', handleOpenPostAd as EventListener);
            window.removeEventListener('open-promote-modal', handleOpenPromote as EventListener);
        };

    }, [language, router]);

    // Handle clicking outside of search to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [socket, setSocket] = useState<any>(null);

    const { settings, fetchDashboardSettings } = useSettings();

    // Socket.io for notifications and Auth Sync
    useEffect(() => {
        const fetchUserAndSetupSocket = async () => {
            const token = Cookies.get('token');
            if (!token) {
                setUser(null);
                setUnreadCount(0);
                if (socket) {
                    socket.disconnect();
                    setSocket(null);
                }
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/user/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) {
                    setUser(null);
                    return;
                }
                const userData = await res.json();

                if (userData && userData._id) {
                    setUser(userData);
                    const socketUrl = API_BASE_URL.replace('/api', '');
                    const newSocket = io(socketUrl);
                    setSocket(newSocket);

                    newSocket.emit('setup', { id: userData._id });

                    newSocket.on('notification received', () => {
                        fetchUnreadCount();
                        window.dispatchEvent(new Event('refresh-unread-count'));
                    });

                    return () => {
                        newSocket.disconnect();
                    };
                }
            } catch (err) {
                console.error("Socket setup error:", err);
            }
        };

        fetchUserAndSetupSocket();

        // Listen for auth changes
        const handleAuthChange = () => {
            fetchUserAndSetupSocket();
            fetchUnreadCount();
        };

        window.addEventListener('auth-change', handleAuthChange);
        return () => {
            window.removeEventListener('auth-change', handleAuthChange);
        };
    }, []);

    // Mobile Sidebar State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [expandedLocation, setExpandedLocation] = useState<string | null>(null);
    const [totalAds, setTotalAds] = useState<number>(0); // Fallback to reference number

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/ads/public/all`);
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setTotalAds(data.data.length);
                }
            } catch (err) {
                console.error("Meta fetch error:", err);
            }
        };
        fetchMeta();
    }, []);

    useEffect(() => {
        fetchDashboardSettings();
    }, [fetchDashboardSettings]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, subCatRes, locRes, subLocRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/categories`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/categories/sub`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/locations`).then(res => res.json()),
                    fetch(`${API_BASE_URL}/api/locations/sub`).then(res => res.json())
                ]);

                if (catRes.success && subCatRes.success) {
                    const cats = catRes.data
                        .map((c: any) => ({
                            ...c,
                            subcategories: subCatRes.data
                                .filter((sc: any) => (sc.category?._id || sc.category) === c._id)
                                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                        }))
                        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                    setCategories(cats);
                }

                if (locRes.success && subLocRes.success) {
                    const locs = locRes.data
                        .map((l: any) => ({
                            ...l,
                            subLocations: subLocRes.data
                                .filter((sl: any) => (sl.location?._id || sl.location) === l._id)
                                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                        }))
                        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                    setLocations(locs);
                }
            } catch (error) {
                console.error("Failed to load menu data", error);
            }
        };
        fetchData();

        // Auto-open modal if openModal=true or profile=ID is in URL
        const openModal = searchParams.get('openModal');
        const openUsersProfile = searchParams.get('openUsersProfile');
        const openMessageModal = searchParams.get('openMessageModal');
        const profileId = searchParams.get('profile');
        const openPromoteTab = searchParams.get('openPromoteTab');
        const token = Cookies.get('token');

        if (openPromoteTab === 'true' && token) {
            setAccountModalInitialTab('Post');
            setIsAccountModalOpen(true);
            const params = new URLSearchParams(window.location.search);
            params.delete('openPromoteTab');
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }

        if (openMessageModal === 'true' && token) {
            setIsMessageModalOpen(true);
            const params = new URLSearchParams(window.location.search);
            params.delete('openMessageModal');
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }

        if (openUsersProfile === 'true' && token) {
            setAccountModalInitialTab('Profile');
            setIsAccountModalOpen(true);
            const params = new URLSearchParams(window.location.search);
            params.delete('openUsersProfile');
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }

        if (openModal === 'true' && token) {
            setIsPostAdModalOpen(true);
            const params = new URLSearchParams(window.location.search);
            params.delete('openModal');
            router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }

        if (profileId) {
            setViewingUserId(profileId);
            setIsAccountModalOpen(true);
        }

        // Handle direct /dashboard/post-ad route
        if (pathname === '/dashboard/post-ad') {
            const token = Cookies.get('token');
            if (!token) {
                setMobileEntryReason('post_ad');
                setIsMobileEntryModalOpen(true);
            } else {
                setTempMobile("");
                setIsPostAdModalOpen(true);
            }
        }
    }, [searchParams, pathname]);

    // Apply Site Settings (Favicon, etc)
    useEffect(() => {
        if (settings.favIcon) {
            const faviconUrl = getImageUrl(settings.favIcon);

            // Standard favicon
            let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = faviconUrl;

            // Apple Touch Icon
            let appleIcon: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
            if (!appleIcon) {
                appleIcon = document.createElement('link');
                appleIcon.rel = 'apple-touch-icon';
                document.getElementsByTagName('head')[0].appendChild(appleIcon);
            }
            appleIcon.href = faviconUrl;

            // Shortcut icon
            let shortcutIcon: HTMLLinkElement | null = document.querySelector("link[rel='shortcut icon']");
            if (!shortcutIcon) {
                shortcutIcon = document.createElement('link');
                shortcutIcon.rel = 'shortcut icon';
                document.getElementsByTagName('head')[0].appendChild(shortcutIcon);
            }
            shortcutIcon.href = faviconUrl;
        }
    }, [settings.favIcon]);

    // Handle Search Suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length >= 2) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/ads/public/all?search=${encodeURIComponent(searchQuery)}&limit=5`);
                    const data = await res.json();
                    console.log("Search suggestions API response:", data);
                    if (data.success) {
                        setSuggestions(data.data);
                        setShowSuggestions(true);
                    }
                } catch (err) {
                    console.error("Suggestion fetch error:", err);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 50);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSearchExecution = () => {
        window.dispatchEvent(new CustomEvent('show-search-results', { detail: { query: searchQuery } }));
        setShowSuggestions(false);
        setIsMobileSearchOpen(false);
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        setUser(null);
        setUnreadCount(0);
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        sessionStorage.removeItem('ad_session_views');
        sessionStorage.removeItem('ad_session_view_tokens');
        window.dispatchEvent(new Event('auth-change'));
        toast.success("Logged out successfully");
        window.location.href = '/dashboard';
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'bn' : 'en');
    };

    const toggleCategory = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    const toggleLocation = (id: string) => {
        setExpandedLocation(expandedLocation === id ? null : id);
    };

    const handleAddAdClick = () => {
        const token = Cookies.get('token');
        if (!token) {
            setMobileEntryReason('post_ad');
            setIsMobileEntryModalOpen(true);
        } else {
            setTempMobile(""); // Clear previous temp mobile if user is logged in
            setIsPostAdModalOpen(true);
        }
    };

    const handleAccountClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const token = Cookies.get('token');
        if (!token) {
            setMobileEntryReason('account');
            setIsMobileEntryModalOpen(true);
        } else {
            setIsAccountModalOpen(true);
        }
    };

    const handleMessageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const token = Cookies.get('token');
        if (!token) {
            setMobileEntryReason('message');
            setIsMobileEntryModalOpen(true);
        } else {
            setIsMessageModalOpen(true);
            fetchUnreadCount();
        }
    };

    const handlePromoteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const token = Cookies.get('token');
        if (!token) {
            // toast.error(language === 'bn' ? 'প্রথমে লগইন করুন তারপর প্রোমোট ট্যাব খুলুন' : "Please login first then go to promote tab");
            setMobileEntryReason('promote');
            setIsMobileEntryModalOpen(true);
        } else {
            setAccountModalInitialTab('Post');
            setIsAccountModalOpen(true);
        }
    };

    const [headerOffset, setHeaderOffset] = useState(0);
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollTop, setLastScrollTop] = useState(0);

    useEffect(() => {
        const handleCenterScroll = (e: any) => {
            setHeaderOffset(e.detail?.offset || 0);
        };
        window.addEventListener('center-scroll', handleCenterScroll as EventListener);
        return () => window.removeEventListener('center-scroll', handleCenterScroll as EventListener);
    }, []);

    return (
        <div className="h-screen bg-[#F1F5F9] font-sans overflow-hidden flex flex-col relative">
            <AdPopup />
            <nav className={cn(
                "md:hidden fixed bottom-0 inset-x-0 z-[60] h-[65px] transition-transform duration-300",
                !isNavbarVisible && "translate-y-[115%]"
            )}>
                {/* Background bar with rounded top corners and shadow */}
                <div className="absolute inset-0 bg-white rounded-t-[20px] shadow-[0_-8px_15px_-5px_rgba(0,0,0,0.15)] border-t border-slate-200" />

                <div className="relative h-full flex items-center justify-around px-2 z-10">
                    {/* Home */}
                    <Link href="/dashboard" className="flex flex-col items-center justify-center min-w-[60px] h-full pt-1">
                        <RiHome5Line className="w-7 h-7 text-black" />
                        <span className="text-[10px] text-black leading-none mb-0 mt-1">{t('home')}</span>
                    </Link>

                    {/* Search */}
                    <button
                        onClick={() => setIsSearchModalOpen(true)}
                        className={cn(
                            "flex flex-col items-center justify-center min-w-[60px] h-full pt-1 transition-colors",
                            isSearchModalOpen ? "text-[#0088cc]" : "text-black"
                        )}
                    >
                        <RiSearchLine className="w-7 h-7" />
                        <span className="text-[10px] leading-none mb-0 mt-1">{t('search_nav')}</span>
                    </button>

                    {/* Centered Floating Post Ad Button */}
                    <div className="relative h-full flex flex-col items-center justify-end">
                        <button
                            onClick={handleAddAdClick}
                            className="absolute -top-2 w-14 h-14 bg-[#0088cc] rounded-full flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform"
                        >
                            <RiAddLine className="w-9 h-9" />
                        </button>
                        {/* Placeholder to maintain spacing and text if needed, or just gap */}
                        <div className="w-14 flex flex-col items-center">
                            <span className="text-[10px] text-transparent leading-none mb-0 mt-1">.</span>
                        </div>
                    </div>

                    {/* Inbox */}
                    <Link
                        href="/dashboard/inbox"
                        onClick={handleMessageClick}
                        className="flex flex-col items-center justify-center min-w-[60px] h-full pt-1 text-black relative"
                    >
                        <div className="relative">
                            <RiMailLine className="w-7 h-7" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-black leading-none mb-0 mt-1">{t('inbox')}</span>
                    </Link>

                    {/* Account */}
                    <Link
                        href="/dashboard/profile"
                        onClick={handleAccountClick}
                        className="flex flex-col items-center justify-center min-w-[60px] h-full pt-1 text-black transition-all"
                    >
                        <div className="w-7 h-7 rounded-full bg-[#EDF2F7] flex items-center justify-center overflow-hidden border border-[#0088cc]">
                            {user && user.photo ? (
                                <img
                                    src={getImageUrl(user.photo)}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <RiUser3Line className="w-6 h-6" />
                            )}
                        </div>
                        <span className="text-[10px] text-black leading-none mb-0 mt-1">{t('account')}</span>
                    </Link>
                </div>
            </nav>

            {/* Main Content Area - Full width scroller to show scrollbar on the far right edge of the screen */}
            <main
                id="main-dashboard-scroller"
                className="flex-1 w-full overflow-y-auto overflow-x-hidden"
                onScroll={(e) => {
                    const scrollTop = e.currentTarget.scrollTop;
                    const clamped = Math.min(scrollTop, 64);
                    setHeaderOffset(clamped);
                    window.dispatchEvent(new CustomEvent('center-scroll', { detail: { offset: clamped } }));

                    // Mobile Navbar hide/show logic
                    if (scrollTop > lastScrollTop && scrollTop > 100) {
                        if (isNavbarVisible) {
                            setIsNavbarVisible(false);
                            window.dispatchEvent(new CustomEvent('nav-visibility', { detail: { visible: false } }));
                        }
                    } else if (scrollTop < lastScrollTop) {
                        if (!isNavbarVisible) {
                            setIsNavbarVisible(true);
                            window.dispatchEvent(new CustomEvent('nav-visibility', { detail: { visible: true } }));
                        }
                    }
                    setLastScrollTop(scrollTop);
                }}
            >
                {/* Pos 1: Website Top - Inside scroller so it scrolls up */}
                <AdDisplay positionId={1} className="bg-white border-b border-slate-100" />

                {/* Header Wrapper */}
                <div className={cn(
                    "z-50 sticky top-0 transition-transform duration-300",
                    !isNavbarVisible && "-translate-y-full"
                )}>
                    {/* Top Navigation Bar */}
                    <header className="bg-white border-b border-slate-200 h-16 w-full">
                        <div className="max-w-[1320px] mx-auto px-4 h-full flex items-center justify-between md:justify-center">
                            {/* Section 1: 300px (Logo & Ad Count) */}
                            <div className={cn("md:w-[300px] flex-none flex items-center gap-2", isMobileSearchOpen && "hidden md:flex")}>
                                {/* Mobile Menu Button - Hidden as requested */}
                                <button
                                    className="hidden p-2 -ml-2 text-black hover:bg-slate-100 rounded-full transition-colors"
                                    onClick={() => setIsMobileMenuOpen(true)}
                                >
                                    <Menu className="w-6 h-6" />
                                </button>

                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 shrink-0"
                                    onClick={() => {
                                        window.dispatchEvent(new Event('reset-saved-search'));
                                        window.dispatchEvent(new Event('refresh-ads'));
                                    }}
                                >
                                    {settings.siteLogo ? (
                                        <div className="h-10 w-auto">
                                            <img
                                                src={getImageUrl(settings.siteLogo)}
                                                alt="Logo"
                                                className="h-full w-auto object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-3xl font-bold text-[#1A202C] tracking-tighter uppercase whitespace-nowrap">shadamon</span>
                                    )}
                                </Link>
                            </div>

                            {/* Gap 1: 50px */}
                            <div className="w-[50px] flex-none hidden md:block"></div>

                            {/* Section 2: 565px (Search & Icons) */}
                            <div className={cn("md:w-[565px] flex-1 md:flex-none flex items-center gap-2 md:gap-4 relative", !isMobileSearchOpen ? "flex justify-end md:justify-center" : "flex")} ref={searchRef}>
                                <div className={cn("flex-1 flex bg-[#EDF2F7] rounded relative", !isMobileSearchOpen && "hidden md:flex")}>
                                    <div className="flex-1 relative flex items-center">
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder={language === 'bn' ? 'অনুসন্ধান করুন' : 'Search'}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchExecution()}
                                            onFocus={() => {
                                                if (searchQuery.trim().length >= 2 && suggestions.length > 0) setShowSuggestions(true);
                                            }}
                                            className="flex-1 bg-transparent px-4 py-2 pr-10 outline-none text-sm text-black placeholder-slate-400"
                                        />

                                        {searchQuery && (
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setShowSuggestions(false);
                                                }}
                                                className="absolute right-2 p-1 text-slate-400 hover:text-black transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}

                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-[#EDF2F7] border border-brand-500/20 shadow-2xl z-[100] mt-1 overflow-hidden divide-y divide-slate-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                                                {suggestions.map((ad) => (
                                                    <div
                                                        key={ad._id}
                                                        className="p-3 hover:bg-slate-200 cursor-pointer flex items-center justify-between group transition-colors"
                                                        onClick={async () => {
                                                            setShowSuggestions(false);
                                                            try {
                                                                const res = await fetch(`${API_BASE_URL}/api/ads/public/${ad._id}`);
                                                                const data = await res.json();
                                                                if (data.success) {
                                                                    const fullAd = data.data;
                                                                    if (fullAd.promoteType === 'traffic' && fullAd.trafficLink) {
                                                                        const directLink = fullAd.trafficLink.startsWith('http') ? fullAd.trafficLink : `https://${fullAd.trafficLink}`;
                                                                        window.open(directLink, '_blank');
                                                                    }
                                                                    setSelectedAdForDetail(fullAd);
                                                                    return;
                                                                }
                                                            } catch (err) {
                                                                console.error("Error fetching ad from search:", err);
                                                            }
                                                            setSelectedAdForDetail(ad);
                                                        }}
                                                    >
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <h4 className="text-sm font-medium text-black truncate group-hover:text-[#0088cc]">{ad.headline}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{ad.user?.name || ad.user?.storeName}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                <span className="text-[10px] text-[#0088cc] font-medium">{ad.category}</span>
                                                            </div>
                                                        </div>
                                                        {ad.images && ad.images[0] && (
                                                            <div className="w-12 h-12 rounded bg-white overflow-hidden shrink-0 border border-slate-200">
                                                                <img
                                                                    src={getImageUrl(ad.images[0])}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleSearchExecution}
                                        className="bg-[#1A202C] text-white px-6 py-2 text-xs hover:bg-slate-800 transition-colors tracking-wider rounded-r"
                                    >
                                        {language === 'bn' ? 'অনুসন্ধান' : 'Search'}
                                    </button>
                                </div>

                                {/* Language & Action Icons */}
                                <div className={cn("flex items-center gap-3 shrink-0", isMobileSearchOpen && "hidden md:flex")}>
                                    <button
                                        onClick={toggleLanguage}
                                        className="w-10 h-10 bg-[#EDF2F7] rounded-full flex items-center justify-center text-[14px] text-black uppercase"
                                    >
                                        {language}
                                    </button>
                                    <button
                                        onClick={handleMessageClick}
                                        className="w-10 h-10 bg-[#EDF2F7] rounded-full hidden md:flex items-center justify-center text-[#1A202C] hover:bg-slate-200 transition-all relative"
                                    >
                                        <RiMailFill className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0088cc] text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Promote Button (Mobile Only) */}
                                    <button
                                        onClick={handlePromoteClick}
                                        className="w-10 h-10 bg-[#EDF2F7] rounded-full flex md:hidden items-center justify-center text-[#1A202C] hover:bg-slate-200 transition-all relative"
                                    >
                                        <Megaphone className="w-5 h-5" />
                                    </button>

                                    <Link
                                        href="/dashboard/profile"
                                        onClick={handleAccountClick}
                                        className={cn(
                                            "w-10 h-10 bg-[#EDF2F7] rounded-full hidden md:flex items-center justify-center text-[#1A202C] hover:bg-slate-200 transition-all overflow-hidden",
                                            user?.photo && "border-2 border-[#0088cc]"
                                        )}
                                    >
                                        {user && user.photo ? (
                                            <img
                                                src={getImageUrl(user.photo)}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <RiUser3Fill className="w-5 h-5" />
                                        )}
                                    </Link>
                                </div>
                            </div>

                            <div className="w-[50px] flex-none hidden md:block"></div>

                            <div className="w-[230px] flex-none hidden md:block">
                                <Link
                                    href="/dashboard/post-ad"
                                    className="w-full bg-[#EDF2F7] border border-slate-400 shadow-sm text-black py-1.5 rounded text-sm uppercase tracking-widest flex items-center justify-center"
                                >
                                    {language === 'bn' ? 'ফ্রি বিজ্ঞাপন দিন' : 'Post Free'}
                                </Link>
                            </div>
                            <div className="w-[70px] flex-none hidden lg:block"></div>
                        </div>
                    </header>
                </div>

                {/* Pos 2: Bottom of Header - Scrolls up before content */}
                <AdDisplay positionId={2} className="bg-white border-b border-slate-100" />

                <div className="max-w-[1320px] mx-auto px-0 lg:px-4 pt-0 lg:pt-4">
                    {children}
                </div>
            </main>

            {/* Mobile Sidebar (Drawer) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Sidebar Content */}
                    <div className="absolute inset-y-0 left-0 w-[80%] max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <span className="font-bold text-lg text-black">Menu</span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 -mr-2 text-black hover:bg-slate-200 rounded-full"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Categories */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-black font-bold border-b border-slate-100 pb-2">
                                    <Grid className="w-5 h-5 text-brand-600" />
                                    <h3>{t('category')}</h3>
                                </div>
                                <div className="space-y-1">
                                    {categories.map((cat) => (
                                        <div key={cat._id}>
                                            <button
                                                onClick={() => toggleCategory(cat._id)}
                                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-black transition-colors text-sm font-medium"
                                            >
                                                <span>{cat.name}</span>
                                                {cat.subcategories.length > 0 && (
                                                    expandedCategory === cat._id
                                                        ? <ChevronDown className="w-4 h-4 text-black" />
                                                        : <ChevronRight className="w-4 h-4 text-black" />
                                                )}
                                            </button>
                                            {expandedCategory === cat._id && cat.subcategories.length > 0 && (
                                                <div className="ml-4 pl-4 border-l border-slate-100 mt-1 space-y-1">
                                                    {cat.subcategories.map(sub => (
                                                        <button
                                                            key={sub._id}
                                                            className="flex items-center gap-2 w-full text-left py-1.5 text-xs text-black hover:text-brand-600"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        >
                                                            {sub.image && (
                                                                <img
                                                                    src={getImageUrl(sub.image)}
                                                                    className="w-4 h-4 object-cover rounded shrink-0"
                                                                    alt=""
                                                                />
                                                            )}
                                                            {sub.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Locations */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-black font-bold border-b border-slate-100 pb-2">
                                    <MapPin className="w-5 h-5 text-brand-600" />
                                    <h3>{t('location')}</h3>
                                </div>
                                <div className="space-y-1">
                                    {locations.map((loc) => (
                                        <div key={loc._id}>
                                            <button
                                                onClick={() => toggleLocation(loc._id)}
                                                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-black transition-colors text-sm font-medium"
                                            >
                                                <span>{loc.name}</span>
                                                {loc.subLocations.length > 0 && (
                                                    expandedLocation === loc._id
                                                        ? <ChevronDown className="w-4 h-4 text-black" />
                                                        : <ChevronRight className="w-4 h-4 text-black" />
                                                )}
                                            </button>
                                            {expandedLocation === loc._id && loc.subLocations.length > 0 && (
                                                <div className="ml-4 pl-4 border-l border-slate-100 mt-1 space-y-1">
                                                    {loc.subLocations.map(sub => (
                                                        <button
                                                            key={sub._id}
                                                            className="flex items-center gap-2 w-full text-left py-1.5 text-xs text-black hover:text-brand-600"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        >
                                                            {sub.image && (
                                                                <img
                                                                    src={getImageUrl(sub.image)}
                                                                    className="w-4 h-4 object-cover rounded shrink-0"
                                                                    alt=""
                                                                />
                                                            )}
                                                            {sub.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer (Logout) */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-2.5 bg-white border border-slate-200 text-black rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all font-bold text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>{t('logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <PostAdModal
                isOpen={isPostAdModalOpen}
                onClose={() => {
                    setIsPostAdModalOpen(false);
                    setAdToEdit(null);
                    if (pathname === '/dashboard/post-ad') {
                        router.push('/dashboard');
                    }
                }}
                editAd={adToEdit}
                initialMobile={tempMobile} // Pass temp mobile
                onSuccess={(newAd) => {
                    setIsPostAdModalOpen(false);
                    // Dispatch custom event to tell Dashboard to refetch
                    window.dispatchEvent(new Event('refresh-ads'));

                    // Open Account Activity Modal and go to Post tab
                    setAccountModalInitialTab('Post');
                    setIsAccountModalOpen(true);

                    if (pathname === '/dashboard/post-ad') {
                        router.replace('/dashboard');
                    }
                }}
            />

            <PromoteModal
                isOpen={isPromoteModalOpen}
                onClose={() => {
                    setIsPromoteModalOpen(false);
                    setAdToPromote(null);
                }}
                ad={adToPromote}
            />

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSwitchToRegister={() => {
                    setIsLoginModalOpen(false);
                    setIsRegisterModalOpen(true);
                }}
                initialMobile={initialMobile}
                onSuccess={() => {
                    if (mobileEntryReason === 'report') {
                        setIsLoginModalOpen(false);
                        setSelectedAdForDetail(reportAd);
                        setShouldOpenReportAfterLogin(true);
                        window.dispatchEvent(new Event('auth-change'));
                        return;
                    }
                    // Navigate to profile or message after login by reloading with param
                    const url = new URL(window.location.href);
                    if (mobileEntryReason === 'message') {
                        url.searchParams.set('openMessageModal', 'true');
                    } else {
                        url.searchParams.set('openUsersProfile', 'true');
                    }
                    window.location.href = url.toString();

                }}

            />

            <RegisterModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSwitchToLogin={() => {
                    setIsRegisterModalOpen(false);
                    setIsLoginModalOpen(true);
                }}
                initialMobile={initialMobile}
                onSuccess={(needsVerification = true, token) => {
                    setIsRegisterModalOpen(false);
                    if (needsVerification && token) {
                        setVerificationToken(token);
                        setIsVerificationModalOpen(true);
                    } else {
                        if (mobileEntryReason === 'report') {
                            setSelectedAdForDetail(reportAd);
                            setShouldOpenReportAfterLogin(true);
                            window.dispatchEvent(new Event('auth-change'));
                            return;
                        }
                        // Direct to profile or message
                        const url = new URL(window.location.href);
                        if (mobileEntryReason === 'message') {
                            url.searchParams.set('openMessageModal', 'true');
                        } else {
                            url.searchParams.set('openUsersProfile', 'true');
                        }
                        window.location.href = url.toString();

                    }
                }}

            />

            <MobileEntryModal
                isOpen={isMobileEntryModalOpen}
                onClose={() => {
                    setIsMobileEntryModalOpen(false);
                    if (pathname === '/dashboard/post-ad') {
                        router.push('/dashboard');
                    }
                }}
                onUserExists={(mobile) => {
                    setTempMobile(mobile);
                    setIsMobileEntryModalOpen(false);
                    if (mobileEntryReason === 'post_ad') {
                        setIsPostAdModalOpen(true);
                    } else {
                        setInitialMobile(mobile);
                        setIsLoginModalOpen(true);
                    }

                }}
                onUserNew={(mobile) => {
                    setTempMobile(mobile);
                    setIsMobileEntryModalOpen(false);
                    if (mobileEntryReason === 'post_ad') {
                        setIsPostAdModalOpen(true);
                    } else {
                        setInitialMobile(mobile);
                        setIsRegisterModalOpen(true);
                    }

                }}

            />

            <VerificationModal
                isOpen={isVerificationModalOpen}
                onClose={() => {
                    setIsVerificationModalOpen(false);
                    setVerificationToken(undefined);
                }}
                verificationToken={verificationToken}
                onSuccess={() => {
                    setIsVerificationModalOpen(false);
                    if (mobileEntryReason === 'report') {
                        setSelectedAdForDetail(reportAd);
                        setShouldOpenReportAfterLogin(true);
                        window.dispatchEvent(new Event('auth-change'));
                        return;
                    }
                    // Reload to refresh auth state and open profile or message
                    const url = new URL(window.location.href);
                    if (mobileEntryReason === 'message') {
                        url.searchParams.set('openMessageModal', 'true');
                    } else {
                        url.searchParams.set('openUsersProfile', 'true');
                    }
                    window.location.href = url.toString();

                }}

            />
            <AccountActivityModal
                isOpen={isAccountModalOpen}
                initialTab={accountModalInitialTab}
                onClose={() => {
                    setIsAccountModalOpen(false);
                    setAccountModalInitialTab('Page'); // Reset to default
                    setViewingUserId(undefined);
                    const params = new URLSearchParams(window.location.search);
                    params.delete('profile');
                    router.replace(`/dashboard${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
                }}
                userId={viewingUserId}
                onOpenPostAd={() => {
                    setIsAccountModalOpen(false);
                    setIsPostAdModalOpen(true);
                }}
                onEditAd={(ad) => {
                    setIsAccountModalOpen(false);
                    setAdToEdit(ad);
                    setIsPostAdModalOpen(true);
                }}
            />

            <AdDetailsModal
                isOpen={!!selectedAdForDetail}
                ad={selectedAdForDetail}
                onClose={() => {
                    setSelectedAdForDetail(null);
                    setShouldOpenReportAfterLogin(false);
                }}
                initialReportOpen={shouldOpenReportAfterLogin}
            />


            <MessageModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                onOpenChat={(ad, otherUser) => {
                    setIsMessageModalOpen(false);
                    setChatAd(ad);
                    setChatOtherUser(otherUser);
                    setIsChatMessageModalOpen(true);
                }}
            />

            <ChatMessageModal
                isOpen={isChatMessageModalOpen}
                onClose={() => {
                    setIsChatMessageModalOpen(false);
                    fetchUnreadCount();
                }}
                onBack={() => {
                    setIsChatMessageModalOpen(false);
                    setIsMessageModalOpen(true);
                }}
                ad={chatAd}
                otherUser={chatOtherUser}
            />

            <InfoModal
                isOpen={infoModal.isOpen}
                onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
                title={infoModal.title}
                content={infoModal.content}
            />

            <SearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSearch={(query) => {
                    window.dispatchEvent(new CustomEvent('show-search-results', { detail: { query } }));
                }}
                onSelectAd={(ad) => {
                    setSelectedAdForDetail(ad);
                }}
            />


        </div>
    );
}
