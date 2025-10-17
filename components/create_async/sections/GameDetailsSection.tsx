import React, { ChangeEvent, useEffect, useState } from 'react';
import { useGameContext } from '../../../contexts/GameContext';
import renderError from '../utils/renderError';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { FormErrors } from '../../GameCreation/FormValidate';
import { HiOutlineDocumentText, HiOutlinePencilAlt, HiOutlineSparkles } from 'react-icons/hi';
import SelectNarrator from './SelectNarrator';

interface GameDetailsSectionProps {
  formErrors: FormErrors;
  onSave: (details: {
    gameName: string;
    gameDescription: string;
    gameOpener: string;
    initialInstructions: string;
  }) => void;
  onDelete: () => void;
  setUnsavedChanges: (val: boolean) => void;
  selectedVoice: string;
  setSelectedVoice: (voiceId: string) => void;
}

const GameDetailsSection: React.FC<GameDetailsSectionProps> = ({
  formErrors,
  onSave,
  onDelete,
  setUnsavedChanges,
  selectedVoice,
  setSelectedVoice,
}) => {
  const { gameData, setGameData, sectionLoading, setSectionLoading } = useGameContext();
  const [localData, setLocalData] = useState({
    gameName: '',
    gameDescription: '',
    gameOpener: '',
    initialInstructions: ''
  });
  const [originalData, setOriginalData] = useState({
    gameName: '',
    gameDescription: '',
    gameOpener: '',
    initialInstructions: '',
    // selectedVoice: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (gameData) {
      const newLocalData = {
        gameName: gameData.gameName || '',
        gameDescription: gameData.gameDescription || '',
        gameOpener: gameData.gameOpener || '',
        initialInstructions: gameData.initialInstructions || ''
      };
      const newOriginalData = {
        ...newLocalData,
        // selectedVoice: gameData.ai_voice || ''
      };
      
      if (JSON.stringify(newLocalData) !== JSON.stringify(localData)) {
        setLocalData(newLocalData);
        setOriginalData(newOriginalData);
      }
    }
  }, [gameData]);

  useEffect(() => {
    const currentData = {
      gameName: localData.gameName,
      gameDescription: localData.gameDescription,
      gameOpener: localData.gameOpener,
      initialInstructions: localData.initialInstructions,
      // selectedVoice: selectedVoice
    };
    
    const hasDataChanges = JSON.stringify(currentData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanges);
  }, [localData, originalData]);

  const handleInputChange = (field: string, value: string) => {
    const newLocalData = {
      ...localData,
      [field]: value
    };
    setLocalData(newLocalData);

    setGameData(prev => ({
      ...prev,
      [field]: value
    }));

    setUnsavedChanges(true);
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
    setGameData(prev => ({
      ...prev,
      ai_voice: voiceId
    }));
    setUnsavedChanges(true);
  };

  const handleSave = async () => {
    const requiredFields = ['gameName', 'gameDescription', 'gameOpener'];
    const missingFields = requiredFields.filter(field => !localData[field]?.trim());

    if (missingFields.length > 0) {
      console.warn('GameDetailsSection - Missing required fields:', missingFields);
      return;
    }

    setSectionLoading(prev => ({ ...prev, gameDetails: true }));
    try {
      await onSave(localData);
      setOriginalData({
        gameName: localData.gameName,
        gameDescription: localData.gameDescription,
        gameOpener: localData.gameOpener,
        initialInstructions: localData.initialInstructions,
        // selectedVoice: selectedVoice
      });
      setHasChanges(false);
    } finally {
      setSectionLoading(prev => ({ ...prev, gameDetails: false }));
    }
  };

  const labelStyling = "text-[15px] font-medium mb-1 text-accent flex items-center gap-1";
  const inputClass =
    "custom-input mt-1 mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition w-full min-h-[3.25rem]"; 

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 lg:mb-16 px-6 py-6 rounded-xl shadow-glass bg-white/10 dark:bg-jacarta-800/70 backdrop-blur-sm border border-white/10 dark:border-jacarta-700/40 animate-fade-in">
      <h3 className="text-lg md:text-2xl lg:text-4xl font-semibold text-accent mb-4 flex items-center gap-1 tracking-tight">
        <HiOutlineDocumentText className="text-accent-light text-base md:text-2xl lg:text-4xl opacity-70" />
        Game Details
      </h3>
      {/* Game Name */}
      <div>
        <label className={labelStyling}>
          <HiOutlinePencilAlt className="text-accent-light text-sm opacity-60" />
          Game Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={localData.gameName}
          onChange={(e) => handleInputChange('gameName', e.target.value)}
          className={inputClass}
          placeholder="Enter your game's name"
        />
        {renderError("gameName", formErrors)}
      </div>
      {/* Game Description */}
      <div className="mt-6">
        <label className={labelStyling}>
          <HiOutlineSparkles className="text-accent-light text-sm opacity-60" />
          Game Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={localData.gameDescription}
          onChange={(e) => handleInputChange('gameDescription', e.target.value)}
          rows={3}
          className={inputClass}
          style={{ resize: "vertical", minHeight: "3.25rem" }}
          placeholder="Describe your game world, story, or setting"
        />
        {renderError("gameDescription", formErrors)}
      </div>
      {/* Game Opener */}
      <div className="mt-6">
        <label className={labelStyling}>
          <HiOutlineSparkles className="text-accent-light text-sm opacity-60" />
          Game Opener <span className="text-red-400">*</span>
        </label>
        <textarea
          value={localData.gameOpener}
          onChange={(e) => handleInputChange('gameOpener', e.target.value)}
          rows={3}
          className={inputClass}
          style={{ resize: "vertical", minHeight: "3.25rem" }}
          placeholder="Write an engaging opener to hook your players"
        />
        {renderError("gameOpener", formErrors)}
      </div>
      {/* Initial Instructions */}
      <div className="mt-6">
        <label className={labelStyling}>
          <HiOutlineDocumentText className="text-accent-light text-sm opacity-60" />
          Gameplay Initial Instructions
        </label>
        <textarea
          value={localData.initialInstructions}
          onChange={(e) => handleInputChange('initialInstructions', e.target.value)}
          className={inputClass}
          rows={3}
          style={{ resize: "vertical", minHeight: "3.25rem" }}
          placeholder="Provide initial instructions for the game master. These will be used to guide the game's flow and interactions."
        />
        {renderError("initialInstructions", formErrors)}
      </div>
      {/* Select Narrator */}
      <div className="mt-6">
        <SelectNarrator selectedVoice={selectedVoice} setSelectedVoice={handleVoiceChange} />
      </div>
      {hasChanges && (
        <div className="flex gap-3 mt-6 justify-end">
          <Button
            onClick={handleSave}
            disabled={sectionLoading.gameDetails}
            className={`bg-accent/90 hover:bg-accent text-white font-medium px-5 py-2 rounded-lg shadow-glow transition-all duration-200 text-base flex items-center gap-2 ${
              sectionLoading.gameDetails ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {sectionLoading.gameDetails ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
          <Button
            onClick={onDelete}
            disabled={sectionLoading.gameDetails}
            className={`border border-red-400 bg-transparent hover:bg-red-600/10 text-red-400 font-medium px-5 py-2 rounded-lg transition-all duration-200 text-base ${
              sectionLoading.gameDetails ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameDetailsSection; 