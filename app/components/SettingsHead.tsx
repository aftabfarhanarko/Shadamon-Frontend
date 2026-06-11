"use client";

import { useEffect } from "react";
import { useSettings } from "../context/SettingsContext";
import { getImageUrl } from "../../utils/imageUrl";

export default function SettingsHead() {
    const { settings } = useSettings();

    useEffect(() => {
        if (settings.favIcon) {
            const iconUrl = getImageUrl(settings.favIcon);
            if (iconUrl) {
                const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon']");
                if (iconLinks.length > 0) {
                    iconLinks.forEach(link => { link.href = iconUrl; });
                } else {
                    const link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                    link.href = iconUrl;
                }

                const appleLinks = document.querySelectorAll<HTMLLinkElement>("link[rel='apple-touch-icon']");
                if (appleLinks.length > 0) {
                    appleLinks.forEach(link => { link.href = iconUrl; });
                } else {
                    const appleLink = document.createElement('link');
                    appleLink.rel = 'apple-touch-icon';
                    document.head.appendChild(appleLink);
                    appleLink.href = iconUrl;
                }
            }
        }
    }, [settings.favIcon]);

    useEffect(() => {
        if (settings.ogImage) {
            const ogUrl = getImageUrl(settings.ogImage);
            if (ogUrl) {
                const setMetaContent = (selector: string, content: string) => {
                    const el = document.querySelector<HTMLMetaElement>(selector);
                    if (el) {
                        el.content = content;
                    } else {
                        const meta = document.createElement('meta');
                        const [attr, val] = selector.includes('property')
                            ? ['property', selector.match(/\[property="([^"]+)"\]/)?.[1] || '']
                            : ['name', selector.match(/\[name="([^"]+)"\]/)?.[1] || ''];
                        meta.setAttribute(attr, val);
                        meta.content = content;
                        document.head.appendChild(meta);
                    }
                };
                setMetaContent('meta[property="og:image"]', ogUrl);
                setMetaContent('meta[name="twitter:image"]', ogUrl);
            }
        }
    }, [settings.ogImage]);

    return null;
}
