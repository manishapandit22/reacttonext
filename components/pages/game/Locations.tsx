import { useState } from 'react';
import Image from "next/image";

export default function Locations({ locations }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image, locationName) => {
    setSelectedImage({ src: typeof image === "string" ? image : image.url, alt: locationName });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (!locations?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 dark:text-slate-500 text-lg">No locations available</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {locations.map((location, i) => {
          const validImages = location.location_images?.filter(image => {
            const url = typeof image === "string" ? image : image.url;
            return !(/youtube\.com|youtu\.be/).test(url);
          }) || [];

          return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-jacarta-600 to-jacarta-900 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-200 dark:border-slate-700"
            >
              {/* Location Header with Gradient Background */}
              <div className="relative p-8 pb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 bg-clip-text text-transparent">
                      {location.location_name}
                    </h2>
                    <div className="flex items-center mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {validImages.length} {validImages.length === 1 ? 'Image' : 'Images'}
                    </div>
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-full group-hover:w-24 transition-all duration-500" />
                </div>
              </div>

              {/* Images Layout */}
              {validImages.length > 0 && (
                <div className="px-8 pb-8">
                  {validImages.length === 1 ? (
                    /* Single Image Layout */
                    <div
                      className="relative aspect-[16/10] overflow-hidden rounded-2xl cursor-pointer group/image shadow-lg"
                      onClick={() => handleImageClick(validImages[0], location.location_name)}
                    >
                      <img
                        src={typeof validImages[0] === "string" ? validImages[0] : validImages[0].url}
                        alt={location.location_name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : validImages.length === 2 ? (
                    /* Two Images Layout */
                    <div className="grid grid-cols-2 gap-4">
                      {validImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group/image shadow-lg"
                          onClick={() => handleImageClick(image, location.location_name)}
                        >
                          <img
                            src={typeof image === "string" ? image : image.url}
                            alt={`${location.location_name} ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Multiple Images Masonry Layout */
                    <div className="grid grid-cols-4 gap-3">
                      {/* Main large image */}
                      <div
                        className="col-span-2 row-span-2 relative aspect-square overflow-hidden rounded-xl cursor-pointer group/image shadow-lg"
                        onClick={() => handleImageClick(validImages[0], location.location_name)}
                      >
                        <img
                          src={typeof validImages[0] === "string" ? validImages[0] : validImages[0].url}
                          alt={location.location_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-300" />
                      </div>
                      
                      {/* Smaller images */}
                      {validImages.slice(1, 5).map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group/thumb shadow-md"
                          onClick={() => handleImageClick(image, location.location_name)}
                        >
                          <img
                            src={typeof image === "string" ? image : image.url}
                            alt={`${location.location_name} ${index + 2}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-colors duration-300" />
                        </div>
                      ))}
                      
                      {/* More images indicator */}
                      {validImages.length > 5 && (
                        <div className="relative aspect-square rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 cursor-pointer hover:border-blue-400 transition-colors duration-300">
                          <div className="text-center">
                            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                              +{validImages.length - 5}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              more
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Hover effect border */}
              <div className="absolute inset-0 rounded-3xl ring-0 group-hover:ring-2 ring-blue-500/20 transition-all duration-500" />
            </div>
          );
        })}
      </div>

      {/* Modern Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div className="relative max-w-5xl max-h-[90vh] m-4 animate-in zoom-in-95 duration-200">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-full rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeModal}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group/close hover:scale-110"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover/close:text-slate-900 dark:group-hover/close:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}