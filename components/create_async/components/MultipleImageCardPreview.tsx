import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaYoutube } from "react-icons/fa";
import { LocationImage, NPCImage } from "@/types";
import { useGameContext } from "../../../contexts/GameContext";

interface MultipleImageCardPreviewProps {
    files: (LocationImage | NPCImage)[];
    savedFiles: any[];
    elementId?: any | null;
    setSelectedLocation?: (index: number) => void;
    setSelectedLocationImage?: (index: number) => void;
    setSelectedNPC?: (index: number) => void;
    setSelectedNPCImage?: (index: number) => void;
    setSelectedElement: (element: string) => void;
    setSelectedSavedImage?: (index: number) => void;
    onRemove: (index: number) => void;
    onRemoveURL?: (index: number) => void;
    element: string;
    elementIndex: number;
    setIsAdding: (isAdding: boolean) => void;
    setSavedImage?: (isSaved: boolean) => void;
    setIsOpen: (isOpen: boolean) => void;
    setEditingImageType?: (type: 'new' | 'saved') => void;
    setEditingImageIndex?: (index: number) => void;
    gameId?: string | null;
    onAddImage?: (imageData: any, index: number) => void;
}

const MultipleImageCardPreview: React.FC<MultipleImageCardPreviewProps> = (props) => {
    const { deleteLocationImage, deleteNPCImage, gameData } = useGameContext();
    const {
        files,
        savedFiles,
        elementId,
        setSelectedLocation,
        setSelectedLocationImage,
        setSelectedNPC,
        setSelectedNPCImage,
        setSelectedElement,
        setSelectedSavedImage,
        onRemove,
        onRemoveURL,
        element,
        elementIndex,
        setIsAdding,
        setSavedImage,
        setIsOpen,
        setEditingImageType,
        setEditingImageIndex,
        gameId
    } = props;

    const [renderKey, setRenderKey] = useState(0);

    useEffect(() => {
        setRenderKey(prev => prev + 1);
    }, [savedFiles]);

    const isYoutubeUrl = (url: string | undefined): boolean => {
        if (!url) return false;

        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/|youtube\.com\/shorts\/)([^#&?]*).*/;
        return youtubeRegex.test(url);
    };

    const getYoutubeVideoId = (url: string | undefined): string | null => {
        if (!url) return null;

        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getYoutubeThumbnail = (url: string | undefined): string | null => {
        const videoId = getYoutubeVideoId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    };

    const getImagePreviewUrl = (image: LocationImage | NPCImage | File): string | null => {
        if (!image) return null;
        if ('file' in image && image.file && (typeof File !== 'undefined' && image.file instanceof File || typeof Blob !== 'undefined' && image.file instanceof Blob)) {
            return URL.createObjectURL(image.file);
        }
        if ('file' in image && image.file && typeof image.file === 'string') {
            return image.file;
        }
        if ('url' in image && image.url && typeof image.url === 'string') {
            return image.url;
        }
        if ('savedUrl' in image && image.savedUrl && typeof image.savedUrl === 'string') {
            return image.savedUrl;
        }
        return null;
    };

    const handleImageDelete = async (index: number, file: any) => {
        if (!gameId) {
            console.log("No gameId");
            onRemove(index);
            return;
        }

        try {
            const imageId = file.image_id || file.id;
            const parentId = element === "location" ? file.id : file.id;

            if (imageId) {
                if (element === "location") {
                    await deleteLocationImage(gameId, String(elementId.id || parentId || elementIndex), String(imageId));
                } else if (element === "NPC") {
                    await deleteNPCImage(gameId, String(elementId.id || parentId || elementIndex), String(imageId));
                }
            }

            if (file.image_id || file.id) {
                onRemoveURL?.(index);
            } else {
                onRemove(index);
            }
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    };

    return (
        <div
            key={renderKey}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-5 bg-white dark:bg-jacarta-800 rounded-xl shadow-sm"
        >
            {savedFiles && savedFiles.length > 0 && (
                <div className="col-span-full mb-2">
                    <h3 className="text-sm font-medium text-jacarta-700 dark:text-white">Saved Images</h3>
                    <div className="w-16 h-1 bg-accent mt-1 mb-3"></div>
                </div>
            )}

            {savedFiles &&
                savedFiles.map((file, index) => (
                    <div
                        className="relative rounded-xl overflow-hidden bg-white dark:bg-jacarta-700 border border-jacarta-100 dark:border-jacarta-600 shadow-sm hover:shadow-md transition-all duration-200 group min-h-[240px] transform hover:-translate-y-1"
                        key={`saved-${index}`}
                    >
                        <a
                            data-bs-toggle="modal"
                            data-bs-target="#imageModal"
                            className="block h-full cursor-pointer"
                            onClick={() => {
                                if (element === "location" && setSelectedLocation) setSelectedLocation(elementIndex);
                                if (element === "location" && setSelectedSavedImage) setSelectedSavedImage(index);
                                if (element === "NPC" && setSelectedNPC) setSelectedNPC(elementIndex);
                                if (setSelectedSavedImage && element === "NPC") setSelectedSavedImage(index);
                                setSelectedElement(element);
                                setSavedImage && setSavedImage(true);
                                setIsAdding(false);
                                setTimeout(() => setIsOpen(true), 0);
                            }}
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex-grow flex items-center justify-center p-2 overflow-hidden bg-light-base dark:bg-jacarta-600" style={{ height: "160px" }}>
                                    {isYoutubeUrl(file.url) ? (
                                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                                            <img
                                                src={getYoutubeThumbnail(file.url) || ''}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                alt={String('title' in file ? file.title : ('name' in file ? file.name : `YouTube Video ${index + 1}`))}
                                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    (target.nextSibling as HTMLElement).style.display = 'flex';
                                                }}
                                            />
                                            <div
                                                className="absolute inset-0 flex items-center justify-center bg-jacarta-700"
                                                style={{ display: 'none' }}
                                            >
                                                <FaYoutube className="text-5xl text-red-600" />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-black bg-opacity-50 rounded-full p-2">
                                                    <FaYoutube className="text-2xl text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : file.url || file.image_url ? (
                                        <img
                                            src={file.url || file.image_url}
                                            className="rounded-lg w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            alt={String('title' in file ? file.title : ('name' in file ? file.name : `Image ${index + 1}`))}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-full">
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2.5">
                                    {(file.title || file.name) && (
                                        <p className="text-sm font-medium text-jacarta-700 dark:text-white truncate">
                                            {file.title || file.name}
                                        </p>
                                    )}
                                    {file.description && (
                                        <p className="text-xs text-jacarta-500 dark:text-jacarta-300 mt-1 line-clamp-2 overflow-hidden">
                                            {file.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </a>
                        {onRemoveURL && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageDelete(index, file);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white dark:bg-jacarta-700 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                                title="Remove image"
                            >
                                <IoClose className="text-red-500 text-lg" />
                            </button>
                        )}
                    </div>
                ))}

            {files && files.length > 0 && (
                <div className="col-span-full mb-2 mt-3">
                    <h3 className="text-sm font-medium text-jacarta-700 dark:text-white">New Images</h3>
                    <div className="w-16 h-1 bg-accent mt-1 mb-3"></div>
                </div>
            )}

            {files &&
                files.map((file, index) => (
                    <div
                        className="relative rounded-xl overflow-hidden bg-white dark:bg-jacarta-700 border border-jacarta-100 dark:border-jacarta-600 shadow-sm hover:shadow-md transition-all duration-200 group min-h-[240px] transform hover:-translate-y-1"
                        key={`new-${index}`}
                    >
                        <a
                            data-bs-toggle="modal"
                            data-bs-target="#imageModal"
                            className="block h-full cursor-pointer"
                            onClick={() => {
                                if (element === "location" && setSelectedLocation) setSelectedLocation(elementIndex);
                                if (element === "location" && setSelectedLocationImage) setSelectedLocationImage(index);
                                if (element === "NPC" && setSelectedNPCImage) setSelectedNPCImage(index);
                                if (element === "NPC" && setSelectedNPC) setSelectedNPC(elementIndex);
                                setSelectedElement(element);
                                setSavedImage && setSavedImage(false);
                                setIsAdding(false);
                                setTimeout(() => setIsOpen(true), 0);
                            }}
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex-grow flex items-center justify-center p-2 overflow-hidden bg-light-base dark:bg-jacarta-600" style={{ height: "160px" }}>
                                    {file.youtubeUrl ? (
                                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                                            <img
                                                src={getYoutubeThumbnail(file.youtubeUrl) || ''}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                alt={String('title' in file ? file.title : ('name' in file ? file.name : `YouTube Video ${index + 1}`))}
                                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    (target.nextSibling as HTMLElement).style.display = 'flex';
                                                }}
                                            />
                                            <div
                                                className="absolute inset-0 flex items-center justify-center bg-jacarta-700"
                                                style={{ display: 'none' }}
                                            >
                                                <FaYoutube className="text-5xl text-red-600" />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="bg-black bg-opacity-50 rounded-full p-2">
                                                    <FaYoutube className="text-2xl text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : getImagePreviewUrl(file) ? (
                                        <img
                                            src={getImagePreviewUrl(file) || ''}
                                            className="rounded-lg w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            alt={String('title' in file && file.title ? file.title : ('name' in file && file.name ? file.name : `Preview ${index + 1}`))}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg w-full h-full">
                                            <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2.5">
                                    {(('title' in file && file.title) || ('name' in file && file.name)) && (
                                        <p className="text-sm font-medium text-jacarta-700 dark:text-white truncate">
                                            {String((('title' in file && file.title) || ('name' in file && file.name)) ?? '')}
                                        </p>
                                    )}
                                    {file.description && (
                                        <p className="text-xs text-jacarta-500 dark:text-jacarta-300 mt-1 line-clamp-2 overflow-hidden">
                                            {file.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </a>
                        {onRemove && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageDelete(index, file);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white dark:bg-jacarta-700 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors duration-200"
                                title="Remove image"
                            >
                                <IoClose className="text-red-500 text-lg" />
                            </button>
                        )}
                    </div>
                ))}

            {(!files || files.length === 0) && (!savedFiles || savedFiles.length === 0) && (
                <div className="col-span-full py-8 text-center">
                    <p className="text-jacarta-500 dark:text-jacarta-300">No images added yet</p>
                </div>
            )}
        </div>
    );
};

export default MultipleImageCardPreview;
