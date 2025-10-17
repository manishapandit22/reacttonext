import useAxiosWithAuth from '@/hooks/useAxiosWithAuth';
import { GameData } from '../interface/Create';
import React, { createContext, ReactNode, useState, useContext, Dispatch, SetStateAction, useEffect, useRef } from 'react';

interface GameContextProviderProps {
  children: ReactNode;
}

interface ExtendedGameData extends GameData {
  gameMechanics?: string;
  secretsPlotTwists?: string;
  storyArcs?: string;
  toneWritingStyle?: string;
  otherInformation?: string;
  // ai_voice?: string;
}

const defaultGameData: ExtendedGameData = {
  previewImage: null,
  previewImageType: '',
  gameName: '',
  gameDescription: '',
  gameOpener: '',
  openerMp3: null,
  gamePrompt: '',
  initialInstructions: '',
  gameTags: [],
  storyDocuments: [],
  locations: [
    { 
      id: null,
      name: '', 
      description: '', 
      images: [] 
    }
  ],
  npcs: [
    { 
      id: null,
      name: '', 
      description: '', 
      images: [], 
      playable: false, 
      class: '', 
      characterSheet: null 
    }
  ],
  dice: false,
  monster: false,
  inventory: false,
  character_sheet: false,
  currency_management: false,
  combat: false,
  gameMechanics: '',
  secretsPlotTwists: '',
  storyArcs: '',
  toneWritingStyle: '',
  otherInformation: '',
  // ai_voice: ''
};

export interface HasGameInfo{
  gameName: string;
  gameDescription: string;
  gameOpener: string;
  previewImage: string | ImageData | File;
  previewImageType: string;
}
export interface GameContextType {
  gameData: ExtendedGameData;
  published: null | boolean | undefined;
  hasAssistant: null | boolean | undefined;
  pendingChanges: null | boolean | undefined;
  saving: boolean | null | undefined;
  gameId?: string | null;
  setSaving?: Dispatch<SetStateAction<boolean | undefined | null>>;
  setHasAssistant?: Dispatch<SetStateAction<boolean | undefined | null>>;
  setPendingChanges?: Dispatch<SetStateAction<boolean | undefined | null>>;
  setIsPublished?: Dispatch<SetStateAction<boolean | undefined | null>>;
  setGameData: Dispatch<SetStateAction<ExtendedGameData>>;
  setInitialInstructions: <T extends HasGameInfo, R = any>(payload?: T) => Promise<R>;
  getInitGame: <T>(gameId: T)=>Promise<T>;
  initializationComplete: Readonly<boolean | undefined>;
  createGameDraft: (formData: FormData) => Promise<GameDraft>;
  listGameDrafts: () => Promise<GameDraft[]>;
  updateGameDraft: (gameId: string, formData: FormData) => Promise<GameDraft>;
  deleteGameDraft: (gameId: string) => Promise<void>;
  getGameDraftDetails: (gameId: string) => Promise<GameDraft>;
  deleteGameStoryDoc: (gameId: string, docId: string) => Promise<void>;
  listLocations: (gameId: string) => Promise<Location[]>;
  createLocation: (gameId: string, formData: FormData) => Promise<Location>;
  updateLocation: (gameId: string, locationId: string, formData: FormData) => Promise<Location>;
  deleteLocation: (gameId: string, locationId: string) => Promise<void>;
  deleteLocationImage: (gameId: string, locationId: string, imageId: string) => Promise<void>;
  updateLocationImage: (gameId: string, locationId: string, imageId: string, formData: FormData) => Promise<any>;
  listNPCs: (gameId: string) => Promise<NPC[]>;
  createNPC: (gameId: string, formData: FormData) => Promise<NPC>;
  updateNPC: (gameId: string, npcId: string, formData: FormData) => Promise<NPC>;
  deleteNPC: (gameId: string, npcId: string) => Promise<void>;
  deleteNPCImage: (gameId: string, npcId: string, imageId: string) => Promise<void>;
  updateNPCImage: (gameId: string, npcId: string, imageId: string, formData: FormData) => Promise<any>;
  loading: {loading: boolean, target: string | null};
  sectionLoading: {[key: string]: boolean};
  setSectionLoading: Dispatch<SetStateAction<{[key: string]: boolean}>>;
}

export const GameContextInstance = createContext<GameContextType | undefined>(undefined);

export interface GameDraft extends GameDraftResponse {
  id: string;
}

export interface Location extends LocationResponse {}

export interface NPC extends NPCResponse {}

export interface GameDoc {
  id: string;
  name: string;
  url: string;
}

export function removeLocationImage(
  locationIndex: number,
  imageIndex: number,
  gameData: any,
  setGameData: (cb: (prev: any) => any) => void
): void {
  setGameData((prev: any) => {
    const newLocations = [...prev.locations];
    newLocations[locationIndex].images = newLocations[locationIndex].images.filter(
      (_: any, idx: number) => idx !== imageIndex
    );
    return { ...prev, locations: newLocations };
  });
}

