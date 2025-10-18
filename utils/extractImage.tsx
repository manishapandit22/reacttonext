import { useState, useEffect, useRef } from 'react';

interface Game {
  game_npc?: Array<{
    npc_images?: string[];
  }>;
  preview_image?: string;
}

interface ExtractImageProps {
  videoUrl: string;
  game: Game;
}

export default function ExtractImage({ videoUrl, game }: ExtractImageProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoUrl) {
      setError("Please provide a video URL");
      setIsLoading(false);
      return;
    }

    const video = document.createElement('video');
    videoRef.current = video;

    video.onloadedmetadata = () => {
      video.currentTime = 0; 
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL('image/jpeg');
          setThumbnailUrl(dataUrl);
          setIsLoading(false);
        }
      } catch (err) {
        setError("Failed to capture thumbnail");
        setIsLoading(false);
      }
    };

    video.onerror = () => {
      setError("Failed to load video");
      setIsLoading(false);
    };

    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.load();

    return () => {
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onseeked = null;
        videoRef.current.onerror = null;
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, [videoUrl]);

  const npcImage = game?.game_npc?.[0]?.npc_images?.[0];

  return (
    <div className="flex flex-col items-center">
      {isLoading && (
        <div className="flex items-center justify-center p-4 border border-gray-300 rounded-md bg-gray-100 w-full max-w-lg">
          <p className="text-gray-500">Loading thumbnail...</p>
        </div>
      )}
      
      {error && (
        <div className="border rounded-md w-full max-w-sm overflow-hidden shadow-lg transition-transform transform hover:scale-105 relative">
          {game?.preview_image && (
            <video 
              src={game.preview_image} 
              loop 
              className="w-full h-auto object-cover rounded-md"
              style={{ maxHeight: '200px' }} 
            />
          )}
        </div>
      )}
      
      {!isLoading && !error && thumbnailUrl && (
        <div className="border border-gray-300 rounded-md overflow-hidden max-w-[10rem] w-full">
          <img 
            src={thumbnailUrl} 
            alt="Video thumbnail" 
            className="w-full object-cover"
          />
        </div>
      )}

      {!isLoading && !error && npcImage && (
        <div className="border border-gray-300 rounded-md overflow-hidden max-w-[10rem] w-full mt-2">
          <img 
            src={npcImage} 
            alt="NPC" 
            className="w-full object-cover"
          />
        </div>
      )}
      
      <div className="mt-2 text-sm text-gray-500">
        {!isLoading && !error && thumbnailUrl && "Enjoy your purchase"}
      </div>
    </div>
  );
}

