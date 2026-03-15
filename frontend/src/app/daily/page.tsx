import type { Metadata } from 'next';
import DailyGame from './DailyGame';

export const metadata: Metadata = {
  title: 'Daily Challenge',
  description: 'Play today\'s Beatdle daily music challenge. Listen to a snippet and guess the song in up to 5 tries. A new song every day!',
  openGraph: {
    title: 'Beatdle Daily Challenge',
    description: 'A new song every day. Can you guess it in 5 tries?',
    url: '/daily',
  },
  twitter: {
    title: 'Beatdle Daily Challenge',
    description: 'A new song every day. Can you guess it in 5 tries?',
  },
};

export default function DailyPage() {
  return <DailyGame />;
}
