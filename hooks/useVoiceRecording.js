import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

export function useVoiceRecording(onTranscriptionComplete, setIsVoiceProcessing) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const silenceTimer = useRef(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const audioStream = useRef(null);
  const animationFrame = useRef(null);
  //normalized threshold (~2% average deviation from center)
  const silenceThresholdNormalized = 0.02;
  const silenceDuration = 3000;
  const lowVolumePromptDuration = 10000; 
  const lowVolumeStartTime = useRef(null);
  const hasPromptedLowVolume = useRef(false);
  const inactivityFallbackTimer = useRef(null);
  const isRecordingRef = useRef(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      audioContext.current = new AudioContext();
      const source = audioContext.current.createMediaStreamSource(stream);
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 2048;
      source.connect(analyser.current);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      isRecordingRef.current = true;
      if (inactivityFallbackTimer.current) clearTimeout(inactivityFallbackTimer.current);
      inactivityFallbackTimer.current = setTimeout(async () => {
        if (isRecordingRef.current) {
          if (!hasPromptedLowVolume.current) {
            hasPromptedLowVolume.current = true;
            toast.info('Try speaking louder or closer to the mic');
          }
          try {
            await stopAndProcess();
          } catch (_) {
            // no-op
          }
        }
      }, 12000);
      detectSilence();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAndProcess = () => {
      return new Promise((resolve) => {
        mediaRecorder.current.onstop = async () => {
          setIsVoiceProcessing(true)
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          try {
            const response = await fetch('/api/speech-to-text', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) throw new Error('Failed to convert speech to text');

            const data = await response.json();
            if (onTranscriptionComplete) {
              onTranscriptionComplete(data.text);
            }
            setIsVoiceProcessing(false)
            resolve(data.text);
          } catch (error) {
            console.error('Error converting speech to text:', error);
            setIsVoiceProcessing(false)

            if (onTranscriptionComplete) {
              onTranscriptionComplete(null);
            }
            resolve(null);
          } finally {
            setIsVoiceProcessing(false)

            mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
            cleanUpAudio();
            setIsProcessing(false);
          isRecordingRef.current = false;
            lowVolumeStartTime.current = null;
            hasPromptedLowVolume.current = false;
          }
        };

        mediaRecorder.current.stop();
        setIsRecording(false);
      isRecordingRef.current = false;
      });
  };

  const stopAndDiscard = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsProcessing(false);
      audioChunks.current = [];
      cleanUpAudio();
    }
  };

  const cleanUpAudio = () => {
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
    audioStream.current = null;
    analyser.current = null;
    clearTimeout(silenceTimer.current);
    if (inactivityFallbackTimer.current) {
      clearTimeout(inactivityFallbackTimer.current);
      inactivityFallbackTimer.current = null;
    }
    lowVolumeStartTime.current = null;
    hasPromptedLowVolume.current = false;
  };

  const detectSilence = () => {
    if (!analyser.current) return;

    const bufferLength = analyser.current.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyser.current.getByteTimeDomainData(dataArray);
    const sum = dataArray.reduce((a, b) => a + Math.abs(b - 128), 0);
    const avgLevel = sum / bufferLength;
    const avgLevelNormalized = avgLevel / 128; // 0..1

    if (avgLevelNormalized < silenceThresholdNormalized) {
      if (!silenceTimer.current) {
        silenceTimer.current = setTimeout(async () => {
          await stopAndProcess();
        }, silenceDuration);
      }

      if (!lowVolumeStartTime.current) {
        lowVolumeStartTime.current = Date.now();
      } else {
        const elapsed = Date.now() - lowVolumeStartTime.current;
        if (elapsed >= lowVolumePromptDuration && !hasPromptedLowVolume.current) {
          hasPromptedLowVolume.current = true;
          toast.info('Try speaking louder or closer to the mic');
        }
      }
    } else {
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = null;
      }
      lowVolumeStartTime.current = null;
      hasPromptedLowVolume.current = false;
    }

    animationFrame.current = requestAnimationFrame(detectSilence);
  };

  useEffect(() => {
    return () => {
      stopAndDiscard();
    };
  }, []);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopAndProcess,
    stopAndDiscard,
  };
}
