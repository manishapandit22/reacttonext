import React from 'react';
import { useVoices } from '@/hooks/useVoices';
import { toast } from 'react-toastify';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  label?: string;
  showPreview?: boolean;
  previewText?: string;
}

const DEFAULT_SNIPPET = 'welcome creator, my voice will tell your story';

/**
 * Reusable VoiceSelector component for selecting and previewing ElevenLabs voices
 */
const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceChange,
  label = 'Select Voice',
  showPreview = true,
  previewText = DEFAULT_SNIPPET
}) => {
  const { voices, grouped, loading, error, refetch } = useVoices();
  const [previewing, setPreviewing] = React.useState(false);

  // Browser-safe helper to convert ArrayBuffer to base64
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
    const voiceId = selectedVoice || (voices.length > 0 ? voices[0].voice_id : '');
    if (!voiceId) {
      toast.error('No voice selected');
      return;
    }

    try {
      setPreviewing(true);
      // Try cached preview first
      const cacheKey = `tts_preview_${voiceId}`;
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
        body: JSON.stringify({ text: previewText, voice_id: voiceId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'TTS failed' }));
        throw new Error(err.error || 'TTS failed');
      }

      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const b64 = arrayBufferToBase64(arrayBuffer);
      try { localStorage.setItem(cacheKey, b64); } catch (e) { /* ignore */ }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (e: any) {
      console.error('Preview error', e);
      toast.error('Preview failed: ' + (e.message || e));
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="block text-[15px] font-medium mb-2 text-accent">{label}</label>
      <div className="flex gap-2">
        <select
          className="flex-1 p-2 border rounded-lg bg-white dark:bg-jacarta-700 dark:text-white"
          value={selectedVoice}
          onChange={e => onVoiceChange(e.target.value)}
          aria-label={label}
        >
          {loading ? (
            <option>Loading voices...</option>
          ) : Object.entries(grouped).length === 0 ? (
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
        {showPreview && (
          <button
            type="button"
            onClick={handlePreview}
            className="btn btn-primary px-4 py-2"
            disabled={!!error || loading || previewing || voices.length === 0}
            aria-disabled={!!error || loading || previewing || voices.length === 0}
            title={voices.length === 0 ? 'No voices loaded' : 'Preview voice'}
          >
            {previewing ? '...' : 'Preview'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-400">
          <div>Unable to load voices: {error}</div>
          <div className="mt-2">
            <button onClick={refetch} className="px-3 py-1 bg-indigo-600 text-white rounded">Retry</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;

