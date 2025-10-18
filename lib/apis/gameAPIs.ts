import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";

export const useGameAPI = () => {
  const {axiosInstance} = useAxiosWithAuth();
  const url_base = process.env.NEXT_PUBLIC_BACKEND_URL;


    async function getGame(game_id) {
        try {
            const url = url_base+`/ai-games/games/${game_id}`
            const response = await axiosInstance.get(url);

            if (response.data && response.data.success) {
                return response.data.success.data;
            } else {
                console.error("Unexpected response structure:", response);
            }
        } catch (err) {
            console.error("Error fetching game:", err);
        }
    }


  const listGames = async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/games', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  
  async function sendMessage(game_id, user_query, sessionId, story_id) {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/games/${game_id}/play`,
        {
          prompt: user_query,
          session_id: sessionId,
          story_id: story_id
        }
      );

      if (response.data && response.data.interaction) {
        return response.data.interaction;
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (err) {
      throw err;
    }
  }


  async function getStoryMessages(game_id,story_id) {
    if(!story_id){
      return []
    }
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/games/${game_id}/play/${story_id}/messages`
      );

      if (response.data && response.data.messages) {
        return response.data.messages;
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (err) {
      throw err;
    }
  }

  async function getStoryData(story_id) {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/story/${story_id}`
      );

      if (response.data) {
        return response.data.story_data;
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (err) {
      throw err;
    }
  }

  async function getGameStories(game_id) {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/games/${game_id}/stories`
      );
      if (response.data && response.data.success) {
        return response.data.success.data;
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (err) {
      throw err;
    }
  }

  async function updateStoryName(storyId, newName) {
    if (newName) {
      try {
        const response = await axiosInstance.patch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/story/${storyId}`,
          { name: newName }
        );

        if (response.data && response.data.success) {
          return response.data.success;
        }
      } catch (err) {
        throw err;
      }
    }
  }

  async function deleteStory(storyId) {
      try {
        const response = await axiosInstance.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/story/${storyId}`
        );
        return response.data.success;

      } catch (err) {
        throw err;
      }
  }




  return {
    getGame,
    listGames,
    sendMessage,
    getStoryMessages,
    getStoryData,
    getGameStories,
    updateStoryName,
    deleteStory
  };
};



