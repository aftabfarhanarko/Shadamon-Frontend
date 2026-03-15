import { MetadataRoute } from 'next';
import { API_BASE_URL } from '../utils/apiConfig';
import { getImageUrl } from '../utils/imageUrl';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let siteFavicon = '/favicon.ico';
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/dashboard`, { 
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000) 
    });
    const data = await res.json();
    if (data.success && data.data?.favIcon) {
      siteFavicon = getImageUrl(data.data.favIcon) || siteFavicon;
    }
  } catch (e) {
    console.warn("Using fallback favicon for manifest", e);
  }

  return {
    name: 'Shadamon',
    short_name: 'Shadamon',
    description: 'The ultimate marketing platform',
    start_url: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    background_color: '#ffffff',
    theme_color: '#0088cc',
    orientation: 'portrait',
    scope: '/',
    prefer_related_applications: false,
    icons: [
      {
        src: siteFavicon,
        sizes: 'any',
        type: 'image/x-icon',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }
    ],
  };
}
