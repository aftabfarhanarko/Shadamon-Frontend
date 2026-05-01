"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const status = searchParams.get('status');
    const txnId = searchParams.get('txnId');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status) {
            setLoading(false);
        }
    }, [status]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Processing your payment status...</p>
            </div>
        );
    }

    const renderStatus = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 flex flex-col items-center text-center max-w-md w-full">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
                        <p className="text-slate-600 mb-6">Your ad promotion has been activated. Thank you for using Shadamon.</p>
                        {txnId && (
                            <div className="bg-slate-50 p-3 rounded-lg w-full mb-6 font-mono text-sm text-slate-500">
                                Transaction ID: {txnId}
                            </div>
                        )}
                        <Link href="/d" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                            Go to Dashboard
                        </Link>
                    </div>
                );
            case 'failed':
                return (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 flex flex-col items-center text-center max-w-md w-full">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Failed</h2>
                        <p className="text-slate-600 mb-6">Unfortunately, the transaction could not be completed. Please try again.</p>
                        <Link href="/" className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors">
                            Back to Home
                        </Link>
                    </div>
                );
            case 'cancelled':
                return (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-amber-100 flex flex-col items-center text-center max-w-md w-full">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-12 h-12 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Cancelled</h2>
                        <p className="text-slate-600 mb-6">You have cancelled the payment process.</p>
                        <Link href="/" className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                            Back to Home
                        </Link>
                    </div>
                );
            default:
                return (
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center text-center max-w-md w-full">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <AlertCircle className="w-12 h-12 text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
                        <p className="text-slate-600 mb-6">An unknown error occurred while processing your payment.</p>
                        <button onClick={() => router.back()} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                            Try Again
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            {renderStatus()}
        </div>
    );
}

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentStatusContent />
        </Suspense>
    );
}
