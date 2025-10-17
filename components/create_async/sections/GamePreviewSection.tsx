import React, { useRef, useEffect, useState } from "react";
import { useGameContext } from "../../../contexts/GameContext";
import ImagePreview from "../components/ImagePreview";
import Button from "../../ui/Button";
import LoadingSpinner from "../../ui/LoadingSpinner";
import renderError from "../utils/renderError";
import { handleImageChange, handleAudioChange } from "../../GameCreation/CommonFunction";
import { FormErrors } from "../../GameCreation/FormValidate";
import { HiOutlinePhotograph, HiOutlineMusicNote } from 'react-icons/hi';

interface GamePreviewSectionProps {
  formErrors: FormErrors;
  setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  onSave: (preview: { previewImage: File | null; previewImageType: string; openerMp3: File | null }) => void;
  setUnsavedChanges: (val: boolean) => void;
}

const GamePreviewSection: React.FC<GamePreviewSectionProps> = ({
  formErrors,
  setFormErrors,
  onSave,
  setUnsavedChanges,
}) => {
  const { gameData, setGameData, sectionLoading, setSectionLoading } = useGameContext();
  const choosImageRef = useRef<HTMLInputElement>(null);
  const chooseAudioRef = useRef<HTMLInputElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [originalData, setOriginalData] = useState({
    previewImageHash: '',
    previewImageType: '',
    openerMp3Hash: '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  const createFileHash = (file: File | string | null): string => {
    if (!file) return '';
    if (typeof file === 'string') return file;
    if (file instanceof File) {
      return `${file.name}-${file.size}-${file.lastModified}`;
    }
    return '';
  };

  useEffect(() => {
    if (gameData && !isInitialized) {
      const newOriginalData = {
        previewImageHash: createFileHash(gameData.previewImage),
        previewImageType: gameData.previewImageType || '',
        openerMp3Hash: createFileHash(gameData.openerMp3),
      };
      setOriginalData(newOriginalData);
      setIsInitialized(true);
    }
  }, [gameData, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !gameData) return;

    const currentData = {
      previewImageHash: createFileHash(gameData.previewImage),
      previewImageType: gameData.previewImageType || '',
      openerMp3Hash: createFileHash(gameData.openerMp3),
    };
    
    const hasDataChanges = 
      currentData.previewImageHash !== originalData.previewImageHash ||
      currentData.previewImageType !== originalData.previewImageType ||
      currentData.openerMp3Hash !== originalData.openerMp3Hash;
    
    setHasChanges(hasDataChanges);
  }, [gameData.previewImage, gameData.previewImageType, gameData.openerMp3, originalData, isInitialized]);

  const labelStyling = "text-[15px] font-medium mb-1 text-accent flex items-center gap-1";

  const handleSave = async () => {
    setSectionLoading(prev => ({ ...prev, gamePreview: true }));
    try {
      const previewImage = gameData.previewImage instanceof File ? gameData.previewImage : null;
      const openerMp3 = gameData.openerMp3 instanceof File ? gameData.openerMp3 : null;
      
      await onSave({
        previewImage,
        previewImageType: gameData.previewImageType,
        openerMp3,
      });
      
      const newOriginalData = {
        previewImageHash: createFileHash(gameData.previewImage),
        previewImageType: gameData.previewImageType || '',
        openerMp3Hash: createFileHash(gameData.openerMp3),
      };
      setOriginalData(newOriginalData);
      setHasChanges(false);
    } finally {
      setSectionLoading(prev => ({ ...prev, gamePreview: false }));
    }
  };

  return (
    <div className="w-full  mx-auto mb-8 lg:mb-16 px-6 py-6 rounded-xl shadow-glass bg-white/10 dark:bg-jacarta-800/70 backdrop-blur-sm border border-white/10 dark:border-jacarta-700/40 animate-fade-in">
      <h3 className="text-lg md:text-2xl lg:text-4xl font-semibold text-accent mb-4 flex items-center gap-1 tracking-tight">
        <HiOutlinePhotograph className="text-accent-light md:text-2xl lg:text-4xl text-base opacity-70" />
        Game Preview
      </h3>
      <div className="flex flex-col gap-6 ">
        <div className="flex-1 flex flex-col">
          <label className={labelStyling}>
            <HiOutlinePhotograph className="text-accent-light text-sm opacity-60" />
            Preview Image/Video <span className="text-red-400">*</span>
          </label>
          <input
            ref={choosImageRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => handleImageChange(e, gameData, setGameData, setFormErrors)}
            className="hidden w-[1rem] z-10"
          />
          <div className="rounded-xl border border-accent/10 bg-white/5 dark:bg-jacarta-900/20 p-4 mb-2 flex flex-col items-center justify-center transition hover:shadow-glass focus-within:shadow-glass">
            <ImagePreview
              file={gameData.previewImage instanceof File ? gameData.previewImage : gameData.previewImage || ''}
              choosImageRef={choosImageRef as any}
              savedPrevUrl={typeof gameData.previewImage === 'string' ? gameData.previewImage : null}
              savedPrevType={gameData.previewImageType}
              onFileDrop={(file: File) => {
                const isSupportedType =
                  file.type.startsWith("image/") || file.type.startsWith("video/");
                if (isSupportedType) {
                  if (file.type.startsWith("video/") && file.size > 200 * 1024 * 1024) {
                    setFormErrors({
                      ...formErrors,
                      previewImage: "Video file size must not exceed 200MB",
                    });
                    return;
                  }
                  setGameData((prev) => ({
                    ...prev,
                    previewImage: file,
                    previewImageType: file.type,
                  }));
                  setFormErrors({
                    ...formErrors,
                    previewImage: undefined,
                  });
                  setUnsavedChanges(true);
                } else {
                  alert("Please upload a valid image or video file.");
                }
              }}
            />
            <Button
              size="md"
              className="bg-accent/90 hover:bg-accent text-white font-medium px-5 py-2 rounded-lg shadow-glow transition-all duration-200 text-base mt-4"
              onClick={() => choosImageRef.current?.click()}
              style={{}}
              onMouseOver={() => {}}
              disabled={false}
              onMouseLeave={() => {}}
            >
              <HiOutlinePhotograph className="inline-block text-base mr-2 opacity-80" />
              Upload Game Thumbnail
            </Button>
          </div>
          {renderError("previewImage", formErrors)}
        </div>
        {/* Opener MP3 */}
        <div className="mt-2">
          <label className={labelStyling}>
            <HiOutlineMusicNote className="text-accent-light text-sm opacity-60" />
            Opener MP3 (Optional)
          </label>
          <input
            type="file"
            accept="audio/*"
            ref={chooseAudioRef}
            onChange={(e) => handleAudioChange(e, gameData, setGameData)}
            className="hidden w-[1rem]"
          />
          <div className="flex items-center gap-4 p-2 mt-1 mb-2 rounded-lg w-full border border-accent/10 dark:border-jacarta-600 dark:bg-jacarta-700/40 dark:text-white bg-white/5">
            <Button
              size="sm"
              onClick={() => chooseAudioRef.current?.click()}
              className="bg-accent/90 hover:bg-accent text-white font-medium px-4 py-1 rounded-lg transition-all duration-200 text-sm"
              style={{}}
              onMouseOver={() => {}}
              disabled={false}
              onMouseLeave={() => {}}
            >
              <HiOutlineMusicNote className="inline-block text-base mr-1 opacity-80" />
              Choose file
            </Button>
            {gameData.openerMp3 ? (
              <span className="text-[14px] text-jacarta-700 dark:text-jacarta-100">
                Selected file: {gameData.openerMp3 instanceof File ? gameData.openerMp3.name : gameData.openerMp3}
              </span>
            ) : (
              <span className="text-[14px] text-jacarta-400">No file chosen</span>
            )}
          </div>
        </div>
        {hasChanges && (
          <div className="flex gap-3 mt-4 justify-end">
            <Button
              onClick={handleSave}
              disabled={sectionLoading.gamePreview}
              className={`bg-accent/90 hover:bg-accent text-white font-medium px-5 py-2 rounded-lg shadow-glow transition-all duration-200 text-base flex items-center gap-2 ${
                sectionLoading.gamePreview ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {sectionLoading.gamePreview ? (
                <>
                  <LoadingSpinner size="sm" className="text-white" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePreviewSection;