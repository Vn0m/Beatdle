import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://beatdle-app.onrender.com'),
  title: {
    default: "Beatdle - Daily Music Guessing Game",
    template: "%s | Beatdle"
  },
  description: "Test your music knowledge with Beatdle! Listen to audio snippets and guess the song in 5 tries. Play the daily challenge solo or compete with friends in real-time multiplayer. New songs daily!",
  keywords: ["music game", "wordle", "music quiz", "spotify", "guess the song", "daily challenge", "multiplayer game", "music trivia"],
  authors: [{ name: "Beatdle" }],
  creator: "Beatdle",
  publisher: "Beatdle",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Beatdle",
    title: "Beatdle - Daily Music Guessing Game",
    description: "Test your music knowledge with Beatdle! Listen to audio snippets and guess the song in 5 tries.",
    images: [
      {
        url: "/Beatdle_Logo.png",
        width: 1200,
        height: 630,
        alt: "Beatdle Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Beatdle - Daily Music Guessing Game",
    description: "Test your music knowledge with Beatdle! Listen to audio snippets and guess the song in 5 tries.",
    images: ["/Beatdle_Logo.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/Beatdle_Logo.png",
    apple: "/Beatdle_Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  
  return (
    <html lang="en">
      <head>
        {adsenseClientId && (
          <>
            <meta name="google-adsense-account" content={adsenseClientId} />
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
              crossOrigin="anonymous"
              strategy="lazyOnload"
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
