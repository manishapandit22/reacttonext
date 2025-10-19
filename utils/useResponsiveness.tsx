import { useState, useEffect } from 'react';
import useDeviceDetect from './useDeviceDetect';

interface ImageSize {
  url: string;
  width: number;
  height?: number;
}

interface ImageData {
  url: string;
  width: number;
  thumbnailURL?: string;
  sizes?: {
    xlarge?: ImageSize;
    large?: ImageSize;
    medium?: ImageSize;
    small?: ImageSize;
    square?: ImageSize;
  };
}

const useResponsiveImage = (imageData: ImageData | null, fallbackUrl: string = '/img/blog/default_image.jpg'): string => {
  const [optimalImageUrl, setOptimalImageUrl] = useState(fallbackUrl);
  const { isMobile, deviceType, screenResolution, devicePixelRatio } = useDeviceDetect();
  
  useEffect(() => {
    if (!imageData) {
      setOptimalImageUrl(fallbackUrl);
      return;
    }

    const screenWidth = parseInt(screenResolution.split('x')[0]) || 0;
    
    try {
      if (!imageData.url) {
        throw new Error('Invalid image data structure');
      }

      const availableSizes: Record<string, ImageSize | null> = {
        original: imageData.url ? { url: imageData.url, width: imageData.width } : null,
        xlarge: imageData.sizes?.xlarge?.url ? { url: imageData.sizes.xlarge.url, width: imageData.sizes.xlarge.width } : null,
        large: imageData.sizes?.large?.url ? { url: imageData.sizes.large.url, width: imageData.sizes.large.width } : null,
        medium: imageData.sizes?.medium?.url ? { url: imageData.sizes.medium.url, width: imageData.sizes.medium.width } : null,
        small: imageData.sizes?.small?.url ? { url: imageData.sizes.small.url, width: imageData.sizes.small.width } : null,
        thumbnail: imageData.thumbnailURL ? { url: imageData.thumbnailURL, width: 300 } : null,
        square: imageData.sizes?.square?.url ? { url: imageData.sizes.square.url, width: imageData.sizes.square.width } : null
      };

      const targetWidth = screenWidth * devicePixelRatio;
      let selectedSize: ImageSize | null = null;

      if (isMobile) {
        if (deviceType === 'mobile') {
          selectedSize = availableSizes.small || availableSizes.medium || availableSizes.thumbnail;
        } else if (deviceType === 'tablet') {
          selectedSize = availableSizes.medium || availableSizes.large || availableSizes.small;
        }
      } else {
        const sortedSizes = Object.values(availableSizes)
          .filter((size): size is ImageSize => size !== null)
          .sort((a, b) => a.width - b.width);
        
        selectedSize = sortedSizes.find(size => size.width >= targetWidth) || 
                       sortedSizes[sortedSizes.length - 1];
      }

      if (!selectedSize) {
        const firstAvailable = Object.values(availableSizes).find((size): size is ImageSize => size !== null);
        selectedSize = firstAvailable || { url: fallbackUrl, width: 0 };
      }

      let finalUrl = selectedSize.url;
      if (finalUrl && !finalUrl.startsWith('http') && !finalUrl.startsWith('/img/')) {
        finalUrl = `https://cms.openbook.games${finalUrl}`;
      }

      setOptimalImageUrl(finalUrl || fallbackUrl);
    } catch (error) {
      console.error('Error selecting responsive image:', error);
      setOptimalImageUrl(fallbackUrl);
    }
  }, [imageData, fallbackUrl, isMobile, deviceType, screenResolution, devicePixelRatio]);

  return optimalImageUrl;
};

export default useResponsiveImage;

