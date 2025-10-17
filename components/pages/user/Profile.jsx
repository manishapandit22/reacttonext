"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import { useUser } from "@/contexts/UserContext";
import tippy from "tippy.js";
import Socials from "../collection/Socials";
import CopyToClipboard from "@/utlis/AddClipboard";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectPayouts,
  ConnectPayments,
  ConnectBalances,
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from "@stripe/react-connect-js";
import { GiTwoCoins, GiScrollUnfurled, GiSpellBook } from "react-icons/gi";
import {
  FaFire,
  FaUsers,
  FaGamepad,
  FaCoffee,
  FaPatreon,
  FaShare,
} from "react-icons/fa";
import { MdVerified, MdEdit } from "react-icons/md";
import PreviewMedia from "@/components/games/PreviewMedia";
import GamesTab from "./GamesTab";
import {useRouter}  from 'next/navigation'
import PublishedGames from "./PublishedGames";
import Cookie from "js-cookie";
import { BiWorld } from "react-icons/bi";
import StripeDisabledMessage from "@/components/ui/StripeDisabledMessage";
import PublishSuccessModal from "@/components/modals/PublishSuccessModal";

export default function CreatorProfile() {
  const { axiosInstance, loading, error } = useAxiosWithAuth();
  const { profile, createCreatorCoupon } = useUser();
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showPatreonModal, setShowPatreonModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedGameData, setPublishedGameData] = useState(null);
  const [activeTab, setActiveTab] = useState("created");
  const [coffeeAmount, setCoffeeAmount] = useState(5);
  const [patreonTier, setPatreonTier] = useState("supporter");
  const [stories, setStories] = useState([]);
  const [isOnboardingComplete, setIsOnboardingComplet] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState({
    bio: "",
    cover_photo: "",
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    profile_photo: "",
    user_id: "",
    joined_at: "",
    experience: 0,
    level: 1,
    games_created: 0,
    games_played: 0,
    followers: 0,
    bmac_username: "https://www.buymeacoffee.com/",
    patreon_username: "https://www.patreon.com/",
    is_premium: false,
    subscription: null,
    game_points: 0,
    badges: ["storyteller", "world-builder"],
    gameStats: {
      published: 0,
      drafts: 0,
      favorites: 0,
    },
  });

  const router = useRouter()

  const [stripeConnectInstance, setStripeConnectInstance] = useState(null);
  const [showStripeDashboard, setShowStripeDashboard] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState(null);
  const [accountDetails, setAccountDetails] = useState(null);
  const [stripeError, setStripeError] = useState(null);
  const [stripeAccountChecked, setStripeAccountChecked] = useState(false);
  const [accountStatus, setAccountStatus] = useState("checking");
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Function to show success modal when a game is published
  const handleGamePublished = (gameData) => {
    setPublishedGameData(gameData);
    setShowSuccessModal(true);
  };

  // Function to handle creating a coupon from the success modal
  const handleCreateCoupon = async (gameId) => {
    try {
      const result = await createCreatorCoupon(gameId);
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    }
  };

  // Function to handle viewing the game
  const handleViewGame = () => {
    if (publishedGameData?.game_id) {
      router.push(`/games/${publishedGameData.game_id}`);
    }
    setShowSuccessModal(false);
  };

  // Function to close success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setPublishedGameData(null);
  };

  const initializeStripeConnect = async () => {
    if (!connectedAccountId || stripeConnectInstance) return;

    try {
      setStripeError(null);

      const stripeConnect = await loadConnectAndInitialize({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        fetchClientSecret: async () => {
          try {
            const response = await axiosInstance.post(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe-connect/account_session/`,
              {
                account: connectedAccountId,
                components: {
                  account_onboarding: { enabled: true },
                  payouts: { enabled: true },
                  payments: { enabled: true },
                  balances: { enabled: true },
                  notification_banner: { enabled: true },
                  documents: { enabled: true }
                }
              }
            );

            if (!response.data?.client_secret) {
              throw new Error("No client secret received");
            }
            return response.data.client_secret;
          } catch (error) {
            console.error("Failed to fetch client secret:", error);
            setStripeError("Failed to fetch client secret. Please try again.");
            throw error;
          }
        },
        appearance: {
          overlays: "dialog",
          variables: {
            colorPrimary: "#635bff",
            colorPrimaryText: "#ffffff",
            colorSecondary: "#0570de",
            colorBackground: "#322354",
            colorBackgroundDeep: "#030712",
            colorSurface: "#1e293b",
            colorSurfaceSecondary: "#334155",


            colorText: "#f8fafc",
            colorTextSecondary: "#cbd5e1",
            colorTextTertiary: "#94a3b8",
            colorTextPlaceholder: "#64748b",
            colorTextInverse: "#0f172a",


            colorSuccess: "#10b981",
            colorSuccessText: "#ecfdf5",
            colorWarning: "#f59e0b",
            colorWarningText: "#fffbeb",
            colorDanger: "#ef4444",
            colorDangerText: "#fef2f2",
            colorInfo: "#3b82f6",
            colorInfoText: "#eff6ff",


            colorActionPrimary: "#635bff",
            colorActionPrimaryText: "#ffffff",
            colorActionSecondary: "#475569",
            colorActionSecondaryText: "#f1f5f9",


            colorBorder: "#374151",
            colorBorderSecondary: "#4b5563",
            colorBorderFocus: "#8b5cf6",
            colorBorderError: "#f87171",
            colorBorderSuccess: "#34d399",


            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            fontSizeBase: "14px",
            fontSizeSmall: "12px",
            fontSizeLarge: "16px",
            fontSizeXLarge: "18px",
            fontWeightNormal: "400",
            fontWeightMedium: "500",
            fontWeightBold: "600",
            lineHeight: "1.5",


            spacingUnit: "8px",
            spacingSmall: "4px",
            spacingMedium: "12px",
            spacingLarge: "16px",
            spacingXLarge: "24px",
            spacingXXLarge: "32px",


            borderRadius: "12px",
            borderRadiusSmall: "6px",
            borderRadiusLarge: "16px",
            borderRadiusXLarge: "20px",

            boxShadowPrimary: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            boxShadowSecondary: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            boxShadowLarge: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            boxShadowFocus: "0 0 0 3px rgba(139, 92, 246, 0.1)",


            formAccentColor: "#8b5cf6",
            formBorderColor: "#374151",
            formBorderColorFocus: "#8b5cf6",
            formBackgroundColor: "#1e293b",


            buttonPrimaryBackgroundColor: "#635bff",
            buttonPrimaryBackgroundColorHover: "#5b54f0",
            buttonPrimaryBackgroundColorActive: "#524ce6",
            buttonPrimaryTextColor: "#ffffff",
            buttonPrimaryBorderRadius: "8px",
            buttonPrimaryFontWeight: "500",

            buttonSecondaryBackgroundColor: "#374151",
            buttonSecondaryBackgroundColorHover: "#4b5563",
            buttonSecondaryBackgroundColorActive: "#6b7280",
            buttonSecondaryTextColor: "#f9fafb",
            buttonSecondaryBorderColor: "#4b5563",


            linkColor: "#8b5cf6",
            linkColorHover: "#a78bfa",
            linkColorActive: "#7c3aed",
            linkTextDecoration: "none",
            linkTextDecorationHover: "underline",

            tableHeaderBackgroundColor: "#374151",
            tableHeaderTextColor: "#f9fafb",
            tableBorderColor: "#4b5563",
            tableRowBackgroundColorHover: "#1e293b",

            progressBarBackgroundColor: "#374151",
            progressBarFillColor: "#8b5cf6",
            spinnerColor: "#8b5cf6",


            logoBackgroundColor: "transparent",
            brandAccentColor: "#635bff",
            brandSecondaryColor: "#0570de",


            overlayBackgroundColor: "rgba(15, 23, 42, 0.8)",
            modalBackgroundColor: "#1e293b",
            modalBorderColor: "#475569",
            modalBorderRadius: "16px",


            transitionDuration: "200ms",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",


            focusRingColor: "#8b5cf6",
            focusRingWidth: "2px",
            focusRingOffset: "2px",


            chartColorPrimary: "#8b5cf6",
            chartColorSecondary: "#06b6d4",
            chartColorTertiary: "#10b981",
            chartColorQuaternary: "#f59e0b",
            chartColorQuinary: "#ef4444",


            statusSuccessColor: "#10b981",
            statusWarningColor: "#f59e0b",
            statusErrorColor: "#ef4444",
            statusInfoColor: "#3b82f6",
            statusNeutralColor: "#6b7280",


            gradientPrimary: "linear-gradient(135deg, #635bff 0%, #8b5cf6 100%)",
            gradientSecondary: "linear-gradient(135deg, #0570de 0%, #06b6d4 100%)",
            gradientBackground: "linear-gradient(180deg, #0a0e1a 0%, #030712 100%)",


            glassBackgroundColor: "rgba(30, 41, 59, 0.8)",
            glassBackdropFilter: "blur(12px)",
            glassBorderColor: "rgba(148, 163, 184, 0.1)",
          },

          // Enhanced layout rules
          layout: {
            type: "card",
            spacedAccordionItems: true,
            radios: "floating",
            tabs: "enclosed",
          },

          // Professional rules for consistent styling
          rules: {
            ".Tab": {
              backgroundColor: "var(--colorSurface)",
              borderRadius: "var(--borderRadiusSmall)",
              border: "1px solid var(--colorBorder)",
              transition: "all var(--transitionDuration) var(--transitionTimingFunction)",
            },
            ".Tab--selected": {
              backgroundColor: "var(--colorActionPrimary)",
              borderColor: "var(--colorActionPrimary)",
              color: "var(--colorActionPrimaryText)",
              transform: "translateY(-1px)",
              boxShadow: "var(--boxShadowPrimary)",
            },
            ".Tab:hover": {
              backgroundColor: "var(--colorSurfaceSecondary)",
              borderColor: "var(--colorBorderSecondary)",
            },
            ".Input": {
              backgroundColor: "var(--formBackgroundColor)",
              borderColor: "var(--formBorderColor)",
              borderRadius: "var(--borderRadius)",
              fontSize: "var(--fontSizeBase)",
              fontWeight: "var(--fontWeightNormal)",
              transition: "all var(--transitionDuration) var(--transitionTimingFunction)",
            },
            ".Input:focus": {
              borderColor: "var(--formBorderColorFocus)",
              boxShadow: "var(--boxShadowFocus)",
              outline: "none",
            },
            ".Button": {
              borderRadius: "var(--buttonPrimaryBorderRadius)",
              fontWeight: "var(--buttonPrimaryFontWeight)",
              fontSize: "var(--fontSizeBase)",
              transition: "all var(--transitionDuration) var(--transitionTimingFunction)",
              cursor: "pointer",
            },
            ".Button--primary": {
              background: "var(--gradientPrimary)",
              border: "none",
              color: "var(--buttonPrimaryTextColor)",
              boxShadow: "var(--boxShadowPrimary)",
            },
            ".Button--primary:hover": {
              transform: "translateY(-1px)",
              boxShadow: "var(--boxShadowSecondary)",
            },
            ".Button--primary:active": {
              transform: "translateY(0)",
              boxShadow: "var(--boxShadowPrimary)",
            },
            ".Card": {
              backgroundColor: "var(--glassBackgroundColor)",
              backdropFilter: "var(--glassBackdropFilter)",
              border: "1px solid var(--glassBorderColor)",
              borderRadius: "var(--borderRadiusLarge)",
              boxShadow: "var(--boxShadowSecondary)",
            },
            ".Label": {
              color: "var(--colorText)",
              fontSize: "var(--fontSizeSmall)",
              fontWeight: "var(--fontWeightMedium)",
              marginBottom: "var(--spacingSmall)",
            },
            ".Error": {
              color: "var(--colorDanger)",
              fontSize: "var(--fontSizeSmall)",
              fontWeight: "var(--fontWeightNormal)",
            },
            ".Success": {
              color: "var(--colorSuccess)",
              fontSize: "var(--fontSizeSmall)",
              fontWeight: "var(--fontWeightMedium)",
            },
            // Loading states
            ".Loading": {
              background: "var(--colorSurface)",
              borderRadius: "var(--borderRadius)",
              opacity: "0.6",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            // Header styling
            ".Header": {
              backgroundColor: "var(--colorBackground)",
              borderBottom: "1px solid var(--colorBorder)",
              padding: "var(--spacingLarge)",
            },
            // Footer branding
            ".Footer": {
              borderTop: "1px solid var(--colorBorder)",
              padding: "var(--spacingMedium)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            },
          }
        }
      });

      setStripeConnectInstance(stripeConnect);
    } catch (error) {
      console.error("Failed to initialize Stripe Connect:", error);
      setStripeError(`Failed to initialize payment dashboard: ${error.message}`);
    }
  };

  const StripeConnectComponent = ({ componentType, minHeight = "400px" }) => {
    const [componentError, setComponentError] = useState(null);

    if (!stripeConnectInstance) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-400">Loading payment dashboard...</p>
        </div>
      );
    }

    return (
      <div style={{ minHeight }} className="w-full rounded-lg overflow-hidden">
        <ConnectComponentsProvider
          connectInstance={stripeConnectInstance}
          onError={(error) => {
            console.error("Stripe Connect Component Error:", error);
            setComponentError(error.message);
          }}
        >
          {componentError ? (
            <div className="p-6 text-center">
              <div className="text-red-400 mb-4">⚠️ Component Error</div>
              <p className="text-sm text-gray-400 mb-4">{componentError}</p>
              <button
                onClick={() => {
                  setComponentError(null);
                  // Reinitialize if needed
                  setStripeConnectInstance(null);
                  initializeStripeConnect();
                }}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {componentType === "account-onboarding" && (
                <ConnectAccountOnboarding
                  onExit={() => {
                    setActiveOnboardingComponent(null);
                    refreshAccountStatus();
                  }}
                />
              )}
              {componentType === "payouts" && (
                <div className="min-h-[400px]">
                  <ConnectPayouts />
                </div>
              )}
              {componentType === "payments" && (
                <div className="min-h-[400px]">
                  <ConnectPayments />
                </div>
              )}
              {componentType === "balances" && (
                <div className="min-h-[400px]">
                  <ConnectBalances />
                </div>
              )}
            </>
          )}
        </ConnectComponentsProvider>
      </div>
    );
  };

  const renderStripeDashboard = () => {
    if (!stripeConnectInstance) {
      return (
        <div className="text-center py-12 relative">
          {/* Stripe Watermark */}
          <div className="absolute top-4 right-4 opacity-20">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" fill-rule="evenodd" fill="#6772e5"><path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z" /></svg>
            </div>
          </div>

          {/* <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-400">Loading payment dashboard...</p> */}

          {/* Powered by attribution */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Openbook.games powered by</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" fill-rule="evenodd" fill="#6772e5"><path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z" /></svg>
            </div>
          </div>
        </div>
      );
    }

    if (accountStatus === "incomplete" && activeOnboardingComponent === "account-onboarding") {
      return (
        <div className="space-y-4 relative">
          {/* Stripe Header Branding */}
          <div className="flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" fill-rule="evenodd" fill="#6772e5"><path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z" /></svg>
              <div>
                <h4 className="text-white font-semibold">Complete Account Setup</h4>
                <p className="text-gray-400 text-xs">Secure payments powered by Stripe</p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveOnboardingComponent(null);
                setDashboardTab("balances");
              }}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
            >
              Skip to Dashboard →
            </button>
          </div>

          <div className="relative">
            <StripeConnectComponent componentType="account-onboarding" minHeight="500px" />

            {/* Watermark overlay */}
            <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
              <div className="flex items-center gap-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                <span>Secured by</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" fill-rule="evenodd" fill="#6772e5"><path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z" /></svg>
              </div>
            </div>
          </div>

          {/* Powered by footer */}
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-900/50 px-3 py-2 rounded-full border border-gray-700">
              <span>Openbook.games powered by</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" fill-rule="evenodd" fill="#6772e5"><path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z" /></svg>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 relative">
        {/* Main Dashboard Header with Stripe Branding */}
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-500/20">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" fill-rule="evenodd" fill="#6772e5"><path d="M101.547 30.94c0-5.885-2.85-10.53-8.3-10.53-5.47 0-8.782 4.644-8.782 10.483 0 6.92 3.908 10.414 9.517 10.414 2.736 0 4.805-.62 6.368-1.494v-4.598c-1.563.782-3.356 1.264-5.632 1.264-2.23 0-4.207-.782-4.46-3.494h11.24c0-.3.046-1.494.046-2.046zM90.2 28.757c0-2.598 1.586-3.678 3.035-3.678 1.402 0 2.897 1.08 2.897 3.678zm-14.597-8.345c-2.253 0-3.7 1.057-4.506 1.793l-.3-1.425H65.73v26.805l5.747-1.218.023-6.506c.828.598 2.046 1.448 4.07 1.448 4.115 0 7.862-3.3 7.862-10.598-.023-6.667-3.816-10.3-7.84-10.3zm-1.38 15.84c-1.356 0-2.16-.483-2.713-1.08l-.023-8.53c.598-.667 1.425-1.126 2.736-1.126 2.092 0 3.54 2.345 3.54 5.356 0 3.08-1.425 5.38-3.54 5.38zm-16.4-17.196l5.77-1.24V13.15l-5.77 1.218zm0 1.747h5.77v20.115h-5.77zm-6.185 1.7l-.368-1.7h-4.966V40.92h5.747V27.286c1.356-1.77 3.655-1.448 4.368-1.195v-5.287c-.736-.276-3.425-.782-4.782 1.7zm-11.494-6.7L34.535 17l-.023 18.414c0 3.402 2.552 5.908 5.954 5.908 1.885 0 3.264-.345 4.023-.76v-4.667c-.736.3-4.368 1.356-4.368-2.046V25.7h4.368v-4.897h-4.37zm-15.54 10.828c0-.897.736-1.24 1.954-1.24a12.85 12.85 0 0 1 5.7 1.47V21.47c-1.908-.76-3.793-1.057-5.7-1.057-4.667 0-7.77 2.437-7.77 6.506 0 6.345 8.736 5.333 8.736 8.07 0 1.057-.92 1.402-2.207 1.402-1.908 0-4.345-.782-6.276-1.84v5.47c2.138.92 4.3 1.3 6.276 1.3 4.782 0 8.07-2.368 8.07-6.483-.023-6.85-8.782-5.632-8.782-8.207z" /></svg>
              <div>
                <h3 className="text-white font-semibold">Payment Dashboard</h3>
                <p className="text-gray-400 text-xs">Enterprise-grade payment processing</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green/30 rounded-full">
              <div className="min-w-[4px] min-h-[4px] bg-green rounded-full animate-pulse"></div>
              <span className="text-green-300 text-xs font-medium">Live</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-gray-700 pb-2">
            {[
              { key: "balances", label: "Balances", icon: "📊" },
              { key: "payouts", label: "Payouts", icon: "💰" },
              { key: "payments", label: "Payments", icon: "💳" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setDashboardTab(tab.key)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${dashboardTab === tab.key
                  ? "bg-gray-700 text-white border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px] relative">
          <StripeConnectComponent componentType={dashboardTab} minHeight="400px" />

          {/* Dashboard Watermark */}
          <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
            <div className="flex flex-col items-center text-xs text-white">
              <svg className="w-14 h-14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="stripe">
              <path fill="#646FDE" d="M11.319 9.242h1.673v5.805h-1.673zM4.226 13.355c0-2.005-2.547-1.644-2.547-2.403l.001.002c0-.262.218-.364.567-.368a3.7 3.7 0 0 1 1.658.432V9.434a4.4 4.4 0 0 0-1.654-.307C.9 9.127 0 9.839 0 11.029c0 1.864 2.532 1.561 2.532 2.365 0 .31-.266.413-.638.413-.551 0-1.264-.231-1.823-.538v1.516a4.591 4.591 0 0 0 1.819.382c1.384-.001 2.336-.6 2.336-1.812zM11.314 8.732l1.673-.36V7l-1.673.36zM16.468 9.129a1.86 1.86 0 0 0-1.305.527l-.086-.417H13.61V17l1.665-.357.004-1.902c.24.178.596.425 1.178.425 1.193 0 2.28-.879 2.28-3.016.004-1.956-1.098-3.021-2.269-3.021zm-.397 4.641c-.391.001-.622-.143-.784-.318l-.011-2.501c.173-.193.413-.334.795-.334.607 0 1.027.69 1.027 1.569.005.906-.408 1.584-1.027 1.584zm5.521-4.641c-1.583 0-2.547 1.36-2.547 3.074 0 2.027 1.136 2.964 2.757 2.964.795 0 1.391-.182 1.845-.436v-1.266c-.454.231-.975.371-1.635.371-.649 0-1.219-.231-1.294-1.019h3.259c.007-.087.022-.44.022-.602H24c0-1.725-.825-3.086-2.408-3.086zm-.889 2.448c0-.758.462-1.076.878-1.076.409 0 .844.319.844 1.076h-1.722zm-13.251-.902V9.242H6.188l-.004-1.459-1.625.349-.007 5.396c0 .997.743 1.641 1.729 1.641.548 0 .949-.103 1.171-.224v-1.281c-.214.087-1.264.398-1.264-.595v-2.395h1.264zm3.465.114V9.243c-.225-.08-1.001-.227-1.391.496l-.102-.496h-1.44v5.805h1.662v-3.907c.394-.523 1.058-.42 1.271-.352z"></path>
              </svg>  
              <span className="font-mono">SECURE</span>
            </div>
          </div>

          {accountStatus === "incomplete" && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg relative">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="flex-1">
                  <span className="text-yellow-300 text-sm">
                    Complete account verification to unlock all payment features.
                  </span>
                  <p className="text-yellow-400/70 text-xs mt-1">Secure verification powered by Stripe</p>
                </div>
                <button
                  onClick={() => handleStripeOnboarding(true)}
                  className="ml-auto text-yellow-300 hover:text-yellow-200 text-sm underline flex items-center gap-1"
                >
                  Complete Setup
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {accountStatus === "pending" && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <span className="text-blue-300 text-sm">
                    Account verification in progress. Some features may be limited.
                  </span>
                  <p className="text-blue-400/70 text-xs mt-1">Processing typically takes 1-2 business days</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-300 text-xs">Processing</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Branding */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Openbook.games powered by</span>
            <svg className="w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="stripe">
              <path fill="#646FDE" d="M11.319 9.242h1.673v5.805h-1.673zM4.226 13.355c0-2.005-2.547-1.644-2.547-2.403l.001.002c0-.262.218-.364.567-.368a3.7 3.7 0 0 1 1.658.432V9.434a4.4 4.4 0 0 0-1.654-.307C.9 9.127 0 9.839 0 11.029c0 1.864 2.532 1.561 2.532 2.365 0 .31-.266.413-.638.413-.551 0-1.264-.231-1.823-.538v1.516a4.591 4.591 0 0 0 1.819.382c1.384-.001 2.336-.6 2.336-1.812zM11.314 8.732l1.673-.36V7l-1.673.36zM16.468 9.129a1.86 1.86 0 0 0-1.305.527l-.086-.417H13.61V17l1.665-.357.004-1.902c.24.178.596.425 1.178.425 1.193 0 2.28-.879 2.28-3.016.004-1.956-1.098-3.021-2.269-3.021zm-.397 4.641c-.391.001-.622-.143-.784-.318l-.011-2.501c.173-.193.413-.334.795-.334.607 0 1.027.69 1.027 1.569.005.906-.408 1.584-1.027 1.584zm5.521-4.641c-1.583 0-2.547 1.36-2.547 3.074 0 2.027 1.136 2.964 2.757 2.964.795 0 1.391-.182 1.845-.436v-1.266c-.454.231-.975.371-1.635.371-.649 0-1.219-.231-1.294-1.019h3.259c.007-.087.022-.44.022-.602H24c0-1.725-.825-3.086-2.408-3.086zm-.889 2.448c0-.758.462-1.076.878-1.076.409 0 .844.319.844 1.076h-1.722zm-13.251-.902V9.242H6.188l-.004-1.459-1.625.349-.007 5.396c0 .997.743 1.641 1.729 1.641.548 0 .949-.103 1.171-.224v-1.281c-.214.087-1.264.398-1.264-.595v-2.395h1.264zm3.465.114V9.243c-.225-.08-1.001-.227-1.391.496l-.102-.496h-1.44v5.805h1.662v-3.907c.394-.523 1.058-.42 1.271-.352z"></path>
            </svg>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>PCI DSS Level 1</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const refreshAccountStatus = async () => {
    if (!connectedAccountId || !axiosInstance) return;
    try {
      setAccountStatus("checking");
      const detailsResponse = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe-connect/account/${connectedAccountId}/`
      );
      
      setAccountDetails(detailsResponse.data);
      const accountData = detailsResponse.data;

      const hasRequiredDetails = accountData?.details_submitted;
      const canReceivePayments = accountData?.charges_enabled;
      const canMakePayouts = accountData?.payouts_enabled;

      if (hasRequiredDetails && canReceivePayments && canMakePayouts) {
        setAccountStatus("complete");
      } else if (hasRequiredDetails) {
        setAccountStatus("pending");
      } else {
        setAccountStatus("incomplete");
      }

      setCreatorProfile((prev) => ({
        ...prev,
        stripe_account_id: connectedAccountId,
        stripe_account_status: hasRequiredDetails && canReceivePayments && canMakePayouts ? "complete" :
          hasRequiredDetails ? "pending" : "incomplete",
      }));
    } catch (error) {
      console.error("Failed to refresh account status:", error);
      setAccountStatus("incomplete");
      setStripeError("Failed to fetch account status. Please try again.");
    }
  };

  useEffect(() => {
    if (connectedAccountId && !stripeConnectInstance && accountStatus !== "checking") {
      initializeStripeConnect();
    }
  }, [connectedAccountId, stripeConnectInstance, accountStatus]);

  useEffect(() => {
    if (connectedAccountId && accountStatus === "complete" && !stripeConnectInstance) {
      initializeStripeConnect();
    }
  }, [connectedAccountId, accountStatus, stripeConnectInstance]);

  const StripeErrorBoundary = ({ children, onError }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      const handleError = (error) => {
        console.error("Stripe Connect Error:", error);
        setHasError(true);
        if (onError) onError(error);
      };

      window.addEventListener('unhandledrejection', handleError);
      return () => window.removeEventListener('unhandledrejection', handleError);
    }, [onError]);

    if (hasError) {
      return (
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">⚠️ Payment System Error</div>
          <p className="text-sm text-gray-400 mb-4">
            There was an issue loading the payment components.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return children;
  };

  const fetchExistingAccount = async () => {
    if (!axiosInstance || loading || stripeAccountChecked) return;
    try {
      setAccountStatus("checking");
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe-connect/my-account/`
      );
      
      if (response.data?.account.is_onboarding_complete) {
        setAccountStatus("complete")
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1);
        localStorage.setItem("onboardingComplete", JSON.stringify({
          value: "true",
          expiry: expiryDate.getTime()
        }));
        setIsOnboardingComplet(true)
        setActiveOnboardingComponent(null)
      }
      if (!response.data?.account.is_onboarding_complete) {
        setAccountStatus("incomplete")
      }
      if (response.data?.account.account_id) {
        // setAccountStatus("complete")
        const accountId = response.data.account_id;
        setConnectedAccountId(accountId);
        await refreshAccountStatus();
      }
    } catch (error) {
      console.log("No existing Stripe account found:", error);
      setAccountStatus("none");
    } finally {
      setStripeAccountChecked(true);
    }
  };

  useEffect(() => {
    fetchExistingAccount();
  }, [axiosInstance, loading]);

  useEffect(() => {
    if (connectedAccountId && accountStatus === "complete" && !stripeConnectInstance) {
      initializeStripeConnect();
    }
  }, [connectedAccountId, accountStatus]);

  useEffect(() => {
    if (connectedAccountId !== null && isOnboardingComplete) {
      setAccountStatus("complete")
    }

  }, [connectedAccountId])

  useEffect(() => {
    if (isOnboardingComplete) {
      handleStripeOnboarding(false)
    }
  }, [isOnboardingComplete])

  const handleStripeOnboarding = async (useHostedFlow = false) => {
    try {
      setStripeError(null);
      let accountId = connectedAccountId;
      if (!accountId) {
        const createResponse = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe-connect/account/`
        );
        if (createResponse.data?.account_id) {
          accountId = createResponse.data.account_id;
        } else if (createResponse.data?.account) {
          accountId = createResponse.data.account;
        } else {
          throw new Error("Failed to create or retrieve account");
        }
        setConnectedAccountId(accountId);
        setCreatorProfile((prev) => ({
          ...prev,
          stripe_account_id: accountId,
        }));
        await refreshAccountStatus();
      }
      if (useHostedFlow) {
        const linkResponse = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe-connect/account_link/`,
          {
            account: accountId,
            refresh_url: `${window.location.origin}/profile?refresh=true`,
            return_url: `${window.location.origin}/profile?setup=complete`,
          }
        );
        if (linkResponse.data?.url) {
          window.location.href = linkResponse.data.url;
        }
      } else {
        await initializeStripeConnect();
        setShowStripeDashboard(true);
        setActiveOnboardingComponent("account-onboarding");
      }
    } catch (error) {
      console.error("Failed to handle Stripe onboarding:", error);
      let errorMessage = "Failed to set up payment account";
      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        if (backendError.includes("no such table")) {
          errorMessage = "Payment system is being set up. Please try again later.";
        } else if (backendError.includes("stripe")) {
          errorMessage = "Payment service temporarily unavailable.";
        } else {
          errorMessage = `Setup failed: ${backendError}`;
        }
      }
      setStripeError(errorMessage);
    }
  };

  const [activeOnboardingComponent, setActiveOnboardingComponent] = useState(null);
  const [dashboardTab, setDashboardTab] = useState("payouts");

  const renderAccountStatus = (stat) => {
    switch (stat) {
      case "checking":
        return (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Checking account status...</p>
          </div>
        );
      case "none":
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2">
              No Payment Account Found
            </h4>
            <p className="text-gray-400 mb-6">
              Set up your payment account to start earning from your games.
            </p>
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => handleStripeOnboarding(true)}
                className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-xl font-medium flex flex-col items-center transition-all duration-200 shadow-lg hover:shadow-xl"
              >

                <span className="text-base">Full Account Setup</span>
                <span className="text-xxs flex flex-row gap-2 items-center justify-center">Powered by  <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="stripe">
                  <path fill="#646FDE" d="M11.319 9.242h1.673v5.805h-1.673zM4.226 13.355c0-2.005-2.547-1.644-2.547-2.403l.001.002c0-.262.218-.364.567-.368a3.7 3.7 0 0 1 1.658.432V9.434a4.4 4.4 0 0 0-1.654-.307C.9 9.127 0 9.839 0 11.029c0 1.864 2.532 1.561 2.532 2.365 0 .31-.266.413-.638.413-.551 0-1.264-.231-1.823-.538v1.516a4.591 4.591 0 0 0 1.819.382c1.384-.001 2.336-.6 2.336-1.812zM11.314 8.732l1.673-.36V7l-1.673.36zM16.468 9.129a1.86 1.86 0 0 0-1.305.527l-.086-.417H13.61V17l1.665-.357.004-1.902c.24.178.596.425 1.178.425 1.193 0 2.28-.879 2.28-3.016.004-1.956-1.098-3.021-2.269-3.021zm-.397 4.641c-.391.001-.622-.143-.784-.318l-.011-2.501c.173-.193.413-.334.795-.334.607 0 1.027.69 1.027 1.569.005.906-.408 1.584-1.027 1.584zm5.521-4.641c-1.583 0-2.547 1.36-2.547 3.074 0 2.027 1.136 2.964 2.757 2.964.795 0 1.391-.182 1.845-.436v-1.266c-.454.231-.975.371-1.635.371-.649 0-1.219-.231-1.294-1.019h3.259c.007-.087.022-.44.022-.602H24c0-1.725-.825-3.086-2.408-3.086zm-.889 2.448c0-.758.462-1.076.878-1.076.409 0 .844.319.844 1.076h-1.722zm-13.251-.902V9.242H6.188l-.004-1.459-1.625.349-.007 5.396c0 .997.743 1.641 1.729 1.641.548 0 .949-.103 1.171-.224v-1.281c-.214.087-1.264.398-1.264-.595v-2.395h1.264zm3.465.114V9.243c-.225-.08-1.001-.227-1.391.496l-.102-.496h-1.44v5.805h1.662v-3.907c.394-.523 1.058-.42 1.271-.352z"></path>
                </svg></span>
              </motion.button>
            </div>
          </div>
        );
      case "incomplete":
        return (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-300">
                  Account Setup Incomplete
                </h4>
                <p className="text-yellow-200/80 text-sm">
                  Complete your account setup to start receiving payments
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleStripeOnboarding(true)}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg text-sm"
              >
                Complete Setup
              </button>
              <button
                onClick={refreshAccountStatus}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm"
              >
                Refresh Status
              </button>
            </div>
          </div>
        );
      case "complete":
        return (
          <div className="bg-green/10 border border-green-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green">Account Active</h4>
                <p className="text-green/80 text-sm">
                  Your payment account is ready to receive payments
                </p>
                <p className="text-purple-500 font-semibold flex flex-row items-center gap-2">  <div className="border rounded-full border-yellow-500 max-w-[14px] animate-pulse p-1">
                  <div className="min-w-[4px] min-h-[4px] max-w-[4px] rounded-full animate-pulse bg-yellow-400"></div>
                </div>Click on Setup Payments Button To Get Started</p>

              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  async function getCreatorProfile() {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/profile`
      );
      if (response.data?.success) {
        const profileData = {
          ...response.data.success.data,
          gameStats: {
            published: response.data.success.data.games_created || 0,
            drafts: 0,
            favorites: 0,
          },
          is_premium: !!response.data.success.data.subscription,
          experience: response.data.success.data.game_points || 0,
          level: Math.floor((response.data.success.data.game_points || 0) / 1000) + 1,
        };
        setCreatorProfile(profileData);
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
        setStories(response.data.success.data);
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  }

  useEffect(() => {
    tippy("[data-tippy-content]");
    new CopyToClipboard();
    getCreatorProfile();
    fetchStories();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const showSuccessModal = urlParams.get('showSuccessModal');
    
    if (showSuccessModal === 'true') {
      const recentlyPublishedGame = localStorage.getItem('recentlyPublishedGame');
      if (recentlyPublishedGame) {
        try {
          const gameData = JSON.parse(recentlyPublishedGame);
          setPublishedGameData(gameData);
          setShowSuccessModal(true);
          localStorage.removeItem('recentlyPublishedGame');
          router.replace('/profile', { scroll: false });
        } catch (error) {
          console.error('Error parsing recently published game data:', error);
        }
      }
    }
  }, []);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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


  const handlePatreonSupport = () => {
    const patreonUrl = creatorProfile.patreon_username?.startsWith("http")
      ? creatorProfile.patreon_username
      : `https://patreon.com/${creatorProfile.patreon_username}`;

    if (creatorProfile.patreon_username) {
      window.open(patreonUrl, "_blank");
      setShowPatreonModal(false);
    }
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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const getBadgeIcon = (badge) => {
    const icons = {
      storyteller: "🖋️",
      "world-builder": "🌍",
      "master-creator": "👑",
      "pixel-artist": "🎨",
    };
    return icons[badge] || "🏆";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white lg:min-h-[70rem]">
      <div className="relative h-40 sm:h-60 md:h-80 overflow-hidden">
        <Image
          src={creatorProfile.cover_photo || "/img/covers/fantasy-landscape.jpg"}
          alt="Cover"
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/80" />
        <Link href={"/edit-profile"}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="absolute top-4 right-4 bg-gray-800/80 p-2 rounded-full"
          >
            <MdEdit className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 -mt-16 sm:-mt-24 md:-mt-32 pb-12 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
            <motion.div variants={itemVariants} className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <Image
                  src={creatorProfile.profile_photo || "/img/user/user_avatar.gif"}
                  alt={creatorProfile.username}
                  width={160}
                  height={160}
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center border-2 sm:border-4 border-white text-white text-xs sm:text-sm md:text-base font-bold">
                {creatorProfile.level}
              </div>
              <div className="absolute -bottom-2 left-0 bg-green-500 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center border-2 border-white">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                </svg>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex-1 space-y-2 sm:space-y-4 text-center md:text-left"
            >
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{creatorProfile.username}</h1>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm flex items-center">
                  <MdVerified className="mr-1" />
                  {creatorProfile.subscription?.plan_type || "Premium"}
                </span>
                <span className="inline-flex items-center rounded-full border border-gray-700 bg-gray-800 py-1 px-2 sm:py-1.5 sm:px-4 text-xs sm:text-sm mt-1 sm:mt-0">
                  <Image
                    src="/img/wallets/coin.png"
                    alt="Points"
                    width={16}
                    height={16}
                    className="mr-1 w-3 h-3 sm:w-4 sm:h-4"
                  />
                  <span>{creatorProfile.game_points} GP</span>
                </span>
              </div>
              <p className="text-gray-300 text-sm sm:text-base max-w-2xl">
                {creatorProfile.bio || "Creating immersive RPG experiences with rich storytelling."}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300">
                <span className="flex items-center gap-1 sm:gap-2">
                  <FaGamepad /> {creatorProfile.gameStats?.published} Games
                </span>
                <span className="flex items-center gap-1 sm:gap-2">
                  <FaFire /> {stories.length || 0} Played
                </span>
                <span className="text-xs sm:text-sm">
                  Joined {creatorProfile.joined_at ? formatDate(creatorProfile.joined_at) : "2024"}
                </span>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="col-span-1 md:col-span-2 space-y-4 sm:space-y-6">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {creatorProfile.badges?.map((badge) => (
                  <motion.span
                    key={badge}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 border border-gray-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                  >
                    {getBadgeIcon(badge)}{" "}
                    {badge.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </motion.span>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-2">
                  <span>Level {creatorProfile.level}</span>
                  <span>{creatorProfile.experience % 1000}/{1000} XP</span>
                </div>
                <div className="h-1.5 sm:h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(creatorProfile.experience % 1000) / 10}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3">
               <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => router.push(`/profile/${creatorProfile.username}`)}
                className="font-bold bg-yellow-400 hover:bg-yellow-500 text-black p-2 sm:p-3 rounded-lg flex items-center justify-center gap-2 text-sm"
              ><BiWorld/> Public Profile</motion.button>
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowCoffeeModal(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-black p-2 sm:p-3 rounded-lg flex items-center justify-center gap-2 text-sm"
              >
                <FaCoffee /> Coffee
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowPatreonModal(true)}
                className="bg-red-500 hover:bg-red-600 p-2 sm:p-3 rounded-lg flex items-center justify-center gap-2 text-sm"
              >
                <FaPatreon /> Patreon
              </motion.button> */}
              <div className="flex gap-2 sm:gap-3">
                <Link href="/edit-profile" className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="w-full bg-gray-700 hover:bg-gray-600 p-2 sm:p-3 rounded-lg flex items-center justify-center"
                  >
                    <MdEdit className="w-4 h-4" />
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 p-2 sm:p-3 rounded-lg flex items-center justify-center"
                  data-bs-toggle="modal"
                  data-bs-target="#buyPointsModal"
                >
                  <GiTwoCoins className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 sm:mt-12">
            <div className="flex border-b border-gray-700 overflow-x-auto scrollbar-hide">
              {["created", "published", "earnings", "about"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 capitalize relative whitespace-nowrap text-sm sm:text-base ${activeTab === tab ? "text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"
                    />
                  )}
                </button>
              ))}
            </div>

            {activeTab === "earnings" && (
              <motion.div variants={containerVariants} className="mt-6 sm:mt-8">
                                {/* <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                      <div>
                        {(connectedAccountId && isOnboardingComplete) ? <div></div> : <div>
                          <h3 className="text-lg font-bold">Payment Dashboard</h3>
                          <h2 className="text-purple-600 font-bold">Steps</h2>
                          <div className="flex flex-row mt-2 mb-2 gap-2 text-xs font-medium text-purple-400 justify-between items-center">
                            <div className="rounded-full animate-pulse p-1 w-7 text-center border border-purple-500 text-purple-100">1</div>
                            <div>Click on Full Setup Button if new or on Complete Setup is setup is left</div>
                            <div className="min-w-[30px] max-w-[30px] min-h-[1.5px] max-h-[1.5px] bg-white/40" />
                            <div className="rounded-full p-1 w-7 animate-pulse text-center border border-purple-500 text-purple-100" >2</div>
                            <div>Complete the steps for Stripe Account Onboarding</div>
                          </div>
                        </div>}
                        <p className="text-gray-400 text-sm">
                          {(connectedAccountId && isOnboardingComplete)
                            ? "Manage your account settings, view transactions, and handle payouts"
                            : "Set up your payment account to start earning from your games"}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {(connectedAccountId && accountStatus === "complete" && isOnboardingComplete) && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setShowStripeDashboard(!showStripeDashboard)}
                            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                          >
                            {showStripeDashboard ? "Hide" : "Show"} Dashboard
                            <svg
                              className={`w-4 h-4 transition-transform ${showStripeDashboard ? "rotate-180" : ""}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </motion.button> */}
                        {/* )} */}
                        {/* <motion.button
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleStripeOnboarding(false)}
                          className={`bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${(connectedAccountId && isOnboardingComplete) ? "hidden": "block"}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          {(connectedAccountId && isOnboardingComplete) ? "" : "Setup Payments"}
                        </motion.button> */}
                      {/* </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    {!connectedAccountId && renderAccountStatus(accountStatus)}
                    {stripeError && (
                      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">{stripeError}</p>
                        <button
                          onClick={() => setStripeError(null)}
                          className="mt-2 text-red-300 hover:text-red-200 text-xs underline"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    <AnimatePresence>
                      {showStripeDashboard && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          {renderStripeDashboard()}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div> */}

                <StripeDisabledMessage />
              </motion.div>
            )}

            {activeTab === "created" && (
              <motion.div variants={containerVariants} className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                  <h2 className="text-lg sm:text-xl font-bold">Created Games</h2>
                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-xs sm:text-sm bg-gray-700/50 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
                      <GiScrollUnfurled />{" "}
                      <span className="whitespace-nowrap">
                        Published: {creatorProfile.gameStats?.published || 0}
                      </span>
                    </span>
                    <span className="text-xs sm:text-sm bg-gray-700/50 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1">
                      <GiSpellBook />{" "}
                      <span className="whitespace-nowrap">
                        Drafts: {creatorProfile.gameStats?.drafts || 0}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-4 sm:gap-6">
                  <GamesTab onGamePublished={handleGamePublished} />
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-4 sm:p-6"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-600/20 flex items-center justify-center mb-3 sm:mb-4">
                      <svg
                        className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h3 className="font-bold text-base sm:text-lg mb-2">Create New Game</h3>
                    <Link href={"/create"} className="hidden sm:block">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="bg-purple-600 hover:bg-purple-700 px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm"
                      >
                        Start Creating
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* {activeTab === "played" && (
              <motion.div variants={containerVariants} className="mt-6 sm:mt-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Recent Activity</h2>
                {loading ? (
                  <p>Loading collections...</p>
                ) : error ? (
                  <p>Error: {error}</p>
                ) : stories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-800 rounded-xl border border-gray-700 text-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4"
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
                    <p className="text-gray-300 text-xs sm:text-sm font-medium">
                      No collections available. Start playing!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {stories.map((story, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg transition-transform duration-300"
                      >
                        <figure className="relative h-[200px] sm:h-[250px] md:h-[300px] lg:h-[250px] xl:h-[300px] overflow-hidden rounded-t-xl">
                          <Link href={`/games/${story.game.game_id}/play?story_id=${story.story_id}`}>
                            <PreviewMedia
                              musicUrl={story.game.opener_mp3}
                              mediaUrl={story.game.preview_image}
                              mediaType={story.game.preview_image_type}
                              alt="Game Preview"
                              className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </Link>
                        </figure>
                        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                          <h3 className="font-bold text-base sm:text-lg bg-clip-text text-transparent bg-gradient-to-tr from-purple-400 to-blue-700 hover:bg-gradient-to-t hover:from-purple-600 hover:to-blue-600 hover:text-purple-300 transition-colors duration-200">
                            {story.game.game_name.length > 30
                              ? story.game.game_name.slice(0, 30) + "..."
                              : story.game.game_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-300">
                            {story.name
                              ? story.name.length > 50
                                ? story.name.slice(0, 50) + "..."
                                : story.name
                              : `Story ${i + 1}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            Last interaction: {new Date(story.last_interaction).toLocaleString()}
                          </p>
                          <Link href={`/games/${story.game.game_id}/play?story_id=${story.story_id}`}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              className="w-full bg-purple-600 mt-1 sm:mt-2 hover:bg-purple-700 py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-colors duration-200 text-sm"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 sm:h-5 sm:w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="font-medium">Continue Story</span>
                            </motion.button>
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )} */}

            {activeTab === "published" && (
              <motion.div variants={containerVariants} className="mt-6 sm:mt-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Published Games</h2>
                <PublishedGames onGamePublished={handleGamePublished} />
              </motion.div>
            )}

            {activeTab === "about" && (
              <motion.div variants={containerVariants} className="mt-6 sm:mt-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">About Creator</h2>
                <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
                  <p className="text-gray-300 text-sm sm:text-base mb-4">
                    {creatorProfile.bio ||
                      "I'm a passionate game creator focused on building immersive RPG experiences with rich storylines and meaningful choices."}
                  </p>
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700">
                    <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Creator Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {["Storytelling", "World Building", "Character Design", "Game Mechanics"].map(
                        (skill) => (
                          <span
                            key={skill}
                            className="bg-gray-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {showCoffeeModal && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                  exit: { opacity: 0 },
                }}
                onClick={() => setShowCoffeeModal(false)}
              >
                <motion.div
                  variants={modalVariants}
                  className="bg-gray-800 rounded-2xl p-4 sm:p-8 max-w-xs sm:max-w-md w-full m-4 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white"
                    onClick={() => setShowCoffeeModal(false)}
                  >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="text-center space-y-4 sm:space-y-6">
                    <FaCoffee className="text-3xl sm:text-4xl text-yellow-400 mx-auto" />
                    <h3 className="text-xl sm:text-2xl font-bold">Support My Work</h3>
                    <p className="text-gray-300 text-sm sm:text-base">Fuel my creativity with a coffee!</p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[3, 5, 10].map((amount) => (
                        <motion.button
                          key={amount}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setCoffeeAmount(amount)}
                          className={`p-2 sm:p-3 rounded-lg text-sm ${coffeeAmount === amount ? "bg-yellow-400 text-black" : "bg-gray-700"
                            }`}
                        >
                          ${amount}
                        </motion.button>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={handleCoffeeSupport}
                      className="w-full bg-yellow-400 text-black p-2 sm:p-3 rounded-lg font-semibold text-sm sm:text-base"
                    >
                      Support ${coffeeAmount}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showPatreonModal && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                  exit: { opacity: 0 },
                }}
                onClick={() => setShowPatreonModal(false)}
              >
                <motion.div
                  variants={modalVariants}
                  className="bg-gray-800 rounded-2xl p-8 max-w-md w-full m-4 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    onClick={() => setShowPatreonModal(false)}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="text-center space-y-6">
                    <FaPatreon className="text-4xl text-red-500 mx-auto" />
                    <h3 className="text-2xl font-bold">Become a Patron</h3>
                    <p className="text-gray-300">Get exclusive content and support my work!</p>
                    <div className="space-y-3">
                      {[
                        { tier: "supporter", amount: 5 },
                        { tier: "elite", amount: 15 },
                      ].map(({ tier, amount }) => (
                        <motion.div
                          key={tier}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setPatreonTier(tier)}
                          className={`p-4 rounded-lg border ${patreonTier === tier ? "border-red-500" : "border-gray-700"
                            }`}
                        >
                          <span className="font-semibold">
                            {tier.charAt(0).toUpperCase() + tier.slice(1)} Tier
                          </span>
                          <span className="float-right">${amount}/mo</span>
                        </motion.div>
                      ))}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={handlePatreonSupport}
                      className="w-full bg-red-500 hover:bg-red-600 p-3 rounded-lg font-semibold"
                    >
                      Join Patreon
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Publish Success Modal */}
          <PublishSuccessModal
            isVisible={showSuccessModal}
            onClose={handleCloseSuccessModal}
            gameData={publishedGameData}
            onViewGame={handleViewGame}
            onCreateCoupon={handleCreateCoupon}
          />
        </motion.div>
      </div>
    </div>
  );
}