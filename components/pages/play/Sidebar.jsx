import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MusicPlayer from "./MusicPlayer";
import PreviewMedia from "@/components/games/PreviewMedia";
import {
  FiX,
  FiMusic,
  FiUser,
  FiPackage,
  FiBookOpen,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiMenu,
  FiBox,
  FiSettings,
} from "react-icons/fi";
import Link from "next/link";
import { FaCoffee } from "react-icons/fa";
import { SiPatreon } from "react-icons/si";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import CharacterStatsCard from "./CharacterStatsCard";
import EquippedItemsCard from "./EquippedItemsCard";
import InventoryModal from "./InventoryModal";
import { ArrowLeft, ArrowRight, Settings } from "lucide-react";

export default function Sidebar({
  game,
  storyData,
  characterModalOpen,
  setCharacterModalOpen,
  inventoryModalOpen,
  setInventoryModalOpen,
  sidebarOpen,
  setSidebarOpen,
  openSettings,
  selectedMusic,
  musicList,
  setSelectedMusic,
  stories,
  selectedStory,
  handleStoryChange,
  handleStartNewStory,
  handleUpdateStoryName,
  handleDeleteStory,
  hasNewInventory,
  hasNewCharacter,
  selectedVoice,
  setSelectedVoice,
  audioModelEnabled,
  setAudioModelEnabled,
  groupedVoices,
  canvasViewerOpen,
  onCanvasViewerToggle,
  onInventoryUpdate,
}) {
  const [activeTab, setActiveTab] = useState("inventory");
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showPatreonModal, setShowPatreonModal] = useState(false);
  const [coffeeAmount, setCoffeeAmount] = useState(5);
  const [patreonTier, setPatreonTier] = useState("supporter");
  const [showCoffeeSupport, setShowCoffeeSupport] = useState(false);
  const [showPatreonSupport, setShowPatreonSupport] = useState(false);
  const [creator, setCreator] = useState(null);
  const [hasNewCharacterClicked, sethasNewCharacterClicked] = useState(false)
  const [hasNewInventoryClicked, sethasNewInventoryClicked] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { axiosInstance } = useAxiosWithAuth();

  const isStagingOrBackstage = (typeof window !== 'undefined' && (process.env.VERCEL_ENV === 'staging' || window.location.origin === 'https://backstage.openbook.games')) || process.env.VERCEL_ENV === 'staging' || process.env.NODE_ENV === 'development';

  const handleCharacterClick = (e) => {
    e.preventDefault();
    sethasNewCharacterClicked(false);
  }
  const handleInventoryClick = (e) => {
    e.preventDefault();
    sethasNewInventoryClicked(false);
  }

  useEffect(() => {
    if (hasNewCharacter) {
      sethasNewCharacterClicked(true);
    }
    if (hasNewInventory) {
      sethasNewInventoryClicked(true);
    }
  }, [hasNewCharacter, hasNewInventory]);

  useEffect(() => {
    async function fetchGame() {
      if (game) {
        try {
          const res = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/profile/public/${game.user.username}`
          );

          if (!res.data?.success) return;
          const creatorData = res.data.success.data;
          setCreator(creatorData)
          setShowCoffeeSupport(!!creatorData.bmac_username);
          setShowPatreonSupport(!!creatorData.patreon_username);

        } catch (error) {
          console.error("Error fetching creator profile:", error);
        }
      }
    }
    fetchGame();
  }, [game])

  const handleCoffeeSupport = () => {
    const bmacUrl = creator.bmac_username?.startsWith("http")
      ? creator.bmac_username
      : `https://buymeacoffee.com/${creator.bmac_username}`;

    if (creator.bmac_username) {
      window.open(`${bmacUrl}?amount=${coffeeAmount}`, "_blank");
      setShowCoffeeModal(false);
    }
  };


  const handlePatreonSupport = () => {
    const patreonUrl = creator.patreon_username?.startsWith("http")
      ? creator.patreon_username
      : `https://patreon.com/${creator.patreon_username}`;

    if (creator.patreon_username) {
      window.open(patreonUrl, "_blank");
      setShowPatreonModal(false);
    }
  };

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  };


  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
    closed: {
      x: -300,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 40,
      },
    },
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const contentVariants = {
    open: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    },
    closed: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  let showCards = false;
  if (typeof window !== 'undefined') {
    showCards =
      process.env.VERCEL_ENV === 'staging' ||
      window.location.origin === 'https://backstage.openbook.games';
  } else if (process.env.VERCEL_ENV === 'staging') {
    showCards = true;
  }

  const getNormalizedCategory = (item) => {
    if (!item || !item.category) return 'Other';
    const category = String(item.category).toLowerCase();
    switch (category) {
      case 'weapon':
      case 'weapon_1h':
      case 'weapon_2h':
        return 'Weapon';
      case 'armor':
        return 'Armor';
      case 'equipment_1h':
      case 'equipment_2h':
        return 'Equipment';
      case 'other':
        return 'Other';
      default:
        return String(item.category.charAt(0).toUpperCase() + item.category.slice(1));
    }
  };

  return (
    <>
    {sidebarOpen &&
                 <motion.button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 left-2 right-auto p-2.5 rounded-full bg-gradient-to-r from-purple-600/80 to-purple-700/80 text-white hover:from-purple-500 hover:to-purple-600 transition-all duration-200 border border-purple-400/30 shadow-lg shadow-purple-900/30 z-[3000] backdrop-blur-sm"
          whileHover={{ scale: 1.1}}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} className="drop-shadow-sm" />
        </motion.button>
}
      {/* Collapsed icon rail (always visible when sidebar is closed) */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.div
            initial={{ x: -32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -32, opacity: 0 }}
            className="
              fixed left-3 top-20 md:left-0 md:top-0 md:h-full 
              w-14 sm:w-20 
              z-[3500] min-[500px]:flex flex-col items-center 
              py-3 sm:py-6 px-1.5 sm:px-2 
              bg-gradient-to-b from-purple-900/90 via-slate-900/90 to-black/90 
              dark:from-black/90 dark:via-purple-950/90 dark:to-slate-900/90 
              border border-purple-700/30 shadow-2xl shadow-purple-900/30 
              backdrop-blur-2xl transition-all duration-300 rounded-2xl md:rounded-none md:border-r
            "
          >
            {/* Glowing vertical accent bar */}
            <div className="absolute left-0 top-0 h-full w-0.5 sm:w-1 bg-gradient-to-b from-pink-500 via-purple-500 to-indigo-500 blur-[2px] opacity-80 pointer-events-none" />
            {/* Open menu button */}
            <div className="flex flex-col items-center gap-3 mt-2 md:mt-0 sm:gap-4">
              <button
                title="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="
                  group 
                  p-2.5 sm:p-4 
                  mt-2 sm:mt-6 md:mt-24 
                  rounded-xl sm:rounded-2xl 
                  bg-gradient-to-tr from-purple-600/80 to-pink-500/80 
                  shadow-lg shadow-purple-900/30 
                  hover:from-pink-500/90 hover:to-purple-600/90 
                  transition-all duration-200 
                  border border-purple-400/30 
                  text-white/90 hover:text-white 
                  relative
                "
              >
                <ArrowRight className="text-lg sm:text-2xl group-hover:scale-125 group-hover:translate-x-1 transition-transform duration-200 drop-shadow-lg" />
                <span className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-pink-400/80 to-purple-500/80 rounded-full blur-[2px] opacity-60 pointer-events-none" />
              </button>
            </div>
            {/* Icon buttons */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 mt-4 sm:mt-8">
              {/* Play by voice toggle (collapsed, compact + animated) */}
              <button
                title={audioModelEnabled ? "Play by voice: ON" : "Play by voice: OFF"}
                onClick={() => setAudioModelEnabled && setAudioModelEnabled(!audioModelEnabled)}
                className={
                  `relative group px-2.5 py-2 rounded-xl sm:rounded-2xl border text-white/90 shadow-lg overflow-hidden ` +
                  `transition-all duration-300 ease-out ` +
                  (audioModelEnabled
                    ? "border-emerald-400/30"
                    : "border-purple-400/20")
                }
              >
                <span className="absolute inset-0 -z-10">
                  <span className={`absolute inset-0 blur-md opacity-70 transition-all duration-700 ${audioModelEnabled ? 'bg-gradient-to-br from-emerald-500/40 via-teal-500/30 to-cyan-500/40' : 'bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-blue-500/30'}`}></span>
                  <span className={`absolute -inset-8 animate-[spin_6s_linear_infinite] rounded-full ${audioModelEnabled ? 'bg-[conic-gradient(from_0deg,rgba(16,185,129,0.25),transparent_55%)]' : 'bg-[conic-gradient(from_0deg,rgba(168,85,247,0.25),transparent_55%)]'}`}></span>
                </span>
                <span className="relative z-10 flex items-center justify-center gap-1">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M19 11c0 3.31-2.69 6-6 6s-6-2.69-6-6H5c0 4.08 3.05 7.44 7 7.93V21h2v-2.07c3.95-.49 7-3.85 7-7.93h-2z"/>
                  </svg>
                </span>
                <span className={`absolute inset-0 rounded-xl sm:rounded-2xl ring-1 transition-all ${audioModelEnabled ? 'ring-emerald-400/50' : 'ring-purple-400/40'}`}></span>
                {audioModelEnabled && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                )}
              </button>
              <button
                title="Inventory"
                onClick={(e) => {
                  setSelectedCategory('All');
                  setInventoryModalOpen(true);
                  handleInventoryClick(e);
                }}
                className="
                  relative group 
                  p-2.5 sm:p-4 
                  rounded-xl sm:rounded-2xl 
                  bg-gradient-to-tr from-indigo-700/60 to-purple-700/60 
                  shadow-md 
                  hover:from-purple-600/80 hover:to-pink-500/80 
                  border border-purple-400/20 
                  text-white/90 hover:text-white 
                  transition-all duration-200
                "
              >
                <FiPackage className="text-lg sm:text-2xl group-hover:scale-110 transition-transform duration-200 drop-shadow" />
                {hasNewInventory && hasNewInventoryClicked && (
                  <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-tr from-pink-500 to-yellow-400 rounded-full shadow-lg animate-pulse" />
                )}
              </button>
              {!showCards && (
                <button
                  title="Character"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCharacterClick(e);
                    setCharacterModalOpen(true);
                  }}
                  className="
                    relative group 
                    p-2.5 sm:p-4 
                    rounded-xl sm:rounded-2xl 
                    bg-gradient-to-tr from-indigo-700/60 to-purple-700/60 
                    shadow-md 
                    hover:from-purple-600/80 hover:to-pink-500/80 
                    border border-purple-400/20 
                    text-white/90 hover:text-white 
                    transition-all duration-200
                  "
                >
                  <FiUser className="text-lg sm:text-2xl group-hover:scale-110 transition-transform duration-200 drop-shadow" />
                  {hasNewCharacter && hasNewCharacterClicked && (
                    <span className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-tr from-pink-500 to-yellow-400 rounded-full shadow-lg animate-pulse" />
                  )}
                </button>
              )}
              <button
                title="Settings"
                onClick={() => openSettings && openSettings()}
                className="
                  group 
                  p-2.5 sm:p-4 
                  rounded-xl sm:rounded-2xl 
                  bg-gradient-to-tr from-indigo-700/60 to-purple-700/60 
                  shadow-md 
                  hover:from-purple-600/80 hover:to-pink-500/80 
                  border border-purple-400/20 
                  text-white/90 hover:text-white 
                  transition-all duration-200
                "
              >
                <FiSettings className="text-lg sm:text-2xl group-hover:rotate-12 group-hover:scale-110 transition-transform duration-200 drop-shadow" />
              </button>
              {/* Optional: 3D View toggle kept consistent */}
              {/* {isStagingOrBackstage && (
                <button
                  title="3D View"
                  onClick={onCanvasViewerToggle}
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl text-white/90 transition-colors ${canvasViewerOpen ? 'bg-purple-700/70' : 'bg-white/10 hover:bg-white/15'}`}
                >
                  <FiBox className="text-base sm:text-xl" />
                </button>
              )} */}
            </div>
            <div className="flex-1" />
            {/* Modern glowing bottom orb */}
            <div className="relative flex flex-col items-center mb-2 sm:mb-4">
              <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 blur-md opacity-60 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sidebarOpen && (
        <motion.aside
          className={`z-[1000] fixed left-0 h-full w-[300px] md:w-[300px] xl:w-[400px] relative`}
          variants={sidebarVariants}
          initial="open"
          animate={sidebarOpen ? "open" : "closed"}
        >
        {/* <motion.button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-12 right-[-3rem] p-2.5 rounded-full bg-gradient-to-r from-purple-600/80 to-purple-700/80 text-white hover:from-purple-500 hover:to-purple-600 transition-all duration-200 border border-purple-400/30 shadow-lg shadow-purple-900/30 z-[2000] backdrop-blur-sm"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiX size={20} className="drop-shadow-sm" />
        </motion.button> */}
        <div className="h-full bg-slate-900 dark:bg-jacarta-900 p-5 flex flex-col border-r border-purple-900/30 shadow-xl relative overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
          <motion.div
            className="flex flex-col items-center mb-6 relative"
            variants={contentVariants}
            initial="closed"
            animate="open"
          >
            <div className="relative group w-full">
              {game && (
                <div className="relative w-full overflow-hidden  shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]">
                  <PreviewMedia
                    musicUrl={game?.opener_mp3}
                    mediaUrl={game?.preview_image}
                    mediaType={game?.preview_image_type}
                    alt="Game Preview"
                  />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(30, 27, 75, 0.1) 60%, rgba(30, 27, 75, 1) 100%)' }} />
                </div>
              )}
              <div className="w-full mt-2 z-10 relative flex flex-col items-center">
                <Link
                  href={`/games/${game?.game_id}`}
                  className="font-bold text-white text-xl hover:text-purple-400 transition-colors duration-300 inline-flex items-center"
                >
                  <span className="bg-clip-text text-transparent text-center bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-lg">
                    {game?.game_name}
                  </span>
                </Link>
                <div className="mt-2 px-4 py-3 bg-black/30 backdrop-blur-md rounded-xl shadow-lg w-full text-center">
                  <p className="text-sm text-gray-300 max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
                    {game?.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-3 justify-between items-center mt-4">
                {
                  showCoffeeSupport &&
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCoffeeModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-medium px-4 py-2 rounded-lg transition-all shadow-md text-sm sm:text-base"
                  >
                    <FaCoffee className="text-lg" />
                    <span className="text-xs">Buy me a coffee</span>
                  </motion.button>
                }
                {showPatreonSupport &&
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPatreonModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-md text-sm sm:text-base"
                  >
                    <SiPatreon className="text-lg" />
                    <span className="text-xs">Support on Patreon</span>
                  </motion.button>
                }
              </div>
            </div>
            <div className="w-full mt-4">
              <CharacterStatsCard click={(e) => {
                e.stopPropagation();
                handleCharacterClick(e)
                setCharacterModalOpen(prev => {
                  return true;
                });
              }} character={storyData} />
            </div>
            <div className="flex items-center mt-4 min-w-full ring-1 backdrop-blur-sm ring-amber-500 gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-600 dark:text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              Currency {" "}
              {storyData?.GP}
            </div>
            <div className="w-full mt-4">
              <EquippedItemsCard
                inventory={storyData?.inventory}
                onEquippedItemClick={(item) => {
                  const normalizedCategory = getNormalizedCategory(item);
                  setSelectedCategory(normalizedCategory);
                  setInventoryModalOpen(true);
                }}
                storyId={selectedStory}
                onInventoryUpdate={onInventoryUpdate}
              />
              <div className="overflow-hidden" />
            </div>
          </motion.div>
          <nav className="flex-1">
            <ul className="space-y-3 h-full flex flex-col">
              {/* {isStagingOrBackstage && (
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                >
                  <motion.button
                    onClick={onCanvasViewerToggle}
                    className={`relative w-full text-left font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition-all duration-200 ${canvasViewerOpen
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                      : "bg-black/30 text-white hover:bg-black/40 hover:shadow-[0_0_8px_rgba(147,51,234,0.3)]"
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiBox className="text-lg" />
                    <span>3D View</span>
                  </motion.button>
                </motion.li>
              )} */}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {/* Play by voice toggle (expanded) */}
                <motion.button
                  onClick={() => setAudioModelEnabled && setAudioModelEnabled(!audioModelEnabled)}
                  className={`relative w-full text-left font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2 transition-all duration-300 overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500 ${audioModelEnabled
                    ? "text-white"
                    : "text-white"}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="absolute inset-0 -z-10">
                    <span className={`absolute inset-0 opacity-90 transition-all duration-700 ${audioModelEnabled ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500' : 'bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-500'}`}></span>
                    <span className={`absolute -inset-16 rounded-full animate-[spin_8s_linear_infinite] ${audioModelEnabled ? 'bg-[conic-gradient(from_0deg,rgba(16,185,129,0.35),transparent_60%)]' : 'bg-[conic-gradient(from_0deg,rgba(168,85,247,0.35),transparent_60%)]'}`}></span>
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-white"></span>
                  </span>
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <svg className="w-4 h-4 drop-shadow" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M19 11c0 3.31-2.69 6-6 6s-6-2.69-6-6H5c0 4.08 3.05 7.44 7 7.93V21h2v-2.07c3.95-.49 7-3.85 7-7.93h-2z"/>
                    </svg>
                    <span className="text-sm">Play by voice</span>
                  </span>
                  <span className={`absolute inset-0 rounded-lg ring-1 ${audioModelEnabled ? 'ring-emerald-400/50' : 'ring-purple-400/40'}`}></span>
                  {audioModelEnabled && (
                    <motion.span
                      className="absolute top-1.5 right-2 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      On
                    </motion.span>
                  )}
                </motion.button>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.22, duration: 0.3 }}
              >
                <motion.button
                  onClick={(e) => {
                    setSelectedCategory('All');
                    setInventoryModalOpen(true);
                    handleInventoryClick(e);
                  }}
                  className={`relative w-full text-left font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition-all duration-200 ${inventoryModalOpen
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                    : "bg-black/30 text-white hover:bg-black/40 hover:shadow-[0_0_8px_rgba(147,51,234,0.3)]"
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiPackage className="text-lg" />
                  <span>Inventory</span>
                  {hasNewInventory && hasNewInventoryClicked && (
                    <motion.span
                      className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      New
                    </motion.span>
                  )}
                </motion.button>
              </motion.li>
              {!showCards && (
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCharacterClick(e)
                      setCharacterModalOpen(prev => {
                        return true;
                      });
                    }}
                    className={`relative w-full text-left font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition-all duration-200 ${characterModalOpen
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]"
                      : "bg-black/30 text-white hover:bg-black/40 hover:shadow-[0_0_8px_rgba(147,51,234,0.3)]"
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    disabled={false}
                  >
                    <FiUser className="text-lg" />
                    <span>Character</span>
                    {hasNewCharacter && hasNewCharacterClicked && (
                      <motion.span
                        className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        New
                      </motion.span>
                    )}
                  </motion.button>
                </motion.li>
              )}
              {/* Settings tab */}
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32, duration: 0.3 }}
              >
                <motion.button
                  onClick={() => openSettings && openSettings()}
                  className={`relative w-full text-left font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition-all duration-200 bg-black/30 text-white hover:bg-black/40 hover:shadow-[0_0_8px_rgba(147,51,234,0.3)]`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                >
                  <FiSettings className="text-lg" />
                  <span>Settings</span>
                </motion.button>
              </motion.li>
              <motion.li
                className="flex-1 flex flex-col justify-end mt-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
              >
                {/* <motion.div
                  className="mb-5 bg-black/30 p-4 rounded-xl border border-purple-900/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-white">
                      <FiBookOpen className="text-purple-400" />
                      <p className="font-medium">Your Stories</p>
                    </div>
                    <motion.button
                      onClick={handleStartNewStory}
                      className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-200 flex items-center gap-1 shadow-lg shadow-purple-900/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiPlus className="text-xs" />
                      <span>New</span>
                    </motion.button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedStory?.story_id || ""}
                      onChange={(e) => {
                        const selected = stories.find(
                          (story) => story.story_id === e.target.value
                        );
                        handleStoryChange(selected);
                      }}
                      className="w-full py-2.5 px-4 rounded-lg bg-black/40 text-white border border-purple-900/30 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a story</option>
                      {stories?.map((story, index) => (
                        <option key={index} value={story.story_id}>
                          {story.name || `Story ${index + 1}`}
                        </option>
                      ))}
                    </select>
                    {selectedStory && (
                      <div className="flex gap-1">
                        <motion.button
                          onClick={() =>
                            handleUpdateStoryName(selectedStory.story_id)
                          }
                          className="p-2.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-all duration-200 border border-purple-900/30"
                          title="Rename Story"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiEdit size={16} />
                        </motion.button>
                        <motion.button
                          onClick={() =>
                            handleDeleteStory(selectedStory.story_id)
                          }
                          className="p-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200"
                          title="Delete Story"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiTrash2 size={16} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div> */}

                {/* <motion.div
                  className="mb-5 bg-black/30 p-4 rounded-xl border border-purple-900/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-medium text-white flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-purple-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Audio Narration
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={audioModelEnabled}
                          onChange={(e) =>
                            setAudioModelEnabled(e.target.checked)
                          }
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-700"></div>
                      </label>
                    </div>
                  </div>

                  <p className="mb-2 text-white text-sm flex items-center gap-2">
                    <span className="text-purple-400">•</span> Select Voice
                  </p>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full py-2.5 px-4 rounded-lg bg-black/40 text-white border border-purple-900/30 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!audioModelEnabled}
                  >
                    {Object.entries(voices).map(([category, voiceList]) => (
                      <optgroup key={category} label={category}>
                        {voiceList.map((voice) => (
                          <option key={voice.id} value={voice.id}>
                            {voice.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </motion.div> */}
                {/* <motion.div
                  className="mb-4 bg-black/30 p-3 rounded-xl border border-purple-900/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FiMusic className="text-purple-400" />
                    <span className="text-white text-sm font-medium">
                      Background Music
                    </span>
                  </div>
                  <div className="bg-black/40">
                    <MusicPlayer
                      songUrl={selectedMusic?.url}
                      selectedMusic={selectedMusic}
                      musicList={musicList}
                      setSelectedMusic={setSelectedMusic}
                      title={selectedMusic?.name || "No Music Selected"}
                    />
                  </div>
                </motion.div> */}
              </motion.li>
            </ul>
          </nav>
        </div>
        </motion.aside>
      )}
      {/* Coffee Support Modal */}
      <AnimatePresence>
        {showCoffeeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCoffeeModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCoffee className="text-2xl text-black" />
                </div>
                <h3 className="text-xl font-bold">Buy me a coffee!</h3>
                <p className="text-gray-400 mt-2">
                  Support {game.username}'s creative work
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Amount ($)
                  </label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 25].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCoffeeAmount(amount)}
                        className={`flex-1 p-3 rounded-lg border transition-all ${coffeeAmount === amount
                          ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                          : "border-white/20 bg-white/5 hover:border-yellow-500/50"
                          }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCoffeeModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCoffeeSupport}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold p-3 rounded-lg transition-all"
                  >
                    Support ${coffeeAmount}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patreon Support Modal */}
      <AnimatePresence>
        {showPatreonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPatreonModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SiPatreon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold">Support on Patreon</h3>
                <p className="text-gray-400 mt-2">
                  Become a patron and get exclusive perks!
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <h4 className="font-semibold text-orange-400">
                      Supporter - $5/month
                    </h4>
                    <p className="text-sm text-gray-400">
                      Access to patron-only posts and early game previews
                    </p>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h4 className="font-semibold text-red-400">
                      Creator - $15/month
                    </h4>
                    <p className="text-sm text-gray-400">
                      Everything above + behind-the-scenes content and voting on
                      future projects
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPatreonModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePatreonSupport}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold p-3 rounded-lg transition-all"
                  >
                    Visit Patreon
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <InventoryModal
        isOpen={inventoryModalOpen}
        setIsOpen={setInventoryModalOpen}
        storyData={storyData}
        storyId={selectedStory}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </>
  );
}