export interface FormErrors {
  previewImage?: string;
  gameName?: string;
  gameOpener?: string;
  toneWritingStyle?: string;
  secretsPlotTwists?: string;
  gameTags?: string;
  locations?: string;
  npcs?: string;
  npcsPlayable?: string;
}

import { GameData } from '../../interface/Create';

export const validateForm = (
  gameData: GameData,
  toneWritingStyle: string,
  secretsPlotTwists: string
): FormErrors => {
  const errors: FormErrors = {};

  if (!gameData.previewImage) {
    errors.previewImage = 'Preview image is required';
  }
  if (!gameData.gameName.trim()) {
    errors.gameName = 'Game name is required';
  }
  if (!gameData.gameOpener.trim()) {
    errors.gameOpener = 'Game opener is required';
  }
  if (toneWritingStyle.trim().length > 0 && secretsPlotTwists.trim().length === 0) {
    errors.secretsPlotTwists = 'This field is required';
  }
  if (secretsPlotTwists.trim().length > 0 && toneWritingStyle.trim().length === 0) {
    errors.toneWritingStyle = 'This field is required';
  }
  if (gameData.gameTags.length === 0) {
    errors.gameTags = 'At least one game tag is required';
  }

  if (gameData.locations && gameData.locations.length > 0) {
    const startedLocations = gameData.locations.filter(loc => 
      loc.name.trim() && loc.description.trim()
    );
    
    if (startedLocations.length > 0) {
      const invalidLocations = startedLocations.some((loc) => {
        const totalImages = (loc.images?.length || 0) + (loc.savedImages?.length || 0);
        return !loc.name.trim() || !loc.description.trim() || totalImages === 0;
      });
      
      if (invalidLocations) {
        errors.locations = 'All locations must have name, description and at least one image';
      }
    }
  }
  
  if (gameData.npcs && gameData.npcs.length > 0) {
    const startedNPCs = gameData.npcs.filter(npc => 
      npc.name.trim() && npc.description.trim()
    );
    
    if (startedNPCs.length > 0) {
      const invalidNPCs = startedNPCs.some((npc) => {
        const totalImages = (npc.images?.length || 0) + (npc.savedImages?.length || 0);
        return !npc.name.trim() || !npc.description.trim() || totalImages === 0;
      });
      
      if (invalidNPCs) {
        errors.npcs = 'All NPCs must have name, description and at least one image';
      }

      const hasPlayableNPC = startedNPCs.some((npc) => npc.playable);
      if (!hasPlayableNPC) {
        errors.npcsPlayable = 'You need to add at least one playable character';
      }
    }
  }

  return errors;
};

