import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SRM Academic Suite',
    short_name: 'SRM Suite',
    description: 'Track SGPA, CGPA, predict grades, and import ERP results — built for SRM students.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/window.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/window.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
