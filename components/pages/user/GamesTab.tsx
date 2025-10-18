"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import tippy from "tippy.js";
import { toast } from "react-toastify";
import PreviewMedia from "@/components/games/PreviewMedia";
import PublishModal from "@/components/modals/PublishModal";
import RenameGameModal from "@/components/modals/RenameGameModal";
import GameDuplicationModal from "@/components/modals/GameDuplicationModal";

export default function GamesTab({ userID, onGamePublished }) {
  const { axiosInstance, loading, error } = useAxiosWithAuth();
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isCloning, setIsCloning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [duplicationModal, setDuplicationModal] = useState({
    isOpen: false,
    websocketId: null,
    newGameId: null
  });

  async function fetchGames() {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/all`
      );
      if (response.data && response.data.success) {
        setGames(response.data.success.data);
      }
    } catch (err) {
      console.error("Error fetching games:", err);
    }
  }

  async function publishGame(game_id, paid, price) {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}/publish`,
        {
          paid,
          price,
        }
      );
      if (response.data && response.data.success) {
        toast.success("Game published");
        setSelectedGame(null);
        fetchGames();
        setIsModalOpen(false);
        return response.data.success.data; 
      }
    } catch (err) {
      toast.error("Error publishing game");
      setIsModalOpen(false);
      throw err;
    }
  }

  async function unpublishGame(game_id) {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}/unpublish`
      );
      if (response.data && response.data.success) {
        toast.success("Game unpublished");
        fetchGames();
      }
    } catch (err) {
      toast.error("Error unpublishing game");
    }
  }

  async function deleteGame(game_id) {
    if (
      !confirm(
        "Are you sure you want to delete this game? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      const response = await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}/`
      );
      if (response.data && response.data.success) {
        toast.success("Game deleted successfully");
        fetchGames();
      }
    } catch (err) {
      toast.error("Error deleting game");
    }
  }

  async function cloneGame(game_id) {
    console.log("clone game API called");
    setIsCloning(true);
    
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/game/clone`,
        { game_id: game_id }
      );

      console.log("Clone API Response:", response.data);

      if (response.data && response.data.success) {
        // Handle the response structure based on your provided example:
        // response.data.success.message contains the actual data
        const responseData = response.data.success.message || response.data.success.data || response.data.success;
        console.log("Response data:", responseData);
        
        const websocket_id = responseData.websocket_id;
        const new_game_id = responseData.new_game_id;
        
        console.log("WebSocket ID:", websocket_id);
        console.log("New Game ID:", new_game_id);
        
        if (websocket_id && new_game_id) {
          console.log("Opening duplication modal with:", { websocket_id, new_game_id });
          
          // Open the duplication modal with WebSocket connection
          setDuplicationModal({
            isOpen: true,
            websocketId: websocket_id,
            newGameId: new_game_id
          });
          
          toast.success("Game duplication started");
        } else {
          console.error("Missing websocket_id or new_game_id in response");
          console.error("Available keys in responseData:", Object.keys(responseData || {}));
          toast.error("Invalid response from server - missing websocket_id or new_game_id");
        }
      } else {
        console.error("Unexpected response structure:", response.data);
        toast.error("Failed to start game duplication");
      }
    } catch (err) {
      console.error("Clone game error:", err);
      if (err.response && err.response.status === 400 && err.response.data.error.message) {
        toast.error(err.response.data.error.message);
      } else {
        toast.error("Error starting game duplication");
      }
    } finally {
      setIsCloning(false);
    }
  }

  async function renameGame(game_id, game_name) {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}/rename`,
        { game_name }
      );
      if (response.data && response.data.success) {
        toast.success("Game renamed successfully");
        fetchGames();
      }
    } catch (err) {
      toast.error("Error renaming game");
    }
  }

  const handleDuplicationComplete = (gameId) => {
    toast.success("Game duplicated successfully!");
    fetchGames(); // Refresh the games list
    setDuplicationModal({
      isOpen: false,
      websocketId: null,
      newGameId: null
    });
  };

  const handleDuplicationClose = () => {
    setDuplicationModal({
      isOpen: false,
      websocketId: null,
      newGameId: null
    });
  };

  useEffect(() => {
    fetchGames();
    tippy("[data-tippy-content]");
  }, []);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <section className="relative text-white">
      <RenameGameModal
        onRename={renameGame}
        game={selectedGame}
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
      />
      <PublishModal
        game={selectedGame}
        onPublish={async (paid, price) => {
          try {
            return await publishGame(selectedGame.game_id, paid, price);
          } catch (error) {
            console.error("Error in publishGame:", error);
            throw error;
          }
        }}
        onPublishSuccess={(gameData) => {
          if (onGamePublished && gameData) {
            onGamePublished(gameData);
          }
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      
      {/* Game Duplication Modal */}
      <GameDuplicationModal
        isOpen={duplicationModal.isOpen}
        websocketId={duplicationModal.websocketId}
        newGameId={duplicationModal.newGameId}
        onComplete={handleDuplicationComplete}
        onClose={handleDuplicationClose}
      />

      {isCloning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-accent py-4 text-center text-white">
          <div className="flex items-center justify-center">
            <span>Duplicating game...</span>
            <svg
              className="animate-spin h-5 w-5 ml-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}

      <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
        <Image
          width={1920}
          height={789}
          src="/img/gradient_light.jpg"
          alt="gradient"
          className="h-full w-full"
        />
      </picture>

      <div className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* <h2 className="text-2xl font-bold mb-6">Owned Games</h2> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <motion.div
                key={game.game_id}
                variants={itemVariants}
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 4px 20px rgba(127, 0, 255, 0.5), 0 0 10px rgba(102, 255, 255, 0.5)",
                }}
                className="bg-gray-800  rounded-xl overflow-hidden border border-gray-700"
              >
                <div className="relative h-[350px] lg:h-[400px]">
                  <Link href={`/games/${game.game_id}`}>
                    <PreviewMedia
                      musicUrl={game.opener_mp3}
                      mediaUrl={game.preview_image}
                      mediaType={game.preview_image_type}
                      alt="Game Preview"
                    />
                  </Link>
                  {!game.is_free && (
                    <span className="absolute top-2 left-2 bg-jacarta-700 text-white text-xs px-2 py-1 rounded">
                      Paid
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 text-gray-300 text-xs">
                    {game.created_at ? formatDate(game.created_at) : ""}
                  </span>
                  <div className="absolute top-2 left-2 dropup">
                    <button
                      className="dropdown-toggle bg-gray-700/50 p-2 rounded-full"
                      data-bs-toggle="dropdown"
                    >
                      <svg
                        width="16"
                        height="4"
                        viewBox="0 0 16 4"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-white"
                      >
                        <circle cx="2" cy="2" r="2" />
                        <circle cx="8" cy="2" r="2" />
                        <circle cx="14" cy="2" r="2" />
                      </svg>
                    </button>
                    <div className="dropdown-menu dropdown-menu-end z-10 hidden min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                      <button
                          className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                          onClick={() => {
                            setSelectedGame(game);
                            setIsModalOpen(true);
                          }}
                        >
                          Change Price
                        </button>
                      {!game.published ? (
                        <button
                          className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                          onClick={() => {
                            setSelectedGame(game);
                            setIsModalOpen(true);
                          }}
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                          onClick={() => unpublishGame(game.game_id)}
                        >
                          Unpublish
                        </button>
                      )}
                      <hr className="my-2 mx-4 h-px border-0 bg-jacarta-100 dark:bg-jacarta-600" />
                      <Link
                        href={`/games/${game.game_id}/edit`}
                        className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                      >
                        Edit
                      </Link>
                      <button
                        className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                        // data-bs-toggle="modal"
                        // data-bs-target="#renameGameModal"
                        onClick={() => {
                          setSelectedGame(game);
                          setIsRenameModalOpen(true);
                        }}
                      >
                        Rename
                      </button>
                      <button
                        className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 disabled:opacity-50"
                        onClick={() => {
                          if(confirm("Are you sure you want to duplicate this game?")) {
                            cloneGame(game.game_id)
                          }
                        }}
                        disabled={isCloning}
                      >
                        <span>{isCloning ? 'Duplicating...' : 'Duplicate'}</span>
                      </button>
                      <button
                        className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                        onClick={() => deleteGame(game.game_id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <Link href={`/games/${game.game_id}`}>
                    <h3 className="font-bold text-lg text-white hover:text-accent">
                      {game.game_name.length > 30
                        ? game.game_name.slice(0, 30) + "..."
                        : game.game_name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-300 min-h-[54px]">
                    {game.description.length > 70
                      ? game.description.substring(0, 70) + "..."
                      : game.description}
                  </p>
                  <div className="flex justify-between">
                    <Link href={`/games/${game.game_id}/play`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded-lg text-sm font-medium"
                      >
                        Preview
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
