"use client";

import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import useWebSocket from "react-use-websocket";
import useAxiosWithAuth from "../../hooks/useAxiosWithAuth";
import Loader from "../ui/Loader";
import withAuth from "../../hooks/withAuth";
import ImageModal from "../modals/ImageModal";
import { useUser } from "../../contexts/UserContext";
import { GameCreationSuccess } from "./GameCreateSuccess";
import CharacterCreatorModal from "./CharacterStats";
import { GameData, NPC } from "../../interface/Create";
import { validateForm, FormErrors } from "../GameCreation/FormValidate";
import { fetchGame, fetchGames } from "../GameCreation/CommonFunction";
import { useGameContext } from "../../contexts/GameContext";
import LimitReached from "../GameCreation/LimitReached";
import EarlyAccess from "../GameCreation/EarlyAccess";
import GameHeaderSection from "./sections/GameHeaderSection";
import GamePreviewSection from "./sections/GamePreviewSection";
import GameDetailsSection from "./sections/GameDetailsSection";
import GameMetaSection from "./sections/GameMetaSection";
import GameTagsSection from "./sections/GameTagsSection";
import LocationsSection from "./sections/LocationsSection";
import NPCsSection from "./sections/NPCsSection";
import SubmitSection from "./sections/SubmitSection";
import ToastNotification from "../ToastNotification/index"; 
import { toast } from "react-toastify";
import AutoSaving from "./sections/AutoSaving";

export interface UserProfile {
  max_games_creation_allowed?: number;
  games_created?: number;
}

const isProduction =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
  process.env.NEXT_PUBLIC_VERCEL_URL?.includes("main");

interface Props {
  game_id?: string;
  isEdit?: boolean;
}