interface APIResponse<T> {
  status: string;
  code: number;
  success: {
    message: string;
    data: T;
  };
}

interface GameDraftResponse {
  game_id: string;
  game_name: string;
  game_opener: string;
  description: string;
  preview_image: string;
  preview_image_type: string;
  opener_mp3: string | null;
  story_documents: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  game_tags: string[];
  dice: boolean;
  monster: boolean;
  inventory: boolean;
  character_sheet: boolean;
  currency_management: boolean;
  combat: boolean;
  game_mechanics: string;
  secrets_plot_twists: string;
  story_arcs: string;
  tone_writing_style: string;
  other_information: string | null;
  initial_instructions: string;
  // ai_voice: string;
  published: boolean;
  has_assistant: boolean;
  has_pending_changes: boolean;
}

interface LocationResponse {
  id: number;
  location_name: string;
  location_description: string;
  location_images: Array<{
    image_id: string;
    url: string;
    name: string;
    description: string;
  }>;
}

interface NPCResponse {
  id: number;
  npc_name: string;
  npc_description: string;
  npc_images: Array<{
    image_id: string;
    url: string;
    name: string;
    description: string;
  }>;
  is_playable: boolean;
  character_template: any;
}

const GameContextProvider = ({ children }: GameContextProviderProps) => {
  const [gameData, setGameData] = useState<ExtendedGameData>(defaultGameData);
  const [initializationComplete, setInitializationComplete] = useState<boolean | undefined>(false);
  const [published, setIsPublished] = useState<boolean | undefined | null>(null);
  const [hasAssistant, setHasAssistant] = useState<boolean | undefined | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<boolean | undefined | null>(null);
  const [loading, setLoading] = useState<{loading: boolean, target: string | null}>({loading: false, target: null});
  const [sectionLoading, setSectionLoading] = useState<{[key: string]: boolean}>({});

  const { axiosInstance } = useAxiosWithAuth();

  const lastGameDataUpdate = useRef<ExtendedGameData | null>(null);

  useEffect(() => {
    lastGameDataUpdate.current = gameData;
  }, [gameData]);

  const setGameDataWithVerification = async (newData: ExtendedGameData | ((prev: ExtendedGameData) => ExtendedGameData)) => {
    
    const finalData = typeof newData === 'function' ? newData(gameData) : newData;
    
    setGameData(finalData);
    lastGameDataUpdate.current = finalData;
    
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 0);
    });
  };

 async function setInitialInstructions<T extends Record<string, any>, R = any>(payload?: T): Promise<R> {
  const formData = new FormData();
  const data: any = payload || gameData;
  const appendIfExists = (key: string, value: any) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  };
  if (data.gameName && data.gameName.trim()) {
    formData.append("game_name", data.gameName);
  }
  if (data.gameDescription && data.gameDescription.trim()) {
    formData.append("description", data.gameDescription);
  }
  if (data.gameOpener && data.gameOpener.trim()) {
    formData.append("game_opener", data.gameOpener);
  }
  if (data.previewImage instanceof File) {
    formData.append("preview_image", data.previewImage);
  }
  if (data.previewImageType && data.previewImageType.trim()) {
    formData.append("preview_image_type", data.previewImageType);
  }
  if (data.openerMp3 instanceof File) {
    formData.append("opener_mp3", data.openerMp3);
  }
  appendIfExists("game_prompt", data.gamePrompt);
  appendIfExists("initial_instructions", data.initialInstructions);
  if (data.ai_voice) {
    // formData.append("ai_voice", data.ai_voice);
  }
  if (Array.isArray(data.gameTags)) {
    data.gameTags.forEach((tag: string) => formData.append("game_tags", tag));
  }
  if (Array.isArray(data.storyDocuments)) {
    data.storyDocuments.forEach((doc: any) => {
      if (doc instanceof File) {
        formData.append("story_documents", doc);
      } else if (typeof doc === 'string') {
        formData.append("story_documents", doc);
      }
    });
  }
  if (Array.isArray(data.locations)) {
    formData.append("locations", JSON.stringify(data.locations));
  }
  if (Array.isArray(data.npcs)) {
    formData.append("npcs", JSON.stringify(data.npcs));
  }
  (["dice","monster","inventory","character_sheet","currency_management","combat"] as const).forEach((key) => {
    if (typeof data[key] === 'boolean' || typeof data[key] === 'string' || typeof data[key] === 'number') {
      formData.append(key, String(data[key]));
    }
  });
  const response = await axiosInstance.post<R>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/`,
    formData
  );
  if(response.status === 200){
    console.log("got the response")
  }
  return response.data;
}

async function getInitGame<T>(gameId: T): Promise<T>{
  const response = await axiosInstance.get<T>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}`
  )
  if(response.status=== 200){
    setInitializationComplete(true)
  }
  return response.data;
}

