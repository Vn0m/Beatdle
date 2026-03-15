import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Beatdle - Daily Music Guessing Game',
  description: 'Test your music knowledge with Beatdle! Listen to audio snippets and guess the song in 5 tries. Play the daily challenge solo or compete with friends in real-time multiplayer. New songs daily!',
  openGraph: {
    title: 'Beatdle - Daily Music Guessing Game',
    description: 'Listen to audio snippets and guess the song in 5 tries. New songs daily!',
    url: '/',
  },
  twitter: {
    title: 'Beatdle - Daily Music Guessing Game',
    description: 'Listen to audio snippets and guess the song in 5 tries. New songs daily!',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Beatdle',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://beatdle-app.onrender.com',
  description: 'A daily music guessing game. Listen to audio snippets and identify the song in up to 5 attempts.',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  genre: 'Music Game',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
