import { useEffect, useState } from "react";

const ImagePreview = ({ file, choosImageRef, savedPrevUrl, savedPrevType, onFileDrop }) => {
  const [preview, setPreview] = useState(savedPrevUrl || "");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    let revokeUrl;
    setVideoThumbnail("");
    setThumbnailError(false);

    if (file && typeof file !== "string" && file.type && file.type.startsWith("video/")) {
      const videoURL = URL.createObjectURL(file);
      revokeUrl = videoURL;
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = videoURL;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      let seekAttempts = [0.1, 1, 0];
      let currentAttempt = 0;
      let seekFailed = false;
      let triedSeek = false;
      video.onloadedmetadata = () => {
        trySeek();
      };
      function trySeek() {
        if (currentAttempt < seekAttempts.length) {
          try {
            video.currentTime = seekAttempts[currentAttempt];
            triedSeek = true;
          } catch (err) {
            currentAttempt++;
            trySeek();
          }
        } else {
          setThumbnailError(true);
          setVideoThumbnail("");
          seekFailed = true;
        }
      }
      video.onseeked = () => {
        if (seekFailed) return;
        try {
          if (video.videoWidth === 0 || video.videoHeight === 0) {
            setThumbnailError(true);
            setVideoThumbnail("");
            return;
          }
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL("image/png");
          setVideoThumbnail(dataURL);
          canvas.remove();
          video.remove();
        } catch (e) {
          currentAttempt++;
          if (currentAttempt < seekAttempts.length) {
            trySeek();
          } else {
            setVideoThumbnail("");
            setThumbnailError(true);
          }
        }
      };
      video.onerror = (e) => {
        setVideoThumbnail("");
        setThumbnailError(true);
      };
    } else if (file && typeof file !== "string" && file.type && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (savedPrevUrl && savedPrevType && savedPrevType.startsWith("image/")) {
      setPreview(savedPrevUrl);
    } else if (savedPrevUrl && savedPrevType && savedPrevType.startsWith("video/")) {
      setPreview(savedPrevUrl);
    }
    return () => {
      setPreview("");
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [file, savedPrevType, savedPrevUrl]);

  const isImage = (file && typeof file !== "string" && file.type && file.type.startsWith("image/")) || (savedPrevType && savedPrevType.startsWith("image/"));
  const isVideo = (file && typeof file !== "string" && file.type && file.type.startsWith("video/")) || (savedPrevType && savedPrevType.startsWith("video/"));

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (onFileDrop) {
        onFileDrop(droppedFile);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={
        (isDragOver
          ? "ring-2 ring-accent ring-offset-2 bg-accent/5 "
          : "") + ""
      }
      style={{ borderRadius: "0.5rem" }}
    >
      {(isImage && preview && preview.trim() !== "") ? (
        <div className="w-full h-[30rem]">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full rounded-md object-cover scale-in-center"
          />
        </div>
      ) : (isVideo && videoThumbnail) ? (
        <div className="w-full h-[30rem] relative">
          <img
            src={videoThumbnail}
            alt="Video thumbnail"
            className="w-full h-full rounded-md object-cover scale-in-center"
          />
          <div className="absolute bottom-4 right-4">
            <video
              src={file ? URL.createObjectURL(file) : undefined}
              controls
              className="w-32 h-20 rounded shadow-lg border border-jacarta-200"
              style={{ background: '#000' }}
            />
          </div>
        </div>
      ) : (isVideo && preview && !videoThumbnail) ? (
        <div className="w-full h-[30rem]">
          <video
            src={preview}
            controls
            className="w-full h-full rounded-md object-cover scale-in-center"
            style={{ background: '#000' }}
          />
          {thumbnailError && (
            <div className="absolute top-2 left-2 bg-yellow-200 text-yellow-900 px-3 py-1 rounded shadow">
              Could not generate video thumbnail.
            </div>
          )}
        </div>
      ) : (preview && preview.trim() !== "") ? (
        <div className="w-full h-[30rem]">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full rounded-md object-cover scale-in-center"
          />
        </div>
      ) : (
        <div
          onClick={() => choosImageRef.current.click()}
          className={
            "group relative flex w-full h-[28rem] flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700 z-1 cursor-pointer " +
            (isDragOver ? "ring-2 ring-accent ring-offset-2 bg-accent/5 " : "")
          }
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
            <p className="mx-auto max-w-xs text-xs dark:text-jacarta-300">
              JPG, PNG, GIF, SVG, WEBP, MP4, WEBM, MOV
            </p>
            <p className="text-accent mt-2 font-semibold">Drag & drop a file here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