const GameForm = ({ game_id, isEdit }: Props) => {
  const { axiosInstance } = useAxiosWithAuth();
  const router = useRouter();
  const { profile } = useUser();
  const [loading, setLoading] = useState(true); 
  const [progress, setProgress] = useState("");
  const [websocketId, setWebsocketId] = useState<string | null>(null);
  const [gameCreationId, setGameCreationId] = useState<string | null>(null);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNPCIndex, setSelectedNPCIndex] = useState<number | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<NPC | null>(null);
  const [gameId, setGameId] = useState<string | null>(game_id ?? null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [apiError, setApiError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [gameMechanics, setGameMechanics] = useState("");
  const [secretsPlotTwists, setSecretsPlotTwists] = useState("");
  const [storyArcs, setStoryArcs] = useState("");
  const [toneWritingStyle, setToneWritingStyle] = useState("");
  const [otherInformation, setOtherInformation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedLocationImage, setSelectedLocationImage] = useState<number | null>(null);
  const [selectedNPC, setSelectedNPC] = useState<any>(null);
  const [selectedNPCImage, setSelectedNPCImage] = useState<number | null>(null);
  // const [selectedVoice, setSelectedVoice] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [savedImage, setSavedImage] = useState(false);
  const [selectedSavedImage, setSelectedSavedImage] = useState<number | null>(null);
  const [savedLocationImage, setSavedLocationImage] = useState(false);
  const [selectedSavedLocationImage, setSelectedSavedLocationImage] = useState<number | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [selectedVoice, setSelectedVoice] = useState("");

  const sectionsRef = useRef<HTMLDivElement>(null);

  const { 
    gameData, 
    setGameData, 
    createLocation, 
    createNPC, 
    setPendingChanges,
    setHasAssistant,
    pendingChanges,
    hasAssistant, 
    setInitialInstructions, 
    updateGameDraft, 
    deleteGameDraft, 
    updateLocation, 
    deleteLocation, 
    updateNPC, 
    deleteNPC,
    getInitGame,
    updateNPCImage,
    updateLocationImage
  } = useGameContext();

  useEffect(() => {
    if (game_id) {
      setGameId(game_id);
    }
  }, [game_id]);

  useEffect(() => {
    if (gameId && sectionsRef.current && dataReady) {
      setTimeout(() => {
        sectionsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [gameId, dataReady]);

  useEffect(() => {
    const initializeData = async () => {
      if (!initialized && game_id) {
        setLoading(true);
        try {
          if (!isEdit) {
            const initData = await getInitGame(game_id);
          } else {
            console.log('Create - Using existing data in edit mode');
          }
          setInitialized(true);
        } catch (error) {
          console.error('Create - Initialization error:', error);
          setApiError('Failed to initialize game data');
        } finally {
          setLoading(false);
        }
      }
    };

    initializeData();
  }, [initialized, game_id, isEdit, getInitGame]);

  useEffect(() => {
    
    if (gameData) {
  setGameMechanics(gameData.gameMechanics || '');
      setSecretsPlotTwists(gameData.secretsPlotTwists || '');
      setStoryArcs(gameData.storyArcs || '');
      setToneWritingStyle(gameData.toneWritingStyle || '');
      setOtherInformation(gameData.otherInformation || '');
      // prefer persisted ai_voice from game data, fall back to browser default if set
      const initialVoice = (gameData as any)?.ai_voice || '';
      if (initialVoice) {
        setSelectedVoice(initialVoice);
      } else {
        try {
          const browserDefault = localStorage.getItem('tts_default_voice');
          if (browserDefault) setSelectedVoice(browserDefault);
        } catch (e) {
          setSelectedVoice('');
        }
      }
      
      const requiredFields = ['gameName', 'gameDescription', 'gameOpener', 'initialInstructions'];
      const hasRequiredFields = requiredFields.every(field => gameData[field] !== undefined);
      const hasValidArrays = Array.isArray(gameData.locations) && 
                           Array.isArray(gameData.npcs) && 
                           Array.isArray(gameData.gameTags);
      
      if (hasRequiredFields && hasValidArrays) {
        setDataReady(true);
        setLoading(false);
      } else {
        console.warn('Create - Data validation failed:', {
          hasRequiredFields,
          hasValidArrays
        });
      }
    }
  }, [gameData]);


  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChanges]);

  useWebSocket(
    websocketId
      ? `${(process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(
          "http",
          "ws"
        )}/ws/game/${websocketId}`
      : null,
    {
      shouldReconnect: () => true,
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        setProgress(data.message);

        if (data.status === "complete") {
          setIsSuccessVisible(true);
          setTimeout(() => {
            setLoading(false);
            router.push("/profile");
          }, 5000);
        }
        if (data.status === "error") {
          setProgress(data.message);
          setApiError(data.message);
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        }
      },
    }
  );

  const handleSaveGameDetails = async (details: { gameName: string; gameDescription: string; gameOpener: string; initialInstructions: string; }) => {
    try {
      let id = gameId;
      let pendingChange = pendingChanges;
      let hasAssist = hasAssistant;
      if (!id) {
        const res = await setInitialInstructions({
          gameName: details.gameName,
          gameDescription: details.gameDescription,
          initialInstructions: details.initialInstructions,
          gameOpener: details.gameOpener,
          previewImage: gameData.previewImage instanceof File ? gameData.previewImage : null,
          previewImageType: gameData.previewImageType,
          ai_voice: selectedVoice,
        });
        id = res.success?.data.game_id || res.success?.id || res.success?.data?.id;
        pendingChange = res.success?.data.has_pending_changes ?? null;
        hasAssist = res.success?.data.has_assistant ?? null;
        setGameId(id);
        if (setPendingChanges) setPendingChanges(pendingChange);
        if (setHasAssistant) setHasAssistant(hasAssist);
      } else {
        const formData = new FormData();
        formData.append("game_name", details.gameName);
        formData.append("description", details.gameDescription);
        formData.append("game_opener", details.gameOpener);
        formData.append("initial_instructions", details.initialInstructions);
  formData.append("ai_voice", selectedVoice);
        await updateGameDraft(id, formData);
      }
      toast.success("Game details saved!",{autoClose: 2000});
      setUnsavedChanges(false);
    } catch (err) {
      toast.error("Failed to save game details.",{autoClose: 2000});
      throw err;
    }
  };

  const handleDeleteGameDraft = async () => {
    if (!gameId) {
      throw new Error("Game ID not available");
    }
    try {
      await deleteGameDraft(gameId);
      setGameId(null);
      toast.success("Draft deleted.",{autoClose: 2000});
    } catch (err) {
      toast.error("Failed to delete draft.",{autoClose: 2000});
      throw err;
    }
  };

  const handleSaveMeta = async (meta: { gameMechanics: string; secretsPlotTwists: string; storyArcs: string; toneWritingStyle: string; otherInformation: string; }) => {
    if (!gameId) {
      toast.error("Save game details first!",{autoClose: 2000});
      throw new Error("Game ID not available");
    }
    try {
      const formData = new FormData();
      formData.append("game_mechanics", meta.gameMechanics);
      formData.append("secrets_plot_twists", meta.secretsPlotTwists);
      formData.append("story_arcs", meta.storyArcs);
      formData.append("tone_writing_style", meta.toneWritingStyle);
      formData.append("other_information", meta.otherInformation);
      await updateGameDraft(gameId, formData);
       setGameData(prev => ({
      ...prev,
      gameMechanics: meta.gameMechanics,
      secretsPlotTwists: meta.secretsPlotTwists,
      storyArcs: meta.storyArcs,
      toneWritingStyle: meta.toneWritingStyle,
      otherInformation: meta.otherInformation,
    })); 
      toast.success("Meta info saved!",{autoClose: 2000});
      setUnsavedChanges(false);
    } catch (error) {
      toast.error("Failed to save meta info.",{autoClose: 2000});
      throw error;
    }
  };

  const handleSavePreview = async (preview: { previewImage: File | null; previewImageType: string; openerMp3: File | null; }) => {
    if (!gameId) {
      toast.error("Save game details first!",{autoClose: 2000});
      throw new Error("Game ID not available");
    }
    try {
      const formData = new FormData();
      if (preview.previewImage) formData.append("preview_image", preview.previewImage);
      if (preview.previewImageType) formData.append("preview_image_type", preview.previewImageType);
      if (preview.openerMp3) formData.append("opener_mp3", preview.openerMp3);
      await updateGameDraft(gameId, formData);
      toast.success("Preview saved!",{autoClose: 2000});
      setUnsavedChanges(false);
    } catch (error) {
      toast.error("Failed to save preview.",{autoClose: 2000});
      throw error;
    }
  };

  const handleSaveTags = async (tags: { gameTags: string[]; storyDocuments: File[] }) => {
    if (!gameId) {
      toast.error("Save game details first!",{autoClose: 2000});
      throw new Error("Game ID not available");
    }
    try {
      let hasTags = tags.gameTags && tags.gameTags.length > 0;
      let hasDocuments = tags.storyDocuments && tags.storyDocuments.length > 0;
      
      if (hasTags && hasDocuments) {
        const tagsFormData = new FormData();
        tags.gameTags.forEach(tag => tagsFormData.append("game_tag", tag));
        await updateGameDraft(gameId, tagsFormData);
        
        const docsFormData = new FormData();
        const uniqueDocs = tags.storyDocuments.filter((doc, index, self) => 
          index === self.findIndex((d) => (
            d.name === doc.name && d.size === doc.size
          ))
        );
        uniqueDocs.forEach(doc => docsFormData.append("story_documents", doc));
        const res = await updateGameDraft(gameId, docsFormData);
        
        if (res.story_documents) {
          setGameData((prev) => ({
            ...prev,
            storyDocuments: res.story_documents,
          }));
        }
        
        toast.success("Tags & docs saved!",{autoClose: 2000});
      } else if (hasTags) {
        const formData = new FormData();
        tags.gameTags.forEach(tag => formData.append("game_tag", tag));
        await updateGameDraft(gameId, formData);
        toast.success("Tags saved!",{autoClose: 2000});
      } else if (hasDocuments) {
        const formData = new FormData();
        const uniqueDocs = tags.storyDocuments.filter((doc, index, self) => 
          index === self.findIndex((d) => (
            d.name === doc.name && d.size === doc.size
          ))
        );
        uniqueDocs.forEach(doc => formData.append("story_documents", doc));
        const res = await updateGameDraft(gameId, formData);
        
        if (res.story_documents) {
          setGameData((prev) => ({
            ...prev,
            storyDocuments: res.story_documents,
          }));
        }
        
        toast.success("Documents saved!",{autoClose: 2000});
      }
      
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving tags/docs:", error);
      toast.error("Failed to save tags/docs.",{autoClose: 2000});
      throw error;
    }
  };

  const handleSaveLocation = async (locationIndex: number, location: any) => {
    if (!gameId) {
      toast.error("Save game details first!", { autoClose: 2000 });
      return;
    }
    
    const requestKey = `location-${locationIndex}-${location.id || 'new'}`;
    if (pendingRequests.has(requestKey)) {
      return; 
    }
    
    setPendingRequests(prev => new Set(prev).add(requestKey));
    
    try {
      let updated: any;
      let locationData: any;
      if (!location.id) {
        const formData = new FormData();
        formData.append("location_name", location.name);
        formData.append("location_description", location.description);
        updated = await createLocation(gameId, formData);
        locationData = updated?.success?.data || updated;
      } else {
        const formData = new FormData();
        formData.append("location_name", location.name);
        formData.append("location_description", location.description);
        location.images.forEach((img: any, i: number) => {
          if (img.file) formData.append(`location_images[${i}][file]`, img.file);
          if (img.title) formData.append(`location_images[${i}][name]`, img.title);
          if (img.description) formData.append(`location_images[${i}][description]`, img.description);
        });
        updated = await updateLocation(gameId, location.id, formData);
        locationData = updated.success?.data || updated;
      }

      if (locationData) {
        setGameData((prev: GameData) => {
          const newLocations = prev.locations.map((loc, idx) => {
            if (idx !== locationIndex) return loc;
            const newImages = (locationData.location_images || []).filter((img: any) => !img.image_id);
            const newSavedImages = (locationData.location_images || []).filter((img: any) => img.image_id);
            return {
              ...loc,
              id: locationData.id || loc.id,
              name: locationData.location_name || loc.name,
              description: locationData.location_description || loc.description,
              images: newImages,
              savedImages: newSavedImages.map((img: any) => ({
                id: img.image_id || img.id,
                image_id: img.image_id || img.id,
                url: img.url,
                title: img.name || img.title || '',
                description: img.description || '',
                type: 'image'
              })),
            };
          });
          return { ...prev, locations: newLocations };
        });
      }

      if (location.id) {
        toast.success("Location saved!", { autoClose: 2000 });
      }
      setUnsavedChanges(false);
    } catch (e) {
      toast.error("Failed to save location.", { autoClose: 2000 });
      console.error(e);
      throw e; 
    } finally {
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!gameId) return;
    try {
      await deleteLocation(gameId, locationId);
      toast.success("Location deleted.",{autoClose: 2000});
    } catch {
      toast.error("Failed to delete location.",{autoClose: 2000});
    }
  };

  const handleSaveNPC = async (npcIndex: number, npc: any) => {
    if (!gameId) {
      toast.error("Save game details first!", { autoClose: 2000 });
      return;
    }
    
    const requestKey = `npc-${npcIndex}-${npc.id || 'new'}`;
    if (pendingRequests.has(requestKey)) {
      return; 
    }
    
    setPendingRequests(prev => new Set(prev).add(requestKey));
    
    try {
      let updated: any;
      let npcData: any;
      if (!npc.id) {
        const formData = new FormData();
        formData.append("npc_name", npc.name);
        formData.append("npc_description", npc.description);
        formData.append("is_playable", String(npc.playable));
        updated = await createNPC(gameId, formData);
        npcData = updated?.success?.data || updated;
      } else {
        const formData = new FormData();
        formData.append("npc_name", npc.name);
        formData.append("npc_description", npc.description);
        formData.append("is_playable", String(npc.playable));
        if (npc.class) {
          formData.append("npc_class", npc.class);
        }
        if (npc.characterSheet) {
          formData.append("character_template", JSON.stringify(npc.characterSheet));
        }
        npc.images.forEach((img: any, i: number) => {
          if (img.file) formData.append(`npc_images[${i}][file]`, img.file);
          if (img.title) formData.append(`npc_images[${i}][name]`, img.title);
          if (img.description) formData.append(`npc_images[${i}][description]`, img.description);
        });
        updated = await updateNPC(gameId, npc.id, formData);
        npcData = updated.success?.data || updated;
      }

      if (npcData) {
        setGameData((prev: GameData) => {
          const newNpcs = prev.npcs.map((n, idx) => {
            if (idx !== npcIndex) return n;
            const newImages = (npcData.npc_images || []).filter((img: any) => !img.image_id);
            const newSavedImages = (npcData.npc_images || []).filter((img: any) => img.image_id);
            return {
              ...n,
              id: npcData.id || n.id,
              name: npcData.npc_name || n.name,
              description: npcData.npc_description || n.description,
              playable: npcData.is_playable !== undefined ? npcData.is_playable : n.playable,
              class: npcData.npc_class || n.class,
              characterSheet: npcData.character_template || n.characterSheet,
              images: newImages,
              savedImages: newSavedImages.map((img: any) => ({
                id: img.image_id,
                url: img.url,
                title: img.name || img.title || '',
                description: img.description || '',
              })),
            };
          });
          return { ...prev, npcs: newNpcs };
        });
      }

      if (npc.id) {
        toast.success("NPC saved!", { autoClose: 2000 });
      }
      setUnsavedChanges(false);
    } catch (e) {
      toast.error("Failed to save NPC.", { autoClose: 2000 });
      console.error(e);
      throw e; 
    } finally {
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestKey);
        return newSet;
      });
    }
  };

  const handleDeleteNPC = async (npcId: string) => {
    if (!gameId) return;
    try {
      await deleteNPC(gameId, npcId);
      toast.success("NPC deleted.",{autoClose: 2000});
    } catch {
      toast.error("Failed to delete NPC.",{autoClose: 2000});
    }
  };

  const redirectToGamesDashboard = () => {
    router.push('/profile');
  };

  const checkFormValidity = () => {
    const errors = validateForm(gameData, toneWritingStyle, secretsPlotTwists);
    const hasErrors = Object.keys(errors).length > 0;
    
    const hasBasicRequiredFields = 
      gameData.gameName?.trim() &&
      gameData.gameOpener?.trim() &&
      (gameData.previewImage instanceof File || (typeof gameData.previewImage === 'string' && gameData.previewImage)) &&
      gameData.gameTags?.length > 0;
    
    const hasMetaFields = 
      (!toneWritingStyle?.trim() && !secretsPlotTwists?.trim()) || 
      (toneWritingStyle?.trim() && secretsPlotTwists?.trim()); 
    
    const isValid = !hasErrors && !!hasBasicRequiredFields && !!hasMetaFields;
    setIsFormValid(isValid);
  };

  useEffect(() => {
    if (dataReady) {
      checkFormValidity();
    }
  }, [
    gameData.gameName,
    gameData.gameOpener,
    gameData.previewImage,
    gameData.gameTags,
    gameData.locations,
    gameData.npcs,
    toneWritingStyle,
    secretsPlotTwists,
    formErrors,
    dataReady
  ]);

  useEffect(() => {
    if (isFormValid && Object.keys(formErrors).length > 0) {
      setFormErrors({});
    }
  }, [isFormValid, formErrors]);

  const handleSubmit = async () => {
    if (loading) return;
    const errors = validateForm(gameData, toneWritingStyle, secretsPlotTwists);
    setFormErrors(errors);
    checkFormValidity();
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors in the form before submitting.",{autoClose: 2000});
      return;
    }
    // if (
    //   !gameData.gameName.trim() ||
    //   !gameData.gameOpener.trim() ||
    //   !(gameData.previewImage instanceof File) ||
    //   !gameData.previewImageType
    // ) {
    //   toast.error("Please fill all required fields: Name, Opener, Preview Image, and Image Type.",{autoClose: 2000});
    //   return;
    // }
    setLoading(true);
    setApiError("");
    try {
      const formData = new FormData();
      formData.append("preview_image", gameData.previewImage);
      formData.append("preview_image_type", gameData.previewImageType);
      formData.append("initial_instructions", gameData.initialInstructions);
      formData.append("game_name", gameData.gameName);
      formData.append("description", gameData.gameDescription);
      formData.append("game_opener", gameData.gameOpener);
      // formData.append("ai_voice", selectedVoice);
      if (gameData.openerMp3) {
        formData.append("opener_mp3", gameData.openerMp3);
      }
      formData.append("dice", String(gameData.dice));
      formData.append("inventory", String(gameData.inventory));
      formData.append("monster", String(gameData.monster));
      formData.append("combat", String(gameData.combat));
      formData.append("character_template", String(gameData.character_sheet));
      formData.append("currency_management", String(gameData.currency_management));
      gameData.gameTags.forEach((tag, index) => {
        formData.append(`game_tag`, tag);
      });
      (Array.isArray(gameData.storyDocuments) ? gameData.storyDocuments : []).forEach((doc: File | { id: string; name: string; url: string }, index: number) => {
        if (doc instanceof File) {
          /**
           * @see got story doc error
           */
          // formData.append(`story_documents[${index}]`, doc);
          formData.append(`story_documents`, doc);
        }
      });
      gameData.locations.forEach((location, index) => {
        formData.append(`location[${index}][location_name]`, location.name ?? "");
        formData.append(`location[${index}][location_description]`, location.description ?? "");
        (Array.isArray(location.images) ? location.images : []).forEach((image: any, i: number) => {
          if (image.title !== undefined) formData.append(`location[${index}][location_images][${i}][name]`, image.title ?? "");
          if (image.description !== undefined) formData.append(`location[${index}][location_images][${i}][description]`, image.description ?? "");
          if (image.type !== undefined) formData.append(`location[${index}][location_images][${i}][type]`, image.type ?? "");
          if (image.type === "youtube" && image.youtubeUrl !== undefined) {
            formData.append(`location[${index}][location_images][${i}][youtube_url]`, image.youtubeUrl ?? "");
          } else if (image.file) {
            formData.append(`location[${index}][location_images][${i}][file]`, image.file);
          }
        });
      });
      gameData.npcs.forEach((npc, index) => {
        formData.append(`npc[${index}][npc_name]`, npc.name ?? "");
        formData.append(`npc[${index}][npc_description]`, npc.description ?? "");
        formData.append(`npc[${index}][is_playable]`, String(npc.playable));
        (Array.isArray(npc.images) ? npc.images : []).forEach((image: any, i: number) => {
          if (image.title !== undefined) formData.append(`npc[${index}][npc_images][${i}][name]`, image.title ?? "");
          if (image.description !== undefined) formData.append(`npc[${index}][npc_images][${i}][description]`, image.description ?? "");
          if (image.type !== undefined) formData.append(`npc[${index}][npc_images][${i}][type]`, image.type ?? "");
          if (image.type === "youtube" && image.youtubeUrl !== undefined) {
            formData.append(`npc[${index}][npc_images][${i}][youtube_url]`, image.youtubeUrl ?? "");
          } else if (image.file) {
            formData.append(`npc[${index}][npc_images][${i}][file]`, image.file);
          }
          // include per-NPC selected voice if present
          if (npc.ai_voice) {
            formData.append(`npc[${index}][ai_voice]`, npc.ai_voice);
          }
          if (npc.ai_voice) {
            formData.append(`npc[${index}][ai_voice]`, npc.ai_voice);
          }
        });
        if (npc.playable && npc.characterSheet) {
          let cs = { ...npc.characterSheet };
          if (
            cs.abilities &&
            Object.values(cs.abilities).every(val => typeof val === 'number')
          ) {
            const capitalized = (s) => s.charAt(0).toUpperCase() + s.slice(1);
            const fixedAbilities = {};
            Object.entries(cs.abilities).forEach(([key, value]) => {
              const numValue = typeof value === 'number' ? value : 0;
              fixedAbilities[capitalized(key)] = {
                score: numValue,
                modifier: Math.floor((numValue - 10) / 2)
              };
            });
            cs.abilities = fixedAbilities;
          }
          formData.append(`npc[${index}][character_template]`, JSON.stringify(cs));
        }
      });
      formData.append("game_mechanics", gameMechanics);
      formData.append("secrets_plot_twists", secretsPlotTwists);
      formData.append("story_arcs", storyArcs);
      formData.append("tone_writing_style", toneWritingStyle);
      formData.append("other_information", otherInformation);
      const response = await axiosInstance.post(
        (process.env.NEXT_PUBLIC_BACKEND_URL ?? "") + `/ai-games/games/drafts/${gameId}/build/`,
        // formData,
        // {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // }
      );
      setProgress("Sending Game creation request");
      toast.success("Game creation request sent!",{autoClose: 2000});
      setIsSuccessVisible(true);
    } catch (err) {
      setApiError("Failed to create game.");
      toast.error("Failed to create game.",{autoClose: 2000});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen">
        <div className="flex flex-col gap-6 justify-center items-center center-fixed">
          <Loader />
          <p className="mt-4 text-white font-semibold text-xl text-center">
            Loading game data...
          </p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="h-screen w-screen">
        <div className="flex flex-col gap-6 justify-center items-center center-fixed">
          <p className="text-red-500 font-semibold text-xl text-center">
            {apiError}
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="bg-accent text-white px-4 py-2 rounded-lg"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <GameCreationSuccess
        isVisible={isSuccessVisible}
        setIsSuccessVisible={setIsSuccessVisible}
        previewImage={gameData.previewImage}
        game_id={gameId}
        axiosInstance={axiosInstance}
        fetchGames={fetchGames}
        setSelectedGame={setSelectedGame}
        setIsModalOpen={setIsModalOpen}
        redirectToGamesDashboard={redirectToGamesDashboard}
        onGamePublished={(gameData) => {
          localStorage.setItem('recentlyPublishedGame', JSON.stringify(gameData));
          router.push('/profile?showSuccessModal=true');
        }}
      />
      {selectedNPCIndex !== null && currentCharacter && (
        <CharacterCreatorModal
          isOpen={isModalOpen}
          setIsOpen={(open: boolean) => {
            setIsModalOpen(open);
            if (!open) {
              setSelectedNPCIndex(null);
              setCurrentCharacter(null);
            }
          }}
          character={currentCharacter}
          npcImage={gameData?.npcs}
          onSave={handleSaveNPC}
        />
      )}
      {profile &&
        !isEdit && //skipping limit check for edit mode for now
        (profile as UserProfile)?.max_games_creation_allowed === (profile as UserProfile)?.games_created ? (
          <LimitReached profile={profile} />
        ) : (
          <>
            <EarlyAccess />
            {!loading && dataReady ? (
              <form
                className="max-w-6xl mx-auto py-24 rounded-lg shadow mt-[200px] md:mt-[110px] "
                onSubmit={e => { e.preventDefault(); }}
              >
                <GameHeaderSection apiError={apiError} isEdit={isEdit} />
                <div className="flex flex-col w-full md:flex-row">
                  <GamePreviewSection
                    formErrors={formErrors}
                    setFormErrors={setFormErrors}
                    onSave={handleSavePreview}
                    setUnsavedChanges={setUnsavedChanges}
                  />
                  <GameDetailsSection
                    formErrors={formErrors}
                    onSave={handleSaveGameDetails}
                    onDelete={handleDeleteGameDraft}
                    setUnsavedChanges={setUnsavedChanges}
                    selectedVoice={selectedVoice}
                    setSelectedVoice={setSelectedVoice}
                  />
                </div>
                {gameId ? (
                  <div ref={sectionsRef} className="animate-fade-in-up">
                     <GameMetaSection
                      formErrors={formErrors}
                      gameMechanics={gameMechanics}
                      setGameMechanics={setGameMechanics}
                      secretsPlotTwists={secretsPlotTwists}
                      setSecretsPlotTwists={setSecretsPlotTwists}
                      storyArcs={storyArcs}
                      setStoryArcs={setStoryArcs}
                      toneWritingStyle={toneWritingStyle}
                      setToneWritingStyle={setToneWritingStyle}
                      otherInformation={otherInformation}
                      setOtherInformation={setOtherInformation}
                      onSave={handleSaveMeta}
                      setUnsavedChanges={setUnsavedChanges}
                    />
                    <GameTagsSection
                      formErrors={formErrors}
                      onSave={handleSaveTags}
                      setUnsavedChanges={setUnsavedChanges}
                      gameId={gameId}
                    /> 
                    <LocationsSection
                      formErrors={formErrors}
                      setSelectedLocation={setSelectedLocation}
                      setSelectedElement={setSelectedElement}
                      setIsAdding={setIsAdding}
                      setIsOpen={setIsOpen}
                      onSave={handleSaveLocation}
                      onDelete={handleDeleteLocation}
                      setUnsavedChanges={setUnsavedChanges}
                      gameId={gameId}
                      setSavedImage={setSavedLocationImage}
                      setSelectedSavedImage={setSelectedSavedLocationImage}
                      setSelectedLocationImage={setSelectedLocationImage}
                    />
                    <NPCsSection
                      formErrors={formErrors}
                      setSelectedNPC={setSelectedNPC}
                      setSelectedElement={setSelectedElement}
                      setIsAdding={setIsAdding}
                      setIsOpen={setIsOpen}
                      setSelectedNPCIndex={setSelectedNPCIndex}
                      setCurrentCharacter={setCurrentCharacter}
                      setIsModalOpen={setIsModalOpen}
                      onSave={handleSaveNPC}
                      onDelete={handleDeleteNPC}
                      setUnsavedChanges={setUnsavedChanges}
                      gameId={gameId}
                      setSavedImage={setSavedImage}
                      setSelectedSavedImage={setSelectedSavedImage}
                    />
                    <SubmitSection onSubmit={handleSubmit} isEdit={isEdit} isFormValid={isFormValid} isSubmitting={loading} />
                  </div>
                ) : (
                  <div className="w-full max-w-2xl mx-auto my-12 px-6 py-8 rounded-xl shadow-glass bg-white/10 dark:bg-jacarta-800/70 backdrop-blur-sm border border-white/10 dark:border-jacarta-700/40 flex flex-col items-center justify-center animate-fade-in-up">
                    <span className="text-accent text-lg font-semibold mb-2">Save your game details to proceed</span>
                    <p className="text-jacarta-600 dark:text-jacarta-100 text-[15px] text-center">Please fill out and save the game details above. Once saved, you can continue customizing your game world!</p>
                  </div>
                )}
              </form>
            ) : (
              <div className="h-screen w-screen">
                <div className="flex flex-col gap-6 justify-center items-center center-fixed">
                  <Loader />
                  <p className="mt-4 text-white font-semibold text-xl text-center">
                    Loading game data...
                  </p>
                </div>
              </div>
            )}
            <ImageModal
              gameId={gameId ?? ""}
              selectedData={
                selectedElement === "NPC"
                  ? savedImage
                    ? gameData.npcs?.[selectedNPCIndex ?? 0]?.savedImages?.[selectedSavedImage ?? 0] ?? null
                    : gameData.npcs?.[selectedNPCIndex ?? 0]?.images?.[selectedNPCImage ?? 0] ?? null
                  : savedLocationImage
                    ? gameData.locations?.[selectedLocation ?? 0]?.savedImages?.[selectedSavedLocationImage ?? 0] ?? null
                    : gameData.locations?.[selectedLocation ?? 0]?.images?.[selectedLocationImage ?? 0] ?? null
              }
              selectedElement={selectedElement}
              isAdding={isAdding}
              isOpen={isOpen}
              setIsOpen={(open: boolean) => {
                setIsOpen(open);
                if (!open) {
                  setSelectedNPCIndex(null);
                  setCurrentCharacter(null);
                }
              }}
              editingImageType={null}
              editingImageIndex={null}
              selectedLocation={selectedLocation}
              selectedLocationImage={selectedLocationImage}
              selectedNPC={selectedNPCIndex}
              selectedNPCImage={selectedNPCImage}
              setIsAdding={setIsAdding}
              updateNPCImage={updateNPCImage}
              updateLocationImage={updateLocationImage}
            />
            <ToastNotification />
          </>
        )}
        <AutoSaving />
    </>
  );
};

export default withAuth(GameForm);
