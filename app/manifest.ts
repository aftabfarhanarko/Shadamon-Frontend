import { MetadataRoute } from 'next';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.shadamon.com';

function buildIconUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  let favIconUrl: string | null = null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/settings/dashboard`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data?.success && data?.data?.favIcon) {
      favIconUrl = buildIconUrl(data.data.favIcon);
    }
  } catch {}

  const iconSrc = favIconUrl || '/web-app-manifest-192x192.png';
  const iconType = iconSrc.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i)
    ? `image/${iconSrc.match(/\.(\w+)$/)?.[1]?.toLowerCase().replace('jpg', 'jpeg') || 'png'}`
    : 'image/png';

  return {
    name: 'Shadamon',
    short_name: 'Shadamon',
    description: 'The ultimate marketing platform',
    start_url: '/d',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    background_color: '#ffffff',
    theme_color: '#ffffff',
    orientation: 'portrait',
    scope: '/',
    prefer_related_applications: false,
    icons: [
      {
        src: iconSrc,
        sizes: '192x192',
        type: iconType,
        purpose: 'any',
      },
      {
        src: iconSrc,
        sizes: '192x192',
        type: iconType,
        purpose: 'maskable',
      },
      {
        src: iconSrc,
        sizes: '512x512',
        type: iconType,
        purpose: 'any',
      },
      {
        src: iconSrc,
        sizes: '512x512',
        type: iconType,
        purpose: 'maskable',
      },
    ],
  };
}
