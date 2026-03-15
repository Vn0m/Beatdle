import type { Metadata } from 'next';
import CustomGame from './CustomGame';

export const metadata: Metadata = {
  title: 'Custom Game',
  description: 'Create a custom Beatdle game. Filter by genre, artist, or decade and challenge yourself with songs you love. Play solo with up to 15 rounds.',
  openGraph: {
    title: 'Beatdle Custom Game',
    description: 'Filter by genre, artist, or decade and challenge yourself. Up to 15 rounds.',
    url: '/custom',
  },
  twitter: {
    title: 'Beatdle Custom Game',
    description: 'Filter by genre, artist, or decade and challenge yourself. Up to 15 rounds.',
  },
};

export default function CustomPage() {
  return <CustomGame />;
}
