import { useState } from 'react';
import Image from "next/image";

export default function NPCs({ npcs }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image, npcName) => {
    setSelectedImage({ src: typeof image === "string" ? image : image.url, alt: npcName });
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (!npcs?.length) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 dark:text-slate-500 text-lg">No characters available</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {npcs.map((npc, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-jacarta-600 to-jacarta-900 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-200 dark:border-slate-700"
          >
            {/* Character Header */}
            <div className="relative p-6 pb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <h3 className="text-xl font-bold bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600 bg-clip-text text-transparent">
                  {npc.npc_name}
                </h3>
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 group-hover:w-20 transition-all duration-300" />
              </div>
            </div>

            {/* Character Images */}
            {npc.npc_images?.length > 0 && (
              <div className="px-6 pb-6">
                <div className="grid gap-3 perspective-1000 transform-style-preserve-3d">
                  {/* Main image */}
                  {npc.npc_images
                    .filter(image => {
                      const url = typeof image === "string" ? image : image.url;
                      return !(/youtube\.com|youtu\.be/).test(url);
                    })
                    .slice(0, 1)
                    .map((image, index) => (
                      <div
                        key={index}
                        className="relative perspective-1000 transform-style-preserve-3d aspect-square overflow-hidden rounded-xl cursor-pointer group/image"
                        onClick={() => handleImageClick(image, npc.npc_name)}
                      >
                        <img
                          src={typeof image === "string" ? image : image.url}
                          alt={npc.npc_name}
                          className="w-full h-full object-cover transition-all duration-500 transform-gpu shadow-lg hover:shadow-2xl"
                          style={{
                            transformStyle: 'preserve-3d',
                            perspective: '1000px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.05) rotateY(-15deg) rotateX(8deg) translateZ(20px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1) rotateY(0deg) rotateX(0deg) translateZ(0px)';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}

                  {/* Additional images grid */}
                  {npc.npc_images
                    .filter(image => {
                      const url = typeof image === "string" ? image : image.url;
                      return !(/youtube\.com|youtu\.be/).test(url);
                    })
                    .slice(1)
                    .length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {npc.npc_images
                          .filter(image => {
                            const url = typeof image === "string" ? image : image.url;
                            return !(/youtube\.com|youtu\.be/).test(url);
                          })
                          .slice(1, 4)
                          .map((image, index) => (
                            <div
                              key={index}
                              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group/thumb"
                              onClick={() => handleImageClick(image, npc.npc_name)}
                            >
                              <img
                                src={typeof image === "string" ? image : image.url}
                                alt={`${npc.npc_name} ${index + 2}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-colors duration-300" />
                            </div>
                          ))}

                        {/* More images indicator */}
                        {npc.npc_images
                          .filter(image => {
                            const url = typeof image === "string" ? image : image.url;
                            return !(/youtube\.com|youtu\.be/).test(url);
                          })
                          .length > 4 && (
                            <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                +{npc.npc_images.filter(image => {
                                  const url = typeof image === "string" ? image : image.url;
                                  return !(/youtube\.com|youtu\.be/).test(url);
                                }).length - 4}
                              </span>
                            </div>
                          )}
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-blue-500/20 transition-all duration-300" />
          </div>
        ))}
      </div>

      {/* Modern Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] m-4 animate-in zoom-in-95 duration-200">
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