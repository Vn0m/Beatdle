import { useEffect, useRef, useState } from 'react';

interface AdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdUnit({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = '',
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !adSlot || adLoaded) {
      return;
    }

    // Check if the element is visible and has width before loading ad
    const checkAndLoadAd = () => {
      if (adRef.current) {
        const rect = adRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
          } catch (error) {
            console.error('Error loading ad:', error);
          }
        }
      }
    };

    // Delay to ensure layout is ready
    const timer = setTimeout(checkAndLoadAd, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [clientId, adSlot, adLoaded]);

  if (!clientId || !adSlot) {
    return null;
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={style}
      data-ad-client={clientId}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}
