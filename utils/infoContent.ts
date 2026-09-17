export type InfoPageType = 'about' | 'terms' | 'privacy' | 'contact' | 'safety' | 'return';
export type InfoLanguage = 'bn' | 'en';

export interface InfoContentItem {
    slug: string;
    title: string;
    content: string;
    titleBn: string;
    titleEn: string;
    contentBn: string;
    contentEn: string;
}

interface InfoContentInput {
    slug: string;
    titleBn: string;
    titleEn: string;
    contentBn: string;
    contentEn: string;
}

const makeInfoItem = (item: InfoContentInput): InfoContentItem => ({
    ...item,
    title: item.titleBn,
    content: item.contentBn
});

export const INFO_CONTENT: Record<InfoPageType, InfoContentItem> = {
    about: makeInfoItem({
        slug: 'about-us',
        titleBn: 'Shadamon.com সম্পর্কে',
        titleEn: 'About Shadamon.com',
        contentEn: `Shadamon Invest is a matchmaking platform in Bangladesh that connects entrepreneurs and investors with one another.

We believe there are numerous promising businesses in Bangladesh that need the right capital, and countless investors looking for the right opportunities. However, there was no easy and reliable medium to establish a connection between these two parties—Shadamon Invest was created to bridge that gap.

What We Do:

Entrepreneurs can post their funding requirements, and investors can post their investment criteria.

The platform helps both parties find each other and initiate communication (Invite, Chat, Call, Send Proposal).

We strive to create a reliable environment through mobile number OTP verification and optional document verification (NID, Trade License, etc.).

What We Do Not Do:

Shadamon Invest is not an investment bank, brokerage, financial advisor, or a licensed financial institution.

We do not verify or guarantee the authenticity of any business's financial data, project feasibility, or proposed returns—these details are the poster's own self-declarations.

We do not mediate any deals, investment contracts, or fund transfers; Shadamon Invest solely connects two parties. Contracts, due diligence, and decisions are entirely the users' own responsibility.

Before making any investment or fundraising decisions, please conduct your own due diligence and consult a licensed financial/legal advisor if necessary.`,
        contentBn: `Shadamon Invest বাংলাদেশে উদ্যোক্তা এবং বিনিয়োগকারীদের একে অপরের সাথে সংযুক্ত করার একটি ম্যাচমেকিং প্ল্যাটফর্ম।

আমরা বিশ্বাস করি বাংলাদেশে এমন অসংখ্য সম্ভাবনাময় ব্যবসা রয়েছে যেগুলোর সঠিক মূলধন প্রয়োজন, এবং অসংখ্য বিনিয়োগকারী রয়েছেন যারা সঠিক সুযোগ খুঁজছেন। তবে এই দুই পক্ষের মধ্যে সংযোগ স্থাপনের কোনো সহজ ও নির্ভরযোগ্য মাধ্যম ছিল না—সেই শূন্যতা পূরণের জন্যই Shadamon Invest তৈরি করা হয়েছে।

আমরা যা করি:

উদ্যোক্তারা তাদের অর্থায়নের প্রয়োজনীয়তা এবং বিনিয়োগকারীরা তাদের বিনিয়োগের মানদণ্ড পোস্ট করতে পারেন।

প্ল্যাটফর্মটি উভয় পক্ষকে একে অপরকে খুঁজে পেতে এবং যোগাযোগ শুরু করতে সহায়তা করে (ইনভাইট, চ্যাট, কল, প্রস্তাব পাঠানো)।

আমরা মোবাইল নম্বর OTP যাচাইকরণ এবং ঐচ্ছিক নথি যাচাইকরণের (NID, ট্রেড লাইসেন্স ইত্যাদি) মাধ্যমে একটি নির্ভরযোগ্য পরিবেশ তৈরি করার চেষ্টা করি।

আমরা যা করি না:

Shadamon Invest কোনো ইনভেস্টমেন্ট ব্যাংক, ব্রোকারেজ, ফাইন্যান্সিয়াল অ্যাডভাইজার বা লাইসেন্সপ্রাপ্ত আর্থিক প্রতিষ্ঠান নয়।

আমরা কোনো ব্যবসার আর্থিক ডেটা, প্রকল্পের সম্ভাব্যতা বা প্রস্তাবিত রিটার্নের সত্যতা যাচাই বা গ্যারান্টি দিই না—এই বিবরণগুলো পোস্টকারীর নিজস্ব স্ব-ঘোষণা।

আমরা কোনো চুক্তি, বিনিয়োগের চুক্তি বা ফান্ড ট্রান্সফারে মধ্যস্থতা করি না; Shadamon Invest শুধুমাত্র দুই পক্ষকে সংযুক্ত করে। চুক্তি, যথাযথ সতর্কতা (Due Diligence) এবং সিদ্ধান্তগুলো সম্পূর্ণভাবে ব্যবহারকারীদের নিজস্ব দায়িত্ব।

যেকোনো বিনিয়োগ বা তহবিল সংগ্রহের সিদ্ধান্ত নেওয়ার আগে, অনুগ্রহ করে আপনার নিজস্ব যথাযথ সতর্কতা অবলম্বন করুন এবং প্রয়োজনে একটি লাইসেন্সপ্রাপ্ত আর্থিক/আইনি উপদেষ্টার সাথে পরামর্শ করুন।`
    }),
    terms: makeInfoItem({
        slug: 'terms-and-conditions',
        titleBn: 'Shadamon Invest – ব্যবহারের শর্তাবলি',
        titleEn: 'Shadamon Invest – Terms & Conditions',
        contentEn: `Terms & Conditions
Last Updated: September 17, 2026

By using Shadamon Invest ("we", "the platform"), you agree to the following terms.

1. Nature of the Platform
Shadamon Invest is merely a matchmaking marketplace. We facilitate connections between entrepreneurs and investors, but are not responsible for any transactions, contracts, or outcomes thereof. Any information displayed on the platform (funding requirements, expected returns, business valuation, etc.) is not independently verified by us unless explicitly marked as "Verified"—and verification badges relate strictly to identity/documents, not a guarantee of the accuracy of financial data.

2. Account & Eligibility
- You must be at least 18 years of age to open an account and possess the legal capacity to enter into a contract under applicable laws of Bangladesh.
- Mobile number OTP verification is mandatory. You are obligated to provide accurate and authentic personal information.
- The security of an account (password, OTP, login session) is entirely the user's responsibility.

3. Posting Rules
- It is the user's responsibility to keep the information provided in posts (funding needs, business description, investment criteria) accurate and up-to-date.
- We reserve the right to remove posts containing false, misleading, or fraudulent information and to suspend or terminate the respective account.
- Posts related to illegal businesses, schemes, pyramid/MLM activities, or any activities prohibited by Bangladeshi law are strictly prohibited.

4. Payments & Paid Features
- Paid features such as Access Packages (Invite/Chat/Call/Send Proposal), Promotion/Boost, and Connect Access are subject to specific terms outlined on their respective feature pages and the "Promote" policy.
- All payments are displayed and accepted in Bangladeshi Taka (৳).
- Refund policies apply as per the conditions stated on the "Promote" page.

5. Limitation of Liability
- Shadamon Invest shall not be liable for any financial losses, fraud, breach of contract, or any damages arising from investments made by any user.
- Any discussions, agreements, or transactions between two parties are conducted entirely at the respective parties' own risk and responsibility.
- Before investing, independently verify the financial standing, legitimacy, and accuracy of the proposed returns of a business.

6. Prohibited Activities
Harassment, spam, creating fake profiles, impersonation, coercing others to make payments outside the platform, using deep-links, page-scrapers, robots, spiders, or any automated methods to harvest platform content, or attempting to breach platform security may result in permanent account termination. In such cases, previously paid fees are non-refundable.

7. Securities & Public Offering Restrictions
Shadamon Invest is not licensed or registered by any regulatory body (such as the Bangladesh Securities and Exchange Commission or any other authority). Offering any public securities, shares, bonds, or similar regulated financial instruments through this platform is strictly prohibited. Users may only use the platform for private, point-to-point business discussions.

8. Release from Disputes
If a dispute arises between two or more users, you release Shadamon Invest from any claims, compensation, or damages (direct and indirect, known and unknown) related to such disputes. Shadamon Invest shall not be liable for any direct, special, indirect, incidental, consequential, or punitive damages, whether arising from contract, statute, tort (including negligence), or any other basis.

9. Indemnification
You agree to indemnify and hold harmless Shadamon Invest from any third-party claims, damages, or costs (including legal fees) arising from your posted content, provided information, or use of the platform—particularly in cases of intellectual property infringement, provision of false information, or violation of third-party rights.

10. Right to Edit/Remove Posts
We reserve the right to edit, suspend, or delete any post or account if we believe a user is misusing the platform, using it outside its intended purpose, providing false/misleading information, or behaving objectionably toward other users. Payments made in such cases are non-refundable. No post or profile displayed on the platform shall constitute a binding offer.

11. Modification/Termination of Services
We reserve the right to modify, suspend, or discontinue our services in whole or in part at any time, without liability to any user or third party.

12. Changes to Terms
We reserve the right to modify these terms at any time. Continuing to use the platform after modifications means you accept the new terms.

13. Governing Law and Jurisdiction
These terms shall be governed by the laws of Bangladesh, and the courts of Dhaka shall have exclusive jurisdiction over any disputes arising from or related to them.

You confirm that you have read these terms and unconditionally agree to abide by them.`,
        contentBn: `ব্যবহারের শর্তাবলি (Terms & Conditions)
সর্বশেষ সংস্করণ: ১৭ সেপ্টেম্বর, ২০২৬

Shadamon Invest ("আমরা", "প্ল্যাটফর্ম") ব্যবহার করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলি মেনে নিতে সম্মত হচ্ছেন।

১. প্ল্যাটফর্মের প্রকৃতি
Shadamon Invest কেবল একটি ম্যাচমেকিং মার্কেটপ্লেস। আমরা উদ্যোক্তা এবং বিনিয়োগকারীদের মধ্যে সংযোগ তৈরিতে সহায়তা করি, তবে কোনো লেনদেন, চুক্তি বা এর ফলাফলের জন্য আমরা দায়ী নই। প্ল্যাটফর্মে প্রদর্শিত যেকোনো তথ্য (অর্থায়নের প্রয়োজনীয়তা, প্রত্যাশিত রিটার্ন, ব্যবসার মূল্যায়ন ইত্যাদি) আমাদের দ্বারা স্বাধীনভাবে যাচাইকৃত নয়, যদি না স্পষ্টভােব "Verified" হিসেবে চিহ্নিত করা হয়—এবং যাচাইকরণ ব্যাজগুলো কঠোরভাবে পরিচয়/নথির সাথে সম্পর্কিত, আর্থিক তথ্যের নির্ভুলতার কোনো গ্যারান্টি নয়।

২. অ্যাকাউন্ট ও যোগ্যতা
- একটি অ্যাকাউন্ট খুলতে আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে এবং বাংলাদেশের প্রচলিত আইনের অধীনে চুক্তি করার আইনি ক্ষমতা থাকতে হবে।
- মোবাইল নম্বর OTP যাচাইকরণ বাধ্যতামূলক। আপনি সঠিক ও খাঁটি ব্যক্তিগত তথ্য প্রদান করতে বাধ্য।
- একটি অ্যাকাউন্টের নিরাপত্তা (পাসওয়ার্ড, OTP, লগইন সেশন) সম্পূর্ণভাবে ব্যবহারকারীর দায়িত্ব।

৩. পোস্ট করার নিয়মাবলি
- পোস্টে প্রদত্ত তথ্য (অর্থায়নের প্রয়োজন, ব্যবসার বিবরণ, বিনিয়োগের মানদণ্ড) সঠিক ও হালনাগাদ রাখা ব্যবহারকারীর দায়িত্ব।
- আমরা মিথ্যা, বিভ্রান্তিকর বা প্রতারণামূলক তথ্য সম্বলিত পোস্ট মুছে ফেলার এবং সংশ্লিষ্ট অ্যাকাউন্ট স্থগিত বা বাতিল করার অধিকার সংরক্ষণ করি।
- অবৈধ ব্যবসা, স্কিম, পিরামিড/MLM কার্যক্রম বা বাংলাদেশের আইন দ্বারা নিষিদ্ধ যেকোনো কার্যক্রম সম্পর্কিত পোস্ট কঠোরভাবে নিষিদ্ধ।

৪. পেমেন্ট ও পেইড ফিচার
- অ্যাক্সেস প্যাকেজ (ইনভাইট/চ্যাট/কল/প্রস্তাব পাঠানো), প্রমোশন/বুস্ট এবং কানেক্ট অ্যাক্সেসের মতো পেইড ফিচারগুলো তাদের নিজ নিজ ফিচার পেজ এবং "Promote" নীতিতে উল্লিখিত নির্দিষ্ট শর্তাবলির অধীন।
- সকল পেমেন্ট বাংলাদেশী টাকায় (৳) প্রদর্শিত এবং গৃহীত হয়।
- "Promote" পেজে উল্লিখিত শর্তানুসারে রিফান্ড নীতি প্রযোজ্য হবে।

৫. দায়ের সীমাবদ্ধতা (Limitation of Liability)
- যেকোনো ব্যবহারকারীর বিনিয়োগের ফলে সৃষ্ট আর্থিক ক্ষতি, প্রতারণা, চুক্তি ভঙ্গ বা কোনো ক্ষতির জন্য Shadamon Invest দায়ী থাকবে না।
- দুই পক্ষের মধ্যকার যেকোনো আলোচনা, চুক্তি বা লেনদেন সম্পূর্ণভাবে নিজ নিজ পক্ষের ঝুঁকিতে এবং দায়িত্বে পরিচালিত হয়।
- বিনিয়োগ করার আগে, একটি ব্যবসার আর্থিক অবস্থা, বৈধতা এবং প্রস্তাবিত রিটার্নের নির্ভুলতা স্বাধীনভাবে যাচাই করুন।

৬. নিষিদ্ধ কার্যকলাপ
হয়রানি করা, স্প্যাম পাঠানো, ভুয়া প্রোফাইল তৈরি করা, ছদ্মবেশ ধারণ করা, প্ল্যাটফর্মের বাইরে পেমেন্ট করতে বাধ্য করা, ডিপ-লিংক, পেজ-স্ক্র্যাপার, রোবট, স্পাইডার বা যেকোনো স্বয়ংক্রিয় পদ্ধতি ব্যবহার করে কন্টেন্ট সংগ্রহ করা বা নিরাপত্তা লঙ্ঘনের চেষ্টা করার ফলে অ্যাকাউন্ট স্থায়ীভাবে বন্ধ হতে পারে। এই ধরনের ক্ষেত্রে পূর্বে পরিশোধিত ফি অফেরতযোগ্য।

৭. সিকিউরিটিজ ও পাবলিক অফারিং বিধিনিষেধ
Shadamon Invest কোনো নিয়ন্ত্রক সংস্থা (যেমন বাংলাদেশ সিকিউরিটিজ অ্যান্ড এক্সচেঞ্জ কমিশন বা অন্য কোনো কর্তৃপক্ষ) দ্বারা লাইসেন্সপ্রাপ্ত বা নিবন্ধিত নয়। এই প্ল্যাটফর্মের মাধ্যমে কোনো পাবলিক সিকিউরিটিজ, শেয়ার, বন্ড বা একই ধরনের নিয়ন্ত্রিত আর্থিক উপাদান অফার করা কঠোরভাবে নিষিদ্ধ। ব্যবহারকারীরা কেবল ব্যক্তিগত, পয়েন্ট-টু-পয়েন্ট ব্যবসার আলোচনার জন্য প্ল্যাটফর্মটি ব্যবহার করতে পারেন।

৮. বিরোধ মুক্তকরণ (Release from Disputes)
যদি দুই বা ততোধিক ব্যবহারকারীর মধ্যে বিরোধ দেখা দেয়, তবে আপনি Shadamon Invest-কে এই ধরনের বিরোধ সম্পর্কিত যেকোনো দাবি, ক্ষতিপূরণ বা ক্ষতি (প্রত্যক্ষ ও পরোক্ষ, জানা এবং অজানা) থেকে মুক্ত করছেন। চুক্তি, সংবিধি, টর্ট (অবহেলাসহ) বা অন্য কোনো ভিত্তি থেকে উদ্ভূত প্রত্যক্ষ, বিশেষ, পরোক্ষ, আনুষঙ্গিক, ফলশ্রুতিগত বা শাস্তিমূলক ক্ষতির জন্য Shadamon Invest দায়ী থাকবে না।

৯. ক্ষতিপূরণ (Indemnification)
আপনার পোস্ট করা কন্টেন্ট, প্রদত্ত তথ্য বা প্ল্যাটফর্ম ব্যবহারের ফলে সৃষ্ট যেকোনো তৃতীয় পক্ষের দাবি, ক্ষতি বা খরচ (আইনি ফি সহ) থেকে Shadamon Invest-কে মুক্ত রাখতে এবং ক্ষতিপূরণ দিতে আপনি সম্মত হন—বিশেষ করে মেধা সম্পত্তি লঙ্ঘন, মিথ্যা তথ্য প্রদান বা তৃতীয় পক্ষের অধিকার লঙ্ঘনের ক্ষেত্রে।

১০. পোস্ট সম্পাদনা/অপসারণের অধিকার
কোনো ব্যবহারকারী প্ল্যাটফর্মের অপব্যবহার করছেন, উদ্দেশ্যে বাইরে ব্যবহার করছেন, মিথ্যা/বিভ্রান্তিকর তথ্য প্রদান করছেন বা অন্য ব্যবহারকারীদের সাথে আপত্তিজনক আচরণ করছেন বলে মনে করলে যেকোনো পোস্ট বা অ্যাকাউন্ট সম্পাদনা, স্থগিত বা মুছে ফেলার অধিকার আমরা সংরক্ষণ করি। এই ধরনের ক্ষেত্রে পরিশোধিত পেমেন্ট অফেরতযোগ্য। প্ল্যাটফর্মে প্রদর্শিত কোনো পোস্ট বা প্রোফাইল কোনো বাধ্যবাধকতামূলক অফার গঠন করবে না।

১১. সেবা পরিবর্তন/সমাপ্তি
আমরা যেকোনো সময় কোনো ব্যবহারকারী বা তৃতীয় পক্ষের প্রতি দায়বদ্ধতা ছাড়াই আমাদের পরিষেবাগুলো সম্পূর্ণ বা আংশিকভাবে পরিবর্তন, স্থগিত বা বন্ধ করার অধিকার সংরক্ষণ করি।

১২. শর্তাবলির পরিবর্তন
আমরা যেকোনো সময় এই শর্তাবলি পরিবর্তন করার অধিকার সংরক্ষণ করি। পরিবর্তনের পর প্ল্যাটফর্মের ব্যবহার অব্যাহত রাখার অর্থ হলো আপনি নতুন শর্তাবলি মেনে নিচ্ছেন।

১৩. প্রযোজ্য আইন এবং এখতিয়ার
এই শর্তাবলি বাংলাদেশের আইন দ্বারা পরিচালিত হবে এবং এর থেকে উদ্ভূত যেকোনো বিরোধের ক্ষেত্রে ঢাকার আদালতের একচ্ছত্র এখতিয়ার থাকবে।

আপনি নিশ্চিত করছেন যে আপনি এই শর্তাবলি পড়েছেন এবং নিঃশর্তভাবে এগুলো মেনে চলতে সম্মত হচ্ছেন।`
    }),
    privacy: makeInfoItem({
        slug: 'privacy-policy',
        titleBn: 'Shadamon Invest – গোপনীয়তা নীতি',
        titleEn: 'Shadamon Invest – Privacy Policy',
        contentEn: `Privacy Policy
Last Updated: September 17, 2026

Information We Collect:

Account Information: Name, mobile number, email (if signed up via Google/Facebook).

Verification Information (Optional): NID, trade license, tax certificate, bank statement—solely for trust scores and verification badges.

Post Information: Funding requirements, business description, investment criteria, images.

Usage Information: Login activity, post views, invite/chat activity (for spam prevention and platform improvement).

Payment Information: Processed securely through payment gateways; we do not directly store card/bank details.

How We Use Information:

- For account verification and OTP authentication.
- For matchmaking and feed display (based on location and category).
- For trust score calculation and fraud prevention.
- For customer support and communication.

Information Sharing:

- Your full name and contact information remain hidden from other users (locked icon) until you give explicit permission or the relevant party purchases Connect Access.
- We share necessary data with third parties (payment providers, SMS gateways) only, which are protected by their own privacy policies.
- We do not sell or share your data with third parties except under legal obligation or government directive.

Data Security:

We take reasonable technical and administrative measures to keep your data secure. However, in the event of unexpected technical errors, malfunctions, or security breaches, Shadamon Invest will not be liable for any resulting damages—no online system is 100% secure, so please be aware of this risk.

Account Closure & Data Retention:

- You can request account closure or permanent data deletion via Contact Us; we will process it promptly.
- We reserve the right to close accounts that remain inactive for a long time or for platform improvement purposes.
- We may permanently retain certain data from closed accounts to comply with the law, prevent fraud, recover pending fees, resolve disputes, or conduct industry analysis.

Business Transfers:

If Shadamon Invest undergoes a merger, acquisition, or asset sale and your information becomes part of the transferred assets, the new privacy policy determined at that time will apply to your data. Such changes will be communicated on the platform or via email.

Your Rights:

- You may request to view, correct, or delete your own data.
- For requests, contact us via the Contact Us page.

Policy Changes:

We reserve the right to modify this privacy policy at any time for any reason.

Cookies:

The platform uses cookies to improve login sessions and user experience.`,
        contentBn: `গোপনীয়তা নীতি (Privacy Policy)
সর্বশেষ সংস্করণ: ১৭ সেপ্টেম্বর, ২০২৬

আমরা যে তথ্য সংগ্রহ করি:

অ্যাকাউন্ট সম্পর্কিত তথ্য: নাম, মোবাইল নম্বর, ইমেইল (গুগল/ফেসবুকের মাধ্যমে সাইন আপ করলে)।

যাচাইকরণ তথ্য (ঐচ্ছিক): NID, ট্রেড লাইসেন্স, ট্যাক্স সার্টিফিকেট, ব্যাংক স্টেটমেন্ট—শুধুমাত্র ট্রাস্ট স্কোর এবং যাচাইকরণ ব্যাজের জন্য।

পোস্ট সম্পর্কিত তথ্য: অর্থায়নের প্রয়োজনীয়তা, ব্যবসার বিবরণ, বিনিয়োগের মানদণ্ড, ছবি।

ব্যবহার সম্পর্কিত তথ্য: লগইন অ্যাক্টিভিটি, পোস্ট ভিউ, ইনভাইট/চ্যাট অ্যাক্টিভিটি (স্প্যাম প্রতিরোধ এবং প্ল্যাটফর্মের উন্নতির জন্য)।

পেমেন্ট সম্পর্কিত তথ্য: পেমেন্ট গেটওয়ের মাধ্যমে নিরাপদে প্রক্রিয়াজাত করা হয়; আমরা সরাসরি কার্ড/ব্যাংক বিবরণ সংরক্ষণ করি না।

আমরা কীভাবে তথ্য ব্যবহার করি:

- অ্যাকাউন্ট যাচাইকরণ এবং OTP অথেন্টিকেশনের জন্য।
- ম্যাচমেকিং এবং ফিড প্রদর্শনের জন্য (অবস্থান এবং ক্যাটাগরির ওপর ভিত্তি করে)।
- ট্রাস্ট স্কোর গণনা এবং জালিয়াতি প্রতিরোধের জন্য।
- কাস্টমার সাপোর্ট এবং যোগাযোগের জন্য।

তথ্য ভাগাভাগি (Information Sharing):

- আপনি স্পষ্ট অনুমতি না দেওয়া বা সংশ্লিষ্ট পক্ষ কানেক্ট অ্যাক্সেস ক্রয় না করা পর্যন্ত আপনার পূর্ণ নাম এবং যোগাযোগের তথ্য অন্য ব্যবহারকারীদের কাছ থেকে লুকানো থাকে (লক করা আইকন)।
- আমরা কেবল প্রয়োজনীয় ডেটা তৃতীয় পক্ষের (পেমেন্ট প্রোভাইডার, SMS গেটওয়ে) সাথে শেয়ার করি, যা তাদের নিজস্ব গোপনীয়তা নীতি দ্বারা সুরক্ষিত।
- আইনি বাধ্যবাধকতা বা সরকারি নির্দেশ ছাড়া আমরা কোনো তৃতীয় পক্ষের কাছে আপনার ডেটা বিক্রি বা শেয়ার করি না।

ডেটা নিরাপত্তা:

আপনার ডেটা নিরাপদ রাখতে আমরা যুক্তিযুক্ত প্রযুক্তিগত এবং প্রশাসনিক ব্যবস্থা গ্রহণ করি। তবে, অপ্রত্যাশিত প্রযুক্তিগত ত্রুটি, বিভ্রাট বা নিরাপত্তা লঙ্ঘনের ক্ষেত্রে, Shadamon Invest কোনো ক্ষতির জন্য দায়ী থাকবে না—কোনো অনলাইন সিস্টেমই ১০০% নিরাপদ নয়, তাই অনুগ্রহ করে এই ঝুঁকি সম্পর্কে সচেতন থাকুন।

অ্যাকাউন্ট বন্ধ এবং ডেটা সংরক্ষণ:

- আপনি 'Contact Us' এর মাধ্যমে অ্যাকাউন্ট বন্ধ বা স্থায়ী ডেটা মুছে ফেলার অনুরোধ করতে পারেন; আমরা অবিলম্বে এটি প্রক্রিয়া করব।
- দীর্ঘ সময় ধরে নিষ্ক্রিয় থাকা অ্যাকাউন্ট বা প্ল্যাটফর্মের উন্নতির উদ্দেশ্যে অ্যাকাউন্ট বন্ধ করার অধিকার আমরা সংরক্ষণ করি।
- আইন মেনে চলা, জালিয়াতি প্রতিরোধ করা, বকেয়া ফি উদ্ধার করা, বিরোধ নিষ্পত্তি করা বা শিল্প বিশ্লেষণের জন্য আমরা বন্ধ করা অ্যাকাউন্টগুলোর নির্দিষ্ট ডেটা স্থায়ীভাবে সংরক্ষণ করতে পারি।

ব্যবসায়িক হস্তান্তর (Business Transfers):

যদি Shadamon Invest কোনো একীভূতকরণ (Merger), অধিগ্রহণ (Acquisition) বা সম্পদ বিক্রয়ের মধ্য দিয়ে যায় এবং আপনার তথ্য স্থানান্তরিত সম্পদের অংশ হয়, তবে সেই সময়ে নির্ধারিত নতুন গোপনীয়তা নীতি আপনার ডেটাতে প্রযোজ্য হবে। এই ধরনের পরিবর্তন প্ল্যাটফর্মে বা ইমেলের মাধ্যমে জানানো হবে।

আপনার অধিকারসমূহ:

- আপনি আপনার নিজস্ব ডেটা দেখতে, সংশোধন করতে বা মুছে ফেলার অনুরোধ করতে পারেন।
- অনুরোধের জন্য, 'Contact Us' পেজের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।

নীতি পরিবর্তন:

আমরা যেকোনো সময় যেকোনো কারণে এই গোপনীয়তা নীতি সংশোধন করার অধিকার সংরক্ষণ করি।

কুকিজ (Cookies):

লগইন সেশন এবং ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে প্ল্যাটফর্মটি কুকিজ ব্যবহার করে।`
    }),
    safety: makeInfoItem({
        slug: 'safety-tips',
        titleBn: 'Shadamon Invest – নিরাপত্তা টিপস',
        titleEn: 'Shadamon Invest – Safety Tips',
        contentEn: `Safety Tips
Last Updated: September 17, 2026

Shadamon Invest only provides connections—due diligence and decisions are entirely your own responsibility. Stay safe by following these tips:

Before Investing:

- Independently verify proposed returns, business financials, and project legitimacy—do not rely solely on figures written in posts.
- Cross-check the business's trade license, NID, and relevant documents directly through respective government agencies.
- Visit the business location in person and meet directly if possible.
- Have a lawyer or financial advisor draft and review agreements.

During Financial Transactions:

- Never send advance money until due diligence is complete.
- Beware of high-pressure tactics such as "decide very quickly" or "limited time offer"—this is a common fraud strategy.
- Be suspicious of promises of unusually high returns (e.g., guaranteed high monthly profits)—no return is 100% guaranteed in realistic investments.

Communication Guidelines:

- Keep initial conversations within the platform; be cautious if there is pressure to quickly move to external channels (WhatsApp, Telegram).
- Having a verified badge means identity/documents have been reviewed—it is not a guarantee of financial safety.
- If you suspect suspicious behavior or fraud, immediately inform us using the "Report" feature.`,
        contentBn: `নিরাপত্তা টিপস (Safety Tips)
সর্বশেষ সংস্করণ: ১৭ সেপ্টেম্বর, ২০২৬

Shadamon Invest কেবল সংযোগ প্রদান করে—যথাযথ সতর্কতা (Due Diligence) অবলম্বন এবং সিদ্ধান্ত গ্রহণ সম্পূর্ণভাবে আপনার নিজস্ব দায়িত্ব। নিরাপদে থাকতে এই টিপসগুলো অনুসরণ করুন:

বিনিয়োগ করার আগে:

- প্রস্তাবিত রিটার্ন, ব্যবসার আর্থিক অবস্থা এবং প্রকল্পের বৈধতা স্বাধীনভাবে যাচাই করুন—কেবল পোস্টে লেখা পরিসংখ্যানে ভরসা করবেন না।
- সংশ্লিষ্ট সরকারি সংস্থার মাধ্যমে সরাসরি ব্যবসার ট্রেড লাইসেন্স, NID এবং প্রাসঙ্গিক নথিপত্র পুনরায় যাচাই (Cross-check) করুন।
- সরাসরি ব্যবসার স্থানে ব্যক্তিগতভাবে যান এবং সম্ভব হলে সরাসরি দেখা করুন।
- একজন আইনজীবী বা আর্থিক উপদেষ্টাকে দিয়ে চুক্তিপত্রের খসড়া তৈরি ও পর্যালোচনা করিয়ে নিন।

আর্থিক লেনদেনের সময়:

- যথাযথ সতর্কতা (Due Diligence) সম্পন্ন না হওয়া পর্যন্ত কখনোই অগ্রিম অর্থ পাঠাবেন না।
- "খুব দ্রুত সিদ্ধান্ত নিন" বা "সীমিত সময়ের অফার"—এর মতো চাপ সৃষ্টিকারী কৌশল থেকে সাবধান থাকুন; এটি একটি সাধারণ প্রতারণার কৌশল।
- অস্বাভাবিক উচ্চ রিটার্নের প্রতিশ্রুতিতে (যেমন, নিশ্চিত উচ্চ মাসিক মুনাফা) সন্দেহ প্রকাশ করুন—বাস্তবসম্মত বিনিয়োগে কোনো রিটার্নই ১০০% নিশ্চিত নয়।

যোগাযোগের নির্দেশিকা:

- প্রাথমিক কথোপকথন প্ল্যাটফর্মের মধ্যেই সীমাবদ্ধ রাখুন; দ্রুত বাহ্যিক চ্যানেলে (হোয়াটসঅ্যাপ, টেলিগ্রাম) স্থানান্তরিত হওয়ার জন্য চাপ থাকলে সতর্ক থাকুন।
- যাচাইকৃত (Verified) ব্যাজ থাকার অর্থ হলো পরিচয়/নথিপত্র পর্যালোচনা করা হয়েছে—এটি আর্থিক নিরাপত্তার কোনো গ্যারান্টি নয়।
- যদি আপনি সন্দেহজনক আচরণ বা প্রতারণার সন্দেহ করেন, তবে "Report" ফিচারটি ব্যবহার করে অবিলম্বে আমাদের জানান।`
    }),
    contact: makeInfoItem({
        slug: 'contact-us',
        titleBn: 'আমাদের সাথে যোগাযোগ',
        titleEn: 'Contact Us',
        contentEn: `If you have any questions, please first check our Safety Tips section. If you do not find your answer there, feel free to contact us. We will respond as quickly as possible.

Contact Methods:
Message or Chat: m.me/ShadamonDotCom
Call: 01752 84 20 84
Business Hours: Every day from 10:00 AM to 8:00 PM
Address: Rampura, Dhaka, Bangladesh.`,
        contentBn: `আপনার যদি কোনো প্রশ্ন থাকে, তবে অনুগ্রহ করে প্রথমে আমাদের নিরাপত্তা টিপস (Safety Tips) বিভাগটি দেখে নিন। সেখানে আপনার উত্তর না পেলে নির্দ্বিধায় আমাদের সাথে যোগাযোগ করুন। আমরা যত দ্রুত সম্ভব আপনাকে সহায়তা করব।

যোগাযোগের মাধ্যম:
মেসেজ বা চ্যাট: m.me/ShadamonDotCom
কল করুন: ০১৭৫২ ৮৪ ২০ ৮৪
অফিস সময়: প্রতিদিন সকাল ১০:০০ টা থেকে রাত ৮:০০ টা পর্যন্ত
ঠিকানা: রামপুরা, ঢাকা, বাংলাদেশ।`
    }),
    return: makeInfoItem({
        slug: 'return-refund-policy',
        titleBn: 'Shadamon Invest – রিটার্ন & রিফান্ড পলিসি',
        titleEn: 'Shadamon Invest – Returns & Refund Policy',
        contentEn: `Returns & Refund Policy
Last Updated: September 17, 2026

This policy applies to both types of paid promotions: View Promotion (View-Boost) and Connect Access Promotion (Only Me Connect / Shared Connect).

Nature and Effectiveness of Results:

Promotion results (number of views, invites/interest, connections) are estimation-based. Our system tries to deliver your post to the maximum number of relevant viewers, but no guarantees are made regarding audience reach, viewer interest, or a specific number of invites/responses. This is a probability-based process dependent entirely on the promotion type, timing, category, and audience reactions.

- View Promotion: In exchange for paid amounts (specific views per 100 Taka), views distributed evenly and priority ranking are provided for a specified duration.
- Connect Access Promotion: Purchasing "Only Me Connect" or "Shared Connect" packages unlocks specific quantities/durations of Chat, Call, Send Proposal access—however, the platform provides no assurance regarding how many users will use this access or whether it will result in actual investments/deals.

User Responsibility:

Ensure your post data is accurate, relevant, and up-to-date before promoting. If promotion results fall short of expectations due to incorrect or incomplete information, Shadamon Invest will not provide any compensation or refund. If an active promotion is terminated due to incorrect or policy-violating information, the payment will be non-refundable.

Result Tracking and Transparency:

After promoting, you can directly see how many viewers have viewed your post or shown interest (view counts for View Promotion, invite/response counts for Connect Access). This data helps you plan future promotions more effectively.

Automated Process:

Both types of promotions work completely automatically—no complex setup required. Clicking 'Promote' or the respective 'Get Access' button starts the process instantly, and results are displayed automatically.

Utilization of Payment:

Upon initiation, payments become active and are utilized via system scheduling workflows to reach the target audience or unlock Connect Access.

Cases Eligible for Full Refund:

Failure to launch the service within a specified timeframe (e.g., within 24 hours of payment)—strictly due to technical errors (payment deducted but promotion/access not activated). In such cases, contact us via the Contact Us page with proof of transaction.

Cases Eligible for Partial Refund (with Deductions):

If Shadamon Invest determines in its sole discretion that a post/profile needs to be cancelled or rejected in the interest of maintaining platform standards—the unused portion of the active promotion will be refunded on a pro-rata basis after a 5% transaction fee deduction.

Cases Where Refunds Are Not Applicable:

- Shadamon Invest does not guarantee a specific number of views, invites, responses, or deal-closures; hence, failure to achieve expected results does not qualify for a refund.
- Refunds do not apply if a user changes their mind, fails to use the promotion, or fails to submit required verification documents.
- Payments for promotions stopped due to incorrect or policy-violating information are completely non-refundable.
- If an account is terminated due to misuse or false information, previously paid fees will be retained as compensation, and refunds cannot be claimed.

Refund Request Process:

If eligible under the above terms, submit a request via the Contact Us page using your registered email/number within 3 months of payment, including invoice number, payment date, amount, and reason. We will review and process eligible refunds within 3 working days. Refunds will be returned to the original payment method and may take 5–15 working days to reflect.

Summary:

Shadamon Invest's promotion system is simple, transparent, and automated. Once payment is complete, it immediately activates to reach the maximum number of relevant viewers/potential connections, the results of which can be tracked directly by the user.`,
        contentBn: `রিটার্ন & রিফান্ড পলিসি (Returns & Refund Policy)
সর্বশেষ সংস্করণ: ১৭ সেপ্টেম্বর, ২০২৬

এই পলিসি উভয় ধরনের পেইড প্রমোশনের জন্য প্রযোজ্য: ভিউ প্রমোশন (View-Boost) এবং কানেক্ট অ্যাক্সেস প্রমোশন (Only Me Connect / Shared Connect)।

ফলাফলের প্রকৃতি ও কার্যকারিতা:

প্রমোশনের ফলাফল (ভিউ সংখ্যা, ইনভাইট/আগ্রহ, কানেকশন) অনুমানের ওপর ভিত্তি করে তৈরি। আমাদের সিস্টেম আপনার পোস্টটি সর্বোচ্চ সংখ্যক প্রাসঙ্গিক দর্শকদের কাছে পৌঁছে দেওয়ার চেষ্টা করে, তবে অডিয়েন্স রিচ, দর্শকদের আগ্রহ বা নির্দিষ্ট সংখ্যক ইনভাইট/সাড়ার কোনো গ্যারান্টি দেওয়া হয় না। এটি প্রমোশনের ধরন, সময়, ক্যাটাগরি এবং দর্শকদের প্রতিক্রিয়ার ওপর নির্ভরশীল একটি সম্ভাবনা-ভিত্তিক প্রক্রিয়া।

- ভিউ প্রমোশন: নির্ধারিত পরিশোধিত অর্থের বিনিময়ে (প্রতি ১০০ টাকায় নির্দিষ্ট ভিউ), নির্দিষ্ট মেয়াদের জন্য সমানভাবে বণ্টনকৃত ভিউ এবং অগ্রাধিকার র্যাঙ্কিং প্রদান করা হয়।
- কানেক্ট অ্যাক্সেস প্রমোশন: "Only Me Connect" বা "Shared Connect" প্যাকেজ কেনার মাধ্যমে নির্দিষ্ট পরিমাণ/মেয়াদের চ্যাট, কল, প্রস্তাব পাঠানোর অ্যাক্সেস আনলক হয়—তবে কতজন ব্যবহারকারী এই অ্যাক্সেস ব্যবহার করবেন বা এটি প্রকৃত বিনিয়োগ/চুক্তিতে পরিণত হবে কিনা সে বিষয়ে প্ল্যাটফর্ম কোনো নিশ্চয়তা দেয় না।

ব্যবহারকারীর দায়িত্ব:

প্রমোট করার আগে আপনার পোস্টের তথ্য সঠিক, প্রাসঙ্গিক এবং হালনাগাদ নিশ্চিত করুন। ভুল বা অসম্পূর্ণ তথ্যের কারণে প্রমোশনের ফলাফল প্রত্যাশার চেয়ে কম হলে Shadamon Invest কোনো ক্ষতিপূরণ বা রিফান্ড প্রদান করবে না। যদি ভুল বা নীতি-লঙ্ঘনকারী তথ্যের কারণে কোনো চলমান প্রমোশন বন্ধ করে দেওয়া হয়, তবে সেই পেমেন্ট অফেরতযোগ্য হবে।

ফলাফল ট্র্যাকিং এবং স্বচ্ছতা:

প্রমোট করার পর, কতজন দর্শক আপনার পোস্ট দেখেছেন বা আগ্রহ প্রকাশ করেছেন তা আপনি সরাসরি দেখতে পাবেন (ভিউ প্রমোশনের জন্য ভিউ সংখ্যা, কানেক্ট অ্যাক্সেসের জন্য ইনভাইট/সাড়া সংখ্যা)। এই তথ্য আপনাকে ভবিষ্যতে আরও কার্যকরভাবে প্রমোশন পরিকল্পনা করতে সাহায্য করবে।

স্বয়ংক্রিয় প্রক্রিয়া:

উভয় ধরনের প্রমোশন সম্পূর্ণ স্বয়ংক্রিয়ভাবে কাজ করে—কোনো জটিল সেটআপের প্রয়োজন নেই। 'Promote' বা সংশ্লিষ্ট 'Get Access' বাটনে ক্লিক করলে প্রক্রিয়াটি তাৎক্ষণিকভাবে শুরু হয় এবং ফলাফল স্বয়ংক্রিয়ভাবে প্রদর্শিত হয়।

পেমেন্টের ব্যবহার:

পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই তা সক্রিয় হয় এবং লক্ষ্যযুক্ত দর্শকদের কাছে পৌঁছাতে বা কানেক্ট অ্যাক্সেস আনলক করতে সিস্টেমের শিডিউলিং ওয়ার্কফ্লোর মাধ্যমে ব্যবহৃত হয়।

পূর্ণাঙ্গ রিফান্ডের যোগ্য ক্ষেত্রসমূহ:

নির্ধারিত সময়সীমার মধ্যে (যেমন, পেমেন্টের ২৪ ঘণ্টার মধ্যে) পরিষেবা চালু করতে ব্যর্থ হওয়া—কঠোরভাবে প্রযুক্তিগত ত্রুটির কারণে (পেমেন্ট কেটে নেওয়া হয়েছে কিন্তু প্রমোশন/অ্যাক্সেস সক্রিয় হয়নি)। এই ধরনের ক্ষেত্রে, লেনদেনের প্রমাণসহ 'Contact Us' পেজের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।

আংশিক রিফান্ডের যোগ্য ক্ষেত্রসমূহ (কর্তন সাপেক্ষে):

যদি Shadamon Invest তার একক বিবেচনায় নির্ধারণ করে যে প্ল্যাটফর্মের মান বজায় রাখার স্বার্থে কোনো পোস্ট/প্রোফাইল বাতিল বা প্রত্যাখ্যান করা প্রয়োজন—তবে সক্রিয় প্রমোশনের অব্যবহৃত অংশ ৫% ট্রানজেকশন ফি কাটার পর প্রোরোটা (Pro-rata) ভিত্তিতে ফেরত দেওয়া হবে।

যেসব ক্ষেত্রে রিফান্ড প্রযোজ্য নয়:

- Shadamon Invest নির্দিষ্ট সংখ্যক ভিউ, ইনভাইট, সাড়া বা চুক্তি সম্পাদনের গ্যারান্টি দেয় না; তাই প্রত্যাশিত ফলাফল অর্জনে ব্যর্থতা রিফান্ডের জন্য গ্রহণযোগ্য নয়।
- ব্যবহারকারী তাদের সিদ্ধান্ত পরিবর্তন করলে, প্রমোশন ব্যবহার করতে ব্যর্থ হলে, বা প্রয়োজনীয় যাচাইকরণ নথি জমা দিতে ব্যর্থ হলে রিফান্ড প্রযোজ্য হবে না।
- ভুল বা নীতি-লঙ্ঘনকারী তথ্যের কারণে বন্ধ করা প্রমোশনের পেমেন্ট সম্পূর্ণ অফেরতযোগ্য।
- অপব্যবহার বা মিথ্যা তথ্যের কারণে অ্যাকাউন্ট বন্ধ করা হলে, পূর্বে পরিশোধিত ফি ক্ষতিপূরণ হিসেবে রেখে দেওয়া হবে এবং রিফান্ড দাবি করা যাবে না।

রিফান্ড অনুরোধের প্রক্রিয়া:

উপরোক্ত শর্তানুসারে যোগ্য হলে, পেমেন্টের ৩ মাসের মধ্যে ইনভয়েস নম্বর, পেমেন্টের তারিখ, পরিমাণ এবং কারণ উল্লেখ করে আপনার নিবন্ধিত ইমেইল/নম্বর ব্যবহার করে 'Contact Us' পেজের মাধ্যমে একটি অনুরোধ জমা দিন। আমরা ৩ কর্মদিবসের মধ্যে যোগ্য রিফান্ড পর্যালোচনা ও প্রক্রিয়া করব। রিফান্ড মূল পেমেন্ট মেথডে ফেরত দেওয়া হবে এবং তা প্রতিফলিত হতে ৫-১৫ কর্মদিবস সময় লাগতে পারে।

সারসংক্ষেপ:

Shadamon Invest-এর প্রমোশন সিস্টেম সহজ, স্বচ্ছ এবং স্বয়ংক্রিয়। পেমেন্ট সম্পন্ন হলে, এটি সর্বোচ্চ সংখ্যক প্রাসঙ্গিক দর্শক/সম্ভাব্য কানেকশনের কাছে পৌঁছানোর জন্য অবিলম্বে সক্রিয় হয়, যার ফলাফল ব্যবহারকারী সরাসরি ট্র্যাক করতে পারেন।`
    })
};

export const INFO_PAGE_ROUTES = {
    about: `/info/${INFO_CONTENT.about.slug}`,
    terms: `/info/${INFO_CONTENT.terms.slug}`,
    privacy: `/info/${INFO_CONTENT.privacy.slug}`,
    contact: `/info/${INFO_CONTENT.contact.slug}`,
    safety: `/info/${INFO_CONTENT.safety.slug}`,
    return: `/info/${INFO_CONTENT.return.slug}`
} as const;

const INFO_CONTENT_BY_SLUG = Object.values(INFO_CONTENT).reduce<Record<string, InfoContentItem>>((acc, item) => {
    acc[item.slug] = item;
    return acc;
}, {});

export function getInfoContentBySlug(slug: string): InfoContentItem | null {
    return INFO_CONTENT_BY_SLUG[slug] || null;
}

export function getInfoContentForLanguage(item: InfoContentItem, language: InfoLanguage) {
    if (language === 'en') {
        return {
            title: item.titleEn,
            content: item.contentEn
        };
    }

    return {
        title: item.titleBn,
        content: item.contentBn
    };
}