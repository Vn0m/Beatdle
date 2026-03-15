import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beatdle-app.onrender.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/multiplayer/', '/profile/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
