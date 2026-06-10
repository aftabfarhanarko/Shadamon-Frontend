import { Suspense } from 'react';
import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

const API_URL = 'https://api.shadamon.com';
const SITE_URL = 'https://shadamon.com';
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.shadamon.com';
// const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shadamon.com';

export async function generateMetadata(
    { searchParams }: { searchParams: Promise<{ ad?: string }> }
): Promise<Metadata> {
    const params = await searchParams;
    const adId = params?.ad;

    if (!adId) {
        return { title: 'Shadamon.com | দ্রুত ও সহজ কেনাবেচার স্মার্ট মার্কেটপ্লেস', description: 'The ultimate marketing platform' };
    }

    try {
        const res = await fetch(`${API_URL}/api/ads/public/${adId}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) throw new Error('Not found');
        const { data: ad } = await res.json();

        const rawImage = ad?.images?.[0];
        const imageUrl = rawImage
            ? (rawImage.startsWith('http') ? rawImage : `${API_URL}/${rawImage.replace(/^\/+/, '')}`)
            : `${SITE_URL}/og-image.jpg`;

        const title = ad?.headline || 'Shadamon';
        const description = (ad?.description || 'The ultimate marketing platform').slice(0, 200);
        const pageUrl = `${SITE_URL}/d?ad=${adId}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                url: pageUrl,
                type: 'website',
                images: [{ url: imageUrl, width: 800, height: 600, alt: title }],
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
        };
    } catch {
        return { title: 'Shadamon.com | দ্রুত ও সহজ কেনাবেচার স্মার্ট মার্কেটপ্লেস', description: 'The ultimate marketing platform' };
    }
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>}>
            <DashboardClient />
        </Suspense>
    );
}
