/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PublishModal({ game, onPublish, onPublishSuccess, isOpen, onClose }) {
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishable, setIsPublishable] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    if (localStorage) {
      const onboardedData = JSON.parse(localStorage.getItem("onboardingComplete"));
      if (onboardedData) {
        const currentTime = new Date().getTime();
        if (onboardedData.expiry && currentTime < onboardedData.expiry) {
          setIsOnboarded(onboardedData.value === "true");
          setIsPublishable(onboardedData.value === "true");
        } else {
          localStorage.removeItem("onboardingComplete");
          setIsOnboarded(false);
          setIsPublishable(false);
        }
      } else {
        setIsOnboarded(false);
        setIsPublishable(false);
      }
    }
  }, []);

  const router = useRouter();

  const handlePublish = async () => {
    if (isPaid && (!price || parseFloat(price) <= 0)) {
      alert("Please enter a valid price greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onPublish(isPaid, isPaid ? parseFloat(price) : 0);
      
      if (onPublishSuccess && result) {
        onPublishSuccess(result);
      }
      
      setIsPaid(false);
      setPrice("");
      setIsSubmitting(false);
      router.push("/profile");
    } catch (error) {
      console.error("Error publishing game:", error);
      alert("There was a problem publishing your game. Please try again.");
      setIsSubmitting(false);
      router.push("/profile");
    }
  };

  const handlePaidOption = () => {
    if (isOnboarded) {
      setIsPaid(true);
    }
  };

  const handleFreeOption = () => {
    setIsPaid(false);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 500 },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={backdropVariants}
    >
      <motion.div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-gray-900 shadow-xl m-4"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Publish Game
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {game ? (
            <>
              <div className="flex flex-col items-center border-b border-gray-200 dark:border-gray-800 pb-6">
                <div className="w-full text-center">
                  <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                    {game.game_name || game?.gameName}
                  </h3>
                  <div className="max-h-32 overflow-y-auto">
                    <p className="text-gray-600 dark:text-gray-300">
                      {game.description || game?.gameDescription}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block font-medium text-gray-900 dark:text-white mb-3">
                  Game Type
                </label>
                <div className="flex space-x-6">
                  <motion.div
                    className={`flex-1 flex items-center justify-center p-4 rounded-lg cursor-pointer transition-all ${
                      !isPaid
                        ? "bg-blue-50 border-2 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400"
                        : "bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    }`}
                    onClick={handleFreeOption}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 mx-auto mb-2 ${
                          !isPaid ? "text-blue-500" : "text-gray-400"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span
                        className={`font-medium ${
                          !isPaid
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Free Game
                      </span>
                    </div>
                  </motion.div>
                  {/*
                  <motion.div
                    className={`flex-1 flex items-center justify-center p-4 rounded-lg transition-all relative ${
                      !isOnboarded
                        ? "bg-gray-100 border border-gray-300 cursor-not-allowed opacity-60 dark:bg-gray-700 dark:border-gray-600"
                        : isPaid
                        ? "bg-blue-50 border-2 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400 cursor-pointer"
                        : "bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                    }`}
                    onClick={handlePaidOption}
                    whileTap={isOnboarded ? { scale: 0.98 } : {}}
                  >
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 mx-auto mb-2 ${
                          !isOnboarded
                            ? "text-gray-400"
                            : isPaid
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span
                        className={`font-medium ${
                          !isOnboarded
                            ? "text-gray-600 dark:text-gray-400"
                            : isPaid
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Paid Game
                      </span>
                      {!isOnboarded && (
                        <div className="absolute -top-1 -right-1">
                          <svg
                            className="h-5 w-5 text-amber-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  */}
                </div>

                {!isPublishable && (
                  <motion.div
                    className="mt-4 p-4 bg-amber-500/20 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg
                          className="h-5 w-5 text-amber-600 dark:text-amber-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-amber-700 dark:text-amber-200 mb-1">
                          Payment Setup Required
                        </h4>
                        <p className="text-sm text-amber-700 dark:text-amber-500/30 mb-3">
                          To publish paid games, you need to complete your Stripe onboarding and setup payment processing.
                        </p>
                        <div className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 border border-amber-500/30 rounded-md  dark:bg-amber-800 dark:text-amber-200 dark:border-amber-600  transition-colors">
                          {/* <svg
                            className="h-3 w-3 mr-1.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg> */}
                          Setup Payments first in the Earnings Section
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {isPaid && isPublishable && (
                <motion.div
                  className="mt-6"
                  initial="hidden"
                  animate="visible"
                  variants={inputVariants}
                >
                  <label
                    htmlFor="gamePrice"
                    className="block font-medium text-gray-900 dark:text-white mb-2"
                  >
                    Price (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">
                        $
                      </span>
                    </div>
                    <input
                      id="gamePrice"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Enter a price greater than $0
                  </p>
                </motion.div>
              )}
            </>
          ) : (
            <div className="flex justify-center items-center py-12">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
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
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <motion.button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handlePublish}
              disabled={isSubmitting || !game}
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium ${
                isSubmitting || !game
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } transition-colors`}
              whileHover={isSubmitting || !game ? {} : { scale: 1.02 }}
              whileTap={isSubmitting || !game ? {} : { scale: 0.98 }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Publishing...
                </div>
              ) : (
                "Publish Game"
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}