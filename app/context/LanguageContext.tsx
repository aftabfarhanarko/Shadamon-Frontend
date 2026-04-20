"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';

type Language = 'bn' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
    'hero_title': {
        bn: 'শাদামন একটি মার্কেটিং প্ল্যাটফর্ম',
        en: 'Shadamon a marketing platform'
    },
    'get_started': {
        bn: 'শুরু করুন',
        en: 'Get Started'
    },
    'welcome_back': {
        bn: 'স্বাগতম',
        en: 'Welcome Back'
    },
    'login_subtitle': {
        bn: 'আপনার একাউন্টে লগইন করুন',
        en: 'Login to your account'
    },
    'email': {
        bn: 'ইমেইল',
        en: 'Email'
    },
    'password': {
        bn: 'পাসওয়ার্ড',
        en: 'Password'
    },
    'email_or_mobile': {
        bn: 'ইমেইল অথবা মোবাইল',
        en: 'Email or Mobile Number'
    },
    'login_button': {
        bn: 'লগইন',
        en: 'Login'
    },
    'register_title': {
        bn: 'নতুন একাউন্ট তৈরি করুন',
        en: 'Create an Account'
    },
    'name': {
        bn: 'নাম',
        en: 'Name'
    },
    'date_of_birth': {
        bn: 'জন্ম তারিখ',
        en: 'Date of Birth'
    },
    'gender': {
        bn: 'লিঙ্গ',
        en: 'Gender'
    },
    'male': {
        bn: 'পুরুষ',
        en: 'Male'
    },
    'female': {
        bn: 'মহিলা',
        en: 'Female'
    },
    'other': {
        bn: 'অন্যান্য',
        en: 'Other'
    },
    'mobile_number': {
        bn: 'মোবাইল নম্বর',
        en: 'Mobile Number'
    },
    'mobile_help_text': {
        bn: '১১ ডিজিট দিন (+৮৮ যোগ করবেন না)',
        en: 'Enter 11 digits (Don\'t add +88)'
    },
    'mobile': {
        bn: 'মোবাইল',
        en: 'Mobile'
    },
    'store_name': {
        bn: 'দোকানের নাম',
        en: 'Store Name'
    },
    'action_button_type': {
        bn: 'বাটন টাইপ',
        en: 'Action Button Type'
    },
    'call_now': {
        bn: 'কল',
        en: 'Call'
    },
    'chat_now': {
        bn: 'চ্যাট',
        en: 'Chat'
    },
    'personal_info': {
        bn: 'ব্যক্তিগত তথ্য',
        en: 'Personal Info'
    },
    'merchant_info': {
        bn: 'মার্চেন্ট তথ্য',
        en: 'Merchant Info'
    },
    'register_button': {
        bn: 'নিবন্ধন',
        en: 'Register'
    },
    'already_have_account': {
        bn: 'ইতিমধ্যে একাউন্ট আছে?',
        en: 'Already have an account?'
    },
    'dont_have_account': {
        bn: 'একাউন্ট নেই?',
        en: "Don't have an account?"
    },
    'dashboard': {
        bn: 'ড্যাশবোর্ড',
        en: 'Dashboard'
    },
    'my_profile': {
        bn: 'আমার প্রোফাইল',
        en: 'My Profile'
    },
    'logout': {
        bn: 'লগআউট',
        en: 'Logout'
    },
    'settings': {
        bn: 'সেটিংস',
        en: 'Settings'
    },
    'change_language': {
        bn: 'ভাষা পরিবর্তন করুন',
        en: 'Change Language'
    },
    'continue_with_google': {
        bn: 'গুগল দিয়ে চালিয়ে যান',
        en: 'Continue with Google'
    },
    'continue_with_facebook': {
        bn: 'ফেসবুক দিয়ে চালিয়ে যান',
        en: 'Continue with Facebook'
    },
    'or': {
        bn: 'অথবা',
        en: 'Or'
    },
    'forgot_password': {
        bn: 'পাসওয়ার্ড ভুলে গেছেন?',
        en: 'Forgot Password?'
    },
    'remember_me': {
        bn: 'আমাকে মনে রাখুন',
        en: 'Remember me'
    },
    // Left side marketing text translations
    'marketing_title': {
        bn: 'আপনার ব্যবসা বৃদ্ধি করুন আত্মবিশ্বাসের সাথে',
        en: 'Grow your business with confidence.'
    },
    'marketing_subtitle': {
        bn: 'আমাদের প্রিমিয়াম মার্কেটিং টুলস ব্যবহার করে আপনার ব্যবসার প্রসার ঘটান।',
        en: 'Access premium marketing tools, automate your workflow, and reach more customers than ever before.'
    },
    'verified_merchants': {
        bn: 'যাচাইকৃত মার্চেন্ট',
        en: 'Verified Merchants'
    },
    'join_verified': {
        bn: '১০,০০০+ মার্চেন্টদের সাথে যোগ দিন',
        en: 'Join 10,000+ verified businesses'
    },
    // Mobile Nav
    'home': {
        bn: 'হোম',
        en: 'Home'
    },
    'search_nav': {
        bn: 'সার্চ',
        en: 'Search'
    },
    'inbox': {
        bn: 'ইনবক্স',
        en: 'Inbox'
    },
    'account': {
        bn: 'প্রোফাইল',
        en: 'Profile'
    },
    'edit_details': {
        bn: 'তথ্য পরিবর্তন',
        en: 'Edit Details'
    },
    'edit_profile_details': {
        bn: 'প্রোফাইল তথ্য পরিবর্তন',
        en: 'Edit Profile Details'
    },
    'store_identity': {
        bn: 'দোকানের পরিচিতি',
        en: 'Store Identity'
    },
    'store_banner': {
        bn: 'দোকানের ব্যানার',
        en: 'Store Banner'
    },
    'store_logo': {
        bn: 'দোকানের লোগো',
        en: 'Store Logo'
    },
    'upload_photo': {
        bn: 'ছবি আপলোড',
        en: 'Upload Photo'
    },
    'owner_photo': {
        bn: 'মালিকের ছবি',
        en: 'Owner Photo'
    },
    'store_link': {
        bn: 'দোকানের লিংক',
        en: 'Store Link'
    },
    'personal_identity': {
        bn: 'ব্যক্তিগত পরিচিতি',
        en: 'Personal Identity'
    },
    'no_link': {
        bn: 'লিংক নেই',
        en: 'No Link'
    },
    'no_category': {
        bn: 'ক্যাটাগরি নেই',
        en: 'No Category'
    },
    'account_status': {
        bn: 'একাউন্ট স্ট্যাটাস',
        en: 'Account Status'
    },
    'verified_by': {
        bn: 'যাচাই মাধ্যম',
        en: 'Verified By'
    },
    'not_verified': {
        bn: 'যাচাই করা হয়নি',
        en: 'Not Verified'
    },
    'merchant_type': {
        bn: 'মার্চেন্ট টাইপ',
        en: 'Merchant Type'
    },
    'action_button': {
        bn: 'অ্যাকশন বাটন',
        en: 'Action Button'
    },
    'review': {
        bn: 'রিভিউ',
        en: 'Review'
    },
    'active': {
        bn: 'সক্রিয়',
        en: 'Active'
    },
    'edit': {
        bn: 'সম্পাদনা',
        en: 'Edit'
    },
    'free': {
        bn: 'ফ্রি',
        en: 'Free'
    },
    'premium': {
        bn: 'প্রিমিয়াম',
        en: 'Premium'
    },
    'pending': {
        bn: 'অপেক্ষমান',
        en: 'Pending'
    },
    'rejected': {
        bn: 'বাতিল',
        en: 'Rejected'
    },
    'in_review': {
        bn: 'পর্যালোচনাধীন',
        en: 'In Review'
    },
    'category': {
        bn: 'ক্যাটাগরি',
        en: 'Category'
    },
    'page_link': {
        bn: 'পেইজ লিংক',
        en: 'Page Link'
    },
    'page_link_modal': {
        bn: 'পেইজ লিংক (পেইজের নাম)',
        en: 'Page Link (Page Name)'
    },
    'select_gender': {
        bn: 'লিঙ্গ নির্বাচন করুন',
        en: 'Select Gender'
    },
    'cancel': {
        bn: 'বন্ধ করুন',
        en: 'Cancel'
    },
    'save_changes': {
        bn: 'সংরক্ষণ করুন',
        en: 'Save Changes'
    },
    'store_info': {
        bn: 'দোকানের তথ্য',
        en: 'Store Information'
    },
    'full_name': {
        bn: 'পুরো নাম',
        en: 'Full Name'
    },
    // Post Ad Modal Translations
    'post_ad_title': { bn: 'বিজ্ঞাপন দিন', en: 'Post an Ad' },
    'free_post': { bn: 'ফ্রি পোস্ট', en: 'Free Post' },
    'photos': { bn: 'ছবি', en: 'Photos' },
    'max_5': { bn: 'সর্বোচ্চ ৫টি', en: 'Max 5' },
    'add_photo': { bn: 'ছবি যোগ করুন', en: 'Add Photo' },
    'headline': { bn: 'শিরোনাম', en: 'Headline' },
    'headline_placeholder': { bn: 'শিরোনাম', en: 'Headline' },
    'description': { bn: 'বিবরণ', en: 'Description' },
    'description_placeholder': { bn: 'বিস্তারিত বিবরণ', en: 'Description' },
    'select_category': { bn: 'ক্যাটাগরি নির্বাচন করুন', en: 'Select a category' },
    'location': { bn: 'অবস্থান', en: 'Location' },
    'select_location_error': { bn: 'অন্তত একটি অবস্থান নির্বাচন করুন', en: 'Please select at least one location.' },
    'show_phone': { bn: 'ফোন নম্বর দেখান', en: 'Show Phone Number' },
    'hide_phone': { bn: 'ফোন নম্বর লুকান (শুধুমাত্র চ্যাট)', en: 'Hide Phone (Chat Only)' },
    'external_url': { bn: 'এক্সটার্নাল লিংক', en: 'External URL' },
    'optional': { bn: 'ঐচ্ছিক', en: 'Optional' },
    'action_type': { bn: 'অ্যাকশন টাইপ', en: 'Action Type' },
    'detail_view': { bn: 'বিস্তারিত দেখুন', en: 'Detail View' },
    'direct_click': { bn: 'সরাসরি ক্লিক', en: 'Direct Click' },
    'rules_agreement_text': { bn: 'আমি পোস্টিং নিয়ম এবং শর্তাবলী পড়েছি এবং সম্মত আছি।', en: 'I have read and agree to the posting rules and regulations.' },
    'post_ad_btn': { bn: 'বিজ্ঞাপন পোস্ট করুন', en: 'Post Ad Now' },
    'verify_and_post': { bn: 'যাচাই করুন এবং পোস্ট করুন', en: 'Verify Now and Post' },
    'all_bangladesh': { bn: 'সারা বাংলাদেশ', en: 'All Bangladesh' },
    'contact_details': { bn: 'যোগাযোগের তথ্য', en: 'Contact Details' },
    // Categories
    'cat_electronics': { bn: 'ইলেকট্রনিক্স', en: 'Electronics' },
    'cat_mobiles': { bn: 'মোবাইল', en: 'Mobiles' },
    'cat_vehicles': { bn: 'যানবাহন', en: 'Vehicles' },
    'cat_property': { bn: 'সম্পত্তি', en: 'Property' },
    'cat_home_living': { bn: 'ঘর ও জীবনযাপন', en: 'Home & Living' },
    'cat_pets': { bn: 'পোশাপ্রাণী', en: 'Pets & Animals' },
    'cat_mens_fashion': { bn: 'পুরুষদের ফ্যাশন', en: "Men's Fashion & Grooming" },
    'cat_womens_fashion': { bn: 'মহিলাদের ফ্যাশন', en: "Women's Fashion & Beauty" },
    'cat_hobbies': { bn: 'শখ, খেলাধুলা ও শিশু', en: 'Hobbies, Sports & Kids' },
    'cat_business': { bn: 'ব্যবসা ও শিল্প', en: 'Business & Industry' },
    'cat_education': { bn: 'শিক্ষা', en: 'Education' },
    // Locations
    'loc_dhaka': { bn: 'ঢাকা', en: 'Dhaka' },
    'loc_chittagong': { bn: 'চট্টগ্রাম', en: 'Chittagong' },
    'loc_sylhet': { bn: 'সিলেট', en: 'Sylhet' },
    'loc_khulna': { bn: 'খুলনা', en: 'Khulna' },
    'loc_rajshahi': { bn: 'রাজশাহী', en: 'Rajshahi' },
    'loc_rangpur': { bn: 'রংপুর', en: 'Rangpur' },
    'loc_barisal': { bn: 'বরিশাল', en: 'Barisal' },
    'loc_mymensingh': { bn: 'ময়মনসিংহ', en: 'Mymensingh' },
    // Dashboard & Ad Details
    'no_ads_yet': { bn: 'এখনো কোন বিজ্ঞাপন নেই', en: 'No Ads Yet' },
    'be_first_post': { bn: 'প্রথম বিজ্ঞাপনটি পোস্ট করুন!', en: 'Be the first to post something!' },
    'see_details': { bn: 'বিস্তারিত দেখুন', en: 'See Details' },
    'premium_merchants': { bn: 'প্রিমিয়াম মার্চেন্ট', en: 'Premium Merchants' },
    'view_all_merchants': { bn: 'সব মার্চেন্ট দেখুন', en: 'View All Merchants' },
    'loading_feed': { bn: 'লোড হচ্ছে...', en: 'Loading feed...' },
    'sponsored': { bn: 'স্পন্সরড', en: 'Sponsored' },
    'views_count': { bn: 'টি ভিউ', en: 'views' },
    'member_since': { bn: 'সদস্য হয়েছেন', en: 'Member since' },
    'ad_not_found': { bn: 'বিজ্ঞাপন পাওয়া যায়নি', en: 'Ad Not Found' },
    'go_back': { bn: 'ফিরে যান', en: 'Go Back' },
    'show_less': { bn: 'কম দেখুন', en: 'Show less' },
    'read_more': { bn: 'আরও পড়ুন', en: 'Read more' },
    'contact_seller': { bn: 'বিক্রেতার সাথে যোগাযোগ করুন', en: 'Contact Seller' },
    'no_contact_num': { bn: 'কোন যোগাযোগ নম্বর নেই', en: 'No contact number available' },
    'visit_link': { bn: 'লিংক ভিজিট করুন', en: 'Visit Link' },
    'view_profile': { bn: 'প্রোফাইল দেখুন', en: 'View Profile' },
    'whatsapp': { bn: 'হোয়াটসঅ্যাপ', en: 'WhatsApp' },
    'telegram': { bn: 'টেলিগ্রাম', en: 'Telegram' },
    'no_premium_merchants': { bn: 'কোন প্রিমিয়াম মার্চেন্ট নেই', en: 'No premium merchants yet.' },
    'posts': { bn: 'পোস্ট', en: 'Posts' },
    'personal_information': { bn: 'ব্যক্তিগত তথ্য', en: 'Personal Information' },
    'store_information': { bn: 'দোকানের তথ্য', en: 'Store Information' },
    'manage_ads': { bn: 'বিজ্ঞাপন পরিচালনা', en: 'Manage Ads' },
    'delete': { bn: 'মুছে ফেলুন', en: 'Delete' },
    'promote': { bn: 'Promote', en: 'Promote' },
    'promote_ad': { bn: 'বিজ্ঞাপন প্রচার করুন', en: 'Promote Ad' },
    'ad_preview': { bn: 'বিজ্ঞাপন প্রিভিউ', en: 'Ad Preview' },
    'estimated_reach': { bn: 'আনুমানিক রিচ', en: 'Estimated Reach' },
    'campaign_goal': { bn: 'ক্যাম্পেইনের লক্ষ্য', en: 'Campaign Goal' },
    'target_location': { bn: 'টার্গেট লোকেশন', en: 'Target Location' },
    'duration': { bn: 'সময়কাল', en: 'Duration' },
    'total_budget': { bn: 'মোট বাজেট', en: 'Total Budget' },
    'promote_now': { bn: 'এখনই প্রচার করুন', en: 'Promote Now' },
    'popular_seller': { bn: 'জনপ্রিয় বিক্রেতা', en: 'Popular Seller' },
    'visited': { bn: 'ভিজিট', en: 'visited' },
    'followers': { bn: 'ফলোয়ার', en: 'Followers' },
    'follower': { bn: 'ফলোয়ার', en: 'Follower' },
    'follow': { bn: 'ফলো', en: 'Follow' },
    'Follow': { bn: 'ফলো', en: 'Follow' },
    'Unfollow': { bn: 'আনফলো', en: 'Unfollow' },
    'all_categories': { bn: 'সকল ক্যাটাগরি', en: 'All Categories' },
    'sell': { bn: 'বিক্রয়', en: 'Sell' },
    'rent': { bn: 'ভাড়া', en: 'Rent' },
    'jobs': { bn: 'চাকরি', en: 'Jobs' },
    'filters': { bn: 'ফিল্টার', en: 'Filters' },
    'sort_by': { bn: 'সর্ট করুন', en: 'Sort results by' },
    'filter_by': { bn: 'ফিল্টার করুন', en: 'Filter ads by' },
    'all': { bn: 'সব', en: 'All' },
    'promoted': { bn: 'প্রচারিত', en: 'Promoted' },
    'about_us': { bn: 'About Us', en: 'About Us' },
    'terms_and_con': { bn: 'Term & Con', en: 'Term & Con.' },
    'privacy_policy': { bn: 'Privacy Policy', en: 'Privacy Policy' },
    'contact_us': { bn: 'Contact Us', en: 'Contact Us' },
    'get_our_app': { bn: 'অ্যাপ ডাউনলোড করুন', en: 'Get Our App' },
    'get_more': { bn: 'আরও দেখুন', en: 'Get More' },
    'newsportal': { bn: 'নিউজ পোর্টাল', en: 'Newsportal' },
    'social_platform': { bn: 'সোশ্যাল প্ল্যাটফর্ম', en: 'Social Platform' },
    'price_negotiable': { bn: 'আলোচনা সাপেক্ষে', en: 'Negotiable' },
    'price_fixed': { bn: 'ফিক্সড', en: 'Fixed' },
    'price_on_ask': { bn: 'জিজ্ঞাসা করুন', en: 'Price on ask' },
    'follow_us': { bn: 'ফলো করুন', en: 'Follow Us' },
    // Post Ad Modal Added Translations
    'pick_a_category': { bn: 'একটি ক্যাটাগরি বেছে নিন', en: 'Pick a Category' },
    'search_category': { bn: 'ক্যাটাগরি খুঁজুন', en: 'Search for a category' },
    'pick_a_location': { bn: 'একটি স্থান বেছে নিন', en: 'Pick a Location' },
    'search_location': { bn: 'স্থান খুঁজুন', en: 'Search for a location' },
    'select_area': { bn: 'এলাকা নির্বাচন করুন', en: 'Select Area' },
    'add_details': { bn: 'বিস্তারিত তথ্য যোগ করুন', en: 'Add Details' },
    'continue_btn': { bn: 'চালিয়ে যান', en: 'Continue' },
    'edit_your_ad': { bn: 'আপনার বিজ্ঞাপন সম্পাদনা করুন', en: 'Edit your AD' },
    'post_your_ad': { bn: 'আপনার বিজ্ঞাপন দিন', en: 'Post your AD' },
    'enter_the_otp': { bn: 'ওটিপি দিন', en: 'Enter the OTP' },
    'resend_otp': { bn: 'ওটিপি পুনরায় পাঠান', en: 'Resend OTP' },
    'enter_otp_sent_to': { bn: 'আপনার পাঠানো ওটিপি দিন', en: 'Enter the OTP sent to' },
    'edit_btn': { bn: 'পরিবর্তন করুন', en: 'Edit' },
    'verifying': { bn: 'যাচাই করা হচ্ছে...', en: 'VERIFYING...' },
    'verify_and_post_btn': { bn: 'যাচাই করুন এবং পোস্ট করুন', en: 'VERIFY & POST' },
    'add_photos_btn': { bn: 'গ্যালারি থেকে', en: 'From Gallery' },
    'drag_and_drop': { bn: 'ছবি যোগ করুন', en: 'Add Photos' },
    'add_cameras_btn': { bn: 'ক্যামেরা দিয়ে', en: 'By Camera' },
    // 'drag_and_drop': { bn: 'ছবি যোগ করুন', en: 'or drag and drop' },
    'description_help_text': { bn: '*একটি সুন্দর এবং বিস্তারিত বিবরণ আপনার পণ্যটি দ্রুত বিক্রি করতে সাহায্য করতে পারে', en: '*A nice & Detail Description Might Help your Product Sell Faster' },
    'change_btn': { bn: 'পরিবর্তন', en: 'Change' },
    'select_btn': { bn: 'নির্বাচন', en: 'Select' },
    'name_placeholder': { bn: 'নাম', en: 'Name' },
    'phone_number_placeholder': { bn: 'ফোন নম্বর', en: 'Phone Number' },
    'password_placeholder': { bn: 'পাসওয়ার্ড', en: 'Password' },
    'limit_reached_max_5': { bn: 'সীমা অতিক্রম করেছে (সর্বোচ্চ ৫)', en: 'Limit reached (Max 5)' },
    'add_another_number': { bn: 'আরেকটি নম্বর যোগ করুন', en: 'Add Another Number' },
    'hide_number_only_message': { bn: 'নম্বর লুকান, শুধুমাত্র মেসেজ', en: 'Hide Number, Only Message' },
    'updating': { bn: 'আপডেট করা হচ্ছে...', en: 'UPDATING...' },
    'posting': { bn: 'পোস্ট করা হচ্ছে...', en: 'POSTING...' },
    'edit_ad_btn': { bn: 'বিজ্ঞাপন আপডেট করুন', en: 'EDIT AD' },
    'post_ad_btn_1': { bn: 'বিজ্ঞাপন পোস্ট করুন', en: 'POST AD' },
    'i_have_read_accept': { bn: 'আমি পড়েছি এবং সম্মতি জ্ঞাপন করছি', en: 'I have read and accept the' },
    'help_chat': { bn: 'সাহায্য চ্যাট', en: 'HelpChat' },
    'ad_under_review': { bn: 'আপনার বিজ্ঞাপনটি রিভিউতে আছে', en: 'Your ad is under review' },
    'ad_under_review_desc': { bn: 'অ্যাডমিন আপনার বিজ্ঞাপনটি সফলভাবে চেক করলে এটি পাবলিশ হবে। বিজ্ঞাপন টি সরাসরি পাবলিশ করতে হলে ট্রাস্টেড মার্চেন্ট হতে পারেন। অথবা দ্রুত বিক্রয় করতে চাইলে বিজ্ঞাপনটি প্রমোট করতে পারেন।', en: 'Your ad will be published once the admin successfully checks it. To publish ads directly, you can become a Trusted Merchant. Or if you want to sell quickly, you can promote the ad.' },
    'promote_your_ad': { bn: 'আপনার অ্যাডটি প্রমোট করুন', en: 'Promote your ad' },
    'do_it_later': { bn: 'পরে করব', en: 'I will do it later' },
    'free_ad_limit_reached': { bn: 'ফ্রি অ্যাড লিমিট শেষ হবেছে!', en: 'Free ad limit reached!' },
    'free_ad_limit_reached_desc': { bn: 'ফ্রি পোস্ট লিমিট শেষ। এখনই পোস্টটি লাইভ করে, বেশি কাস্টমার পেতে প্রমোট করুন', en: 'Free post limit ended. Go live now and promote the post to get more customers.' },
    'go_back_btn': { bn: 'ফিরে যান', en: 'Go back' },
    'field_required': { bn: 'এই তথ্যটি প্রয়োজন', en: 'This field is required' },
    'processing': { bn: 'প্রসেসিং...', en: 'Processing...' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Default to Bangla ('bn') as requested
    const [language, setLanguageState] = useState<Language>('bn');

    useEffect(() => {
        const savedLang = Cookies.get('app_lang') as Language;
        if (savedLang && (savedLang === 'bn' || savedLang === 'en')) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        Cookies.set('app_lang', lang, { expires: 365 });
    };

    const t = (key: string) => {
        return translations[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
