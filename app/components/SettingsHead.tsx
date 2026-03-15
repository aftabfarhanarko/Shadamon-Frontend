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
                // Update favicon
                let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = iconUrl;

                // Update apple-touch-icon
                let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
                if (!appleLink) {
                    appleLink = document.createElement('link');
                    appleLink.rel = 'apple-touch-icon';
                    document.getElementsByTagName('head')[0].appendChild(appleLink);
                }
                appleLink.href = iconUrl;
            }
        }
    }, [settings.favIcon]);

    return null;
}
