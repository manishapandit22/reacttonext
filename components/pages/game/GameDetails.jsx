"use client";
import React, { useState, useEffect, useRef } from "react";
import Tabs from "./Tabs";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion'
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import PreviewMedia from "@/components/pages/game/PreviewMedia";
import useUserCookie from "@/hooks/useUserCookie";
import MusicPlayer from "@/components/pages/play/MusicPlayer";
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp, FaTiktok, FaDiscord, FaCoffee } from 'react-icons/fa';
import CouponModal from "@/components/modals/CouponModal";
import TypewriterMarkdown from "./TypewriterMarkdown";
import { getTagIcon } from "@/components/home/CoverFlowSlider";
import { SiPatreon } from "react-icons/si";
import RedeemCouponCard from "@/components/modals/GameRedeemModal";

export default function GameDetails({ id }) {
  const { axiosInstance, loading, error } = useAxiosWithAuth();
  const user = useUserCookie();
  const router = useRouter();
  const [game, setGame] = useState();
  const [height, setHeight] = useState(0);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showPatreonModal, setShowPatreonModal] = useState(false);
  const [showCoffeeSupport, setShowCoffeeSupport] = useState(false)
  const [showPatreonSupport, setShowPatreonSupport] = useState(false)
  const [coffeeAmount, setCoffeeAmount] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [creator, setCreator] = useState(null);
  const [patreonTier, setPatreonTier] = useState("supporter");
  const { profile } = useUser();

  const ref = useRef(null);
  const isLoading = !game;
  const [isMdUp, setIsMdUp] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const getSocialDescription = () => {
    if (!game?.game_opener) return '';
    const cleanedDescription = game.game_opener.replace(/https?:\/\/[^\s]+/g, '').trim();
    return cleanedDescription.substring(0, 160) + (cleanedDescription.length > 160 ? '...' : '');
  };

  async function fetchGame(game_id) {
    console.log("Get game API called");

    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/games/${game_id}`
      );

      if (!response.data?.success) {
        console.error("Unexpected response structure:", response);
        return;
      }

      const gameData = response.data.success.data;
      setGame(gameData);

      if (!gameData.user?.username) return;

      try {
        const res = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/profile/public/${gameData.user.username}`
        );

        if (!res.data?.success) return;

        const creatorData = res.data.success.data;

        setShowCoffeeSupport(!!creatorData.bmac_username);
        setShowPatreonSupport(!!creatorData.patreon_username);
        setCreator(creatorData);

      } catch (error) {
        console.error("Error fetching creator profile:", error);
      }

    } catch (err) {
      console.error("Error fetching game:", err);
    }
  }

  const getShareUrls = () => {
    const rawUrl = `${window.location.origin}/games/${id}`;
    const rawTitle = game?.game_name || '';
    const rawDescription = getSocialDescription();

    const encodedUrl = encodeURIComponent(rawUrl);
    const encodedTitle = encodeURIComponent(rawTitle);
    const encodedDescription = encodeURIComponent(rawDescription);

    const whatsappText = `${rawTitle} - ${rawDescription} ${rawUrl}`;
    const tiktokText = `Check out this amazing game: ${rawTitle}! ${rawUrl}`;

    return {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}%20-%20${encodedDescription}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`,
    };
  };

  const handleShare = (platform) => {
    const urls = getShareUrls();
    const dimensions = {
      twitter: 'width=600,height=600',
      facebook: 'width=670,height=520',
      linkedin: 'width=600,height=600',
      whatsapp: 'width=550,height=600',
    };
    const shareData = {
      title: game?.game_name || '',
      text: getSocialDescription(),
      url: `${window.location.origin}/games/${id}`,
    };

    if (typeof window !== 'undefined') {
      if (platform === 'whatsapp') {
        if (navigator.share && /mobile|android|ios/i.test(navigator.userAgent)) {
          navigator.share({
            title: game?.game_name || '',
            text: getSocialDescription(),
            url: `${window.location.origin}/games/${id}`
          }).catch(err => {
            console.error('Share failed:', err);
            window.open(urls[platform], '_blank', dimensions[platform]);
          });
        } else {
          window.open(urls[platform], '_blank', dimensions[platform]);
        }
      }

      else if (platform === 'tiktok' || platform === 'discord') {
        if (navigator.share) {
          navigator.share(shareData)
            .then(() => {
              showNotification(`Shared successfully to ${platform}!`);
            })
            .catch((err) => {
              console.error(`Share failed for ${platform}:`, err);
              copyToClipboard(platform);
            });
        } else {
          copyToClipboard(platform);
        }
      } else {
        window.open(urls[platform], '_blank', dimensions[platform]);
      }
    }
  };

  const copyToClipboard = () => {
    const textToCopy = `${game?.game_name} - ${window.location.origin}/games/${id}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        showNotification('Link copied to clipboard! You can now paste it in Discord.');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const showNotification = (message) => {
    console.log(message);
    // toast.success(message);
  };

  async function handlePurchaseGame(coupon_code) {
    try {
      const response = await axiosInstance.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/payments/create-game-checkout/" + id + "/",
        {
          coupon_code: coupon_code
        }
      );
      window.location.href = response.data.session_url;
    } catch (err) {
      toast.error("Error purchasing game");
    }
  }

  async function handleCreateCoupon() {
    console.log("Create coupon");
    try {
      const response = await axiosInstance.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/create-creator-coupon/",
        {
          game: id,
        }
      );
      if (response.data.success) {
        toast.success("Coupon created");
        router.push("/wallet");
      } else {
        toast.error("Failed to create coupon");
      }
    } catch (err) {
      if (err.response.status === 403) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to create coupon");
      }
    }
  }

  useEffect(() => {
    fetchGame(id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsClient(true);
    const mql = window.matchMedia('(min-width: 768px)');
    const update = () => setIsMdUp(mql.matches);
    update();
    mql.addEventListener ? mql.addEventListener('change', update) : mql.addListener(update);
    return () => {
      mql.removeEventListener ? mql.removeEventListener('change', update) : mql.removeListener(update);
    };
  }, []);

  useEffect(() => {
    if (game && !game?.published) {
      // If game is not published and user is not logged in, redirect
      if (!profile) {
        toast.error("Game access denied");
        router.push(`/games`);
      }
      // If game is not published and user is logged in but not the creator, redirect
      else if (game?.user.user_id !== profile?.user_id) {
        toast.error("Game access denied");
        router.push(`/games`);
      }
    }

    // No need to update metadata here as it's handled by generateMetadata in the page component
  }, [game, id]);

  useEffect(() => {
    setLikesCount(Math.floor(Math.random() * 51) + 50);
  }, []);

  async function handleDeleteGame() {
    console.log("delete game API called");

    // Add confirmation dialog
    if (!confirm("Are you sure you want to delete this game? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/games/" + id + "/");

      if (response.data && response.data.success) {
        toast.success("Game deleted successfully");
        router.push('/profile');
      } else {
        toast.error("Failed to delete game");
      }
    } catch (err) {
      toast.error("Error deleting game");
    }
  }

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

  const components = {
    // @ts-expect-error
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        // @ts-expect-error
        <pre
          {...props}
          className={`${className} text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
        >
          <code className={match[1]}>{children}</code>
        </pre>
      ) : (
        <code
          className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
          {...props}
        >
          {children}
        </code>
      );
    },
    ol: ({ node, children, ...props }) => {
      return (
        <ol className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }) => {
      return (
        <li className="py-1" {...props}>
          {children}
        </li>
      );
    },
    ul: ({ node, children, ...props }) => {
      return (
        <ul className="list-decimal list-outside ml-4" {...props}>
          {children}
        </ul>
      );
    },
    strong: ({ node, children, ...props }) => {
      return (
        <span className="font-semibold" {...props}>
          {children}
        </span>
      );
    },

    h1: ({ node, children, ...props }) => {
      return (
        <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h1>
      );
    },
    h2: ({ node, children, ...props }) => {
      return (
        <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }) => {
      return (
        <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
          {children}
        </h3>
      );
    },
    h4: ({ node, children, ...props }) => {
      return (
        <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
          {children}
        </h4>
      );
    },
    h5: ({ node, children, ...props }) => {
      return (
        <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
          {children}
        </h5>
      );
    },
    h6: ({ node, children, ...props }) => {
      return (
        <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
          {children}
        </h6>
      );
    },
  };

  useEffect(() => {
    setHeight(ref.current.clientHeight);
  }, [game, mediaLoaded]);
  return (
    <div className="relative">
      {/* Modern header with breadcrumbs and quick actions */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-white/60 dark:bg-jacarta-900/60 backdrop-blur-md supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-jacarta-900/50">
        <div className="container px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <nav aria-label="Breadcrumb" className="flex items-center text-sm">
            <ol className="flex items-center gap-2 text-jacarta-500 dark:text-jacarta-300">
              <li>
                <Link href="/" className="hover:text-jacarta-700 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-1">Home</Link>
              </li>
              <li aria-hidden="true" className="opacity-60">/</li>
              <li>
                <Link href="/games" className="hover:text-jacarta-700 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded px-1">Games</Link>
              </li>
              <li aria-hidden="true" className="opacity-60">/</li>
              <li aria-current="page" className="font-medium text-jacarta-700 dark:text-white truncate max-w-[40vw] md:max-w-[50vw]">{game?.game_name || 'Loading...'}</li>
            </ol>
          </nav>
        </div>
      </header>
      {isLoading && (
        <section className="relative pt-10 md:pt-16 pb-20 md:pb-28">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:flex-wrap gap-8 animate-pulse">
              <div className="md:w-2/5 lg:w-1/2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 rounded-full bg-jacarta-100 dark:bg-jacarta-700" />
                  <div className="h-6 w-6 rounded-full bg-jacarta-100 dark:bg-jacarta-700" />
                </div>
                <div className="h-64 w-full rounded-xl bg-jacarta-100 dark:bg-jacarta-700" />
              </div>
              <div className="md:w-3/5 lg:w-1/2 space-y-4 md:pl-8 lg:pl-[3.75rem]">
                <div className="h-10 w-3/4 rounded bg-jacarta-100 dark:bg-jacarta-700" />
                <div className="h-4 w-full rounded bg-jacarta-100 dark:bg-jacarta-700" />
                <div className="h-4 w-5/6 rounded bg-jacarta-100 dark:bg-jacarta-700" />
                <div className="h-60 w-full rounded-2xl border border-jacarta-100 dark:border-jacarta-600 bg-white dark:bg-jacarta-700" />
                <div className="h-10 w-full rounded-lg bg-accent/60" />
              </div>
            </div>
          </div>
        </section>
      )}
        {/* {
        modalOpen && <RedeemCouponCard isOpen={modalOpen}/>
      } */}
      {/* Removed Head component as metadata is handled by generateMetadata */}

      <section className="relative pt-10 md:pt-16 pb-20 md:pb-28">
        <CouponModal game={game} onPurchase={handlePurchaseGame} />
        <div className="container px-4 sm:px-6 lg:px-8">
          {/* Item */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Image */}
            <figure className="w-full">
              <div ref={ref}>
                <div className="mb-3 flex flex-wrap gap-2">
                  {/* Collection */}
                  <div className="flex items-center">
                    {!game?.is_free && <>
                      <span className="dark:text-white mr-2">Paid</span>
                      <span
                        className="inline-flex h-6 w-6 items-center mr-2 justify-center rounded-full border-2 border-white bg-green dark:border-jacarta-600"
                        data-tippy-content="Verified Collection"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className="h-[.875rem] w-[.875rem] fill-white"
                        >
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                        </svg>
                      </span>
                    </>}
                    {game?.game_tags && game?.game_tags.length > 0 && (
                      <div className="flex items-center bg-black/40 p-1 rounded-md max-w-full overflow-x-auto whitespace-nowrap">
                        {game.game_tags.slice(0, 3).map((tag, i) => (
                          <div key={i} className="inline-flex items-center mr-2">
                            <div className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-jacarta-900">
                              {getTagIcon(tag, i)}
                            </div>
                            <span className="font-display text-xs font-semibold text-white">
                              {tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Likes / Actions */}
                  <div className="ml-auto flex space-x-2 w-full md:w-auto mt-2 md:mt-0 justify-end md:justify-start">
                    {/* Share Button */}
                    <div className="dropdown rounded-xl border border-jacarta-100 bg-white/70 hover:bg-white shadow-popover ring-1 ring-black/5 backdrop-blur-md transition-colors dark:border-jacarta-600 dark:bg-jacarta-700/70 dark:hover:bg-jacarta-700 relative z-[3000]">
                      <button
                        className="dropdown-toggle inline-flex h-10 w-10 items-center justify-center text-sm rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent hover:text-jacarta-700 dark:hover:text-white transition"
                        role="button"
                        id="shareDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        aria-label="Share game"
                        title="Share"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="fill-jacarta-500 dark:fill-jacarta-200" viewBox="0 0 16 16">
                          <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
                        </svg>
                      </button>
                      <div className="dropdown-menu dropdown-menu-end z-[3000] hidden min-w-[220px] whitespace-nowrap rounded-2xl bg-white/90 py-4 px-2 text-left shadow-popover ring-1 ring-black/5 backdrop-blur-md dark:bg-jacarta-800/90" aria-labelledby="shareDropdown" role="menu">
                        <button onClick={() => handleShare('twitter')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                          <FaTwitter size={16} className="text-[#1DA1F2]" />
                          Share on Twitter
                        </button>
                        <button onClick={() => handleShare('facebook')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                          <FaFacebook size={16} className="text-[#4267B2]" />
                          Share on Facebook
                        </button>
                        <button onClick={() => handleShare('tiktok')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                          <FaTiktok size={16} className="text-[#000000] dark:text-[#ff0050]" />
                          Share on TikTok
                        </button>
                        {/* <button onClick={() => handleShare('linkedin')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                          <FaLinkedin size={16} className="text-[#0077b5]" />
                          Share on LinkedIn
                        </button> */}
                        <button onClick={() => handleShare('whatsapp')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:text-white dark:hover:bg-jacarta-600">
                          <FaWhatsapp size={16} className="text-[#25D366]" />
                          Share on WhatsApp
                        </button>
                        {/* <button onClick={() => handleShare('discord')} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                          <FaDiscord size={16} className="text-[#5865F2]" />
                          Share on Discord
                        </button> */}
                        <hr className="my-2 mx-4 h-px border-0 bg-jacarta-100 dark:bg-jacarta-600" />
                        <button onClick={() => {
                          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://krakengames.quest';
                          const gameUrl = `${origin}/games/${id}`;
                          navigator.clipboard.writeText(gameUrl);
                          toast.success("URL copied to clipboard!");
                        }} className="flex w-full items-center gap-2 rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:text-white dark:hover:bg-jacarta-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-500" viewBox="0 0 16 16">
                            <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                            <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                          </svg>
                          Copy URL
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 rounded-xl border border-jacarta-100 bg-white/70 py-2 px-4 shadow-card ring-1 ring-black/5 backdrop-blur-md dark:border-jacarta-600 dark:bg-jacarta-700/70">
                      <span
                        className="js-likes relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-[url('../img/heart-fill.svg')] before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0"
                        data-tippy-content="Favorite"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className="h-4 w-4 fill-red-500 hover:fill-red-600 dark:fill-red-500 dark:hover:fill-red-600"
                        >
                          <path fill="none" d="M0 0H24V24H0z"></path>
                          <path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z"></path>
                        </svg>
                      </span>
                      <span className="text-sm dark:text-jacarta-200">
                        {game ? (game.total_interactions) : '-'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="dropdown rounded-xl border border-jacarta-100 bg-white/80 hover:bg-white shadow-popover ring-1 ring-black/5 backdrop-blur-sm transition-colors dark:border-jacarta-600 dark:bg-jacarta-700/80 dark:hover:bg-jacarta-700">
                      <a
                        href="#"
                        className="dropdown-toggle inline-flex h-10 w-10 items-center justify-center text-sm rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent hover:text-jacarta-700 dark:hover:text-white transition"
                        role="button"
                        id="collectionActions"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <svg
                          width="16"
                          height="4"
                          viewBox="0 0 16 4"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="fill-jacarta-500 dark:fill-jacarta-200"
                        >
                          <circle cx="2" cy="2" r="2"></circle>
                          <circle cx="8" cy="2" r="2"></circle>
                          <circle cx="14" cy="2" r="2"></circle>
                        </svg>
                      </a>
                      <div
                        className="dropdown-menu dropdown-menu-end z-10 hidden min-w-[220px] whitespace-nowrap rounded-2xl bg-white/90 py-4 px-2 text-left shadow-popover ring-1 ring-black/5 backdrop-blur-sm dark:bg-jacarta-800/90"
                        aria-labelledby="collectionActions"
                      >
                        {game?.user?.user_id === profile?.user_id && (
                          <>
                            <Link
                              href={`/games/${id}/edit`}
                              className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent dark:text-white dark:hover:bg-jacarta-600">
                              Edit Game
                            </Link>
                            <button
                              onClick={() => handleDeleteGame()}
                              className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 dark:text-white dark:hover:bg-jacarta-600"
                              aria-label="Delete game"
                            >
                              Delete Game
                            </button>

                          </>
                        )}
                        {!game?.is_free && (
                          <>
                            <hr className="my-2 mx-4 h-px border-0 bg-jacarta-100 dark:bg-jacarta-600" />

                            {/* <button 
                              onClick={handleCreateCoupon}
                              className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              Create coupon
                            </button> */}
                          </>
                        )}

                      </div>
                    </div>
                  </div>
                </div>

                <h1 className="mb-4 font-display text-3xl md:text-4xl font-semibold tracking-tight text-jacarta-700 dark:text-white">
                  {game?.game_name}
                </h1>

                <p className="mb-6 text-jacarta-600 dark:text-jacarta-300 leading-relaxed">
                  {game?.description}
                </p>

                <PreviewMedia
                  musicUrl={game?.opener_mp3}
                  mediaUrl={game?.preview_image}
                  mediaType={game?.preview_image_type}
                  alt="Game Preview"
                  onLoad={() => setMediaLoaded(true)}
                />
                {/* <button onClick={()=>setModalOpen(true)} className="mt-3 inline-flex items-center rounded-lg bg-gradient-to-r from-jacarta-700 to-jacarta-700/90 text-white px-4 py-2 text-sm font-medium shadow-card hover:shadow-glow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jacarta-700">Open Modal</button> */}
                {/* Bid */}
                <div className="rounded-3xl border border-jacarta-100 bg-white/70 p-6 shadow-card ring-1 ring-black/5 backdrop-blur-md dark:border-jacarta-600 dark:bg-jacarta-700/70 mt-4">
                  <div className="mb-6">
                    {/* Creator Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <figure className="shrink-0">
                          <Image
                            width={48}
                            height={48}
                            onClick={() => router.push(`/profile/${game?.user.username}`)}
                            src={game?.user.profile_photo || "/img/avatars/avatar_4.jpg"}
                            alt="avatar"
                            className="rounded-full cursor-pointer ring-2 ring-white/50 shadow-card"
                            style={{
                              color: "transparent",
                              visibility: "visible",
                            }}
                            priority={true}
                          />
                        </figure>
                        <div>
                          <span className="text-sm text-jacarta-400 dark:text-jacarta-300 block">
                            Creator of game
                          </span>
                          <span className="font-medium text-jacarta-700 dark:text-white">
                            {game?.user.username}
                          </span>
                        </div>
                      </div>

                      {/* Support Buttons */}
                      <div className="flex flex-wrap gap-3 ml-auto w-full sm:w-auto mt-4 sm:mt-0 justify-start sm:justify-end">
                        {showCoffeeSupport &&
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowCoffeeModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-medium px-4 py-2 rounded-lg transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 text-sm sm:text-base"
                          >
                            <FaCoffee className="text-lg" />
                            <span>Buy me a coffee</span>
                          </motion.button>
                        }
                        {showPatreonSupport &&
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowPatreonModal(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium px-4 py-2 rounded-lg transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 text-sm sm:text-base"
                          >
                            <SiPatreon className="text-lg" />
                            <span>Support on Patreon</span>
                          </motion.button>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  {game?.user.user_id === profile?.user_id ? (
                    <Link
                      href={`/games/${game?.game_id}/play`}
                      className="flex items-center justify-center w-full rounded-xl bg-accent py-3 px-6 text-center font-medium text-white shadow-card hover:shadow-glow transition-all hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                    >
                      Play Game
                    </Link>
                  ) : game?.is_free || game?.is_purchased ? (
                    <Link
                      href={user ? `/games/${game?.game_id}/play` : ""}
                      data-bs-toggle={!user ? "modal" : undefined}
                      data-bs-target={!user ? "#loginModal" : undefined}
                      className="flex items-center justify-center w-full rounded-xl bg-accent py-3 px-6 text-center font-medium text-white shadow-card hover:shadow-glow transition-all hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                    >
                      Play Game
                    </Link>
                  ) : (
                    <button
                      data-bs-toggle="modal"
                      data-bs-target={user ? "#couponModal" : "#loginModal"}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-accent py-3 px-6 text-center font-medium text-white shadow-card hover:shadow-glow transition-all hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
                    >
                      <svg className="fill-white w-4 h-4" viewBox="0 0 330 330" xmlSpace="preserve">
                        <path d="M65,330h200c8.284,0,15-6.716,15-15V145c0-8.284-6.716-15-15-15h-15V85c0-46.869-38.131-85-85-85 S80,38.131,80,85v45H65c-8.284,0-15,6.716-15,15v170C50,323.284,56.716,330,65,330z M180,234.986V255c0,8.284-6.716,15-15,15 s-15-6.716-15-15v-20.014c-6.068-4.565-10-11.824-10-19.986c0-13.785,11.215-25,25-25s25,11.215,25,25 C190,223.162,186.068,230.421,180,234.986z M110,85c0-30.327,24.673-55,55-55s55,24.673,55,55v45H110V85z" />
                      </svg>
                      <span>Unlock Game for ${game?.price}</span>
                    </button>
                  )}
                </div>
                {/* end bid */}
                <div
                  className="modal fade"
                  id="imageModal"
                  tabIndex="-1"
                  aria-hidden="true"
                >
                  <div className="modal-dialog !my-0 flex h-full items-center justify-center p-4">
                    {game?.preview_image && (
                      <Image
                        width={787}
                        height={984}
                        src={game?.preview_image}
                        alt="item"
                      />
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-close absolute top-6 right-6"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-6 w-6 fill-white"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                    </svg>
                  </button>
                </div>
                {/* end modal */}
              </div>
            </figure>

            {/* Details */}
            <div className="w-full mt-2 lg:mt-0">
              <div
                style={isMdUp ? {
                  height: game?.opener_mp3
                    ? `calc(${height}px - 90px )`
                    : `${height}px`,
                } : {}}
                className="px-6 py-8 dark:text-white rounded-2lg border border-jacarta-100 bg-white/70 shadow-sm dark:border-jacarta-600 dark:bg-jacarta-700/70 overflow-y-auto backdrop-blur-md"
              >
                <TypewriterMarkdown
                  content={game?.game_opener}
                  components={components}
                  delay={20}
                />
              </div>

              {game?.opener_mp3 && (
                <div className="mt-[15px] p-4 rounded-xl border border-jacarta-100 dark:border-jacarta-600 bg-white/60 dark:bg-jacarta-700/60 backdrop-blur-md">
                  <MusicPlayer
                    songUrl={game?.opener_mp3}
                    title={"Opener Mp3"}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="rounded-2xl border border-jacarta-100 dark:border-jacarta-600 bg-white/60 dark:bg-jacarta-700/60 backdrop-blur-md shadow-card">
            <Tabs game={game} />
          </div>
          {/* end tabs */}
        </div>
      </section>
      {/* Coffee Support Modal */}
      <AnimatePresence>
        {showCoffeeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowCoffeeModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCoffee className="text-2xl text-black" />
                </div>
                <h3 className="text-xl font-bold">Buy me a coffee!</h3>
                <p className="text-gray-400 mt-2">Support {creator.username}'s creative work</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount ($)</label>
                  <div className="flex gap-2">
                    {[5, 10, 15, 25].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCoffeeAmount(amount)}
                        className={`flex-1 p-3 rounded-lg border transition-all ${coffeeAmount === amount
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                          : 'border-white/20 bg-white/5 hover:border-yellow-500/50'
                          }`}
                        aria-pressed={coffeeAmount === amount}
                        aria-label={`Set coffee amount to ${amount}`}
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
                    aria-label="Cancel coffee support"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCoffeeSupport}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-semibold p-3 rounded-lg transition-all"
                    aria-label={`Support ${coffeeAmount} dollars`}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowPatreonModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SiPatreon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold">Support on Patreon</h3>
                <p className="text-gray-400 mt-2">Become a patron and get exclusive perks!</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <h4 className="font-semibold text-orange-400">Supporter - $5/month</h4>
                    <p className="text-sm text-gray-400">Access to patron-only posts and early game previews</p>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <h4 className="font-semibold text-red-400">Creator - $15/month</h4>
                    <p className="text-sm text-gray-400">Everything above + behind-the-scenes content and voting on future projects</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPatreonModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors"
                    aria-label="Cancel Patreon"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePatreonSupport}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold p-3 rounded-lg transition-all"
                    aria-label="Visit Patreon"
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
