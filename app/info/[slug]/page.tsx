import Link from 'next/link';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getInfoContentBySlug, getInfoContentForLanguage, type InfoLanguage } from '@/utils/infoContent';

interface InfoPageProps {
    params: Promise<{ slug: string }>;
}

export default async function InfoPage({ params }: InfoPageProps) {
    const { slug } = await params;
    const page = getInfoContentBySlug(slug);

    if (!page) {
        notFound();
    }

    const cookieStore = await cookies();
    const langCookie = cookieStore.get('app_lang')?.value;
    const language: InfoLanguage = langCookie === 'en' ? 'en' : 'bn';
    const localizedPage = getInfoContentForLanguage(page, language);
    const showTopBackButton = ['about-us', 'terms-and-conditions', 'privacy-policy', 'contact-us', 'safety-tips'].includes(slug);

    return (
        <main className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                        <h1 className="text-lg md:text-xl font-semibold text-slate-900">{localizedPage.title}</h1>
                        {showTopBackButton && (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center whitespace-nowrap text-xs md:text-sm font-medium text-sky-700 hover:text-sky-800"
                            >
                                {language === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}
                            </Link>
                        )}
                    </div>
                </div>

                <div className="px-6 py-6">
                    <p className="text-sm md:text-[15px] leading-7 text-slate-700 whitespace-pre-wrap">{localizedPage.content}</p>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm font-medium text-sky-700 hover:text-sky-800"
                    >
                        {language === 'bn' ? 'ড্যাশবোর্ডে ফিরে যান' : 'Back to Dashboard'}
                    </Link>
                </div>
            </div>
        </main>
    );
}
