import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface SelectNarratorProps {
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
}

type ElevenVoice = {
  voice_id: string;
  name: string;
  labels?: Record<string, string>;
}

const DEFAULT_SNIPPET = 'welcome creator, my voice will tell your story';

const SelectNarrator: React.FC<SelectNarratorProps> = ({ selectedVoice, setSelectedVoice }) => {
  const [voices, setVoices] = useState<ElevenVoice[]>([]);
  const [grouped, setGrouped] = useState<Record<string, ElevenVoice[]>>({});
  const [loading, setLoading] = useState(false);
  const [snippet, setSnippet] = useState(() => {
    try {
      return localStorage.getItem('tts_default_snippet') || DEFAULT_SNIPPET;
    } catch (e) { return DEFAULT_SNIPPET; }
  });
  const [presets, setPresets] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('tts_snippet_presets') || '[]'); } catch (e) { return []; }
  });

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
      const list: ElevenVoice[] = (data.voices || []).map((v: any) => ({ voice_id: v.voice_id, name: v.name, labels: v.labels || {} }));
      setVoices(list);

      // group by label (accent+gender) or fallback to 'Other'
      const g = list.reduce((acc, v) => {
        const accent = v.labels?.accent || 'Other';
        const gender = v.labels?.gender || 'Voice';
        const key = `${accent} ${gender}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(v);
        return acc;
      }, {} as Record<string, ElevenVoice[]>);
      setGrouped(g);

      if (!selectedVoice && list.length > 0) setSelectedVoice(list[0].voice_id);
    } catch (err: any) {
      console.error('SelectNarrator fetch error', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    // run fetch on mount
    if (mounted) fetchVoices();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // browser-safe helper to convert ArrayBuffer to base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk) as any);
    }
    return typeof btoa === 'function' ? btoa(binary) : '';
  };

  const handlePreview = async () => {
    if (!selectedVoice) return;
    try {
      setLoading(true);
      // Try cached preview first (per-browser cache to avoid repeated API calls)
      const cacheKey = `tts_preview_${selectedVoice}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const audio = new Audio(`data:audio/mpeg;base64,${cached}`);
          audio.play();
          return;
        }
      } catch (e) {
        // ignore localStorage issues
      }

      const res = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: snippet, voice_id: selectedVoice })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'TTS failed' }));
        throw new Error(err.error || 'TTS failed');
      }

      const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  // convert to base64 for storage
  const b64 = arrayBufferToBase64(arrayBuffer);
  try { localStorage.setItem(cacheKey, b64); } catch (e) { /* ignore */ }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (e) {
      console.error('Preview error', e);
      toast.error('Preview failed: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };
  // NOTE: regeneratePreview removed per UI requirement (avoid duplicate regenerate action)

  const savePreset = () => {
    const next = Array.from(new Set([snippet, ...presets])).slice(0, 10);
    setPresets(next);
    try { localStorage.setItem('tts_snippet_presets', JSON.stringify(next)); } catch (e) {}
  };

  const setDefaultSnippet = () => {
    try { localStorage.setItem('tts_default_snippet', snippet); } catch (e) {}
    toast.success('Default snippet saved');
  };

  return (
    <div className="mb-6">
      <label className="block text-[15px] font-medium mb-2 text-accent">Select Narrator Voice</label>
      <div className="flex gap-2">
        <select
          className="flex-1 p-2 border rounded-lg bg-white dark:bg-jacarta-700 dark:text-white"
          value={selectedVoice}
          onChange={e => setSelectedVoice(e.target.value)}
          aria-label="Select narrator voice"
        >
          {loading ? <option>Loading voices...</option> : Object.entries(grouped).length === 0 ? (
            <option value="">No voices available</option>
          ) : (
            Object.entries(grouped).map(([group, list]) => (
              <optgroup key={group} label={group}>
                {list.map(v => (
                  <option key={v.voice_id} value={v.voice_id}>{v.name}</option>
                ))}
              </optgroup>
            ))
          )}
        </select>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className="btn btn-primary px-3 py-2"
            disabled={!!error || loading || voices.length === 0}
            aria-disabled={!!error || loading || voices.length === 0}
            title={voices.length === 0 ? 'No voices loaded' : 'Preview snippet with selected voice'}
          >
            {loading ? '...' : 'Preview'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-400">
          <div>Unable to load voices: {error}</div>
          <div className="mt-2">
            <button onClick={fetchVoices} className="px-3 py-1 bg-indigo-600 text-white rounded">Retry</button>
          </div>
        </div>
      )}

      <div className="mt-3">
        <label className="block text-sm text-accent mb-1">Snippet (preview)</label>
        <div className="flex gap-2 items-center">
          <textarea
            aria-label="TTS snippet"
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            className="flex-1 p-2 border rounded-lg bg-white dark:bg-jacarta-700/30 text-muted text-sm resize-none h-16"
          />
          <button type="button" onClick={savePreset} className="px-3 py-2 bg-indigo-600 text-white rounded" title="Save this snippet to presets">Save</button>
          <button
            type="button"
            onClick={() => {
              // persist current snippet as default
              try { localStorage.setItem('tts_default_snippet', snippet); } catch (e) {}
              toast.success('Default snippet saved');
            }}
            className="px-3 py-2 bg-gray-600 text-white rounded"
            title="Set this snippet as your default"
          >
            Set Default
          </button>
        </div>
        {presets.length > 0 && (
          <div className="mt-2 flex gap-2 flex-wrap">
            {presets.map(p => (
              <button key={p} onClick={() => setSnippet(p)} className="px-2 py-1 bg-white/5 rounded text-sm">{p.length > 24 ? p.slice(0,24)+'…' : p}</button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        {/* Replace green Set Default button with a checkbox per client request */}
        <label className="flex items-center gap-2 text-sm text-accent/80">
          <input
            type="checkbox"
            checked={(() => {
              try { return localStorage.getItem('tts_save_default_with_draft') === 'true'; } catch (e) { return false; }
            })()}
            onChange={(e) => {
              try { localStorage.setItem('tts_save_default_with_draft', e.target.checked ? 'true' : 'false'); } catch (err) {}
            }}
          />
          <span>Default narrator will be saved with your draft when you save game details.</span>
        </label>
      </div>
    </div>
  );
};

export default SelectNarrator;