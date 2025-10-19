"use client";

import { useState, useEffect, useRef, useCallback, use, Suspense } from "react";
import { TTSProvider } from "@/components/pages/play/TTSContext";
import Sidebar from "@/components/pages/play/Sidebar";
import ChatArea from "@/components/pages/play/ChatArea";
import InputArea from "@/components/pages/play/InputArea";
import CharacterModal from "@/components/pages/play/CharacterModal";
import InventoryModal from "@/components/pages/play/InventoryModal";
import Header from "@/components/header/HeaderGamePlay";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import withAuth from "@/hooks/withAuth";
import { useUser } from "@/contexts/UserContext";
import { toast } from "react-toastify";
import { useGameAPI } from "@/lib/apis/gameAPIs";
import { useCommonAPI } from "@/lib/apis/commonAPIs";
import Cookie from "js-cookie";
import CharacterSelectionModal from "@/components/pages/play/CharacterSelectionModal";
// import CanvasViewer from "@/components/CanvasViewer";
import { isYouTubeUrl } from "@/utils/youtubeUtils";
import SettingsModal from "@/components/pages/play/SettingsModal";
import SettingsButton from "@/components/pages/play/SettingsButton";

const ChatPageInner = ({ params }) => {
  const unwrappedParams = use(params);
  const [isStagingOrBackstage, setIsStagingOrBackstage] = useState(false);

  const { axiosInstance, loading, error } = useAxiosWithAuth();
  const { getProfile } = useUser();
  const {
    getGame,
    sendMessage,
    getStoryMessages,
    getStoryData,
    getGameStories,
    updateStoryName,
    deleteStory,
  } = useGameAPI();
  const { getTracks } = useCommonAPI();
  const wsRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [game, setGame] = useState();
  const [storyId, setStoryId] = useState("");
  const [storyData, setStoryData] = useState({});
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [suggestions, setSuggestions] = useState(null);
  const [dicePlay, setDicePlay] = useState(false);
  const [currentFace, setCurrentFace] = useState(19);
  const [diceRolling, setDiceRolling] = useState(false);
  const [getAnswer, setGetAnswer] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [musicList, setMusicList] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState();
  const [stories, setStories] = useState([]);
  const [highlightDice, setHighlightDice] = useState(true)
  const [selectedStory, setSelectedStory] = useState(null);
  const [flag, setFlag] = useState(false);
  const [storyDataFetched, setStoryDataFetched] = useState(false);
  const [hasNewInventory, setHasNewInventory] = useState(false);
  const [hasNewCharacter, setHasNewCharacter] = useState(false);
  const [isNewStory, setIsNewStory] = useState(false);
  const [newStoryInitialized, setNewStoryInitialized] = useState(false);
  const [voices, setVoices] = useState([]);
  const [groupedVoices, setGroupedVoices] = useState({});
  const [selectedVoice, setSelectedVoice] = useState("");
  const [audioModelEnabled, setAudioModelEnabled] = useState(false);
  const [characterSelectionModalOpen, setCharacterSelectionModalOpen] =
    useState(false);
  const [characterSelectionPrompt, setCharacterSelectionPrompt] = useState({});
  const [onlyOneNpc, setOnlyOneNpc] = useState(false);
  const [audio] = useState(new Audio("/sound/recieve.mp3")); // Add receive sound
  const sendAudio = new Audio("/sound/send.mp3"); // Keep existing send sound
  const [characterSelectionComplete, setCharacterSelectionComplete] = useState(false);
  const [abilityDeltas, setAbilityDeltas] = useState({});
  const [initialMessageCount, setInitialMessageCount] = useState(0);
  const [historyLoadFlag, setHistoryLoadFlag] = useState(false);
  const [isBrandNewStory, setIsBrandNewStory] = useState(false);
  const [canvasViewerOpen, setCanvasViewerOpen] = useState(false);
  const [canvasViewerFullscreen, setCanvasViewerFullscreen] = useState(false);
  const [inventoryUpdateTrigger, setInventoryUpdateTrigger] = useState(0);
  const [lastInventoryUpdate, setLastInventoryUpdate] = useState(null);
  const [inventoryUpdateCount, setInventoryUpdateCount] = useState(0);
  const [isHeartbeatUpdateInProgress, setIsHeartbeatUpdateInProgress] = useState(false);
  const [isUserInteractingWithInventory, setIsUserInteractingWithInventory] = useState(false);
  const [inputText, setInputText] = useState("");

  const getCategory = (voice) => {
    const accent = voice.labels?.accent || 'Other';
    const gender = voice.labels?.gender || 'Voice';
    const accentMap = {
      'american': '≡ƒç║≡ƒç╕',
      'british': '≡ƒç¼≡ƒçº',
      //add more as needed
    };
    const flag = accentMap[accent.toLowerCase()] || '';
    const emoji = gender.toLowerCase() === 'female' ? '≡ƒæ⌐' : gender.toLowerCase() === 'male' ? '≡ƒæ¿' : '';
    return `${accent.charAt(0).toUpperCase() + accent.slice(1)} ${gender.charAt(0).toUpperCase() + gender.slice(1)} ${flag} ${emoji}`.trim();
  };

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/text-to-speech');
      if (!response.ok) throw new Error('Failed to fetch voices');
      const data = await response.json();
      const voiceList = data.voices || [];
      setVoices(voiceList);

      const grouped = voiceList.reduce((acc, voice) => {
        const category = getCategory(voice);
        if (!acc[category]) acc[category] = [];
        acc[category].push({ id: voice.voice_id, name: voice.name });
        return acc;
      }, {});

      setGroupedVoices(grouped);

      let defaultVoice = '';
      const narratorVoice = voiceList.find(v =>
        typeof v.name === 'string' && v.name.trim().toLowerCase() === 'narrator'
      ) || voiceList.find(v =>
        typeof v.name === 'string' && v.name.trim().toLowerCase().includes('narrator')
      );

      if (narratorVoice && narratorVoice.voice_id) {
        defaultVoice = narratorVoice.voice_id;
      } else if (game?.ai_voice && voiceList.some(v => v.voice_id === game.ai_voice)) {
        defaultVoice = game.ai_voice;
      } else if (voiceList.length > 0) {
        defaultVoice = voiceList[0].voice_id;
      }
      setSelectedVoice(defaultVoice);
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
  };

  const getLayoutWidths = () => {
    const collapsedWidth = '64px';
    const isVerySmall = typeof window !== 'undefined' ? window.innerWidth < 500 : false;
    const collapsedSidebar = (!sidebarOpen && !isVerySmall) ? collapsedWidth : 0;
    if (!sidebarOpen && !canvasViewerOpen) {
      return { sidebar: collapsedSidebar, chat: collapsedSidebar ? `calc(100% - ${collapsedWidth})` : '100%', canvas: 0 };
    } else if (sidebarOpen && !canvasViewerOpen) {
      return { sidebar: '301px', chat: 'calc(100% - 301px)', canvas: 0 };
    } else if (!sidebarOpen && canvasViewerOpen) {
      return { sidebar: collapsedSidebar, chat: collapsedSidebar ? '50%' : '100%', canvas: collapsedSidebar ? '50%' : 0 };
    } else {
      return { sidebar: '33.333%', chat: '33.333%', canvas: '33.334%' };
    }
  };

  const layoutWidths = getLayoutWidths();

  const hasCharacterSelected = (storyData) => {
    return storyData && (
      storyData.name ||
      storyData.character_id ||
      Object.keys(storyData).length > 0
    );
  };

  // Create Safe Character Selection Function
  const handleAutoSelectCharacter = async (npc) => {
    try {
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/story/select-npc/`,
        {
          // Don't pass story_id for new story creation
          npc_id: npc.id,
          game_id: game.game_id
        }
      );

      if (res.status === 200) {
        const newStoryId = res.data.success.data.story_id;

        toast.success("Character automatically selected", { autoClose: 2000 });
        setHasNewCharacter(true);

        // Update story ID and fetch story data
        setStoryId(newStoryId);
        await fetchStoryData(newStoryId);

        // Refresh stories list to include the new story
        const updatedStories = await handleGetGameStories(unwrappedParams.gameId);

        // Find and select the new story
        const newStory = updatedStories.find(story => story.story_id === newStoryId);
        if (newStory) {
          setSelectedStory(newStory);
        }

        setCharacterModalOpen(true);
      }
    } catch (error) {
      console.error("Character auto-selection failed:", error);
      toast.error("Failed to auto-select character", { autoClose: 2000 });
    }
  };

  const handleCharacterSelectionModalOpen = async (value) => {
    if (typeof value === "boolean") {
      setCharacterSelectionModalOpen(value);
      return;
    }

    const prompt = `I have selected ${value?.selectedClass} as my character`;
    const gender = value.selectedGender === "left" ? "male" : "female";
    const sub =
      value.selectedGender === "middle"
        ? " and selected no gender"
        : ` and I have chosen ${gender} as my gender`;
    const finalPrompt = prompt + sub;

    setCharacterSelectionModalOpen(false);

    // handleSend(finalPrompt);
  };

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileWidth = window.innerWidth <= 768;

      setSidebarOpen(prevState => {
        if (isMobileWidth && prevState === true) {
          return false;
        } else if (!isMobileWidth && prevState === false) {
          return true;
        }
        return prevState;
      });
    };

    // Set isStagingOrBackstage on client side only
    setIsStagingOrBackstage(
      (process.env.VERCEL_ENV === 'staging' || 
       window.location.origin === 'https://backstage.openbook.games' || 
       process.env.NODE_ENV === 'development')
    );

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const getToken = () => {
    const token = Cookie.get("access_token");
    return token;
  };

  const token = getToken();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(
        "http",
        "ws"
      )}/ws/game/${unwrappedParams.gameId}/interact/`;
      wsRef.current = new WebSocket(wsUrl, ["access_token", token]);

      wsRef.current.onopen = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "authentication",
              token: token,
            })
          );
        }
      };

      wsRef.current.onmessage = (event) => {
        const response = JSON.parse(event.data);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        toast.error("Failed to connect to game server", { autoClose: 2000 });
      };

      return () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.close();
        }
      };
    }
  }, [unwrappedParams.gameId, token]);

  const handleDiceRoll = async (roll_result) => {
    setDiceRolling(true);
    setCurrentFace(roll_result);
    await new Promise((resolve) => setTimeout(resolve, 6001));
    setDiceRolling(false);
    setGetAnswer(true);
  };

  const handleSend = async (user_query) => {
    if (!unwrappedParams.gameId || !user_query) return;

    sendAudio.play().catch((err) => console.error("Error playing audio:", err));

    setGetAnswer(false);
    setSuggestions(null);

    if (isInventoryRelatedContent(user_query)) {
    }

    const messages_copy = [...messages];
    messages_copy.push({ content: user_query, sent_by_user: true });
    messages_copy.push({
      content: "Thinking...",
      sent_by_user: false,
      type: "text",
    });
    setMessages(messages_copy);

    try {
      const messageData = {
        prompt: user_query,
        game_id: unwrappedParams.gameId,
        story_id: selectedStory?.story_id,
      };

      // BEFORE sending, validate story context
      if (!selectedStory?.story_id && !sessionId) {
        console.error("Cannot send message: No valid story context");
        toast.error("Please select or create a story first");
        return;
      }

      let tempMessageContent = "";

      wsRef.current.onmessage = async (event) => {
        const response = JSON.parse(event.data);

        if (response.type === "text") {
          tempMessageContent += response.content;
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1] = {
              content: tempMessageContent,
              sent_by_user: false,
              type: "text",
              is_chunk: true,
            };
            return newMessages;
          });
        } else if (response.type === "final") {
          audio.play().catch((err) => console.error("Error playing audio:", err));

          const finalResponse = response.content;

          if (!sessionId && finalResponse.thread_id) {
            setSessionId(finalResponse.thread_id);
          }

          if (!selectedStory && finalResponse.story_id && isNewStory) {
            setStoryId(storyId);

            fetchStoryData(storyId);

            handleGetGameStories(unwrappedParams.gameId).then((storiesData) => {
              const newStory = storiesData.find(story => story.story_id === storyId);
              if (newStory) {
                setSelectedStory(newStory);
                setTimeout(() => {
                  setIsNewStory(false);
                }, 2000);
              }
            });
          }
          else if (selectedStory && finalResponse.story_id === selectedStory.story_id) {
            setTimeout(async () => {
              await fetchStoryDataAndCompareChanges(selectedStory.story_id);
            }, 2000);
            
            if (finalResponse.assistant_resp.parsed_content && 
                isInventoryRelatedContent(finalResponse.assistant_resp.parsed_content)) {
              setTimeout(() => {
                debouncedInventoryUpdate();
              }, 3000); 
            }
          }

          setMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            const parts = makeMessageParts(
              finalResponse.assistant_resp.parsed_content,
              true
            );

            newMessages.pop();

            parts.forEach((part) => {
              newMessages.push({
                content: part.content,
                sent_by_user: false,
                type: part.type,
              });
            });

            return newMessages;
          });

          if (finalResponse.assistant_resp.tools_output) {
            const tools_output = finalResponse.assistant_resp.tools_output;
            const roll_tool_result = tools_output
              .filter((item) => {
                if (item.output) {
                  const output = JSON.parse(item.output);
                  return output.roll !== undefined && output.roll_needed === true;
                }
                return false;
              })
              .map((item) => ({
                ...item,
                output: JSON.parse(item.output),
              }));

            if (roll_tool_result?.length > 0) {
              handleDiceRoll(roll_tool_result[0].output.roll);
            }
          }
        }
      };

      wsRef.current.send(JSON.stringify(messageData));
      getProfile();
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error(err.message || "Failed to send message", { autoClose: 2000 });
      setMessages((prevMessages) => prevMessages.slice(0, -1));
    }
  };

  // Replace Problematic useEffect with Controlled Logic
  useEffect(() => {
    // Only run character selection logic when:
    // 1. Game is loaded
    // 2. Selected story exists with valid ID  
    // 3. Story data is fetched
    // 4. Character selection hasn't been completed yet
    // 5. Story doesn't already have a character

    if (
      game &&
      selectedStory?.story_id &&
      storyDataFetched &&
      !characterSelectionComplete &&
      !hasCharacterSelected(storyData)
    ) {
      const playableNpcs = game.game_npc?.filter((npc) => npc.is_playable) || [];

      if (playableNpcs.length === 1) {
        // Auto-select single character
        handleAutoSelectCharacter(playableNpcs[0]);
      } else if (playableNpcs.length > 1) {
        // Show character selection modal
        setCharacterSelectionModalOpen(true);
      }

      // Mark as complete regardless of outcome
      setCharacterSelectionComplete(true);
    }
  }, [
    game,
    selectedStory?.story_id,
    storyDataFetched,
    characterSelectionComplete,
    storyData
  ]); // REMOVED: messages dependency

  const onSuggestionClick = (message) => {
    if (message.startsWith("I rolled")) {
      handleSend(message);
      return;
    }
    if (message.startsWith("Show me a picture of the scene")) {
      handleSend("Show me a picture of the scene");
      return;
    }
    //   if (message.startsWith("Show me a picture of the scene")) {
    //   const currentSuggestions = suggestions;
    //   handleSend("Show me a picture of the scene");
    //   setTimeout(() => {
    //     setSuggestions(currentSuggestions);
    //   }, 1000);
    //   return;
    // }
    const suggestionIndex = suggestions.findIndex(
      (suggestion) => suggestion.title === message.trim()
    );

    if (suggestionIndex !== -1) {
      // const formattedMessage = `I choose ${suggestionIndex + 1}. ${message}`;
      const formattedMessage = `I choose ${suggestionIndex + 1}.`;
      handleSend(formattedMessage);
    } else {
      console.error("Suggestion not found in the array.");
    }
  };

  const parseStoryOptions = (content) => {
    if (!content) return [];
    const paragraphs = content.split("\n\n");

    for (let i = paragraphs.length - 1; i >= 0; i--) {
      const paragraph = paragraphs[i];

      const numberedOptions = [
        ...paragraph.matchAll(/\s*(\d+)[\.\)\/\-\:]\s*(.*?)(?=\s*\d+[\.\)\/\-\:]|$)/g),
      ];

      if (numberedOptions.length > 1) {
        return numberedOptions.map(([, number, title]) => ({
          number: parseInt(number, 10),
          title: title.trim(),
          subtitle: "",
        }));
      }

      const alphabeticalOptions = [
        ...paragraph.matchAll(/\s*([A-Z])\)\s+(.*?)(?=\s*[A-Z]\)|$)/g),
      ];

      if (alphabeticalOptions.length > 1) {
        return alphabeticalOptions.map(([, letter, title]) => ({
          number: letter,
          title: title.trim(),
          subtitle: "",
        }));
      }
    }

    return [];
  };

  const makeMessageParts = (message, isLastNonUserMessage) => {
    try {
      const parts = message.split(
        /(!\[.*?\]\(.*?\)|\[\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)[^\s\]]+)\s*\]|https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)[^\s\]]+)/
      );
      
      const processedParts = parts.flatMap((rawPart) => {
        const part = typeof rawPart === 'string' ? rawPart : String(rawPart || '');
        const trimmed = part.trim();

        if (trimmed === '[' || trimmed === ']') {
          return [];
        }

        if (trimmed.startsWith("![")) {
          try {
            const imageUrl = trimmed.match(/\((.*?)\)/)?.[1];
            if (imageUrl) {
              return [{ type: "image", content: imageUrl }];
            }
          } catch (error) {
            console.error("Error parsing image markdown:", error);
            return [{ type: "text", content: trimmed }];
          }
        } else if (trimmed.startsWith("[")) {
          const urlMatch = trimmed.match(/\[\s*(https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)[^\s\]]+)\s*\]/);
          
          if (urlMatch && urlMatch[1]) {
            const url = urlMatch[1];
            
            if (isYouTubeUrl(url)) {
              const cleanUrl = url.split(/[\s\]]/)[0];
              const withoutArtifacts = cleanUrl.replace(/\?autoplay=true$/i, '');
              return [{ type: "image", content: withoutArtifacts }];
            }
          }
        } else if (isYouTubeUrl(trimmed)) {
          const cleanUrl = trimmed.split(/[\s\]]/)[0];
          const withoutArtifacts = cleanUrl.replace(/\?autoplay=true$/i, '');
          return [{ type: "image", content: withoutArtifacts }];
        }

        if (trimmed) {
          const artifactCleaned = trimmed
            .replace(/^\[\s*$/g, '')
            .replace(/^\?autoplay=true\]?$/i, '')
            .replace(/^\]$/g, '')
            .trim();

          if (!artifactCleaned) {
            return [];
          }

          const dcPattern = /\b(?:DC\s*\d+|\(DC\s*\d+\))\b/gi;
          const dicePattern = /\bdice/gi;
          const hasDC = dcPattern.test(artifactCleaned);
          const hasDice = dicePattern.test(artifactCleaned);
          if (hasDC || hasDice) {
            setHighlightDice(true);
          }
          const options = parseStoryOptions(artifactCleaned);
          if (options) {
            setSuggestions(options);
            const textWithoutOptions = artifactCleaned
              .replace(/###Options_Start###[\s\S]*?###Options_End###/m, "")
              .trim();
            const resultParts = [];
            if (textWithoutOptions) {
              resultParts.push({ type: "text", content: textWithoutOptions });
            }
            return resultParts;
          } else {
            return [{ type: "text", content: artifactCleaned }];
          }
        }
        return [];
      });
      
      return processedParts.filter((part) => part.content);
    } catch (error) {
      console.error("Error in makeMessageParts:", error);
      return [{ type: "text", content: message.trim() }];
    }
  };

  const fetchStoryMessages = async () => {
    if (!selectedStory?.story_id) {
      if (game?.game_opener) {
        const opener_parts = makeMessageParts(game.game_opener, true);
        const messages_copy = opener_parts.map(part => ({
          content: part.content,
          sent_by_user: false,
          type: part.type,
        }));
        setMessages(messages_copy);
      }
      return;
    }

    try {
      const resp_messages = await getStoryMessages(
        unwrappedParams.gameId,
        selectedStory.story_id
      );

      const messages = resp_messages.flatMap((message, index) => {
        const lastNonUserMessageIndex = resp_messages
          .map((msg, index) => ({ isUser: msg.sent_by_user, index }))
          .filter((msg) => !msg.isUser)
          .pop()?.index;

        if (!message.sent_by_user) {
          const isLastNonUserMessage = index === lastNonUserMessageIndex;
          const parts = makeMessageParts(message.content, isLastNonUserMessage);

          return parts.map((part) => ({
            content: part.content,
            type: part.type,
            sent_by_user: message.sent_by_user,
          }));
        } else {
          return {
            content: message.content,
            sent_by_user: message.sent_by_user,
            type: "text",
          };
        }
      });

      let final_messages = [];
      if (game?.game_opener) {
        const opener_parts = makeMessageParts(game.game_opener, false);
        final_messages = opener_parts.map(part => ({
          content: part.content,
          sent_by_user: false,
          type: part.type,
        }));
      }

      setMessages([...final_messages, ...messages]);
      if (!isNewStory) {
        setInitialMessageCount([...final_messages, ...messages].length);
        setHistoryLoadFlag(true); 
      }
    } catch (error) {
      console.error("Error fetching story messages:", error);
    }
  };

  // Function to fetch story data and compare changes for "new" tags
  const fetchStoryDataAndCompareChanges = useCallback(async (story_id) => {
    if (!story_id) {
      console.warn("fetchStoryDataAndCompareChanges called without story_id");
      return;
    }

    try {
      const resp_story = await getStoryData(story_id);

      // Get previous data from localStorage for comparison
      const storageKey = `prevStoryData_${story_id}`;
      const prevData = JSON.parse(localStorage.getItem(storageKey));

      if (prevData) {
        // Compare character fields
        const characterFields = [
          "name", "gender", "class", "level", "actions", "abilities",
          "skills", "HP", "max_hp", "background"
        ];

        const hasCharacterChanged = characterFields.some(
          (field) => JSON.stringify(resp_story[field]) !== JSON.stringify(prevData[field])
        );

        // Compare inventory
        const hasInventoryChanged = JSON.stringify(resp_story.inventory) !== JSON.stringify(prevData.inventory);
        const hasGoldChanged = resp_story.GP !== prevData.GP;

        // Only set "new" tags if there are actual changes
        if (hasCharacterChanged && resp_story.name) {
          toast.info("Character sheet updated", { autoClose: 2000 });
          setHasNewCharacter(true);
        }

        if ((hasInventoryChanged && resp_story.inventory?.length > 0) || (hasGoldChanged && resp_story.GP > 0)) {
          if (hasInventoryChanged) {
            toast.info("Inventory updated", { autoClose: 2000 });
          }
          if (hasGoldChanged) {
            toast.info(`Currency updated: +${resp_story.GP} GP`, { autoClose: 2000 });
          }
          setHasNewInventory(true);
        }
      }

      setStoryData(resp_story);
      setStoryDataFetched(true);

      // Store current data for future comparisons
      localStorage.setItem(storageKey, JSON.stringify(resp_story));

    } catch (error) {
      console.error("Error fetching story data:", error);
      toast.error("Failed to fetch story data", { autoClose: 2000 });
    }
  }, [getStoryData]);

  const fetchStoryData = useCallback(async (story_id) => {
    if (!story_id) {
      console.warn("fetchStoryData called without story_id");
      return;
    }

    try {
      const resp_story = await getStoryData(story_id);
      setStoryData(resp_story);
      setStoryDataFetched(true);

      if (resp_story && resp_story.name) {
        setHasNewCharacter(true);
      }

      if (resp_story && resp_story.inventory && resp_story.inventory.length > 0) {
        setHasNewInventory(true);
      }
    } catch (error) {
      console.error("Error fetching story data:", error);
      toast.error("Failed to fetch story data", { autoClose: 2000 });
    }
  }, [getStoryData]);

  const handleInventoryHeartbeatUpdate = useCallback(async (story_id) => {
    if (!story_id) {
      console.warn("handleInventoryHeartbeatUpdate called without story_id");
      return;
    }

    if (isHeartbeatUpdateInProgress) {
      return;
    }

    if (isUserInteractingWithInventory) {
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = lastInventoryUpdate ? now - lastInventoryUpdate : Infinity;

    if (timeSinceLastUpdate < 1000) {
      return;
    }

    setIsHeartbeatUpdateInProgress(true);

    try {
      const response = await getStoryData(story_id);
      setStoryData(response);
      setLastInventoryUpdate(Date.now());
      setInventoryUpdateCount(prev => prev + 1);

      const storageKey = `prevStoryData_${story_id}`;
      const prevData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      if (prevData.inventory && JSON.stringify(response.inventory) !== JSON.stringify(prevData.inventory)) {
        setHasNewInventory(true);
        toast.info("Inventory updated", { autoClose: 2000 });
      }

      localStorage.setItem(storageKey, JSON.stringify(response));

    } catch (error) {
      console.error("Error in inventory update call:", error);
      toast.error("Failed to update inventory", { autoClose: 2000 });
    } finally {
      setIsHeartbeatUpdateInProgress(false);
    }
  }, [getStoryData, lastInventoryUpdate, inventoryUpdateCount, isHeartbeatUpdateInProgress]);

  const triggerInventoryUpdate = () => {
    if (selectedStory?.story_id) {
      setInventoryUpdateTrigger(prev => prev + 1);
    }
  }

  const debouncedInventoryUpdate = useCallback(() => {
    if (selectedStory?.story_id) {
      if (window.inventoryUpdateTimeout) {
        clearTimeout(window.inventoryUpdateTimeout);
      }
      window.inventoryUpdateTimeout = setTimeout(() => {
        setInventoryUpdateTrigger(prev => prev + 1);
      }, 2000); 
    }
  }, [selectedStory?.story_id]);

  const isInventoryRelatedContent = useCallback((content) => {
    if (!content) return false;
    
    const inventoryKeywords = [
      'inventory', 'equipment', 'item', 'equip', 'unequip', 'wear', 'remove',
      'weapon', 'armor', 'shield', 'sword', 'dagger', 'bow', 'arrow',
      'helmet', 'boots', 'gloves', 'ring', 'amulet', 'potion', 'scroll',
      'gold', 'gp', 'currency', 'loot', 'treasure', 'pick up', 'drop',
      'give', 'receive', 'trade', 'buy', 'sell', 'purchase'
    ];
    
    const lowerContent = content.toLowerCase();
    return inventoryKeywords.some(keyword => lowerContent.includes(keyword));
  }, []);

  async function handleGetGameStories(game_id) {
    if (!game_id) return [];

    try {
      const storiesData = await getGameStories(game_id);
      setStories(storiesData);

      if (storiesData.length > 0) {
        const queryParams = new URLSearchParams(window.location.search);
        const queryStoryId = queryParams.get("story_id");

        if (queryStoryId) {
          const matchingStory = storiesData.find(
            (story) => story.story_id === queryStoryId
          );
          if (matchingStory) {
            setSelectedStory(matchingStory);
            setStoryId(matchingStory.story_id);
          } else {
            const latestStory = storiesData[storiesData.length - 1];
            setSelectedStory(latestStory);
            setStoryId(latestStory.story_id);
          }
        } else if (!isNewStory) {
          const latestStory = storiesData[storiesData.length - 1];
          setSelectedStory(latestStory);
          setStoryId(latestStory.story_id);
        }
      }
      return storiesData;
    } catch (err) {
      console.error("Error fetching game stories:", err);
      return [];
    }
  }

  function handleStoryChange(story) {
    if (story) {
      setInitialMessageCount(0); 
      setSelectedStory(story);
      setStoryId(story.story_id);
      setHistoryLoadFlag(true); 
      setIsBrandNewStory(false); 

      // Reset character selection state for new story
      setCharacterSelectionComplete(false);
      setStoryDataFetched(false);

      setSuggestions(null);
      setHasNewInventory(false);
      setHasNewCharacter(false);
      setIsNewStory(true);
      setNewStoryInitialized(true);
    }
  }

  async function handleStartNewStory() {
    try {
      setAudioModelEnabled(false);
      setSelectedStory(null);
      setStoryId("");
      setStoryData({});
      setStoryDataFetched(false);
      setSessionId("");
      setNewStoryInitialized(true);

      // Reset character selection state
      setCharacterSelectionComplete(false);

      setSuggestions(null);
      setHasNewInventory(false);
      setHasNewCharacter(false);
      setDicePlay(false);
      setCurrentFace(19);
      setDiceRolling(false);
      setGetAnswer(false);
      setInputText("");

      setCharacterModalOpen(false);
      setInventoryModalOpen(false);
      setCharacterSelectionModalOpen(false);

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('prevStoryData_')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.removeItem("prevStoryData");

      if (game?.game_opener) {
        setSuggestions(null);
        const opener_parts = makeMessageParts(game.game_opener, true);
        const messages_copy = opener_parts.map(part => ({
          content: part.content,
          sent_by_user: false,
          type: part.type,
        }));
        setMessages(messages_copy);
      } else {
        setMessages([]);
      }

      const url = new URL(window.location);
      url.searchParams.delete('story_id');
      window.history.replaceState({}, '', url);

      setIsNewStory(true);
      setIsBrandNewStory(true);
      setFlag((prev) => !prev);

      toast.info("Started new story", { autoClose: 2000 });
    } catch (err) {
      console.error("Error starting new story:", err);
      toast.error("Failed to start new story", { autoClose: 2000 });
    }
  }

  async function handleUpdateStoryName(storyId) {
    const newName = window.prompt("Enter new story name:");
    if (newName) {
      try {
        const response = await updateStoryName(storyId, newName);
        await handleGetGameStories(unwrappedParams.gameId);
        toast.success("Story name updated successfully", { autoClose: 2000 });
      } catch (err) {
        toast.error("Failed to update story name", { autoClose: 2000 });
      }
    }
  }

  async function handleDeleteStory(storyId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this story? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        const response = await deleteStory(storyId);
        if (response) {
          if (selectedStory?.story_id === storyId) {
            setSelectedStory(null);
            setStoryId("");
            setStoryData({});
            setSuggestions(null);

            if (game?.game_opener) {
              const opener_parts = makeMessageParts(game.game_opener, true);
              const messages_copy = opener_parts.map(part => ({
                content: part.content,
                sent_by_user: false,
                type: part.type,
              }));
              setMessages(messages_copy);
            } else {
              setMessages([]);
            }

            setIsNewStory(true);
          }
          await handleGetGameStories(unwrappedParams.gameId);
          toast.success("Story deleted successfully", { autoClose: 2000 });
        }
      } catch (err) {
        toast.error("Failed to delete story", { autoClose: 2000 });
      }
    }
  }

  const handleCanvasViewerToggle = () => {
    setCanvasViewerOpen(!canvasViewerOpen);
    if (!canvasViewerOpen && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleCanvasViewerFullscreen = () => {
    setCanvasViewerFullscreen(!canvasViewerFullscreen);
  };

  useEffect(() => {
    if (storyId && storyId !== selectedStory?.story_id && !storyDataFetched) {
      fetchStoryData(storyId);
    }
  }, [storyId, selectedStory?.story_id, storyDataFetched, fetchStoryData]);

  useEffect(() => {
    if (musicList) {
      setSelectedMusic(musicList[0]);
    }
  }, [musicList]);

  useEffect(() => {
    let isMounted = true;
    const initializeGame = async () => {
      try {
        const gameData = await getGame(unwrappedParams.gameId);
        if (isMounted) setGame(gameData);

        const [tracksData, storiesData] = await Promise.all([
          getTracks(),
          handleGetGameStories(unwrappedParams.gameId)
        ]);

        if (isMounted) setMusicList(tracksData);

        const isReallyNewStory = storiesData.length === 1;
        setIsNewStory(isReallyNewStory);

        if (gameData) {
          await fetchVoices();
        }
      } catch (error) {
        console.error("Error initializing game:", error);
      }
    };

    initializeGame();

    return () => {
      isMounted = false;
    };
  }, [unwrappedParams.gameId]);

  useEffect(() => {
    const fetchStoriesAsync = async () => {
      const storiesGet = await getGameStories(unwrappedParams.gameId)

      if (storiesGet.length === 0) {
        handleStartNewStory()
      }
    }
    fetchStoriesAsync()
  }, [stories])

  useEffect(() => {
    if (game) {
      if (selectedStory) {
        fetchStoryData(selectedStory.story_id);
      }
      fetchStoryMessages();
      if (game?.ai_voice) {
        setSelectedVoice(game?.ai_voice);
      }
    }
  }, [game, selectedStory]);

  useEffect(() => {
    if (storyData && storyDataFetched && storyId) {

      const storageKey = `prevStoryData_${storyId}`;
      const prevData = JSON.parse(localStorage.getItem(storageKey));

      let deltas = {};
      if (prevData && storyData.abilities && prevData.abilities) {
        for (const ability in storyData.abilities) {
          if (prevData.abilities[ability]) {
            const prevScore = prevData.abilities[ability].score;
            const currScore = storyData.abilities[ability].score;
            if (currScore !== prevScore) {
              deltas[ability] = currScore - prevScore;
            }
          }
        }
      }
      setAbilityDeltas(deltas);

      if (!prevData) {
        localStorage.setItem(storageKey, JSON.stringify(storyData));
        return;
      }

      const characterFields = [
        "name", "gender", "class", "level", "actions", "abilities",
        "skills", "HP", "max_hp", "background"
      ];

      const hasCharacterChanged = characterFields.some(
        (field) => JSON.stringify(storyData[field]) !== JSON.stringify(prevData[field])
      );

      if (hasCharacterChanged && storyData.name) {
        toast.info("Character sheet updated", { autoClose: 2000 });
        setHasNewCharacter(true);
      }

      if (
        JSON.stringify(storyData.inventory) !== JSON.stringify(prevData.inventory) &&
        storyData.inventory?.length > 0
      ) {
        toast.info("Inventory updated", { autoClose: 2000 });
        setHasNewInventory(true);
      }

      if (storyData.GP !== prevData.GP && storyData.GP > 0) {
        toast.info(`Currency updated: +${storyData.GP} GP`, { autoClose: 2000 });
        setHasNewInventory(true);
      }

      localStorage.setItem(storageKey, JSON.stringify(storyData));
    }
  }, [storyData, storyDataFetched, storyId]);

  useEffect(() => {
    if (characterModalOpen && !storyData && storyId) {
      fetchStoryData(storyId);
    }
  }, [characterModalOpen, storyData, storyId, fetchStoryData]);

  useEffect(() => {
    if (inventoryModalOpen && !storyData && storyId) {
      fetchStoryData(storyId);
    }
  }, [inventoryModalOpen, storyData, storyId, fetchStoryData]);

  useEffect(() => {
    if (game && isNewStory) {

      const playableNpcs = game.game_npc?.filter((npc) => npc.is_playable) || [];

      if (playableNpcs.length === 1) {

        setTimeout(async () => {
          try {
            const res = await axiosInstance.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/story/select-npc/`,
              {
                // Don't pass story_id for new story creation
                npc_id: playableNpcs[0].id,
                game_id: game.game_id
              }
            );

            if (res.status === 200) {
              const newStoryId = res.data.success.data.story_id;

              toast.success("Character automatically selected", { autoClose: 2000 });
              setHasNewCharacter(true);

              // Update story ID and fetch story data
              setStoryId(newStoryId);
              await fetchStoryData(newStoryId);

              // Refresh stories list to include the new story
              const updatedStories = await handleGetGameStories(unwrappedParams.gameId);

              // Find and select the new story
              const newStory = updatedStories.find(story => story.story_id === newStoryId);
              if (newStory) {
                setSelectedStory(newStory);
              }

              setTimeout(() => {
                setCharacterModalOpen(true);
              }, 500);
            }
          } catch (error) {
            console.error("Error auto-selecting character:", error);
            toast.error("Failed to auto-select character", { autoClose: 2000 });
          }
        }, 1000);

      } else if (playableNpcs.length > 1) {
        setTimeout(() => {
          setCharacterSelectionModalOpen(true);
        }, 1500);
      }
    }
  }, [flag]);

  useEffect(() => {
    let pollInterval;
    let initialUpdateTimeout;
    let stabilityTimeout;
    
    if (inventoryModalOpen && selectedStory?.story_id) {
      
      stabilityTimeout = setTimeout(() => {
        initialUpdateTimeout = setTimeout(() => {
          handleInventoryHeartbeatUpdate(selectedStory.story_id);
        }, 3000);
        
        pollInterval = setInterval(() => {
          handleInventoryHeartbeatUpdate(selectedStory.story_id);
        }, 30000);
      }, 1000);
    }
    
    return () => {
      if (stabilityTimeout) {
        clearTimeout(stabilityTimeout);
      }
      if (initialUpdateTimeout) {
        clearTimeout(initialUpdateTimeout);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [inventoryModalOpen, selectedStory?.story_id, handleInventoryHeartbeatUpdate]);

  useEffect(() => {
    if (inventoryUpdateTrigger > 0 && selectedStory?.story_id) {
      handleInventoryHeartbeatUpdate(selectedStory.story_id);
      setInventoryUpdateTrigger(0); 
    }
  }, [inventoryUpdateTrigger, selectedStory?.story_id, handleInventoryHeartbeatUpdate]);

   return (
    <TTSProvider>
      {/* <SettingsButton
        onClick={() => setSettingsModalOpen(true)}
        isOpen={settingsModalOpen}
      /> */}
      <section className="relative h-screen   flex flex-col">
        {storyData && characterModalOpen && (
          <CharacterModal
            character={storyData}
            isOpen={characterModalOpen}
            setIsOpen={setCharacterModalOpen}
            abilityDeltas={abilityDeltas}
          />
        )}

        {storyData && inventoryModalOpen && (
          <>
            <InventoryModal
              storyData={storyData}
              isOpen={inventoryModalOpen}
              setIsOpen={setInventoryModalOpen}
              storyId={selectedStory}
              onInventoryUpdate={() => setInventoryUpdateTrigger(prev => prev + 1)}
              onUserInteraction={setIsUserInteractingWithInventory}
              fetchStoryData={fetchStoryData}
            />
          </>
        )}

        <div className="h-full flex">
          {/* Sidebar */}
          <div 
            className="h-full transition-all duration-300 ease-in-out"
            style={{ width: layoutWidths.sidebar }}
          >
            <Sidebar
              game={game}
              storyData={storyData}
              characterModalOpen={characterModalOpen}
              setCharacterModalOpen={setCharacterModalOpen}
              inventoryModalOpen={inventoryModalOpen}
              setInventoryModalOpen={setInventoryModalOpen}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              openSettings={() => setSettingsModalOpen(true)}
              selectedMusic={selectedMusic}
              musicList={musicList}
              setSelectedMusic={setSelectedMusic}
              stories={stories}
              selectedStory={selectedStory}
              handleStoryChange={handleStoryChange}
              handleStartNewStory={handleStartNewStory}
              handleUpdateStoryName={handleUpdateStoryName}
              handleDeleteStory={handleDeleteStory}
              hasNewInventory={hasNewInventory}
              hasNewCharacter={hasNewCharacter}
              selectedVoice={selectedVoice}
              setSelectedVoice={setSelectedVoice}
              audioModelEnabled={audioModelEnabled}
              setAudioModelEnabled={setAudioModelEnabled}
              canvasViewerOpen={canvasViewerOpen}
              onCanvasViewerToggle={handleCanvasViewerToggle}
              groupedVoices={groupedVoices}
              onInventoryUpdate={() => setInventoryUpdateTrigger(prev => prev + 1)}
            />
          </div>

          {/* Chat Area */}
          <div 
            className="h-full flex flex-col transition-all duration-300 ease-in-out"
            style={{ width: layoutWidths.chat }}
          >
            <CharacterSelectionModal
              game={game}
              story={stories}
              storyId={storyId}
              isOpen={characterSelectionModalOpen}
              setIsOpen={handleCharacterSelectionModalOpen}
              setHasNewCharacter={setHasNewCharacter}
              fetchStoryData={fetchStoryData}
              setStoryId={setStoryId}
              handleGetGameStories={handleGetGameStories}
              setSelectedStory={setSelectedStory}
              gameId={unwrappedParams.gameId}
            />
            <div className="w-full relative">
              <Header
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
              
              <hr />
            </div>
            <ChatArea
              OnClick={() => setSettingsModalOpen(true)}
              IsOpen={settingsModalOpen} 
              messages={messages}
              setSidebarOpen={setSidebarOpen}
              highlightDice={highlightDice}
              character={storyData}
              setMessages={setMessages}
              suggestions={suggestions}
              onSuggestionClick={onSuggestionClick}
              setCurrentFace={setCurrentFace}
              setHighlightDice={setHighlightDice}
              dicePlay={dicePlay}
              currentFace={currentFace}
              diceRolling={diceRolling}
              setDiceRolling={setDiceRolling}
              getAnswer={getAnswer}
              selectedVoice={selectedVoice || game?.ai_voice || ""}
              audioModelEnabled={audioModelEnabled}
              setInputText={setInputText}
              onSendMessage={handleSend}
              isNewStory={isNewStory}
              initialMessageCount={initialMessageCount}
              setInitialMessageCount={setInitialMessageCount}
              isHistoryLoad={historyLoadFlag}
              resetHistoryLoadFlag={() => setHistoryLoadFlag(false)}
              onScrolledToTop={() => setIsBrandNewStory(false)}
              isBrandNewStory={isBrandNewStory}
              settingsModalOpen={settingsModalOpen}
              setSettingsModalOpen={setSettingsModalOpen}
            />
            {/* Input Area */}
            <div className="sticky bottom-0">
              <InputArea
                onSendMessage={(message) => handleSend(message)}
                audioModelEnabled={audioModelEnabled}
                inputText={inputText}
                setInputText={setInputText}
              />
            </div>
          </div>

          {/* Canvas Area */}
          {/* {canvasViewerOpen && (
            <div 
              className="h-full transition-all duration-300 ease-in-out"
              style={{ width: layoutWidths.canvas }}
            >
              <CanvasViewer
                isOpen={canvasViewerOpen}
                onToggle={handleCanvasViewerToggle}
                isFullscreen={canvasViewerFullscreen}
                onToggleFullscreen={handleCanvasViewerFullscreen}
                isEmbedded={true}
              />
            </div>
          )} */}
        </div>
        <SettingsModal
          isOpen={settingsModalOpen}
          setIsOpen={setSettingsModalOpen}
          stories={stories}
          selectedStory={selectedStory}
          handleStoryChange={handleStoryChange}
          handleStartNewStory={handleStartNewStory}
          handleUpdateStoryName={handleUpdateStoryName}
          handleDeleteStory={handleDeleteStory}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          audioModelEnabled={audioModelEnabled}
          setAudioModelEnabled={setAudioModelEnabled}
          groupedVoices={groupedVoices}
          selectedMusic={selectedMusic}
          musicList={musicList}
          setSelectedMusic={setSelectedMusic}
        />
      </section>
    </TTSProvider>
  );
};

const ChatPage = ({ params }) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-jacarta-900 to-jacarta-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading game...</p>
        </div>
      </div>
    }>
      <ChatPageInner params={params} />
    </Suspense>
  );
};

export default withAuth(ChatPage);
