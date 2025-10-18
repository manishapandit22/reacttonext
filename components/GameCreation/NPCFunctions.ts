import { GameData, NPC, NPCImage } from '@/types';
import { defaultStatBlocks } from '../create_async/utils/DefaultBlocks';

export async function handleNPCSave(
  gameId: string,
  npc: any,
  createNPC: any,
  updateNPC: any,
  setGameData: any
) {
  const formData = new FormData();
  formData.append('npc_name', npc.name);
  formData.append('npc_description', npc.description);
  formData.append('npc_playable', String(npc.playable));

  const uniqueImages = npc.images.filter((img: any, index: number, self: any[]) => 
    index === self.findIndex((i: any) => (
      (i.file && img.file && i.file.name === img.file.name && i.file.size === img.file.size) ||
      (i.url && img.url && i.url === img.url) ||
      (i.id && img.id && i.id === img.id)
    ))
  );

  uniqueImages.forEach((img: any, i: number) => {
    if (img.file) formData.append(`npc_images[${i}][file]`, img.file);
    if (img.title) formData.append(`npc_images[${i}][name]`, img.title);
    if (img.description) formData.append(`npc_images[${i}][description]`, img.description);
  });

  let updated;
  if (npc.id) {
    updated = await updateNPC(gameId, npc.id, formData);
  } else {
    updated = await createNPC(gameId, formData);
  }

  if (updated) {
    setGameData((prev: GameData) => {
      const newNpcs = prev.npcs.map((n) => {
        if (n.id === updated.id || (!n.id && !updated.id && n.name === updated.npc_name)) {
          return {
            ...n,
            ...updated,
            id: updated.id,
            name: updated.npc_name,
            description: updated.npc_description,
            images: updated.npc_images || uniqueImages
          };
        }
        return n;
      });
      return { ...prev, npcs: newNpcs };
    });
  }
}

export async function handleNPCDelete(
  gameId: string,
  npcId: string,
  deleteNPC: any,
  setGameData: any
) {
  await deleteNPC(gameId, npcId);
  setGameData((prev: GameData) => ({
    ...prev,
    npcs: prev.npcs.filter((n) => String(n.id) !== String(npcId)),
  }));
}

export async function handleNPCImageUpdate(
  gameId: string,
  npcId: string,
  imageId: string,
  imageData: any,
  updateNPCImage: any,
  setGameData: any
) {
  const formData = new FormData();
  if (imageData.file) formData.append('file', imageData.file);
  if (imageData.title) formData.append('name', imageData.title);
  if (imageData.description) formData.append('description', imageData.description);
  const updated = await updateNPCImage(gameId, npcId, imageId, formData);
  if (updated) {
    setGameData((prev: GameData) => {
      const newNpcs = prev.npcs.map((n) => {
        if (String(n.id) === String(npcId)) {
          const newImages = n.images.map((img: any) =>
            String(img.id) === String(imageId) ? { ...img, ...updated } : img
          );
          return { ...n, images: newImages };
        }
        return n;
      });
      return { ...prev, npcs: newNpcs };
    });
  }
}

export async function handleNPCImageDelete(
  gameId: string,
  npcId: string,
  imageId: string,
  deleteNPCImage: any,
  setGameData: any
) {
  await deleteNPCImage(gameId, npcId, imageId);
  setGameData((prev: GameData) => {
    const newNpcs = prev.npcs.map((n) => {
      if (String(n.id) === String(npcId)) {
        return { ...n, images: n.images.filter((img: any) => String(img.id) !== String(imageId)) };
      }
      return n;
    });
    return { ...prev, npcs: newNpcs };
  });
}

export function handleNPCImageChange(
  imageData: NPCImage,
  isAdding: boolean,
  selectedNPC: number,
  selectedNPCImage: number,
  gameData: GameData,
  setGameData: (cb: (prev: GameData) => GameData) => void
): void {
  setGameData((prev) => {
    const newGameData = { ...prev };
    if (
      typeof selectedNPC !== 'number' ||
      selectedNPC < 0 ||
      selectedNPC >= newGameData.npcs.length
    ) {
      return prev;
    }
    if (isAdding) {
      const alreadyExists = newGameData.npcs[selectedNPC].images.some(
        img => img.file === imageData.file && img.title === imageData.title
      );
      if (!alreadyExists) {
        newGameData.npcs[selectedNPC].images.push(imageData);
      }
    } else {
      if (
        typeof selectedNPCImage !== 'number' ||
        selectedNPCImage < 0
      ) {
        return prev;
      }
      newGameData.npcs[selectedNPC].images[selectedNPCImage] = imageData;
    }
    return newGameData;
  });
}

export function addNPC(gameData: GameData, setGameData: (cb: (prev: GameData) => GameData) => void): void {
  setGameData((prev) => ({
    ...prev,
    npcs: [
      ...prev.npcs,
      {
        name: '',
        description: '',
        images: [],
        playable: false,
        class: '',
        characterSheet: null,
      },
    ],
  }));
}

const createAbilityStructure = (classPreset: any) => {
  const strength = classPreset?.Strength ?? classPreset?.strength ?? 10;
  const dexterity = classPreset?.Dexterity ?? classPreset?.dexterity ?? 10;
  const constitution = classPreset?.Constitution ?? classPreset?.constitution ?? 10;
  const intelligence = classPreset?.Intelligence ?? classPreset?.intelligence ?? 10;
  const wisdom = classPreset?.Wisdom ?? classPreset?.wisdom ?? 10;
  const charisma = classPreset?.Charisma ?? classPreset?.charisma ?? 10;

  const abilities = {
    Strength: { score: strength, modifier: Math.floor((strength - 10) / 2) },
    Dexterity: { score: dexterity, modifier: Math.floor((dexterity - 10) / 2) },
    Constitution: { score: constitution, modifier: Math.floor((constitution - 10) / 2) },
    Intelligence: { score: intelligence, modifier: Math.floor((intelligence - 10) / 2) },
    Wisdom: { score: wisdom, modifier: Math.floor((wisdom - 10) / 2) },
    Charisma: { score: charisma, modifier: Math.floor((charisma - 10) / 2) }
  };
  return abilities;
};

