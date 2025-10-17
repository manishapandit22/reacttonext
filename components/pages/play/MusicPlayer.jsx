import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const MusicPlayer = ({ 
  songUrl, 
  title = 'Current Track',
  artist = 'Unknown Artist',
  musicList = [],
  setSelectedMusic,
  selectedMusic
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!isDragging && audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      const progress = (current / total) * 100;
      setProgress(progress || 0);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current) return;
    const bounds = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const time = percent * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setProgress(percent * 100);
  };

  const handleProgressMouseDown = () => {
    setIsDragging(true);
  };

  const handleProgressMouseUp = () => {
    setIsDragging(false);
  };

  const handleProgressMouseMove = (e) => {
    if (isDragging && audioRef.current) {
      const bounds = progressBarRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
      const time = percent * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(percent * 100);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleProgressMouseMove);
    window.addEventListener('mouseup', handleProgressMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleProgressMouseMove);
      window.removeEventListener('mouseup', handleProgressMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    const audioElement = audioRef.current;
    audioElement.volume = volume;

    setIsPlaying(false);
    setProgress(0);
    audioElement.pause();
    audioElement.currentTime = 0;

    return () => {
      audioElement.pause();
      setIsPlaying(false);
    };
  }, [songUrl, volume]);

  return (
    <div className=" mx-auto">
      <div className="bg-transparent backdrop-blur-sm ">
        
        {selectedMusic?.name &&  <select
          value={selectedMusic?.url || ''}
          onChange={(e) => {
            const selected = musicList?.find(music => music.url === e.target.value);
            setSelectedMusic(selected);
          }}
          className="w-full mb-4 py-1 px-3 text-sm rounded-lg bg-jacarta-900 text-purple-200 border border-purple-700/30 text-white font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="" className="bg-jacarta-800 text-purple-200">Select a song</option>
          {musicList?.map((music, index) => (
            <option key={index} value={music.url} className="bg-jacarta-800 text-purple-200">
              {music.name}
            </option>
          ))}
        </select>
        }

        {/* <div className="text-center mb-4">
          <h3 className="text-lg font-medium text-gray-200 truncate">
            {selectedMusic?.name || ''}
          </h3>
        </div> */}

        <div className="mb-4">
          <div 
            ref={progressBarRef}
            className="h-1 bg-purple-600 rounded-full cursor-pointer"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            <div 
              className="h-full bg-purple-900 rounded-full transition-all duration-200" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button 
            onClick={togglePlay}
            className="bg-gray-800 text-white rounded-full p-2 hover:bg-gray-900 transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-white" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-purple-600 rounded-full appearance-none cursor-pointer slider"
            />
            <style jsx>{`
              .slider::-webkit-slider-thumb {
                appearance: none;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #1f2937;
                cursor: pointer;
              }
              .slider::-moz-range-thumb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #1f2937;
                cursor: pointer;
                border: none;
              }
            `}</style>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={songUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default MusicPlayer;