import type { Metadata } from 'next';
import LeaderboardContent from './LeaderboardContent';

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'See the top Beatdle players ranked by win streak and total games won. Can you make it to the top?',
  openGraph: {
    title: 'Beatdle Leaderboard',
    description: 'See the top players ranked by win streak and total games won.',
    url: '/leaderboard',
  },
  twitter: {
    title: 'Beatdle Leaderboard',
    description: 'See the top players ranked by win streak and total games won.',
  },
};

export default function LeaderboardPage() {
  return <LeaderboardContent />;
}
