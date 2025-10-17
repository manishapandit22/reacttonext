export const extractYouTubeVideoId = (url) => {
  try {
    if (!url || typeof url !== 'string') {
      console.warn('Invalid URL provided to extractYouTubeVideoId:', url);
      return null;
    }

    const cleanUrl = url.trim().split(/[&\s?#]/)[0];

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*?v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        if (videoId.length >= 10 && videoId.length <= 12 && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
          return videoId;
        }
      }
    }
    
    console.warn('Could not extract valid YouTube video ID from URL:', cleanUrl);
    return null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error, 'URL:', url);
    return null;
  }
};

export const isYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const youtubePatterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=/,
    /https?:\/\/(?:www\.)?youtu\.be\//,
    /https?:\/\/(?:www\.)?youtube\.com\/embed\//,
    /https?:\/\/(?:www\.)?youtube\.com\/shorts\//,
    /https?:\/\/(?:www\.)?youtube\.com\/v\//
  ];
  
  return youtubePatterns.some(pattern => pattern.test(url));
};

export const createYouTubeEmbedUrl = (videoId, options = {}) => {
  const {
    rel = 0,
    modestbranding = 1,
    fs = 1,
    enablejsapi = 1,
    origin = typeof window !== 'undefined' ? window.location.origin : '',
    ...otherOptions
  } = options;

  const params = new URLSearchParams({
    rel,
    modestbranding,
    fs,
    enablejsapi,
    ...otherOptions
  });

  if (origin) {
    params.set('origin', origin);
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export const isYouTubeShorts = (url) => {
  return url && url.includes('/shorts/');
};

export const getYouTubeDimensions = (url) => {
  if (isYouTubeShorts(url)) {
    return { width: "315", height: "560" };
  }
  return { width: "100%", height: "400" };
};
