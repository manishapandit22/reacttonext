/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState, useCallback } from "react";
import { FaImage, FaYoutube, FaCloudUploadAlt, FaTimes, FaPlay } from "react-icons/fa"; 

import ImagePreview from "../create/components/ImagePreview";
import { useGameContext } from "../../contexts/GameContext";
import { handleLocationImageUpdate } from "../GameCreation/LocationFunctions";
import { handleNPCSave } from "../GameCreation/NPCFunctions";
import { handleLocationSave } from "../GameCreation/LocationFunctions";
import LoadingSpinner from "../ui/LoadingSpinner";

const DragDropZone = ({ children, hasImage, onDragOver, onDragEnter, onDragLeave, onDrop, isDragOver }) => (
  <div
    onDragOver={onDragOver}
    onDragEnter={onDragEnter}
    onDragLeave={onDragLeave}
    onDrop={onDrop}
    className={`
      relative transition-all duration-300 rounded-2xl overflow-hidden
      ${isDragOver ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50 dark:bg-blue-900/10' : ''}
      ${!hasImage ? 'border-2 border-dashed border-gray-300 dark:border-gray-600' : ''}
    `}
    style={{ pointerEvents: 'auto' }}
  >
    {children}
    {isDragOver && (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 pointer-events-none">
        <div className="bg-white/90 dark:bg-gray-800/90 px-6 py-4 rounded-xl shadow-lg border border-white/20">
          <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg flex items-center gap-2">
            <FaCloudUploadAlt className="text-xl" />
            Drop image here
          </div>
        </div>
      </div>
    )}
  </div>
);

