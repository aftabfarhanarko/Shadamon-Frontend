import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "react-hot-toast";
import RegisterServiceWorker from "@/components/RegisterServiceWorker"

export const metadata: Metadata = {
  title: "Shadamon",
  description: "The ultimate marketing platform",
  other: {

  },
};

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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="google-site-verification" content="google971854131468af49.htm" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shadamon" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shadamon" />
        <meta name="description" content="The ultimate marketing platform" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2B5797" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />

        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://shadamon.com" />
        <meta name="twitter:title" content="Shadamon" />
        <meta name="twitter:description" content="The ultimate marketing platform" />
        <meta name="twitter:image" content="https://shadamon.com/icons/android-chrome-192x192.png" />
        <meta name="twitter:creator" content="@shadamon" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Shadamon" />
        <meta property="og:description" content="Shadamon official website" />
        <meta property="og:site_name" content="Shadamon" />
        <meta property="og:url" content="https://shadamon.com" />
        <meta property="og:image" content="https://shadamon.com/og-image.jpg" />

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
              FB.init({
                appId      : '${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}',
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
