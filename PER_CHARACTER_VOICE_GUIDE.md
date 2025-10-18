# Per-Character Voice Implementation Guide

## Overview
This project now supports per-character voices using the ElevenLabs API. Each NPC/character can have their own distinct voice that will be used during dialogue playback.

## Backend Implementation

### 1. Database Schema
The `Npc` model now includes an `ai_voice` field:
```python
class Npc(models.Model):
    # ... other fields ...
    ai_voice = models.CharField(max_length=100, null=True, blank=True)
```

**Migration**: `backend/ai_games_app/migrations/0001_add_ai_voice_to_npc.py`

### 2. Serializers
The `NpcSerializer` and `NpcCreateUpdateSerializer` include the `ai_voice` field:
- Located in: `backend/ai_games_app/serializers/location_npc_serializer.py`
- Located in: `backend/ai_games_app/serializers/game_serializer.py`

### 3. API Endpoints
- **Create NPC**: `POST /api/games/{game_id}/npcs/` - accepts `ai_voice` in request body
- **Update NPC**: `PUT /api/games/{game_id}/npcs/{npc_id}/` - accepts `ai_voice` in request body
- **Get NPCs**: Returns `ai_voice` field in response

## Frontend Implementation

### 1. Reusable Components

#### `VoiceSelector` Component
Location: `components/common/VoiceSelector.tsx`

Reusable component for voice selection with preview functionality:
```tsx
<VoiceSelector
  selectedVoice={voice_id}
  onVoiceChange={(voiceId) => setVoiceId(voiceId)}
  label="Character Voice"
  showPreview={true}
/>
```

#### `useVoices` Hook
Location: `hooks/useVoices.ts`

Custom hook for fetching and managing voices from ElevenLabs API:
```tsx
const { voices, grouped, loading, error, refetch } = useVoices();
```

### 2. Integration Points

#### Game Creation (NPCsSection)
Location: `components/create_async/sections/NPCsSection.tsx`
- Each NPC gets a voice selector during creation/editing
- Voice is saved with NPC data
- Persisted in `ai_voice` field

#### Narrator Selection
Location: `components/create_async/sections/SelectNarrator.tsx`
- Uses the same `VoiceSelector` component
- Sets default voice for narration

### 3. Types
```typescript
// types/Create.ts
export interface NPC {
  // ... other fields ...
  ai_voice?: string;  // ElevenLabs voice_id
}

// types/pages.ts
export interface Message {
  // ... other fields ...
  character?: string;  // Character name/id
}
```

## Text-to-Speech API

### Endpoint
`POST /api/text-to-speech`

### Request Body
```json
{
  "text": "Hello, welcome creator!",
  "voice_id": "EXAVITQu4vr4xnSDxMaL",  // Optional, defaults to Sarah
  "model_id": "eleven_turbo_v2_5",      // Optional
  "voice_settings": {                    // Optional
    "stability": 0.5,
    "similarity_boost": 0.8,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

### Get Available Voices
`GET /api/text-to-speech`

Returns list of available voices from ElevenLabs.

## Usage in Gameplay

### Current Implementation
The Message component (`components/pages/play/Message.tsx`) currently uses the narrator's voice (`selectedVoice` prop) for all TTS.

### Implementing Per-Character Voices
To use per-character voices during gameplay:

1. **Backend**: When generating messages, include the character/NPC information:
   ```python
   message = {
       'role': 'assistant',
       'content': 'Welcome, traveler!',
       'character': npc.npc_name,
       'character_voice': npc.ai_voice
   }
   ```

2. **Frontend**: Update the Message component to use character voice:
   ```tsx
   // In Message.tsx, modify createAudioElement call:
   const voiceToUse = message.character_voice || selectedVoice;
   audioCreationPromise.current = createAudioElement(
     message.content, 
     voiceToUse,  // Use character voice if available
     shouldDeductPoints
   );
   ```

## Testing
1. Create a game with multiple NPCs
2. Assign different voices to each NPC using the Voice Selector
3. Save the NPCs
4. During gameplay, verify that each character's dialogue uses their assigned voice

## Environment Variables
Ensure `ELEVENLABS_API_KEY` is set in your environment for voice functionality to work.

## Future Enhancements
- [ ] Add voice preview in character selection during gameplay
- [ ] Support custom voice settings per character
- [ ] Add fallback voices if character voice is not available
- [ ] Cache voice data to improve performance
- [ ] Add voice emotion/intensity controls per message

## Troubleshooting

### Voice not playing during preview
- Check browser console for errors
- Verify ElevenLabs API key is valid
- Check network tab for API request/response

### Voice not saved with NPC
- Verify the `ai_voice` field is included in the form data
- Check network request in browser DevTools
- Ensure migration has been run on the database

### Different voice plays during gameplay
- Verify the message includes character information
- Check that the character's voice_id is being passed to the TTS API
- Review Message component props and voice selection logic

