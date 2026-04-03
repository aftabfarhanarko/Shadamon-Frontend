import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInfoContentBySlug } from '../../../utils/infoContent';

interface InfoPageProps {
    params: Promise<{ slug: string }>;
}

export default async function InfoPage({ params }: InfoPageProps) {
    const { slug } = await params;
    const page = getInfoContentBySlug(slug);

    if (!page) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h1 className="text-lg md:text-xl font-semibold text-slate-900">{page.title}</h1>
                </div>

                <div className="px-6 py-6">
                    <p className="text-sm md:text-[15px] leading-7 text-slate-700 whitespace-pre-wrap">{page.content}</p>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center text-sm font-medium text-sky-700 hover:text-sky-800"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
