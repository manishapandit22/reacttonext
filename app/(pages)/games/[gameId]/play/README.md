# Gameplay Page (`games/[gameId]/play/page.jsx`)

This document explains the structure, main components, and API interactions of the gameplay page in the Kraken Blog frontend. It is intended for developers who want to understand or extend the gameplay/chat experience.

---

## High-Level Structure

The gameplay page is a React component (Next.js page) that orchestrates the main game/chat experience. It manages state for the current game, story, messages, character, inventory, and UI modals. It interacts with backend APIs for game data, story progression, inventory management, and more.

### Main Responsibilities
- Fetch and manage game and story data
- Handle chat messages and suggestions
- Manage character and inventory modals
- Control music, dice, and sidebar UI
- Connect to the backend via WebSocket for real-time chat

---

## Main Components and Their Roles

### 1. **Sidebar**
- **Props:**
  - `game`, `characterModalOpen`, `setCharacterModalOpen`, `inventoryModalOpen`, `setInventoryModalOpen`, `sidebarOpen`, `setSidebarOpen`, `selectedMusic`, `musicList`, `setSelectedMusic`, `stories`, `selectedStory`, `handleStoryChange`, `handleStartNewStory`, `handleUpdateStoryName`, `handleDeleteStory`, `hasNewInventory`, `hasNewCharacter`, `selectedVoice`, `setSelectedVoice`, `audioModelEnabled`, `setAudioModelEnabled`
- **Responsibilities:**
  - Displays navigation for inventory, character, music, and stories
  - Allows opening/closing of character and inventory modals
  - Lets users change music, voice, and audio model settings
  - Handles support links (Patreon, BuyMeACoffee)
  - Notifies about new inventory or character updates
  - Fetches creator profile for support links

### 2. **ChatArea**
- **Props:**
  - `messages`, `isNewStory`, `setMessages`, `highlightDice`, `setSidebarOpen`, `onSuggestionClick`, `suggestions`, `dicePlay`, `currentFace`, `setCurrentFace`, `diceRolling`, `setDiceRolling`, `getAnswer`, `selectedVoice`, `audioModelEnabled`, `setInputText`, `onSendMessage`, `setHighlightDice`
- **Responsibilities:**
  - Renders the chat log, including user and assistant messages
  - Handles dice rolling and visual dice feedback
  - Scrolls to bottom/top as needed
  - Handles suggestions and quick replies
  - Integrates with voice and TTS features

### 3. **InputArea**
- **Props:**
  - `onSendMessage`, `audioModelEnabled`
- **Responsibilities:**
  - Provides a text input and send button for chat
  - Integrates with voice recording and TTS
  - Deducts game points for sending messages or using voice
  - Shows a paywall UI if the user is out of game points
  - Handles message sending and triggers parent callbacks

### 4. **InventoryModal**
- **Props:**
  - `isOpen`, `setIsOpen`, `storyData`, `storyId`
- **Responsibilities:**
  - Displays the user's inventory for the current story
  - Allows searching, filtering, and viewing item details
  - Handles equipping/unequipping items (API call)
  - Updates automatically when new inventory data arrives
  - Responsive layout for mobile/desktop

### 5. **CharacterModal**
- **Props:**
  - `isOpen`, `setIsOpen`, `character`
- **Responsibilities:**
  - Shows detailed character sheet for the current story
  - Displays stats, abilities, actions, and background
  - Responsive and scrollable modal

---

## API Interactions

### 1. **Game and Story Data**
- Uses hooks from `@/lib/apis/gameAPIs` and `@/lib/apis/commonAPIs`:
  - `getGame`, `getStoryMessages`, `getStoryData`, `getGameStories`, `updateStoryName`, `deleteStory`, `getTracks`
- Fetches game and story data on mount and when story/game changes
- Stores previous story data in localStorage for change detection

### 2. **WebSocket**
- Connects to the backend WebSocket for real-time chat
- Sends/receives chat messages, handles authentication
- Receives assistant responses, dice rolls, and story updates

### 3. **Inventory and Equipment**
- `InventoryModal` uses `useAxiosWithAuth` to call `/equipment/manage/` for equipping/unequipping items
- Inventory updates are detected and reflected in the modal automatically

### 4. **Voice and TTS**
- `InputArea` uses `useVoiceRecording` and `useTTS` for voice input and text-to-speech
- Deducts points via `/points/deduct` API when using voice input

### 5. **Profile and Points**
- Uses `useUser` context to get and update user profile and game points
- Shows paywall if out of points

---

## High-Level Flow

1. **Page Mounts:** Fetches game and story data, initializes WebSocket, sets up music and UI state.
2. **User Interacts:**
   - Sends messages via `InputArea` (text or voice)
   - Receives assistant responses in `ChatArea`
   - Opens `Sidebar` to view inventory, character, or change settings
   - Opens `InventoryModal` or `CharacterModal` for details
3. **API Calls:**
   - Fetches/updates game, story, inventory, and character data as needed
   - Equips/unequips items, updates profile, deducts points
   - Handles real-time chat and dice via WebSocket
4. **UI Updates:**
   - Modals and chat update in response to data and user actions
   - Inventory and character modals reflect latest data automatically

---

## Extending or Debugging
- To add new features, extend the relevant component and update the API hooks as needed.
- To debug data flow, check the useEffect hooks and API calls in `page.jsx` and the modals.
- For UI changes, update the respective component (Sidebar, ChatArea, InputArea, InventoryModal, CharacterModal).

---

## File Structure Reference
- `app/(pages)/games/[gameId]/play/page.jsx` — Main gameplay page
- `components/pages/play/Sidebar.jsx` — Sidebar navigation and settings
- `components/pages/play/ChatArea.jsx` — Chat log and dice
- `components/pages/play/InputArea.jsx` — Chat input and voice
- `components/pages/play/InventoryModal.jsx` — Inventory modal
- `components/pages/play/CharacterModal.jsx` — Character sheet modal

---

For more details, see the code and comments in each component. 