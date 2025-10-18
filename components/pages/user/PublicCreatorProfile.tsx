"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import {
  GiTwoCoins,
  GiScrollUnfurled,
  GiSpellBook,
  GiTrophy,
  GiSwordman,
  GiMagicSwirl,
  GiDragonHead,
  GiCastle,
} from "react-icons/gi";
import {
  FaFire,
  FaGamepad,
  FaShare,
  FaExternalLinkAlt,
  FaCoffee,
  FaHeart,
  FaStar,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaEdit,
} from "react-icons/fa";
import { MdVerified, MdEdit } from "react-icons/md";
import { SiPatreon } from "react-icons/si";
import { BiWorld, BiBook, BiPalette, BiCode } from "react-icons/bi";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import CopyToClipboard from "@/utils/AddClipboard";
import tippy from "tippy.js";

export default function PublicCreatorProfile({
  initialProfile,
  initialStories,
  username,
  isOwnProfile = false,
  revalidateAction,
}) {
  const [activeTab, setActiveTab] = useState("created");
  const [shareModal, setShareModal] = useState(false);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showPatreonModal, setShowPatreonModal] = useState(false);
  const [coffeeAmount, setCoffeeAmount] = useState(5);
  const [patreonTier, setPatreonTier] = useState("supporter");
  const [hasSupportLinks,setHasSupportLinks] = useState({
    bamc: false,
    patreon: false,
  })

  const [creatorProfile, setCreatorProfile] = useState({
    bio: "",
    cover_photo: "",
    username: "",
    first_name: "",
    last_name: "",
    profile_photo: "",
    user_id: "",
    joined_at: "",
    experience: 0,
    level: 1,
    games_created: 0,
    is_premium: false,
    subscription: null,
    game_points: 0,
    badges: [],
    gameStats: {
      published: 0,
      drafts: 0,
      totalPlays: 0,
      avgRating: 0,
    },
    bmac_username: "https://buymeacoffee.com/creator",
    patreon_username: "https://patreon.com/creator",
    specializations: [
      "Fantasy RPGs",
      "Character Development",
      "World Building",
      "Interactive Storytelling",
    ],
    achievements: [
      {
        name: "Master Storyteller",
        icon: "📚",
        description: "Created 10+ engaging stories",
      },
      {
        name: "World Builder",
        icon: "🌍",
        description: "Crafted immersive game worlds",
      },
      {
        name: "Player Favorite",
        icon: "⭐",
        description: "Maintained 4.5+ star rating",
      },
      {
        name: "Community Leader",
        icon: "👑",
        description: "Active community member",
      },
    ],
  });

  useEffect(() => {
    if (initialProfile && typeof initialProfile === 'object') {
      setHasSupportLinks(prev => ({
        ...prev,
        bmac: initialProfile.bmac_username || !!initialProfile.bmac_username,
        patreon: initialProfile.patreon_username || !!initialProfile.bmac_username
      }));
    }
  }, [initialProfile]);

  const [stories, setStories] = useState(
    initialStories || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { axiosInstance } = useAxiosWithAuth();

  async function getCreatorProfile() {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/profile`
      );
      if (response.data?.success) {
        const profileData = {
          ...response.data.success.data,
          gameStats: {
            published: response.data.success.data.games_created || -1,
            drafts: -1,
            favorites: -1,
          },
          is_premium: !!response.data.success.data.subscription,
          experience: response.data.success.data.game_points || -1,
          level:
            Math.floor((response.data.success.data.game_points || -1) / 1000) +
            1,
        };
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }

  async function fetchStories() {
    console.log("Get stories API called");
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/stories/`
      );
      if (response.data && response.data.success) {
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  }

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

  useEffect(() => {

    setStories((prev)=>prev=initialProfile?.games);

    if (initialProfile) {
      const mappedProfile = {
        bio: initialProfile.bio || "Hi, I am using Kraken",
        cover_photo:
          initialProfile.cover_photo || "/img/covers/fantasy-landscape.jpg",
        username: initialProfile.username || "Anonymous Creator",
        first_name: initialProfile.first_name || "",
        last_name: initialProfile.last_name || "",
        profile_photo:
          initialProfile.profile_photo || "/img/user/user_avatar.gif",
        user_id: initialProfile.user_id || "",
        joined_at: initialProfile.joined_at || "",

        games_created: initialProfile.games_created || 0,
        published_games: initialProfile.published_games || 0,

        experience: (initialProfile.games_created || 0) * 100,
        level:
          Math.floor(((initialProfile.games_created || 0) * 100) / 500) + 1,
        game_points: (initialProfile.games_created || 0) * 100,

        bmac_username: initialProfile.bmac_username
          ? `https://buymeacoffee.com/${initialProfile.bmac_username}`
          : null,
        patreon_username: initialProfile.patreon_username
          ? `https://patreon.com/${initialProfile.patreon_username}`
          : null,
        twitter_username: initialProfile.twitter_username || "",
        discord_username: initialProfile.discord_username || "",

        is_premium: false,
        subscription: null,
        badges: [],

        gameStats: {
          published: initialProfile.published_games || 0,
          drafts:
            initialProfile.games_created -
            (initialProfile.published_games || 0),
          totalPlays: 0,
          avgRating: 0,
        },

        specializations: [
          "Fantasy RPGs",
          "Character Development",
          "World Building",
          "Interactive Storytelling",
        ],
        achievements: [
          {
            name: "Master Storyteller",
            icon: "📚",
            description: "Created 10+ engaging stories",
          },
          {
            name: "World Builder",
            icon: "🌍",
            description: "Crafted immersive game worlds",
          },
          {
            name: "Player Favorite",
            icon: "⭐",
            description: "Maintained 4.5+ star rating",
          },
          {
            name: "Community Leader",
            icon: "👑",
            description: "Active community member",
          },
        ],
      };

      setCreatorProfile((prev) => ({
        ...prev,
        ...mappedProfile,
      }));
    }
  }, [initialProfile]);

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

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Unknown";
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getBadgeIcon = (badge) => {
    const icons = {
      storyteller: "🖋️",
      "world-builder": "🌍",
      "master-creator": "👑",
      "pixel-artist": "🎨",
      "community-favorite": "⭐",
      "prolific-writer": "📚",
    };
    return icons[badge] || "🏆";
  };

  const getSpecializationIcon = (spec) => {
    const icons = {
      "Fantasy RPGs": <GiDragonHead className="text-purple-400" />,
      "Character Development": <GiSwordman className="text-blue-400" />,
      "World Building": <BiWorld className="text-green-400" />,
      "Interactive Storytelling": <BiBook className="text-orange-400" />,
      "Choice-Based Narratives": <GiMagicSwirl className="text-pink-400" />,
      "Game Mechanics": <BiCode className="text-cyan-400" />,
      "Visual Design": <BiPalette className="text-yellow-400" />,
      "Sound Design": <FaHeart className="text-red-400" />,
    };
    return icons[spec] || <FaGamepad className="text-gray-400" />;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${creatorProfile.username}'s Game Profile`,
          text: `Check out ${creatorProfile.username}'s amazing games!`,
          url: url,
        });
      } catch (error) {
        console.log("Error sharing:", error);
        setShareModal(true);
      }
    } else {
      setShareModal(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleCoffeeSupport = () => {
    const bmacUrl = creatorProfile.bmac_username?.startsWith("http")
      ? creatorProfile.bmac_username
      : `https://buymeacoffee.com/${creatorProfile.bmac_username}`;

    if (creatorProfile.bmac_username) {
      window.open(`${bmacUrl}?amount=${coffeeAmount}`, "_blank");
      setShowCoffeeModal(false);
    }
  };

  const generateDynamicBadges = (profileData) => {
    const badges = [];

    if (profileData.games_created >= 1) {
      badges.push("storyteller");
    }

    if (profileData.games_created >= 5) {
      badges.push("prolific-writer");
    }

    if (profileData.published_games >= 3) {
      badges.push("world-builder");
    }

    if (profileData.games_created >= 10) {
      badges.push("master-creator");
    }

    return badges;
  };

  const handlePatreonSupport = () => {
    const patreonUrl = creatorProfile.patreon_username?.startsWith("http")
      ? creatorProfile.patreon_username
      : `https://patreon.com/${creatorProfile.patreon_username}`;

    if (creatorProfile.patreon_username) {
      window.open(patreonUrl, "_blank");
      setShowPatreonModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-24 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section with Cover */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <Image
          src={
            creatorProfile.cover_photo || "/img/covers/fantasy-landscape.jpg"
          }
          alt="Cover"
          layout="fill"
          objectFit="cover"
          className="brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

        {/* Action Buttons */}
        <div className="absolute top-6 right-6 flex gap-3">
          {isOwnProfile && (
            <Link href="/edit-profile">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="bg-white/10 backdrop-blur-sm p-3 rounded-full border border-white/20 hover:bg-white/20 transition-colors"
              >
                <MdEdit className="w-5 h-5" />
              </motion.button>
            </Link>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleShare}
            className="bg-white/10 backdrop-blur-sm p-3 rounded-full border border-white/20 hover:bg-white/20 transition-colors"
          >
            <FaShare className="w-5 h-5" />
          </motion.button>

          {creatorProfile.bmac_username && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowCoffeeModal(true)}
              className="bg-yellow-600/80 backdrop-blur-sm p-3 rounded-full border border-yellow-500/20 hover:bg-yellow-600 transition-colors"
            >
              <FaCoffee className="w-5 h-5" />
            </motion.button>
          )}

          {creatorProfile.patreon_username && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowPatreonModal(true)}
              className="bg-orange-600/80 backdrop-blur-sm p-3 rounded-full border border-orange-500/20 hover:bg-orange-600 transition-colors"
            >
              <SiPatreon className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl mx-auto">
                <Image
                  src={
                    creatorProfile.profile_photo || "/img/user/user_avatar.gif"
                  }
                  alt={creatorProfile.username || "Creator"}
                  width={160}
                  height={160}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-12 h-12 flex items-center justify-center border-4 border-white text-white font-bold">
                {creatorProfile.level}
              </div>
              <div className="absolute -bottom-2 left-0 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                </svg>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {creatorProfile.username || "Anonymous Creator"}
                </h1>
                {creatorProfile.is_premium && (
                  <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1 rounded-full text-sm flex items-center font-semibold">
                    <MdVerified className="mr-1" />
                    {creatorProfile.subscription?.plan_type || "Premium"}
                  </span>
                )}
              </div>

              <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                {creatorProfile.bio ||
                  "Creating immersive RPG experiences with rich storytelling and meaningful player choices."}
              </p>

              {/* Enhanced Stats Row */}
              <div className="flex items-center w-full justify-center gap-4 px-44 md:px-56 lg:px-72 xl:px-96">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg min-w-full max-w-[20rem] p-4 border border-white/10">
                  <div className="flex items-center justify-center text-purple-400 mb-2">
                    <FaGamepad className="text-2xl" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {creatorProfile.published_games || 0}
                    </div>
                    <div className="text-sm text-gray-400">Published Games</div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg min-w-full p-4 max-w-[20rem] border border-white/10">
                  <div className="flex items-center justify-center text-orange-400 mb-2">
                    <GiScrollUnfurled className="text-2xl" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {creatorProfile.games_created || 0}
                    </div>
                    <div className="text-sm text-gray-400">Total Games</div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-lg min-w-full p-4 max-w-[20rem] border border-white/10">
                  <div className="flex items-center justify-center text-yellow-400 mb-2">
                    <FaStar className="text-2xl" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {stories.length > 0
                        ? (
                            stories.reduce(
                              (sum, story) => sum + (story.rating || 0),
                              0
                            ) / stories.length
                          ).toFixed(1)
                        : "N/A"}
                    </div>
                    <div className="text-sm text-gray-400">Avg Rating</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 pt-4">
                <FaCalendarAlt className="text-purple-400" />
                <span>
                  Joined {formatDate(creatorProfile.joined_at) || "2024"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Badges */}
          {creatorProfile.badges && creatorProfile.badges.length > 0 ? (
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {creatorProfile.badges.map((badge) => (
                <motion.span
                  key={badge}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 px-4 py-2 rounded-full flex items-center gap-2 text-sm backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30 transition-all"
                >
                  {getBadgeIcon(badge)}{" "}
                  {badge
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </motion.span>
              ))}
            </motion.div>
          ) : (
            // Show default badges based on achievements
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-3 mb-12"
            >
              {generateDynamicBadges(creatorProfile).map((badge) => (
                <motion.span
                  key={badge}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 px-4 py-2 rounded-full flex items-center gap-2 text-sm backdrop-blur-sm hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30 transition-all"
                >
                  {getBadgeIcon(badge)}{" "}
                  {badge
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex justify-center border-b border-white/10 overflow-x-auto">
              {["created", "about"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 capitalize relative font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? "text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {tab === "created" ? "Games" : tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
  {activeTab === "created" && (
    <motion.div
      key="created"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Published Games</h2>
        <div className="flex gap-4 text-sm">
          <span className="bg-white/5 px-3 py-1 rounded-full flex items-center gap-2">
            <GiScrollUnfurled className="text-purple-400" />
            {creatorProfile.gameStats?.published || 0} Published
          </span>
        </div>
      </div>

      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <motion.div
              key={story.game_id}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300 group h-[350px] lg:h-[550px] flex flex-col"
            >
              <div className="relative h-64 lg:h-96 overflow-hidden flex-shrink-0">
                <Image
                  src={
                    story.preview_image ||
                    "/img/covers/fantasy-landscape.jpg"
                  }
                  alt={story.game_name}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Price Badge */}
                {!story.is_free && (
                  <span className="absolute top-3 left-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    ${story.price}
                  </span>
                )}
                
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-row items-center gap-4">
                      {story.game_tags && (
                        <div className="flex gap-1">
                          {story.game_tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-purple-600/80 px-2 py-1 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                     <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                        <FaFire className="text-orange-400" />
                        <span>{story.total_interactions || 0} plays</span>
                      </div>
                    </div>
                    <Link href={`/games/${story.game_id}`}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="bg-purple-600 hover:bg-purple-700 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaExternalLinkAlt className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {story.game_name || "Untitled Game"}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow line-clamp-3">
                  {(story.description || "No description available").slice(0, 120)}
                  {story.description && story.description.length > 120 && "..."}
                </p>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                  <p className="text-xs text-gray-500">
                    Created {formatDate(story.created_at)}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaUsers />
                      {story.total_interactions || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaGamepad />
                      {story.stories_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-semibold mb-2">
            No Published Games Yet
          </h3>
          <p className="text-gray-400">
            This creator hasn't published any games yet. Check back later!
          </p>
        </div>
      )}
    </motion.div>
  )}
</AnimatePresence>
        </motion.div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShareModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-6 text-center">
                Share Profile
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-300 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(window.location.href)}
                    className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Copy
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      window.open(
                        `https://twitter.com/intent/tweet?text=Check out ${creatorProfile.username}'s amazing games!&url=${window.location.href}`,
                        "_blank"
                      )
                    }
                    className="bg-blue-500 hover:bg-blue-600 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
                        "_blank"
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Facebook</span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShareModal(false)}
                className="w-full mt-6 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  Support {creatorProfile.username}'s creative work
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
                        className={`flex-1 p-3 rounded-lg border transition-all ${
                          coffeeAmount === amount
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
    </div>
  );
}
