"use client";
import React, { useState, useEffect, useRef } from 'react';

const GameDuplicationModal = ({ isOpen, onClose, websocketId, newGameId, onComplete }) => {
  const [status, setStatus] = useState('connecting');
  const [message, setMessage] = useState('Connecting to duplication service...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    console.log("GameDuplicationModal props:", { isOpen, websocketId, newGameId });
    
    if (isOpen && websocketId) {
      console.log("Starting WebSocket connection...");
      // Reset state when modal opens
      setStatus('connecting');
      setMessage('Connecting to duplication service...');
      setProgress(0);
      setError(null);
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        console.log("Cleaning up WebSocket connection");
        wsRef.current.close();
      }
    };
  }, [isOpen, websocketId]);

  const connectWebSocket = () => {
    try {
      // Try multiple possible WebSocket endpoints
      const possibleUrls = [
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'ws://localhost:8000'}/ws/game/${websocketId}/`,
      ];
      
      const wsUrl = possibleUrls[0]; // Start with the first URL
      console.log("Connecting to WebSocket:", wsUrl);
      console.log("Environment variables:", {
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
      });
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log("WebSocket connection opened successfully");
        setStatus('processing');
        setMessage('Connected. Starting duplication...');
        setProgress(5);
      };

      wsRef.current.onmessage = (event) => {
        console.log("WebSocket message received:", event.data);
        try {
          const data = JSON.parse(event.data);
          console.log("Parsed WebSocket data:", data);
          
          if (data.status === 'processing') {
            setStatus('processing');
            setMessage(data.message);
            // Extract progress from message or use incremental progress
            const progressMatch = data.message.match(/(\d+)%/);
            if (progressMatch) {
              setProgress(parseInt(progressMatch[1]));
            } else {
              // Estimate progress based on message content
              if (data.message.includes('preview image')) setProgress(15);
              else if (data.message.includes('opener audio')) setProgress(25);
              else if (data.message.includes('story documents')) setProgress(40);
              else if (data.message.includes('game record')) setProgress(50);
              else if (data.message.includes('locations')) setProgress(70);
              else if (data.message.includes('NPCs')) setProgress(85);
              else if (data.message.includes('assistant')) setProgress(95);
            }
          } else if (data.status === 'complete') {
            console.log("Duplication completed successfully");
            setStatus('complete');
            setMessage('Game duplicated successfully!');
            setProgress(100);
            
            setTimeout(() => {
              onComplete && onComplete(data.data?.game_id || newGameId);
              onClose();
            }, 2000);
          } else if (data.status === 'error') {
            console.error("Duplication error from server:", data.message);
            setStatus('error');
            setError(data.message);
            setMessage('Duplication failed');
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err, 'Raw message:', event.data);
          setStatus('error');
          setError('Failed to parse server response');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket readyState:', wsRef.current?.readyState);
        setStatus('error');
        setError(`Connection error: ${error.message || 'Unknown error'}`);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          currentStatus: status
        });
        
        if (status !== 'complete' && status !== 'error') {
          setStatus('error');
          setError(`Connection closed unexpectedly (Code: ${event.code}, Reason: ${event.reason || 'No reason provided'})`);
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setStatus('error');
      setError(`Failed to connect to duplication service: ${err.message}`);
    }
  };

  const handleClose = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    onClose();
  };

  const getProgressColor = () => {
    if (status === 'error') return 'bg-red-500';
    if (status === 'complete') return 'bg-green-500';
    return 'bg-accent';
  };

  const getStatusIcon = () => {
    if (status === 'error') {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (status === 'complete') {
      return (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="animate-spin w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={status === 'complete' || status === 'error' ? handleClose : undefined}></div>
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-jacarta-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-jacarta-700 dark:text-white">
            Duplicating Game
          </h3>
          {(status === 'complete' || status === 'error') && (
            <button
              onClick={handleClose}
              className="text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-jacarta-100 dark:bg-jacarta-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-jacarta-500 dark:text-jacarta-300 mt-2">
              {progress}% Complete
            </div>
          </div>

          {/* Status Message */}
          <div className="mb-6">
            <p className="text-jacarta-700 dark:text-white font-medium mb-2">
              {message}
            </p>
            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}
          </div>

          {/* Game ID Display */}
          {newGameId && status === 'complete' && (
            <div className="bg-jacarta-50 dark:bg-jacarta-700 rounded-lg p-3 mb-4">
              <p className="text-xs text-jacarta-500 dark:text-jacarta-300 mb-1">New Game ID:</p>
              <p className="text-sm font-mono text-jacarta-700 dark:text-white break-all">
                {newGameId}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {status === 'error' && (
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-jacarta-100 dark:bg-jacarta-600 text-jacarta-700 dark:text-white rounded-lg hover:bg-jacarta-200 dark:hover:bg-jacarta-500 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setStatus('connecting');
                  setError(null);
                  setProgress(0);
                  connectWebSocket();
                }}
                className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {status === 'complete' && (
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Done
            </button>
          )}
        </div>

        {/* Processing Steps (Optional) */}
        {status === 'processing' && (
          <div className="mt-6 pt-4 border-t border-jacarta-100 dark:border-jacarta-600">
            <h4 className="text-sm font-medium text-jacarta-700 dark:text-white mb-3">
              Duplication Steps:
            </h4>
            <div className="space-y-2 text-xs text-jacarta-500 dark:text-jacarta-300">
              <div className={`flex items-center ${progress >= 15 ? 'text-green-500' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${progress >= 15 ? 'bg-green-500' : 'bg-jacarta-300'}`}></div>
                Copy preview image
              </div>
              <div className={`flex items-center ${progress >= 25 ? 'text-green-500' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${progress >= 25 ? 'bg-green-500' : 'bg-jacarta-300'}`}></div>
                Copy audio files
              </div>
              <div className={`flex items-center ${progress >= 40 ? 'text-green-500' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${progress >= 40 ? 'bg-green-500' : 'bg-jacarta-300'}`}></div>
                Process story documents
              </div>
              <div className={`flex items-center ${progress >= 50 ? 'text-green-500' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${progress >= 50 ? 'bg-green-500' : 'bg-jacarta-300'}`}></div>
                Create game record
              </div>
              <div className={`flex items-center ${progress >= 70 ? 'text-green-500' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${progress >= 70 ? 'bg-green-500' : 'bg-jacarta-300'}`}></div>
                Copy locations & images
              </div>
              <div className={`flex items-center ${progress >= 85 ? 'text-green-500' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${progress >= 85 ? 'bg-green-500' : 'bg-jacarta-300'}`}></div>
                Copy NPCs & images
              </div>
              <div className={`flex items-center ${progress >= 95 ? 'text-green-500' : ''}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${progress >= 95 ? 'bg-green-500' : 'bg-jacarta-300'}`}></div>
                Setup game assistant
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameDuplicationModal;
