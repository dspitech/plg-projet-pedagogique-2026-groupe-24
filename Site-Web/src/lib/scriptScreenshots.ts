import { supabase } from '@/integrations/supabase/client';

export const SCRIPT_SCREENSHOTS_BUCKET = 'script-screenshots';

export function isHttpUrl(v: string) {
  return /^https?:\/\//i.test(v);
}

export async function signScreenshotPaths(
  pathsOrUrls: string[],
  expiresInSeconds = 60 * 60,
): Promise<(string | null)[]> {
  return Promise.all(pathsOrUrls.map(async (p) => {
    if (!p) return null;
    if (isHttpUrl(p)) return p; // legacy stored URL
    const { data, error } = await supabase.storage
      .from(SCRIPT_SCREENSHOTS_BUCKET)
      .createSignedUrl(p, expiresInSeconds);
    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  }));
}