export default function ImageModal({
  selectedElement,
  selectedData,
  isAdding,
  gameId,
  isOpen,
  setIsOpen,
  setIsAdding,
  editingImageType,
  editingImageIndex,
  selectedLocation,
  selectedLocationImage,
  selectedNPC,
  selectedNPCImage,
  updateNPCImage,
  updateLocationImage,
}) {
  const choosImageRef = useRef();
  const dragCounterRef = useRef(0);
  const { gameData, setGameData, createNPC, updateNPC, createLocation, updateLocation, listNPCs, listLocations } = useGameContext();
  const [imageData, setImageData] = useState({
    title: "",
    description: "", 
    file: "",
    savedUrl: "",
    youtubeUrl: "",
    type: "image" 
  });
  const [error, setError] = useState({ title: "", file: "", youtubeUrl: "" });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateYoutubeUrl = (url) => {
    if (!url) return false;
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/|youtube\.com\/shorts\/)([^#&?]*).*/;
    return youtubeRegex.test(url);
  };

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYoutubeThumbnail = (url) => {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const validateImageFile = (file) => {
    if (!file) return { isValid: false, error: "No file selected" };
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: "Only images are allowed." };
    }
    const maxSize = 10 * 1024 * 1024; 
    if (file.size > maxSize) {
      return { isValid: false, error: "File size must be less than 10MB." };
    }
    return { isValid: true, error: "" };
  };

  const handleFileSelect = useCallback((file) => {
    const validation = validateImageFile(file);
    if (validation.isValid) {
      setImageData(prev => ({ ...prev, file, savedUrl: "" })); 
      setError(prev => ({ ...prev, file: "" }));
    } else {
      setError(prev => ({ ...prev, file: validation.error }));
    }
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }, [isDragOver]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const resetModalState = useCallback(() => {
    setImageData({
      title: "",
      description: "", 
      file: "",
      savedUrl: "",
      youtubeUrl: "",
      type: "image"
    });
    setError({ title: "", file: "", youtubeUrl: "" });
    setIsDragOver(false);
    setIsLoading(false);
    dragCounterRef.current = 0;
    
    if (choosImageRef.current) {
      choosImageRef.current.value = '';
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
      setError({ title: "", file: "", youtubeUrl: "" });

      if (!isAdding && selectedData) {
        let normalized = selectedData;
        if (selectedData instanceof File) {
          normalized = {
            file: selectedData,
            title: "",
            description: "",
            type: "image"
          };
        }
        const isValidUrl = normalized.url && normalized.url !== "undefined" && normalized.url.trim() !== "";
        const isYoutubeUrl = isValidUrl && validateYoutubeUrl(normalized.url);
        const contentType = normalized.type || (isYoutubeUrl ? "youtube" : "image");
        let finalUrl = "";
        if (contentType === "youtube") {
          finalUrl = normalized.url || "";
        } else {
          finalUrl = normalized.savedUrl || (isValidUrl ? normalized.url : "");
        }
        const newImageData = {
          title: normalized.title || normalized.name || "",
          description: normalized.description || "",
          file: normalized.file || "",
          savedUrl: contentType === "youtube" ? "" : finalUrl,
          youtubeUrl: contentType === "youtube" ? finalUrl : "",
          type: contentType
        };
        setImageData(newImageData);
      } else {
        setImageData({ 
          title: "", 
          description: "", 
          file: "", 
          savedUrl: "",
          youtubeUrl: "", 
          type: "image" 
        });
      }
    } else {
      resetModalState();
    }
  }, [isOpen, isAdding, selectedData, resetModalState]);

  const handleAdd = async () => {
    try {
      let hasError = false;
      const newErrors = { title: "", file: "", youtubeUrl: "" };

      if (imageData.type === 'image' && !imageData.file && !imageData.savedUrl) {
        newErrors.file = "You need to upload the image";
        hasError = true;
      }

      if (imageData.type === 'youtube' && !imageData.youtubeUrl) {
        newErrors.youtubeUrl = "You need to enter a YouTube URL";
        hasError = true;
      } else if (imageData.type === 'youtube' && !validateYoutubeUrl(imageData.youtubeUrl)) {
        newErrors.youtubeUrl = "Please enter a valid YouTube URL";
        hasError = true;
      }

      setError(newErrors);

      if (hasError) {
        return;
      }

      setIsLoading(true);

    let merged = { ...selectedData };
    merged.title = imageData.title;
    merged.name = imageData.title;
    merged.description = imageData.description;
    merged.type = imageData.type;

    if (imageData.type === 'youtube') {
      merged.url = imageData.youtubeUrl && imageData.youtubeUrl.trim() !== '' ? imageData.youtubeUrl : undefined;
      merged.file = undefined;
    } else {
      if (imageData.file) {
        merged.file = imageData.file;
        merged.url = undefined;
      } else if (imageData.savedUrl && imageData.savedUrl.trim() !== '') {
        merged.url = imageData.savedUrl;
        merged.file = undefined;
      } else if (selectedData && selectedData.url) {
        merged.url = selectedData.url;
        merged.file = undefined;
      }
    }
    delete merged.youtubeUrl;
    delete merged.savedUrl;

    const imageId = merged.id || merged.image_id;
    const npcArr = Array.isArray(gameData.npcs) ? gameData.npcs : [];
    const npcObj = typeof selectedNPC === 'number' && npcArr[selectedNPC] ? npcArr[selectedNPC] : null;
    const locArr = Array.isArray(gameData.locations) ? gameData.locations : [];
    const locObj = typeof selectedLocation === 'number' && locArr[selectedLocation] ? locArr[selectedLocation] : null;
    const gameIdValue = gameData.id || gameData.gameId || gameId;

    if (selectedElement === "NPC" && gameIdValue && npcObj && npcObj.id) {
      if (isAdding) {
        try {
          await handleNPCSave(gameIdValue, {
            ...npcObj,
            images: [...(npcObj.images || []), merged]
          }, createNPC, updateNPC, setGameData);
          
          const updatedNPCs = await listNPCs(gameIdValue);
          const updatedNPC = updatedNPCs.find(npc => npc.id === npcObj.id);
          if (updatedNPC) {
            setGameData(prev => {
              const newNpcs = prev.npcs.map(npc => 
                npc.id === npcObj.id ? {
                  ...npc,
                  savedImages: updatedNPC.npc_images || []
                } : npc
              );
              return { ...prev, npcs: newNpcs };
            });
          }
        } catch (error) {
          console.error('Error uploading NPC image:', error);
        }
      } else if (updateNPCImage && imageId) {
        const formData = new FormData();
        if (merged.file) formData.append('file', merged.file);
        else if (merged.url) formData.append('url', merged.url);
        else if (merged.image_url) formData.append('url', merged.image_url);
        if (merged.title) formData.append('name', merged.title);
        if (merged.description) formData.append('description', merged.description);
        
        try {
          await updateNPCImage(gameIdValue, npcObj.id, imageId, formData);
          
          const updatedNPCs = await listNPCs(gameIdValue);
          const updatedNPC = updatedNPCs.find(npc => npc.id === npcObj.id);
          if (updatedNPC) {
            setGameData(prev => {
              const newNpcs = prev.npcs.map(npc => 
                npc.id === npcObj.id ? {
                  ...npc,
                  savedImages: updatedNPC.npc_images || []
                } : npc
              );
              return { ...prev, npcs: newNpcs };
            });
          }
        } catch (error) {
          console.error('Error updating NPC image:', error);
        }
      }
    } else if (selectedElement === "location" && gameIdValue && locObj && locObj.id) {
      if (isAdding) {
        try {
          await handleLocationSave(gameIdValue, {
            ...locObj,
            images: [...(locObj.images || []), merged]
          }, createLocation, updateLocation, setGameData);
          
          const updatedLocations = await listLocations(gameIdValue);
          const updatedLocation = updatedLocations.find(loc => loc.id === locObj.id);
          if (updatedLocation) {
            setGameData(prev => {
              const newLocations = prev.locations.map(loc => 
                loc.id === locObj.id ? {
                  ...loc,
                  savedImages: updatedLocation.location_images || []
                } : loc
              );
              return { ...prev, locations: newLocations };
            });
          }
        } catch (error) {
          console.error('Error uploading location image:', error);
        }
      } else if (updateLocationImage && imageId) {
        const formData = new FormData();
        if (merged.file) formData.append('file', merged.file);
        else if (merged.url) formData.append('url', merged.url);
        else if (merged.image_url) formData.append('url', merged.image_url);
        if (merged.title) formData.append('name', merged.title);
        if (merged.description) formData.append('description', merged.description);
        
        try {
          await updateLocationImage(gameIdValue, locObj.id, imageId, formData);
          
          const updatedLocations = await listLocations(gameIdValue);
          const updatedLocation = updatedLocations.find(loc => loc.id === locObj.id);
          if (updatedLocation) {
            setGameData(prev => {
              const newLocations = prev.locations.map(loc => 
                loc.id === locObj.id ? {
                  ...loc,
                  savedImages: updatedLocation.location_images || []
                } : loc
              );
              return { ...prev, locations: newLocations };
            });
          }
        } catch (error) {
          console.error('Error updating location image:', error);
        }
      }
    }

    if (selectedElement === "location") {
      if (isAdding && typeof selectedLocation === "number" && (!gameIdValue || !locObj || !locObj.id)) {
        setGameData(prev => {
          const newLocations = [...prev.locations];
          const images = newLocations[selectedLocation].images;
          const alreadyExists = images.some(img =>
            (img.file && merged.file && img.file.name === merged.file.name && img.file.size === merged.file.size) ||
            (img.url && merged.url && img.url === merged.url)
          );
          if (!alreadyExists) {
            newLocations[selectedLocation].images = [...images, merged];
          }
          return { ...prev, locations: newLocations };
        });
      } else if (!isAdding && (!gameIdValue || !locObj || !locObj.id)) {
        handleLocationImageUpdate(
          gameData.id,
          selectedLocation?.id,
          merged.id,
          merged,
          updateLocationImage,
          setGameData
        );
      }
    } else if (selectedElement === "NPC") {
      const npcIndex = typeof selectedNPC === 'number' ? selectedNPC : 0;
      const imageIndex = typeof selectedNPCImage === 'number' ? selectedNPCImage : 0;
      
      if ((isAdding && (!gameIdValue || !npcObj || !npcObj.id)) || (!isAdding && (!gameIdValue || !npcObj || !npcObj.id))) {
        setGameData(prev => {
          const newGameData = { ...prev };
          if (!newGameData.npcs[npcIndex]) return prev;
          if (isAdding) {
            if (!newGameData.npcs[npcIndex].images) {
              newGameData.npcs[npcIndex].images = [];
            }
            const alreadyExists = newGameData.npcs[npcIndex].images.some(img => 
              (img.file && merged.file && img.file.name === merged.file.name && img.file.size === merged.file.size) ||
              (img.url && merged.url && img.url === merged.url)
            );
            if (!alreadyExists) {
              newGameData.npcs[npcIndex].images.push(merged);
            }
          } else {
            if (newGameData.npcs[npcIndex].images && newGameData.npcs[npcIndex].images[imageIndex]) {
              newGameData.npcs[npcIndex].images[imageIndex] = merged;
            }
          }
          return newGameData;
        });
      }
    }

    setIsOpen(false);
    if (typeof setIsAdding === 'function') setIsAdding(false);
    document.querySelector('[data-bs-dismiss="modal"]').click();
  } catch (error) {
    console.error('Error in handleAdd:', error);
  } finally {
    setIsLoading(false);
  }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (typeof setIsAdding === 'function') setIsAdding(false);
    resetModalState();
    setIsLoading(false);
  };

  return (
    <div
      className="modal fade"
      id="imageModal"
      tabIndex="-1"
      aria-labelledby="imageModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '800px', width: '95vw' }}>
        <div className="modal-content bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-2xl font-bold mb-2" id="imageModalLabel">
                    {isAdding ? 'Add New Content' : 'Update Content'}
                  </h5>
                  <p className="text-blue-100 text-sm">
                    {selectedElement === 'NPC' ? 'Character' : 'Location'} • {imageData.type === 'youtube' ? 'Video Content' : 'Image Content'}
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-200 hover:scale-105"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={handleClose}
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
            <div className="space-y-8">
              {/* Content Type Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Content Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    className={`group relative p-6 rounded-2xl transition-all duration-300 flex flex-col items-center gap-3 border-2 overflow-hidden ${
                      imageData.type === 'image' 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg transform scale-105' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 hover:shadow-md hover:scale-102'
                    }`}
                    onClick={() => setImageData(prev => ({...prev, type: 'image'}))}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${imageData.type === 'image' ? 'from-blue-500/10 to-indigo-500/10' : 'from-transparent to-transparent group-hover:from-blue-500/5 group-hover:to-indigo-500/5'} transition-all duration-300`}></div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`p-4 rounded-xl ${imageData.type === 'image' ? 'bg-blue-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600'} transition-all duration-300`}>
                        <FaImage className="text-2xl" />
                      </div>
                      <span className={`font-semibold ${imageData.type === 'image' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>Image Upload</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 text-center">Upload images from your device</span>
                    </div>
                  </button>
                  
                  <button 
                    className={`group relative p-6 rounded-2xl transition-all duration-300 flex flex-col items-center gap-3 border-2 overflow-hidden ${
                      imageData.type === 'youtube'
                        ? 'border-red-500 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 shadow-lg transform scale-105'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-red-300 hover:shadow-md hover:scale-102'
                    }`}
                    onClick={() => setImageData(prev => ({...prev, type: 'youtube'}))}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${imageData.type === 'youtube' ? 'from-red-500/10 to-pink-500/10' : 'from-transparent to-transparent group-hover:from-red-500/5 group-hover:to-pink-500/5'} transition-all duration-300`}></div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className={`p-4 rounded-xl ${imageData.type === 'youtube' ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-red-100 group-hover:text-red-600'} transition-all duration-300`}>
                        <FaYoutube className="text-2xl" />
                      </div>
                      <span className={`font-semibold ${imageData.type === 'youtube' ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>YouTube Video</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 text-center">Embed YouTube videos</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Title</label>
                  <div className="relative">
                    <input
                      value={imageData.title}
                      onChange={(e) => {
                        setImageData(prev => ({ ...prev, title: e.target.value }));
                        if (e.target.value) {
                          setError(prev => ({ ...prev, title: "" }));
                        }
                      }}
                      placeholder="Enter a descriptive title"
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-lg"
                    />
                    {error.title && (
                      <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-red-500 text-sm">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        {error.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Description (Optional)</label>
                  <textarea
                    value={imageData.description}
                    onChange={(e) =>
                      setImageData(prev => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Add a detailed description..."
                    rows="4"
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                  />
                </div>
              </div>

              {/* Content Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  {imageData.type === 'youtube' ? 'Video Content' : 'Image Content'}
                </label>
                
                {imageData.type === 'youtube' ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <input
                        value={imageData.youtubeUrl}
                        onChange={(e) => {
                          setImageData(prev => ({ ...prev, youtubeUrl: e.target.value }));
                          if (validateYoutubeUrl(e.target.value)) {
                            setError(prev => ({ ...prev, youtubeUrl: "" }));
                          }
                        }}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200 text-lg"
                      />
                      {error.youtubeUrl && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-red-500 text-sm">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                          {error.youtubeUrl}
                        </div>
                      )}
                    </div>
                    
                    {imageData.youtubeUrl && validateYoutubeUrl(imageData.youtubeUrl) && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Video Preview</h4>
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group cursor-pointer">
                          <img
                            src={getYoutubeThumbnail(imageData.youtubeUrl)}
                            alt="YouTube Thumbnail"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
                            style={{ display: 'none' }}
                          >
                            <div className="text-center">
                              <FaYoutube className="text-6xl text-red-500 mx-auto mb-4" />
                              <p className="text-white text-lg font-medium">Video Preview</p>
                              <p className="text-gray-300 text-sm">Thumbnail not available</p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                              <FaPlay className="text-white text-2xl ml-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <input
                      ref={choosImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {imageData.savedUrl && imageData.savedUrl.trim() !== "" && !isAdding && !imageData.file ? (
                      <DragDropZone 
                        hasImage={true}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        isDragOver={isDragOver}
                      >
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                          <img
                            src={imageData.savedUrl}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <button
                            onClick={() => choosImageRef.current.click()}
                            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 py-2 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                          >
                            <FaImage className="text-sm" />
                            Replace Image
                          </button>
                        </div>
                      </DragDropZone>
                    ) : imageData.file ? (
                      <DragDropZone 
                        hasImage={true}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        isDragOver={isDragOver}
                      >
                        <div className="relative group">
                          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ pointerEvents: 'none' }}>
                            <ImagePreview
                              file={imageData.file}
                              choosImageRef={choosImageRef}
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                          <button
                            onClick={() => choosImageRef.current.click()}
                            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 py-2 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-medium flex items-center gap-2"
                          >
                            <FaImage className="text-sm" />
                            Replace Image
                          </button>
                        </div>
                      </DragDropZone>
                    ) : (
                      <DragDropZone 
                        hasImage={false}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        isDragOver={isDragOver}
                      >
                        <div 
                          className="w-full aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 rounded-2xl  dark:border-gray-600 group"
                          onClick={() => choosImageRef.current.click()}
                        >
                          <div className="text-center space-y-6">
                            {/* <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                <FaCloudUploadAlt className="text-4xl text-white" />
                              </div>
                            </div> */}
                            
                            <div className="space-y-3">
                              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                                Drop your image here
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                                or click to browse files from your device
                              </p>
                            </div>
                            
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                              <FaImage />
                              Choose File
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                              <span className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                                JPG, PNG, GIF, WebP
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                                Max 10MB
                              </span>
                            </div>
                          </div>
                        </div>
                      </DragDropZone>
                    )}

                    {error.file && (
                      <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        {error.file}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  isLoading 
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
                    : 'border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                }`}
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 flex items-center gap-3 ${
                  isLoading 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl hover:scale-105'
                }`}
                onClick={handleAdd}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>{isAdding ? "Adding..." : "Updating..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isAdding ? "Add Content" : "Update Content"}</span>
                    <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}