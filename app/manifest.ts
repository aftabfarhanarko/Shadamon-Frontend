import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
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
        src: '/hc.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/hc.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/hc.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/hc.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
