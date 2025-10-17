import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useGameContext } from '../../../contexts/GameContext';
import renderError from '../utils/renderError';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { FormErrors } from '../../GameCreation/FormValidate';
import { HiOutlineLightBulb, HiOutlineBookOpen, HiOutlineSparkles, HiOutlineAdjustments } from 'react-icons/hi';
import useSaveWithDebounce from '@/lib/apis/useSaveWithDebounce';

interface GameMetaSectionProps {
  formErrors: FormErrors;
  gameMechanics: string;
  setGameMechanics: (value: string) => void;
  secretsPlotTwists: string;
  setSecretsPlotTwists: (value: string) => void;
  storyArcs: string;
  setStoryArcs: (value: string) => void;
  toneWritingStyle: string;
  setToneWritingStyle: (value: string) => void;
  otherInformation: string;
  setOtherInformation: (value: string) => void;
  onSave: (meta: {
    gameMechanics: string;
    secretsPlotTwists: string;
    storyArcs: string;
    toneWritingStyle: string;
    otherInformation: string;
  }) => void;
  setUnsavedChanges: (val: boolean) => void;
}

const GameMetaSection: React.FC<GameMetaSectionProps> = ({
  formErrors,
  gameMechanics,
  setGameMechanics,
  secretsPlotTwists,
  setSecretsPlotTwists,
  storyArcs,
  setStoryArcs,
  toneWritingStyle,
  setToneWritingStyle,
  otherInformation,
  setOtherInformation,
  onSave,
  setUnsavedChanges,
}) => {
  const { gameData, sectionLoading, setSectionLoading } = useGameContext();
  const [originalData, setOriginalData] = useState({
    gameMechanics: '',
    secretsPlotTwists: '',
    storyArcs: '',
    toneWritingStyle: '',
    otherInformation: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (gameData) {
      const newOriginalData = {
        gameMechanics: gameData.gameMechanics || '',
        secretsPlotTwists: gameData.secretsPlotTwists || '',
        storyArcs: gameData.storyArcs || '',
        toneWritingStyle: gameData.toneWritingStyle || '',
        otherInformation: gameData.otherInformation || ''
      };
      setOriginalData(newOriginalData);
      setGameMechanics(gameData.gameMechanics || '');
      setSecretsPlotTwists(gameData.secretsPlotTwists || '');
      setStoryArcs(gameData.storyArcs || '');
      setToneWritingStyle(gameData.toneWritingStyle || '');
      setOtherInformation(gameData.otherInformation || '');
    }
  }, [gameData]);

  useEffect(() => {
    const currentData = {
      gameMechanics,
      secretsPlotTwists,
      storyArcs,
      toneWritingStyle,
      otherInformation
    };
    
    const hasDataChanges = JSON.stringify(currentData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanges);
  }, [gameMechanics, secretsPlotTwists, storyArcs, toneWritingStyle, otherInformation, originalData]);

  const metaData = {
    gameMechanics,
    secretsPlotTwists,
    storyArcs,
    toneWritingStyle,
    otherInformation,
  };

  const debouncedSave = useSaveWithDebounce({
    onSave: async (data: typeof metaData) => {
      await onSave(data);
      setOriginalData({
        gameMechanics: data.gameMechanics,
        secretsPlotTwists: data.secretsPlotTwists,
        storyArcs: data.storyArcs,
        toneWritingStyle: data.toneWritingStyle,
        otherInformation: data.otherInformation
      });
      setHasChanges(false);
    },
    delay: 5000,
  });

  const handleFieldChange = (field: string, value: string) => {
    setUnsavedChanges(true);
    switch (field) {
      case 'gameMechanics':
        setGameMechanics(value);
        break;
      case 'secretsPlotTwists':
        setSecretsPlotTwists(value);
        break;
      case 'storyArcs':
        setStoryArcs(value);
        break;
      case 'toneWritingStyle':
        setToneWritingStyle(value);
        break;
      case 'otherInformation':
        setOtherInformation(value);
        break;
    }
    
    const updatedData = { ...metaData, [field]: value };
    debouncedSave(updatedData);
  };

  const handleSave = async () => {
    setSectionLoading(prev => ({ ...prev, gameMeta: true }));
    try {
      await onSave(metaData);
      setOriginalData({
        gameMechanics,
        secretsPlotTwists,
        storyArcs,
        toneWritingStyle,
        otherInformation
      });
      setHasChanges(false);
    } finally {
      setSectionLoading(prev => ({ ...prev, gameMeta: false }));
    }
  };

  const labelStyling = "text-[15px] font-medium mb-1 text-accent flex items-center gap-1";

  return (
    <div className="w-full  mx-auto mb-8 lg:mb-16 px-6 py-6 rounded-xl shadow-glass bg-white/10 dark:bg-jacarta-800/70 backdrop-blur-sm border border-white/10 dark:border-jacarta-700/40 animate-fade-in">
      <h3 className=" font-semibold text-accent mb-4 text-2xl lg:text-4xl flex items-center gap-1 tracking-tight">
        <HiOutlineAdjustments className="text-accent-light text-base md:text-2xl lg:text-4xl opacity-70" />
        Game Prompts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelStyling}>
            <HiOutlineLightBulb className="text-accent-light text-sm opacity-60" />
            Game Mechanics
          </label>
          <textarea
            value={gameMechanics}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('gameMechanics', e.target.value)}
            rows={3}
            className="custom-input mt-1 mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition"
            placeholder="Describe the core mechanics or rules (optional)"
          />
        </div>
        <div>
          <label className={labelStyling}>
            <HiOutlineSparkles className="text-accent-light text-sm opacity-60" />
            Secrets, Plot Twists, and When/How to Reveal Them
          </label>
          <textarea
            value={secretsPlotTwists}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('secretsPlotTwists', e.target.value)}
            rows={3}
            className="custom-input mt-1 mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition"
            placeholder="List secrets, twists, or surprises"
          />
          {renderError("secretsPlotTwists", formErrors)}
        </div>
        <div>
          <label className={labelStyling}>
            <HiOutlineBookOpen className="text-accent-light text-sm opacity-60" />
            Story/Quests Arcs/Chapters
          </label>
          <textarea
            value={storyArcs}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('storyArcs', e.target.value)}
            rows={3}
            className="custom-input mt-1 mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition"
            placeholder="Describe story arcs or quest lines (optional)"
          />
        </div>
        <div>
          <label className={labelStyling}>
            <HiOutlineSparkles className="text-accent-light text-sm opacity-60" />
            Tone and Writing Style
          </label>
          <textarea
            value={toneWritingStyle}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('toneWritingStyle', e.target.value)}
            rows={3}
            className="custom-input mt-1 mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition"
            placeholder="Describe the tone, style, or provide examples"
          />
          {renderError("toneWritingStyle", formErrors)}
        </div>
        <div className="md:col-span-2">
          <label className={labelStyling}>
            <HiOutlineLightBulb className="text-accent-light text-sm opacity-60" />
            Other Information
          </label>
          <textarea
            value={otherInformation}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleFieldChange('otherInformation', e.target.value)}
            rows={3}
            className="custom-input mt-1 mb-2 bg-white/5 dark:bg-jacarta-900/20 border border-accent/10 focus:border-accent focus:ring-1 focus:ring-accent/20 rounded-lg text-[15px] font-medium text-jacarta-900 dark:text-white placeholder:text-jacarta-400 transition"
            placeholder="Any other notes or info (optional)"
          />
        </div>
      </div>
      {hasChanges && (
        <div className="flex gap-3 mt-6 justify-end">
          <Button
            onClick={handleSave}
            disabled={sectionLoading.gameMeta}
            className={`bg-accent/90 hover:bg-accent text-white font-medium px-5 py-2 rounded-lg shadow-glow transition-all duration-200 text-base flex items-center gap-2 ${
              sectionLoading.gameMeta ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {sectionLoading.gameMeta ? (
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
  );
};

export default GameMetaSection; 