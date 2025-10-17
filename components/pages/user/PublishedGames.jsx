"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import { toast } from "react-toastify";
import PreviewMedia from "@/components/games/PreviewMedia";

export default function PublishedGames({ userID, onGamePublished }) {
  const { axiosInstance, loading, error } = useAxiosWithAuth();
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isCloning, setIsCloning] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  async function fetchPublishedGames() {
    try {
      const response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/all`);
      if (response.data?.success?.data) {
        const publishedGames = response.data.success.data.filter((game) => game.published === true);
        setGames(publishedGames);
        
        //for now, just check if the games array has changed and trigger the callback
        if (publishedGames.length > 0 && onGamePublished) {
          //you can implemetn logic here to detect neuly published games
          //for exampel, could compare with a previous state or check timestamps
        }
      } else {
        toast.error("Unexpected API response structure");
      }
    } catch (err) {
      toast.error("Failed to fetch published games: " + (err.message || "Unknown error"));
    }
  }

  const triggerSuccessModal = (gameData) => {
    if (onGamePublished) {
      onGamePublished(gameData);
    }
  };

  async function unpublishGame(game_id) {
    try {
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}/unpublish`);
      if (response.data?.success) {
        toast.success("Game unpublished");
        fetchPublishedGames();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Error unpublishing game");
    }
  }

  async function deleteGame(game_id) {
    if (!confirm("Are you sure you want to delete this game? This action cannot be undone.")) return;
    try {
      const response = await axiosInstance.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}/`);
      if (response.data?.success) {
        toast.success("Game deleted successfully");
        fetchPublishedGames();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Error deleting game");
    }
  }

  async function cloneGame(game_id) {
    setIsCloning(true);
    try {
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/game/clone`, { game_id });
      if (response.data?.success) {
        toast.success("Game cloned successfully");
        fetchPublishedGames();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Error cloning game");
    } finally {
      setIsCloning(false);
    }
  }

  async function renameGame(game_id, game_name) {
    try {
      const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}/rename`, { game_name });
      if (response.data?.success) {
        toast.success("Game renamed successfully");
        fetchPublishedGames();
        setIsRenameModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Error renaming game");
    }
  }

  useEffect(() => {
    fetchPublishedGames();
  }, []);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <section className="relative text-white">
      <AnimatePresence>
        {isRenameModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            onClick={() => setIsRenameModalOpen(false)}
          >
            <motion.div
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
              variants={modalVariants}
            >
              <h3 className="text-lg font-bold mb-4">Rename Game</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const newName = e.target.game_name.value;
                  if (newName && selectedGame) renameGame(selectedGame.game_id, newName);
                }}
              >
                <input
                  type="text"
                  name="game_name"
                  defaultValue={selectedGame?.game_name}
                  className="w-full p-2 mb-4 bg-gray-700 rounded text-white"
                  placeholder="Enter new game name"
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 p-2 rounded text-white">
                    Save
                  </button>
                  <button type="button" onClick={() => setIsRenameModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 p-2 rounded text-white">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isCloning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-accent py-4 text-center text-white">
          <div className="flex items-center justify-center">
            <span>Duplicating game...</span>
            <svg className="animate-spin h-5 w-5 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )}

      <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
        <Image width={1920} height={789} src="/img/gradient_light.jpg" alt="gradient" className="h-full w-full" />
      </picture>

      <div className="container">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* <h2 className="text-2xl font-bold mb-6">Published Games</h2> */}
          {loading ? (
            <p className="text-center">Loading published games...</p>
          ) : error ? (
            <p className="text-center text-red-400">Error: {error.message}</p>
          ) : games.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border border-gray-700 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h11M9 21V3m0 3H5m4-2h4M21 16.6A2.6 2.6 0 0118.4 19H5.6A2.6 2.6 0 013 16.4V5.6A2.6 2.6 0 015.6 3h12.8A2.6 2.6 0 0121 5.6v10.8z"
                />
              </svg>
              <p className="text-gray-300 text-sm font-medium">No published games available. Start publishing!</p>
            </div>
          ) : (
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
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
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
                          onClick={() => unpublishGame(game.game_id)}
                        >
                          Unpublish
                        </button>
                        <hr className="my-2 mx-4 h-px border-0 bg-jacarta-100 dark:bg-jacarta-600" />
                        <Link
                          href={`/games/${game.game_id}/edit`}
                          className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                        >
                          Edit
                        </Link>
                        <button
                          className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                          onClick={() => {
                            setSelectedGame(game);
                            setIsRenameModalOpen(true);
                          }}
                        >
                          Rename
                        </button>
                        <button
                          className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                          onClick={() => cloneGame(game.game_id)}
                        >
                          Duplicate
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
                          Play
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}