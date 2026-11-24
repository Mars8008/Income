import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nomio',
    short_name: 'Nomio',
    description: 'Өдөр тутмын орлого, зарлага, төсөв, хуримтлалаа хянах',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f4f6',
    theme_color: '#14b2ec',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
