import { GameData } from '../../interface/Create';

export async function fetchGame(game_id: string, axiosInstance: any, setGame: (data: any) => void): Promise<void> {
  try {
    const response = await axiosInstance.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/games/" + game_id
    );
    if (response.data && response.data.success) {
      setGame(response.data.success.data);
    }
  } catch (err) {
    console.error("Error fetching game:", err);
  }
}

export async function fetchGames(axiosInstance: any): Promise<void> {
  try {
    const response = await axiosInstance.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games`
    );
  } catch (err) {
    console.error("Error fetching games:", err);
  }
}

export function handleImageChange(e: React.ChangeEvent<HTMLInputElement>, gameData: GameData, setGameData: (cb: (prev: GameData) => GameData) => void, setFormErrors: (errors: any) => void): void {
  const file = e.target.files?.[0];
  if (file) {
    const isSupportedType = file.type.startsWith("image/") || file.type.startsWith("video/");
    if (isSupportedType) {
      if (file.type.startsWith("video/") && file.size > 200 * 1024 * 1024) {
        setFormErrors((prev: any) => ({
          ...prev,
          previewImage: "Video file size must not exceed 200MB",
        }));
        return;
      }
      setGameData((prev) => ({
        ...prev,
        previewImage: file,
        previewImageType: file.type,
      }));
      setFormErrors((prev: any) => ({
        ...prev,
        previewImage: null,
      }));
    } else {
      alert("Please upload a valid image or video file.");
    }
  }
}

export function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>, gameData: GameData, setGameData: (cb: (prev: GameData) => GameData) => void): void {
  if (e.target.files && e.target.files[0]) {
    setGameData((prev) => ({
      ...prev,
      openerMp3: e.target.files![0],
    }));
  }
}

export function handleDocumentsChange(e: React.ChangeEvent<HTMLInputElement>, setGameData: (cb: (prev: GameData) => GameData) => void): void {
  if (e.target.files && e.target.files.length > 0) {
    setGameData((prev) => ({
      ...prev,
      storyDocuments: [
        ...(Array.isArray(prev.storyDocuments) ? prev.storyDocuments : []),
        ...Array.from(e.target.files ?? []),
      ],
    }));
  }
}

export function removeDocument(indexToRemove: number, gameData: GameData, setGameData: (cb: (prev: GameData) => GameData) => void): void {
  setGameData((prev) => ({
    ...prev,
    storyDocuments: Array.isArray(prev.storyDocuments)
      ? prev.storyDocuments.filter((_, index) => index !== indexToRemove)
      : [],
  }));
}

export function handleTagChange(tag: string, gameData: GameData, setGameData: (cb: (prev: GameData) => GameData) => void): void {
  setGameData((prev) => {
    const newTags = prev.gameTags.includes(tag)
      ? prev.gameTags.filter((t) => t !== tag)
      : [...prev.gameTags, tag];
    return {
      ...prev,
      gameTags: newTags,
    };
  });
}