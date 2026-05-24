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
                // Update all icon links (rel="icon" and rel="shortcut icon")
                const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel='icon'], link[rel='shortcut icon']");
                if (iconLinks.length > 0) {
                    iconLinks.forEach(link => { link.href = iconUrl; });
                } else {
                    const link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                    link.href = iconUrl;
                }

                // Update all apple-touch-icon links
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

    return null;
}