async function createGameDraft(formData: FormData): Promise<GameDraft> {
  const { data } = await axiosInstance.post<GameDraft>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/`,
    formData
  );
  return data;
}

async function listGameDrafts(): Promise<GameDraft[]> {
  const { data } = await axiosInstance.get<GameDraft[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/list`
  );
  return data;
}

/**
 * gonna use this func for the sync feature
 * @param gameId 
 * @param formData 
 * @returns Promise<GameDraft>
 */
async function updateGameDraft(gameId: string, formData: FormData, ai_voice?: string): Promise<GameDraft> {
  // if (ai_voice) {
  //   formData.append("ai_voice", ai_voice);
  // }
  const { data } = await axiosInstance.patch<GameDraft>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/`,
    formData
  );
  return data;
}

async function deleteGameDraft(gameId: string): Promise<void> {
  await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/`
  );
}

async function getGameDraftDetails(gameId: string): Promise<GameDraft> {
  const { data } = await axiosInstance.get<APIResponse<GameDraftResponse>>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/detail/`
  );
  return { ...data.success.data, id: data.success.data.game_id };
}

async function deleteGameStoryDoc(gameId: string, docId: string): Promise<void> {
  await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/documents/${docId}/`
  );
}

async function listLocations(gameId: string): Promise<Location[]> {
  const { data } = await axiosInstance.get<APIResponse<LocationResponse[]>>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/locations/`
  );
  return data.success.data;
}

async function createLocation(gameId: string, formData: FormData): Promise<Location> {
  setLoading({loading: true, target: "location"});
  try {
    const { data } = await axiosInstance.post<Location>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/locations/`,
      formData
    );
    return data;
  } finally {
    setLoading({loading: false, target: "location"});
  }
}

async function updateLocation(gameId: string, locationId: string, formData: FormData): Promise<Location> {
  setLoading({loading: true, target: "location"});
  try {
    const { data } = await axiosInstance.put<Location>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/locations/${locationId}/`,
      formData
    );
    return data;
  } finally {
    setLoading({loading: false, target: "location"});
  }
}

async function deleteLocation(gameId: string, locationId: string): Promise<void> {
  await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/locations/${locationId}/`
  );
}

async function deleteLocationImage(gameId: string, locationId: string, imageId: string): Promise<void> {
  await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/locations/${locationId}/images/${imageId}/`
  );
}

async function updateLocationImage(
  gameId: string,
  locationId: string,
  imageId: string,
  formData: FormData
): Promise<any> {
  const { data } = await axiosInstance.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/locations/${locationId}/images/${imageId}/`,
    formData
  );
  return data;
}

async function listNPCs(gameId: string): Promise<NPC[]> {
  const { data } = await axiosInstance.get<APIResponse<NPCResponse[]>>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/npcs/`
  );
  return data.success.data;
}

async function createNPC(gameId: string, formData: FormData): Promise<NPC> {
  setLoading({loading: true, target: "npc"});
  try {
    const { data } = await axiosInstance.post<NPC>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/npcs/`,
      formData
    );
    return data;
  } finally {
    setLoading({loading: false, target: "npc"});
  }
}

async function updateNPC(gameId: string, npcId: string, formData: FormData): Promise<NPC> {
  setLoading({loading: true, target: "npc"});
  try {
    const { data } = await axiosInstance.put<NPC>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/npcs/${npcId}/`,
      formData
    );
    return data;
  } finally {
    setLoading({loading: false, target: "npc"});
  }
}

async function deleteNPC(gameId: string, npcId: string): Promise<void> {
  await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/npcs/${npcId}/`
  );
}

async function deleteNPCImage(gameId: string, npcId: string, imageId: string): Promise<void> {
  await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/npcs/${npcId}/images/${imageId}/`
  );
}

async function updateNPCImage(
  gameId: string,
  npcId: string,
  imageId: string,
  formData: FormData
): Promise<any> {
  const { data } = await axiosInstance.put(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/drafts/${gameId}/npcs/${npcId}/images/${imageId}/`,
    formData
  );
  return data;
}

  return (
    <GameContextInstance.Provider value={{
      gameData,
      setGameData: setGameDataWithVerification,
      published,
      loading,
      setIsPublished,
      pendingChanges,
      setHasAssistant,
      hasAssistant,
      setPendingChanges,
      saving,
      setSaving,
      setInitialInstructions,
      getInitGame,
      initializationComplete,
      createGameDraft,
      listGameDrafts,
      updateGameDraft,
      deleteGameDraft,
      getGameDraftDetails,
      deleteGameStoryDoc,
      listLocations,
      createLocation,
      updateLocation,
      deleteLocation,
      deleteLocationImage,
      updateLocationImage,
      listNPCs,
      createNPC,
      updateNPC,
      deleteNPC,
      deleteNPCImage,
      updateNPCImage,
      gameId,
      sectionLoading,
      setSectionLoading
    }}>
      {children}
    </GameContextInstance.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContextInstance);
  if (!context) throw new Error('useGameContext must be used within a GameContextProvider');
  return context;
};

export default GameContextProvider;