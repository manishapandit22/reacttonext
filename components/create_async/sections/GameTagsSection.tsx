import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { useGameContext } from '../../../contexts/GameContext';
import { gameGenres } from '../../../constants/game';
import { handleTagChange, handleDocumentsChange, removeDocument } from '../../GameCreation/CommonFunction';
import renderError from '../utils/renderError';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { FormErrors } from '../../GameCreation/FormValidate';
import { HiOutlineTag, HiOutlineDocumentAdd } from 'react-icons/hi';
import useSaveWithDebounce from '@/lib/apis/useSaveWithDebounce';

interface GameTagsSectionProps {
  formErrors: FormErrors;
  onSave: (tags: { gameTags: string[]; storyDocuments: File[] }) => void;
  setUnsavedChanges: (val: boolean) => void;
  gameId: string;
}

const GameTagsSection: React.FC<GameTagsSectionProps> = React.memo(({ formErrors, onSave, setUnsavedChanges, gameId }) => {
  const { gameData, setGameData, deleteGameStoryDoc, sectionLoading, setSectionLoading } = useGameContext();
  const chooseStoryDocRef = useRef<HTMLInputElement>(null);
  const [originalData, setOriginalData] = useState({
    gameTags: [] as string[],
    storyDocuments: [] as File[]
  });
  const [hasChanges, setHasChanges] = useState(false);

  const storyDocuments = useMemo(() => {
    return Array.isArray(gameData.storyDocuments)
      ? gameData.storyDocuments.filter((doc): doc is File => doc instanceof File)
      : [];
  }, [gameData.storyDocuments]);

  useEffect(() => {
    if (gameData) {
      const newOriginalData = {
        gameTags: [...gameData.gameTags],
        storyDocuments: [...storyDocuments]
      };
      setOriginalData(newOriginalData);
    }
  }, [gameData]);

  useEffect(() => {
    const currentData = {
      gameTags: gameData.gameTags,
      storyDocuments: storyDocuments
    };
    
    const hasDataChanges = 
      JSON.stringify(currentData.gameTags) !== JSON.stringify(originalData.gameTags) ||
      currentData.storyDocuments.length !== originalData.storyDocuments.length ||
      currentData.storyDocuments.some((doc, index) => 
        !originalData.storyDocuments[index] || 
        doc.name !== originalData.storyDocuments[index].name || 
        doc.size !== originalData.storyDocuments[index].size
      );
    
    setHasChanges(hasDataChanges);
  }, [gameData.gameTags, storyDocuments, originalData]);

  const debouncedSaveTags = useSaveWithDebounce({
    onSave: async (data: { gameTags: string[] }) => {
      await onSave({ gameTags: data.gameTags, storyDocuments: [] });
      setOriginalData(prev => ({
        ...prev,
        gameTags: [...data.gameTags]
      }));
      setHasChanges(false);
    },
    delay: 5000,
  });

  const debouncedSaveDocuments = useSaveWithDebounce({
    onSave: async (data: { storyDocuments: File[] }) => {
      await onSave({ gameTags: [], storyDocuments: data.storyDocuments });
      setOriginalData(prev => ({
        ...prev,
        storyDocuments: [...data.storyDocuments]
      }));
      setHasChanges(false);
    },
    delay: 5000,
  });

  const labelStyling = 'text-[15px] font-medium mb-1 text-accent flex items-center gap-1';

  const handleDeleteStoryDoc = useCallback((docId: string, index: number) => {
    if(docId) deleteGameStoryDoc(gameId, docId);
    
    const currentDocs = Array.isArray(gameData.storyDocuments) ? gameData.storyDocuments : [];
    const updatedDocs = currentDocs.filter((_, i) => i !== index);
    
    setGameData(prev => ({
      ...prev,
      storyDocuments: updatedDocs as any
    }));
    
    setUnsavedChanges(true);
    
    const fileDocs = updatedDocs.filter((doc): doc is File => doc instanceof File);
    debouncedSaveDocuments({ storyDocuments: fileDocs });
  }, [deleteGameStoryDoc, gameId, gameData, setGameData, setUnsavedChanges, debouncedSaveDocuments]);

  const handleManualSave = useCallback(async () => {
    const currentDocs = Array.isArray(gameData.storyDocuments) ? gameData.storyDocuments : [];
    const fileDocs = currentDocs.filter((doc): doc is File => doc instanceof File);
    
    setSectionLoading(prev => ({ ...prev, gameTags: true }));
    try {
      if (gameData.gameTags.length > 0 || fileDocs.length > 0) {
        await onSave({ gameTags: gameData.gameTags, storyDocuments: fileDocs });
        setOriginalData({
          gameTags: [...gameData.gameTags],
          storyDocuments: [...fileDocs]
        });
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error in manual save:', error);
    } finally {
      setSectionLoading(prev => ({ ...prev, gameTags: false }));
    }
  }, [onSave, gameData.gameTags, gameData.storyDocuments, setSectionLoading]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const currentDocs = Array.isArray(gameData.storyDocuments) ? gameData.storyDocuments : [];
      const updatedDocs = [...currentDocs, ...newFiles];
      
      setGameData(prev => ({
        ...prev,
        storyDocuments: updatedDocs as any
      }));
      
      setUnsavedChanges(true);
      
      const fileDocs = updatedDocs.filter((doc): doc is File => doc instanceof File);
      debouncedSaveDocuments({ storyDocuments: fileDocs });
      
      if (chooseStoryDocRef.current) {
        chooseStoryDocRef.current.value = '';
      }
    }
  }, [setGameData, setUnsavedChanges, debouncedSaveDocuments, gameData.storyDocuments]);

  const handleTagClick = useCallback((tag: string) => {
    const updatedTags = gameData.gameTags.includes(tag)
      ? gameData.gameTags.filter((t) => t !== tag)
      : [...gameData.gameTags, tag];
    
    setGameData(prev => ({
      ...prev,
      gameTags: updatedTags
    }));
    
    setUnsavedChanges(true);
    
    debouncedSaveTags({ gameTags: updatedTags });
  }, [gameData, setGameData, setUnsavedChanges, debouncedSaveTags]);

  return (
    <div className="w-full  mx-auto mb-8 lg:mb-16 px-6 py-6 rounded-xl shadow-glass bg-white/10 dark:bg-jacarta-800/70 backdrop-blur-sm border border-white/10 dark:border-jacarta-700/40 animate-fade-in">
      <h3 className="text-lg md:text-2xl lg:text-4xl font-semibold text-accent mb-4 flex items-center gap-1 tracking-tight">
        <HiOutlineTag className="text-accent-light md:text-2xl lg:text-4xl text-base opacity-70" />
        Game Tags & Documents
      </h3>
      <div className="flex flex-col gap-8">
        {/* Game Tags */}
        <div className="flex-1 flex flex-col">
          <span className={labelStyling}>
            <HiOutlineTag className="text-accent-light text-sm opacity-60" />
            Game Tags <span className="text-red-400">*</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
            {gameGenres.map((tag) => (
              <div
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`flex items-center justify-center cursor-pointer gap-2 px-3 py-1 rounded-full font-medium text-[14px] border transition-colors duration-150
                  ${gameData.gameTags.includes(tag)
                    ? "bg-accent/90 text-white border-accent shadow-glow"
                    : "bg-white/5 dark:bg-jacarta-900/20 text-jacarta-700 dark:text-jacarta-100 border-accent/10 hover:bg-accent/10 hover:text-accent"}
                `}
              >
                {tag}
              </div>
            ))}
          </div>
          <div className="mt-2">{renderError("gameTags", formErrors)}</div>
        </div>
        {/* Story Documents */}
        <div className="flex-1 flex flex-col">
          <label className={labelStyling}>
            <HiOutlineDocumentAdd className="text-accent-light text-sm opacity-60" />
            Story Documents
          </label>
          <div className="rounded-lg border border-accent/10 dark:border-jacarta-600 dark:bg-jacarta-700/40 dark:text-white bg-white/5 p-3 min-h-[56px]">
            <ul className="flex flex-col gap-2">
              {(Array.isArray(gameData.storyDocuments) ? gameData.storyDocuments : []).map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-2 text-[14px] text-jacarta-700 dark:text-white"
                >
                  <span className="truncate max-w-[80%]">{file.name}</span>
                  <button
                    type="button"
                    className="text-xs text-red-400 hover:underline"
                    onClick={() => handleDeleteStoryDoc(file.id, index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-end mt-3 gap-2">
            <Button
              size="sm"
              className="bg-accent/90 hover:bg-accent text-white font-medium px-4 py-1 rounded-lg transition-all duration-200 text-sm"
              style={{}}
              onMouseOver={() => {}}
              onMouseLeave={() => {}}
              disabled={false}
              onClick={() => chooseStoryDocRef.current?.click()}
            >
              <HiOutlineDocumentAdd className="inline-block text-base mr-1 opacity-80" />
              Add file
            </Button>
            <input
              type="file"
              ref={chooseStoryDocRef}
              multiple
              accept=".docx,.pptx,.cls,.pdf,.html,.txt,.md,.jpeg,.jpg,.png,.svg"
              onChange={handleFileInputChange}
              className="w-[1rem] hidden"
            />
          </div>
          <div className="mt-2">{renderError("storyDocuments", formErrors)}</div>
        </div>
      </div>
      {hasChanges && (
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleManualSave}
            disabled={sectionLoading.gameTags}
            className={`bg-accent/90 hover:bg-accent text-white font-medium px-5 py-2 rounded-lg shadow-glow transition-all duration-200 text-base flex items-center gap-2 ${
              sectionLoading.gameTags ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {sectionLoading.gameTags ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                Saving...
              </>
            ) : (
              `Save (${gameData.gameTags.length} tags, ${Array.isArray(gameData.storyDocuments) ? gameData.storyDocuments.length : 0} docs)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
});

export default React.memo(GameTagsSection);