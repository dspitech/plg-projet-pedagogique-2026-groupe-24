export type LocationSource = 'gps' | 'ip' | 'profile' | 'timezone';

export interface ResolvedLocation {
  city: string | null;
  country: string | null;
  postalCode: string | null;
  region: string | null;
  timezone: string;
  source: LocationSource;
  /** Ligne principale : ville, code postal */
  line1: string;
  /** Ligne secondaire : région, pays */
  line2: string;
}

const CACHE_KEY = 'ash:user-location-v1';
const CACHE_TTL_MS = 60 * 60 * 1000;

type ProfileHint = { city?: string | null; country?: string | null; address?: string | null };

function buildLines(parts: {
  city?: string | null;
  postalCode?: string | null;
  region?: string | null;
  country?: string | null;
}): { line1: string; line2: string } {
  const cityPart = [parts.city, parts.postalCode].filter(Boolean).join(', ');
  const countryPart = [parts.region, parts.country].filter(Boolean).join(' · ');
  return {
    line1: cityPart || parts.country || parts.region || 'Emplacement inconnu',
    line2: countryPart && cityPart ? countryPart : parts.country || '',
  };
}

function fromProfile(profile?: ProfileHint): ResolvedLocation | null {
  if (!profile?.city && !profile?.country) return null;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Local';
  const { line1, line2 } = buildLines({
    city: profile.city,
    country: profile.country,
  });
  return {
    city: profile.city ?? null,
    country: profile.country ?? null,
    postalCode: null,
    region: null,
    timezone: tz,
    source: 'profile',
    line1,
    line2,
  };
}

function fromTimezone(): ResolvedLocation {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Local';
  const label = tz.replace(/_/g, ' ');
  return {
    city: null,
    country: null,
    postalCode: null,
    region: null,
    timezone: tz,
    source: 'timezone',
    line1: label,
    line2: 'Fuseau horaire navigateur',
  };
}

async function reverseGeocode(lat: number, lon: number): Promise<Partial<ResolvedLocation>> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'json');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('zoom', '12');
  url.searchParams.set('addressdetails', '1');

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'fr',
    },
  });
  if (!res.ok) throw new Error('reverse geocode failed');
  const data = await res.json();
  const a = data.address ?? {};
  const city =
    a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? a.state_district ?? null;
  const country = a.country ?? null;
  const postalCode = a.postcode ?? null;
  const region = a.state ?? a.region ?? null;
  const { line1, line2 } = buildLines({ city, postalCode, region, country });
  return {
    city,
    country,
    postalCode,
    region,
    line1,
    line2,
  };
}

function getGpsPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 12_000,
      maximumAge: CACHE_TTL_MS,
    });
  });
}

async function fetchByIp(): Promise<Partial<ResolvedLocation>> {
  const res = await fetch('https://ipwho.is/?lang=fr');
  if (!res.ok) throw new Error('ip lookup failed');
  const data = await res.json();
  if (!data.success) throw new Error('ip lookup unsuccessful');
  const city = data.city ?? null;
  const country = data.country ?? null;
  const postalCode = data.postal ?? data.postal_code ?? null;
  const region = data.region ?? null;
  const { line1, line2 } = buildLines({ city, postalCode, region, country });
  return { city, country, postalCode, region, line1, line2 };
}

function readCache(): ResolvedLocation | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: ResolvedLocation };
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: ResolvedLocation) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* ignore quota */
  }
}

/** Résout ville, code postal, pays (GPS → IP → profil → fuseau). */
export async function resolveUserLocation(profile?: ProfileHint): Promise<ResolvedLocation> {
  const cached = readCache();
  if (cached) return cached;

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Local';

  try {
    const pos = await getGpsPosition();
    const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
    const result: ResolvedLocation = {
      city: geo.city ?? null,
      country: geo.country ?? null,
      postalCode: geo.postalCode ?? null,
      region: geo.region ?? null,
      timezone: tz,
      source: 'gps',
      line1: geo.line1 ?? fromTimezone().line1,
      line2: geo.line2 ?? '',
    };
    writeCache(result);
    return result;
  } catch {
    /* GPS refusé ou indisponible */
  }

  try {
    const ip = await fetchByIp();
    const result: ResolvedLocation = {
      city: ip.city ?? null,
      country: ip.country ?? null,
      postalCode: ip.postalCode ?? null,
      region: ip.region ?? null,
      timezone: tz,
      source: 'ip',
      line1: ip.line1 ?? fromTimezone().line1,
      line2: ip.line2 ?? '',
    };
    writeCache(result);
    return result;
  } catch {
    /* réseau */
  }

  const fromProf = fromProfile(profile);
  if (fromProf) {
    writeCache(fromProf);
    return fromProf;
  }

  const fallback = fromTimezone();
  writeCache(fallback);
  return fallback;
}

export function getTimezoneShort(date: Date, timeZone: string): string {
  try {
    const part = new Intl.DateTimeFormat('fr-FR', {
      timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}
