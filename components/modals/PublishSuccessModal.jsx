"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaDiscord, FaFacebook, FaTwitter, FaWhatsapp, FaCopy, FaCheck, FaShare, FaGamepad, FaGift } from "react-icons/fa";
import { toast } from "react-toastify";

export default function PublishSuccessModal({ 
  isVisible, 
  onClose, 
  gameData, 
  onViewGame, 
  onCreateCoupon 
}) {
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponCreated, setCouponCreated] = useState(false);

  useEffect(() => {
    if (isVisible && gameData?.game_id && !couponCreated) {
      handleAutoCreateCoupon();
    }
  }, [isVisible, gameData?.game_id, couponCreated]);

  const handleAutoCreateCoupon = async () => {
    if (!gameData?.game_id) {
      toast.error("Game data not available");
      return;
    }

    setIsCreatingCoupon(true);
    try {
      if (onCreateCoupon) {
        const result = await onCreateCoupon(gameData.game_id);
        if (result.success) {
          const couponData = result.data;
          const code = couponData.code || couponData.coupon_code;
          setCouponCode(code);
          setCouponCreated(true);
          
          try {
            await navigator.clipboard.writeText(code);
            toast.success(`Creator coupon created and copied to clipboard: ${code}`);
          } catch (clipboardError) {
            console.error('Failed to copy to clipboard:', clipboardError);
            toast.success(`Creator coupon created successfully: ${code}`);
          }
        } else {
          toast.error("Failed to create coupon");
        }
      }
    } catch (error) {
      toast.error("Failed to create coupon");
    } finally {
      setIsCreatingCoupon(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/games/${gameData?.game_id}`;
    if (navigator.share) {
      navigator.share({
        title: gameData?.game_name || "Check out this game!",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Game link copied to clipboard!");
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/games/${gameData?.game_id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Game link copied to clipboard!");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl mx-4 overflow-hidden rounded-2xl bg-gradient-to-br from-jacarta-700 to-jacarta-800 shadow-2xl border border-accent/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-bounce opacity-60"></div>
            <div className="absolute top-32 right-16 w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-20 left-20 w-4 h-4 bg-green-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-32 right-8 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1.5s' }}></div>
            
            {/* Floating particles */}
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.7s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1.1s' }}></div>
          </div>

          {/* Success Badge */}
          <div className="absolute top-4 left-4 z-10">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-2 rounded-full text-sm font-bold bg-green-500 text-white shadow-lg flex items-center gap-2"
            >
              <FaCheck className="w-4 h-4" />
              Published Successfully!
            </motion.div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="relative p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Congratulations! 🎉
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-jacarta-300"
              >
                Your game "{gameData?.game_name}" has been published successfully!
              </motion.p>
            </div>

            {/* Coupon Creation Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              {isCreatingCoupon ? (
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-300 font-semibold">Creating Creator Coupon...</span>
                  </div>
                  <p className="text-blue-200 text-sm">Please wait while we generate your exclusive creator coupon.</p>
                </div>
              ) : couponCreated && couponCode ? (
                <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <FaGift className="w-6 h-6 text-green-400" />
                    <span className="text-green-300 font-semibold">Creator Coupon Created!</span>
                  </div>
                  <div className="bg-green-700/30 rounded-lg p-3 mb-3">
                    <p className="text-green-200 text-sm mb-2">Your coupon code:</p>
                    <p className="text-green-100 font-mono text-lg font-bold">{couponCode}</p>
                  </div>
                  <p className="text-green-200 text-sm">This code has been automatically copied to your clipboard!</p>
                </div>
              ) : (
                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-yellow-300 font-semibold">Coupon Creation Failed</span>
                  </div>
                  <p className="text-yellow-200 text-sm">There was an issue creating your creator coupon. Please try again later.</p>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              {/* Primary Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onViewGame}
                  className="flex-1 bg-accent hover:bg-accent-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaGamepad className="w-5 h-5" />
                  View Game
                </button>
              </div>

              {/* Share Section */}
              <div className="bg-jacarta-600 rounded-xl p-4 border border-jacarta-500/30">
                <h3 className="text-lg font-semibold text-white mb-3 text-center">Share Your Game</h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaShare className="w-5 h-5" />
                    Share
                  </button>
                  
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaCopy className="w-5 h-5" />
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-jacarta-600 rounded-xl p-4 border border-jacarta-500/30">
                <h3 className="text-lg font-semibold text-white mb-3 text-center">What's Next?</h3>
                <div className="space-y-3 text-sm text-jacarta-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Share your game with friends and on social media</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Use your creator coupon to give players exclusive access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>Monitor your game's performance and player feedback</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Create more games and build your creator portfolio</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
