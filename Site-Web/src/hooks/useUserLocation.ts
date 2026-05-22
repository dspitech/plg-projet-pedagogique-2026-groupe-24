import { useEffect, useState } from 'react';
import { resolveUserLocation, type ResolvedLocation } from '@/lib/userLocation';

type ProfileHint = { city?: string | null; country?: string | null; address?: string | null };

export function useUserLocation(profile?: ProfileHint) {
  const [location, setLocation] = useState<ResolvedLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    resolveUserLocation(profile).then((loc) => {
      if (active) {
        setLocation(loc);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [profile?.city, profile?.country, profile?.address]);

  return { location, loading };
}