export function handleNPCChange(
  index: number,
  field: keyof NPC | 'images' | 'playable' | 'class',
  value: any,
  gameData: GameData,
  setGameData: (cb: (prev: GameData) => GameData) => void
): { openModal?: boolean, selectedNPCIndex?: number, currentCharacter?: any } {
  let openModal = false;
  let selectedNPCIndex: number | undefined = undefined;
  let currentCharacter: any = undefined;
  
  setGameData((prev) => {
    const newNPCs = [...prev.npcs];
    
    if (field === 'images' && value.target.files && value.target.files.length > 0) {
      newNPCs[index].images = [
        ...prev.npcs[index].images,
        ...Array.from(value.target.files ?? []) as NPCImage[],
      ];
    } else if (field === 'playable') {
      newNPCs[index].playable = value;
      
      if (value) {
        const selectedClass = newNPCs[index].class || 'Fighter'; 
        newNPCs[index].class = selectedClass;
        
        const classPreset = (defaultStatBlocks as Record<string, any>)[selectedClass]?.abilities || {
          Strength: 10, Dexterity: 10, Constitution: 10, Intelligence: 10, Wisdom: 10, Charisma: 10
        };
        
        const abilities = createAbilityStructure(classPreset);
        
        const constitutionMod = abilities.Constitution.modifier;
        const dexterityMod = abilities.Dexterity.modifier;
        const level = 1;
        const hp = 10 + (constitutionMod * level);
        const ac = 10 + dexterityMod;
        
        if (!newNPCs[index].characterSheet) {
          newNPCs[index].characterSheet = {
            gender: 'Male',
            class: selectedClass,
            level: level,
            abilities: abilities,
            HP: hp,
            max_hp: hp,
            AC: ac,
            background: newNPCs[index].description,
            playable: true,
            name: newNPCs[index].name,
            image_url: newNPCs[index].images[0]?.file || '',
          };
        } else {
          newNPCs[index].characterSheet = {
            ...newNPCs[index].characterSheet,
            class: selectedClass,
            abilities: abilities,
            HP: hp,
            max_hp: hp,
            AC: ac,
            playable: true,
            name: newNPCs[index].name,
            background: newNPCs[index].description,
          };
        }
        
        openModal = true;
        selectedNPCIndex = index;
        currentCharacter = {
          ...newNPCs[index].characterSheet,
          index: index,
          name: newNPCs[index].name,
          images: newNPCs[index].images
        };
      } else {
        newNPCs[index].characterSheet = null;
        newNPCs[index].class = '';
      }
    } else if (field === 'class') {
      const previousClass = newNPCs[index].class;
      newNPCs[index].class = value;
      
      const classPreset = (defaultStatBlocks as Record<string, any>)[value]?.abilities || {
        Strength: 10, Dexterity: 10, Constitution: 10, Intelligence: 10, Wisdom: 10, Charisma: 10
      };
      
      const abilities = createAbilityStructure(classPreset);
      
      const constitutionMod = abilities.Constitution.modifier;
      const dexterityMod = abilities.Dexterity.modifier;
      const level = newNPCs[index].characterSheet?.level || 1;
      const hp = 10 + (constitutionMod * level);
      const ac = 10 + dexterityMod;
      
      newNPCs[index].characterSheet = {
        gender: newNPCs[index].characterSheet?.gender || 'Male',
        class: value,
        level: level,
        abilities: abilities,
        HP: hp,
        max_hp: hp,
        AC: ac,
        background: newNPCs[index].description,
        playable: true,
        name: newNPCs[index].name,
        image_url: newNPCs[index].images[0]?.file || '',
      };
      
      if (previousClass !== value && value !== '') {
        openModal = true;
        selectedNPCIndex = index;
        currentCharacter = {
          ...newNPCs[index].characterSheet,
          index: index,
          name: newNPCs[index].name,
          images: newNPCs[index].images
        };
      }
    } else {
      (newNPCs[index] as any)[field] = value;
      
      if (newNPCs[index].characterSheet) {
        newNPCs[index].characterSheet.name = newNPCs[index].name;
        newNPCs[index].characterSheet.background = newNPCs[index].description;
        newNPCs[index].characterSheet.image_url = newNPCs[index].images[0]?.file || '';
      }
    }
    
    return {
      ...prev,
      npcs: newNPCs,
    };
  });
  
  return { openModal, selectedNPCIndex, currentCharacter };
}

export function removeNPCImage(
  npcIndex: number,
  imageIndex: number,
  gameData: GameData,
  setGameData: (cb: (prev: GameData) => GameData) => void
): void {
  setGameData((prev) => {
    const newNPCs = [...prev.npcs];
    newNPCs[npcIndex].images = newNPCs[npcIndex].images.filter((_, index) => index !== imageIndex);
    if (newNPCs[npcIndex].characterSheet) {
      newNPCs[npcIndex].characterSheet.image_url = newNPCs[npcIndex].images[0]?.file || '';
    }
    return { ...prev, npcs: newNPCs };
  });
}

export function removeNpc(
  index: number,
  gameData: GameData,
  setGameData: (cb: (prev: GameData) => GameData) => void
): void {
  if (gameData.npcs.length > 1) {
    setGameData((prev) => {
      const filteredNpcs = prev.npcs.filter((_, i) => i !== index);
      return { ...prev, npcs: filteredNpcs };
    });
  }
}