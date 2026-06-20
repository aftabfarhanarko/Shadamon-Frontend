import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "react-hot-toast";
import RegisterServiceWorker from "@/components/RegisterServiceWorker"

const SITE_TITLE = "Shadamon.com | দ্রুত ও সহজ কেনাবেচার স্মার্ট মার্কেটপ্লেস";
const SITE_DESCRIPTION = "The ultimate marketing platform";
const FALLBACK_OG_IMAGE = "https://shadamon.com/og.png";
const API_URL = 'https://api.shadamon.com';

async function fetchOgImageUrl(): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/api/settings/dashboard`, { next: { revalidate: 3600 } });
    if (!res.ok) return FALLBACK_OG_IMAGE;
    const data = await res.json();
    if (data.success && data.data?.ogImage) {
      const p = data.data.ogImage as string;
      if (p.startsWith('http')) return p;
      return `${API_URL}/${p.startsWith('/') ? p.slice(1) : p}`;
    }
  } catch { }
  return FALLBACK_OG_IMAGE;
}

export async function generateMetadata(): Promise<Metadata> {
  const ogImageUrl = await fetchOgImageUrl();
  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: "https://shadamon.com",
      siteName: "Shadamon",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: "Shadamon" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [ogImageUrl],
    },
    other: {
      "fb:app_id": "352947546661410",
    },
  };
}

import { SettingsProvider } from "./context/SettingsContext";
import SettingsHead from "./components/SettingsHead";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <head>
        <meta name="google-site-verification" content="google971854131468af49.htm" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="The ultimate marketing platform" />
        <meta name="format-detection" content="telephone=no" />

        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shadamon" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/png" sizes="16x16" href="/hc.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/hc.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/hc.png" />
        <link rel="shortcut icon" href="/hc.png" />
        <link rel="apple-touch-icon" href="/hc.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/hc.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/hc.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/hc.png" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />

        <meta name="twitter:creator" content="@shadamon" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Shadamon',
              url: 'https://shadamon.com',
              logo: 'https://shadamon.com/logo.png',
              sameAs: [
                'https://facebook.com/shadamondotcom',
                'https://www.youtube.com/@ShadaMondotcom'
              ]
            })
          }}
        />

      </head>
      <body
        className={`antialiased`}

      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-SEZGVZCXMT"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SEZGVZCXMT');
          `}
        </Script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              /**
               * ------------------------------------------------------------------
               * DEVELOPED BY: 
               * WEBSITE:     
               * EMAIL:       
               * ------------------------------------------------------------------
               */
              console.log(
                "%c  ",
                "background: #1a1a1a; color: #00ff00; font-size: 1.2rem; font-weight: bold; padding: 10px; border-radius: 5px; border: 1px solid #00ff00;"
              );
              console.log(
                "%c WEBSITE: ",
                "background: #1a1a1a; color: #00ff00; font-size: 1.2rem; font-weight: bold; padding: 10px; border-radius: 5px; border: 1px solid #00ff00;"
              );
              console.log(
                "%c EMAIL:,
                "background: #1a1a1a; color: #00ff00; font-size: 1.2rem; font-weight: bold; padding: 10px; border-radius: 5px; border: 1px solid #00ff00;"
              );
              console.log(
                "%c Professional Web Development & Design Solutions ",
                "color: #888; font-style: italic; font-size: 0.9rem;"
              );
            `,
          }}
        />
        <RegisterServiceWorker />
        <div id="fb-root"></div>
        <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.fbAsyncInit = function() {
              FB.init({,
                appId      : '352947546661410',
                cookie     : true,
                xfbml      : true,
                version    : 'v18.0'
              });
            };
          `
        }} />

        <script src="https://accounts.google.com/gsi/client" async defer></script>

        <SettingsProvider>
          <SettingsHead />
          <LanguageProvider>
            {children}
            <Toaster position="top-center" reverseOrder={false} />
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
