import React, { useEffect } from 'react';
import Image from 'next/image';
import useResponsiveImage from '@/utlis/useResponsiveness';

const ResponsiveImage = ({
  imageData,
  fallbackSrc = '/img/blog/default_image.jpg',
  alt = 'Image',
  width,
  height,
  className = '',
  imgProps = {}
}) => {
  const optimalImageSrc = useResponsiveImage(imageData, fallbackSrc);
  useEffect(()=>{
    if(optimalImageSrc !== null){
    }
  },[optimalImageSrc])
  
  return (
    <Image
      src={optimalImageSrc}
      alt={imageData?.alt || alt}
      width={width}
      height={height}
      className={className}
      {...imgProps}
      onError={(e) => {
        console.warn(`Failed to load image: ${optimalImageSrc}`);
        e.target.src = fallbackSrc;
        if (imgProps.onError) imgProps.onError(e);
      }}
    />
  );
};

export default ResponsiveImage;