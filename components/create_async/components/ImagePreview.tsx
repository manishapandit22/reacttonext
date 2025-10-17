import React, { useEffect, useState } from "react";
import { useGameContext } from "../../../contexts/GameContext";

interface ImagePreviewProps {
    file: File | string | null;
    choosImageRef: React.RefObject<HTMLInputElement>;
    savedPrevUrl: string | null;
    savedPrevType: string | null;
    onFileDrop: (file: File) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, choosImageRef, savedPrevUrl, savedPrevType, onFileDrop: onFileDropProp }) => {
    const { setGameData } = useGameContext();
    const onFileDrop = onFileDropProp || ((file: File) => {
        setGameData(prev => ({ ...prev, previewImage: file, previewImageType: file.type }));
    });
    const [preview, setPreview] = useState<string>(savedPrevUrl || "");
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (file && file instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
        else if (savedPrevUrl) {
            setPreview(savedPrevUrl);
        }
        return () => setPreview("");
    }, [file, savedPrevType, savedPrevUrl]);

    const isImage = (file && typeof file !== 'string' && file.type.startsWith("image/")) || (savedPrevType && savedPrevType.startsWith("image/"));
    const isVideo = !isImage && ((file && typeof file !== 'string' && file.type.startsWith("video/")) || (savedPrevType && savedPrevType.startsWith("video/")));

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (onFileDrop) {
                onFileDrop(droppedFile);
            }
        }
    };

    return (
        <div className="min-w-full">
            {preview || file ? (
                <div className="w-full h-[30rem]">
                    {isImage && (
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full rounded-md object-cover scale-in-center"
                        />
                    )}
                    {isVideo && (
                        <video
                            src={preview}
                            controls
                            className="w-full h-full rounded-md object-cover scale-in-center"
                        />
                    )}
                </div>
            ) : (
                <div
                    onClick={() => choosImageRef.current?.click()}
                    className={`group relative flex h-[28rem] flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700 z-1 cursor-pointer ${isDragging ? "border-accent bg-accent/10" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="relative z-10">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="mb-4 inline-block fill-jacarta-500 dark:fill-white"
                        >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z" />
                        </svg>
                        <p className="mx-auto max-w-xs text-s dark:text-green">DRAG & DROP</p>
                        <p className="mx-auto max-w-xs text-xs dark:text-jacarta-300">
                            JPG, PNG, GIF, SVG, WEBP, MP4, WEBM, OGG
                        </p>
                        <p className="mx-auto max-w-xs text dark:text-jacarta-300 mt-1">
                            Max file size: 200MB
                        </p>
                        {isDragging && (
                            <p className="mt-4 text-accent font-bold">Drop file here</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagePreview;
