import { useEffect, useState } from 'react';

export type ElevenVoice = {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
};

export type GroupedVoices = Record<string, ElevenVoice[]>;

/**
 * Custom hook to fetch and manage voices from ElevenLabs API
 * @returns Object containing voices, grouped voices, loading state, and error state
 */
export const useVoices = () => {
  const [voices, setVoices] = useState<ElevenVoice[]>([]);
  const [grouped, setGrouped] = useState<GroupedVoices>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoices = async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await fetch('/api/text-to-speech');
      if (!res.ok) {
        let msg = 'Failed to fetch voices';
        try {
          const data = await res.json();
          msg = data?.error || msg;
        } catch (e) {}
        throw new Error(msg);
      }
      const data = await res.json();
      const list: ElevenVoice[] = (data.voices || []).map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name,
        labels: v.labels || {}
      }));
      setVoices(list);

      // Group by label (accent+gender) or fallback to 'Other'
      const g = list.reduce((acc, v) => {
        const accent = v.labels?.accent || 'Other';
        const gender = v.labels?.gender || 'Voice';
        const key = `${accent} ${gender}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(v);
        return acc;
      }, {} as GroupedVoices);
      setGrouped(g);
    } catch (err: any) {
      console.error('useVoices fetch error', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) fetchVoices();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { voices, grouped, loading, error, refetch: fetchVoices };
};

