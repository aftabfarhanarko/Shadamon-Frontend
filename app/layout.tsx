import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./context/LanguageContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Shadamon User",
  description: "The ultimate marketing platform",
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
        <meta name="theme-color" content="#0088cc" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`antialiased`}
      >
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

            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
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
