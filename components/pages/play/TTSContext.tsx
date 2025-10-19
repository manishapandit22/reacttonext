import React, {useEffect, createContext, useContext, useState, useRef, useCallback } from 'react';

const TTSContext = createContext();

export const useTTS = () => {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
};

export const TTSProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [ttsStatus, setTtsStatus] = useState('idle'); // 'idle', 'loading', 'playing', 'error', 'completed'
  const [error, setError] = useState(null);
  
  const [onTTSComplete, setOnTTSComplete] = useState(null);
  
  const processingRef = useRef(false);
  const playedRequests = useRef(new Set());
  const autoRecordingTimeoutRef = useRef(null);
  const audioCache = useRef(new Map()); 
  const audioUrlCache = useRef(new Map()); 
  const pendingRequests = useRef(new Map());
  const retryCount = useRef(new Map());
  const timeoutRefs = useRef(new Map());
  const maxRetries = 3;
  const audioTimeout = 30000; // 30 seconds timeout for audio loading
  const playbackTimeout = 300000; // 5 minutes timeout for audio playback 

  const addToQueue = useCallback((ttsRequest) => {
    const isAlreadyInQueue = queue.some(item => item.id === ttsRequest.id);
    const isCurrentlyPlaying = currentRequestId === ttsRequest.id;
    const wasPlayed = playedRequests.current.has(ttsRequest.id);
    const isAuto = !!(ttsRequest.meta && ttsRequest.meta.auto);
    if (isAuto && wasPlayed) {
      return;
    }
    if (!isAlreadyInQueue && !isCurrentlyPlaying) {
      setQueue(prev => {
        const stillNotInQueue = !prev.some(item => item.id === ttsRequest.id);
        if (stillNotInQueue) {
          return [...prev, ttsRequest];
        }
        return prev;
      });
      setTtsStatus('loading');
      setError(null);
    }
  }, [queue, currentRequestId]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    if (currentAudio) {
      currentAudio.pause();
    }
    setCurrentAudio(null);
    setIsPlaying(false);
    setIsProcessing(false);
    setCurrentRequestId(null);
    setTtsStatus('idle');
    setError(null);
    processingRef.current = false;
    playedRequests.current.clear();
    
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    
    audioCache.current.forEach(audio => {
      if (!audio.paused) audio.pause();
    });
    audioCache.current.clear();
    
    audioUrlCache.current.forEach(url => {
      URL.revokeObjectURL(url);
    });
    audioUrlCache.current.clear();
    
    pendingRequests.current.clear();
    retryCount.current.clear();
    
    if (autoRecordingTimeoutRef.current) {
      clearTimeout(autoRecordingTimeoutRef.current);
      autoRecordingTimeoutRef.current = null;
    }
  }, [currentAudio]);

  const setTTSCompleteCallback = useCallback((callback) => {
    setOnTTSComplete(() => callback);
  }, []);

  const cleanupAudio = useCallback((audioElement) => {
    if (audioElement) {
      try {
        audioElement.pause();
        audioElement.currentTime = 0;
      } catch (_) {}
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0) return;
    
    processingRef.current = true;
    setIsProcessing(true);
    setTtsStatus('loading');
    
    const currentRequest = queue[0];
    setQueue(prev => prev.slice(1));
    setCurrentRequestId(currentRequest.id);

    try {
      if (currentAudio) {
        cleanupAudio(currentAudio);
      }

      let audioElement;
      
      if (audioCache.current.has(currentRequest.id)) {
        audioElement = audioCache.current.get(currentRequest.id);
        try { audioElement.currentTime = 0; } catch (_) {}
        setTtsStatus('playing');
      } else {
        if (pendingRequests.current.has(currentRequest.id)) {
          audioElement = await pendingRequests.current.get(currentRequest.id);
        } else {
          const pendingAudio = currentRequest.processAudio();
          pendingRequests.current.set(currentRequest.id, pendingAudio);
          
          const loadTimeout = setTimeout(() => {
            console.error('Audio loading timeout');
            setError('Audio loading timeout');
            setTtsStatus('error');
            processingRef.current = false;
            setIsProcessing(false);
            playedRequests.current.add(currentRequest.id);
            pendingRequests.current.delete(currentRequest.id);
            setTimeout(() => processQueue(), 100);
          }, audioTimeout);
          
          timeoutRefs.current.set(currentRequest.id, loadTimeout);
          
          try {
            audioElement = await pendingAudio;
            clearTimeout(loadTimeout);
            timeoutRefs.current.delete(currentRequest.id);
            
            audioCache.current.set(currentRequest.id, audioElement);
            if (audioElement.src && audioElement.src.startsWith('blob:')) {
              audioUrlCache.current.set(currentRequest.id, audioElement.src);
            }
            
            pendingRequests.current.delete(currentRequest.id);
          } catch (error) {
            clearTimeout(loadTimeout);
            timeoutRefs.current.delete(currentRequest.id);
            throw error;
          }
        }
      }
      
      setCurrentAudio(audioElement);
      setIsPlaying(true);
      setTtsStatus('playing');

      const onEnded = () => {
        audioElement.removeEventListener('ended', onEnded);
        audioElement.removeEventListener('error', onError);
        audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
        audioElement.removeEventListener('loadstart', onLoadStart);
        audioElement.removeEventListener('loadeddata', onLoadedData);
        audioElement.removeEventListener('progress', onProgress);
        
        setIsPlaying(false);
        setCurrentAudio(null);
        setCurrentRequestId(null);
        processingRef.current = false;
        setIsProcessing(false);
        setTtsStatus('completed');
        playedRequests.current.add(currentRequest.id);
        
        const playbackTimeoutId = timeoutRefs.current.get(`${currentRequest.id}_playback`);
        if (playbackTimeoutId) {
          clearTimeout(playbackTimeoutId);
          timeoutRefs.current.delete(`${currentRequest.id}_playback`);
        }
        
        // Do NOT clear src; keep cached for replay
        cleanupAudio(audioElement);
        
        setTimeout(() => {
          setQueue(currentQueue => {
            if (currentQueue.length === 0) {
              setTtsStatus('idle');
              autoRecordingTimeoutRef.current = setTimeout(() => {
                if (onTTSComplete) {
                  onTTSComplete();
                }
              }, 1000);
            } else {
              processQueue();
            }
            return currentQueue;
          });
        }, 0);
      };

      const onError = (error) => {
        audioElement.removeEventListener('ended', onEnded);
        audioElement.removeEventListener('error', onError);
        audioElement.removeEventListener('canplaythrough', onCanPlayThrough);
        audioElement.removeEventListener('loadstart', onLoadStart);
        audioElement.removeEventListener('loadeddata', onLoadedData);
        audioElement.removeEventListener('progress', onProgress);
        
        console.error('Audio playback error:', error);
        setError(`Playback error: ${error && error.message ? error.message : 'Unknown error'}`);
        setTtsStatus('error');
        setIsPlaying(false);
        setCurrentAudio(null);
        setCurrentRequestId(null);
        processingRef.current = false;
        setIsProcessing(false);
        
        const loadTimeoutId = timeoutRefs.current.get(currentRequest.id);
        const playbackTimeoutId = timeoutRefs.current.get(`${currentRequest.id}_playback`);
        if (loadTimeoutId) clearTimeout(loadTimeoutId);
        if (playbackTimeoutId) clearTimeout(playbackTimeoutId);
        timeoutRefs.current.delete(currentRequest.id);
        timeoutRefs.current.delete(`${currentRequest.id}_playback`);
        
        const currentRetryCount = retryCount.current.get(currentRequest.id) || 0;
        if (currentRetryCount < maxRetries) {
          retryCount.current.set(currentRequest.id, currentRetryCount + 1);
          setTimeout(() => {
            setQueue(prev => [currentRequest, ...prev]);
            processQueue();
          }, 1000 * (currentRetryCount + 1));
        } else {
          playedRequests.current.add(currentRequest.id);
          setTimeout(() => processQueue(), 100);
        }
        
        // Do NOT clear src; keep cached for replay
        cleanupAudio(audioElement);
      };

      const onCanPlayThrough = () => {
        setTtsStatus('playing');
      };

      const onLoadStart = () => {
        setTtsStatus('loading');
      };

      const onLoadedData = () => {
        setTtsStatus('loading');
      };

      const onProgress = () => {
        setTtsStatus('loading');
      };

      audioElement.addEventListener('ended', onEnded);
      audioElement.addEventListener('error', onError);
      audioElement.addEventListener('canplaythrough', onCanPlayThrough);
      audioElement.addEventListener('loadstart', onLoadStart);
      audioElement.addEventListener('loadeddata', onLoadedData);
      audioElement.addEventListener('progress', onProgress);
      
      const playbackTimeoutId = setTimeout(() => {
        setError('Audio playback timeout');
        onError(new Error('Playback timeout'));
      }, playbackTimeout);
      timeoutRefs.current.set(`${currentRequest.id}_playback`, playbackTimeoutId);
      
      try {
        await audioElement.play();
      } catch (playError) {
        onError(playError);
      }
    } catch (error) {
      setError(`Processing error: ${error.message || 'Unknown error'}`);
      setTtsStatus('error');
      setCurrentRequestId(null);
      processingRef.current = false;
      setIsProcessing(false);
      
      const loadTimeoutId = timeoutRefs.current.get(currentRequest.id);
      if (loadTimeoutId) {
        clearTimeout(loadTimeoutId);
        timeoutRefs.current.delete(currentRequest.id);
      }
      
      const currentRetryCount = retryCount.current.get(currentRequest.id) || 0;
      if (currentRetryCount < maxRetries) {
        retryCount.current.set(currentRequest.id, currentRetryCount + 1);
        setTimeout(() => {
          setQueue(prev => [currentRequest, ...prev]);
          processQueue();
        }, 1000 * (currentRetryCount + 1));
      } else {
        playedRequests.current.add(currentRequest.id);
        setTimeout(() => processQueue(), 100);
      }
      
      pendingRequests.current.delete(currentRequest.id);
    }
  }, [queue, currentAudio, onTTSComplete, cleanupAudio, audioTimeout, playbackTimeout, maxRetries]);

  useEffect(() => {
    if (queue.length > 0 && !processingRef.current) {
      processQueue();
    }
  }, [queue, processQueue]);

  const stopCurrent = useCallback(() => {
    if (currentAudio && isPlaying) {
      cleanupAudio(currentAudio);
      setIsPlaying(false);
      setCurrentAudio(null);
      setCurrentRequestId(null);
      processingRef.current = false;
      setIsProcessing(false);
      setTtsStatus('idle');
    }
    
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    
    if (autoRecordingTimeoutRef.current) {
      clearTimeout(autoRecordingTimeoutRef.current);
      autoRecordingTimeoutRef.current = null;
    }
  }, [currentAudio, isPlaying, cleanupAudio]);

  const isRequestPlaying = useCallback((requestId) => {
    return currentRequestId === requestId && isPlaying;
  }, [currentRequestId, isPlaying]);

  const isRequestCached = useCallback((requestId) => {
    return audioCache.current.has(requestId) || audioUrlCache.current.has(requestId);
  }, []);

  const isRequestPending = useCallback((requestId) => {
    return pendingRequests.current.has(requestId);
  }, []);

  const isRequestPlayed = useCallback((requestId) => {
    return playedRequests.current.has(requestId);
  }, []);

  const toggleRequest = useCallback((ttsRequest) => {
    const isAuto = !!(ttsRequest.meta && ttsRequest.meta.auto);
    if (isAuto && playedRequests.current.has(ttsRequest.id)) {
      return;
    }
    if (currentRequestId === ttsRequest.id && isPlaying) {
      stopCurrent();
    } else {
      setQueue([]);
      if (currentAudio && currentRequestId !== ttsRequest.id) {
        cleanupAudio(currentAudio);
        setCurrentAudio(null);
        setCurrentRequestId(null);
        processingRef.current = false;
        setIsProcessing(false);
        setTtsStatus('idle');
      }
      
      setTimeout(() => {
        addToQueue(ttsRequest);
      }, 0);
    }
  }, [currentRequestId, isPlaying, stopCurrent, currentAudio, addToQueue, cleanupAudio]);

  useEffect(() => {
    return () => {
      if (autoRecordingTimeoutRef.current) {
        clearTimeout(autoRecordingTimeoutRef.current);
      }
      
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      timeoutRefs.current.clear();
      
      audioCache.current.forEach(audio => {
        cleanupAudio(audio);
      });
      audioCache.current.clear();
      
      audioUrlCache.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
      audioUrlCache.current.clear();
      
      pendingRequests.current.clear();
      retryCount.current.clear();
    };
  }, [cleanupAudio]);

  const value = {
    isPlaying,
    isProcessing,
    queueLength: queue.length,
    addToQueue,
    clearQueue,
    stopCurrent,
    currentAudio,
    currentRequestId,
    setTTSCompleteCallback,
    isRequestPlaying, 
    toggleRequest,
    isRequestCached,
    isRequestPending,
    isRequestPlayed,
    ttsStatus,
    error,
    clearError: () => setError(null),
  };

  return (
    <TTSContext.Provider value={value}>
      {children}
    </TTSContext.Provider>
  );
};