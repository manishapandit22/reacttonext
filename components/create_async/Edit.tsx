"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameContext } from "../../contexts/GameContext";
import Create from "./Create";
import Loader from "../ui/Loader";
import Button from "../ui/Button";

interface EditProps {
  game_id: string;
}

const Edit: React.FC<EditProps> = ({ game_id }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const { 
    setGameData, 
    getGameDraftDetails, 
    listLocations, 
    listNPCs,
    setHasAssistant,
    setPendingChanges,
    setIsPublished,
    gameData
  } = useGameContext();

  const stateUpdateVerified = useRef(false);
  const isInitializing = useRef(false);

  const loadGameData = useCallback(async () => {
    if (initialized || isInitializing.current) return;
    
    try {
      isInitializing.current = true;
      setLoading(true);
      setError(null);

      const [gameResponseData, locationsData, npcsData] = await Promise.all([
        getGameDraftDetails(game_id),
        listLocations(game_id),
        listNPCs(game_id)
      ]);

      if (!gameResponseData) {
        throw new Error('Invalid game response structure');
      }

      const mappedLocations = locationsData.map(loc => ({
        id: loc.id,
        name: loc.location_name || '',
        description: loc.location_description || '',
        images: [],
        savedImages: Array.isArray(loc.location_images) ? loc.location_images.map(img => ({
          id: img.image_id,
          url: img.url,
          title: img.name || '',
          description: img.description || '',
          type: 'image/jpeg',
          file: null
        })) : []
      }));

      const mappedNPCs = npcsData.map(npc => ({
        id: npc.id,
        name: npc.npc_name || '',
        description: npc.npc_description || '',
        images: [],
        savedImages: Array.isArray(npc.npc_images) ? npc.npc_images.map(img => ({
          id: img.image_id,
          url: img.url,
          title: img.name || '',
          description: img.description || '',
          type: 'image/jpeg',
          file: null
        })) : [],
        playable: npc.is_playable || false,
        characterSheet: npc.character_template || null,
        class: npc.character_template?.class || ''
      }));

      let previewImageFile = null;
      let previewImageUrl = null;
      if (gameResponseData.preview_image) {
        try {
          const response = await fetch(gameResponseData.preview_image);
          if (!response.ok) {
            throw new Error(`Failed to fetch preview image: ${response.status}`);
          }
          const blob = await response.blob();
          previewImageFile = new File([blob], 'preview_image', { type: gameResponseData.preview_image_type });
          previewImageUrl = gameResponseData.preview_image;
        } catch (err) {
          console.error('Failed to load preview image:', err);
          previewImageUrl = gameResponseData.preview_image;
        }
      }

      let openerMp3File = null;
      let openerMp3Url = null;
      if (gameResponseData.opener_mp3) {
        try {
          const response = await fetch(gameResponseData.opener_mp3);
          if (!response.ok) {
            throw new Error(`Failed to fetch opener MP3: ${response.status}`);
          }
          const blob = await response.blob();
          openerMp3File = new File([blob], 'opener.mp3', { type: 'audio/mpeg' });
          openerMp3Url = gameResponseData.opener_mp3;
        } catch (err) {
          console.error('Failed to load opener MP3:', err);
          openerMp3Url = gameResponseData.opener_mp3;
        }
      }

      const newGameData = {
        gameName: gameResponseData.game_name || '',
        gameDescription: gameResponseData.description || '',
        gameOpener: gameResponseData.game_opener || '',
        previewImage: previewImageFile || previewImageUrl || null,
        previewImageType: gameResponseData.preview_image_type || '',
        openerMp3: openerMp3File || openerMp3Url || null,
        initialInstructions: gameResponseData.initial_instructions || '',
        gameTags: Array.isArray(gameResponseData.game_tags) ? gameResponseData.game_tags : [],
        storyDocuments: Array.isArray(gameResponseData.story_documents) ? gameResponseData.story_documents : [],
        locations: mappedLocations,
        npcs: mappedNPCs,
        dice: gameResponseData.dice || false,
        monster: gameResponseData.monster || false,
        inventory: gameResponseData.inventory || false,
        character_sheet: gameResponseData.character_sheet || false,
        currency_management: gameResponseData.currency_management || false,
        combat: gameResponseData.combat || false,
        gamePrompt: '',
        gameMechanics: gameResponseData.game_mechanics || '',
        secretsPlotTwists: gameResponseData.secrets_plot_twists || '',
        storyArcs: gameResponseData.story_arcs || '',
        toneWritingStyle: gameResponseData.tone_writing_style || '',
        otherInformation: gameResponseData.other_information || '',
        // ai_voice: gameResponseData.ai_voice || ''
      };

      await setGameData(newGameData);
      stateUpdateVerified.current = true;

      if (setHasAssistant) setHasAssistant(gameResponseData.has_assistant || false);
      if (setPendingChanges) setPendingChanges(gameResponseData.has_pending_changes || false);
      if (setIsPublished) setIsPublished(gameResponseData.published || false);

      setInitialized(true);
      setLoading(false);
      setRetryCount(0); 
    } catch (err) {
      console.error('Error loading game data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game data';
      setError(`Failed to load game data: ${errorMessage}`);
      setLoading(false);
      setRetryCount(prev => prev + 1);
    } finally {
      isInitializing.current = false;
    }
  }, [game_id, initialized, setGameData, getGameDraftDetails, listLocations, listNPCs, setHasAssistant, setPendingChanges, setIsPublished]);

  useEffect(() => {
    if (game_id && !initialized && retryCount < 3) {
      loadGameData();
    }
  }, [game_id, initialized, retryCount, loadGameData]);

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
    setInitialized(false);
    isInitializing.current = false;
  };

  const handleGoBack = () => {
    router.push('/profile');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen">
        <div className="flex flex-col gap-6 justify-center items-center center-fixed">
          <Loader />
          <p className="mt-4 text-white font-semibold text-xl text-center">
            Loading game data...
          </p>
          {retryCount > 0 && (
            <p className="text-yellow-400 text-sm">
              Retry attempt {retryCount}/3
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen">
        <div className="flex flex-col gap-6 justify-center items-center center-fixed max-w-md mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-red-500 font-semibold text-xl mb-2">
              Failed to Load Game
            </h2>
            <p className="text-red-400 text-sm mb-6">
              {error}
            </p>
            {retryCount >= 3 && (
              <p className="text-yellow-400 text-sm mb-4">
                Maximum retry attempts reached. Please check your connection and try again.
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {retryCount < 3 && (
              <Button
                onClick={handleRetry}
                className="bg-accent hover:bg-accent/90 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 flex-1"
              >
                Try Again
              </Button>
            )}
            <Button
              onClick={handleGoBack}
              className="border border-accent/20 bg-transparent hover:bg-accent/10 text-accent font-medium px-6 py-3 rounded-lg transition-all duration-200 flex-1"
            >
              Go Back
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-gray-400 text-xs">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="h-screen w-screen">
        <div className="flex flex-col gap-6 justify-center items-center center-fixed">
          <Loader />
          <p className="mt-4 text-white font-semibold text-xl text-center">
            Initializing game editor...
          </p>
        </div>
      </div>
    );
  }

  return <Create game_id={game_id} isEdit={true} />;
};

export default Edit; 