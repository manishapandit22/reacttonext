export enum MEDIA_TYPE {
    JPG = "image/jpeg",
    PNG = "image/png",
    GIF = "image/gif",
    SVG = "image/svg+xml",
    WEBP = "image/webp",
    MP4 = "video/mp4",
    WEBM = "video/webm",
    OGG = "video/ogg"
}

export interface LocationImage {
    id?: string;
    image_id?: string;
    location_id?: string;
    url?: string;
    file?: File | string;
    title?: string;
    description?: string;
    type?: string;
    youtubeUrl?: string;
    savedUrl?: string;
}

export interface Location {
    id?: string | number;
    name: string;
    description: string;
    images: LocationImage[];
    savedImages?: LocationImage[];
}

export interface NPCImage {
    id?: string;
    image_id?: string;
    npc_id?: string;
    url?: string;
    file?: File | string;
    title?: string;
    description?: string;
    type?: string;
    youtubeUrl?: string;
    savedUrl?: string;
}

export interface NPC {
    id?: string | number;
    name: string;
    description: string;
    images: NPCImage[];
    savedImages?: NPCImage[];
    ai_voice?: string;
    playable: boolean;
    class: string;
    characterSheet: any | null;
}

export interface GameData {
    previewImage: File | null;
    previewImageType: string;
    gameName: string;
    gameDescription: string;
    gameOpener: string;
    openerMp3?: File | null;
    gamePrompt?: string;
    initialInstructions: string;
    gameTags: string[];
    storyDocuments: File[] | { id: string; name: string; url: string }[];
    locations: Location[];
    npcs: NPC[];
    dice: boolean;
    monster: boolean | null | undefined;
    inventory: boolean | null | undefined;
    character_sheet: boolean | null | undefined;
    currency_management: boolean | null | undefined;
    combat: boolean;
} 