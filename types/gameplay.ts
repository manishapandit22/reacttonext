// WebSocket and API types
export interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

export interface Voice {
  voice_id: string;
  name: string;
  labels?: {
    accent?: string;
    gender?: string;
    age?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface GroupedVoices {
  [category: string]: Voice[];
}

export interface MusicTrack {
  id: string;
  name: string;
  url: string;
  artist?: string;
  [key: string]: any;
}

export interface Story {
  id: string;
  name: string;
  game_id: string;
  created_at?: string;
  updated_at?: string;
  message_count?: number;
  [key: string]: any;
}

export interface CharacterSelectionPrompt {
  type: string;
  characters?: any[];
  message?: string;
  [key: string]: any;
}

export interface AbilityDeltas {
  [abilityName: string]: number;
}

export interface SuggestionData {
  suggestions?: string[];
  [key: string]: any;
}

