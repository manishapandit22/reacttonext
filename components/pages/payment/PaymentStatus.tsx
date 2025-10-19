"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import { CheckCircle, XCircle, Clock, CreditCard, Calendar, DollarSign, Loader2 } from "lucide-react";

const PaymentStatus = ({ gameId }) => {
  const router = useRouter();
  const { axiosInstance, loading } = useAxiosWithAuth();
  const [paymentData, setPaymentData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("loading"); // loading, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [hasVerified, setHasVerified] = useState(false); // Prevent multiple API calls

  useEffect(() => {
    if (gameId && axiosInstance && !hasVerified) {
      verifyPayment();
    }
  }, [gameId, axiosInstance, hasVerified]);

  const verifyPayment = async () => {
    if (hasVerified) return; // Prevent multiple calls
    
    try {
      setHasVerified(true); // Mark as verified to prevent re-calls
      setVerificationStatus("loading");
      
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ai-games/payments/verify-game-purchase/${gameId}/`
      );

      if (response.data) {
        setPaymentData(response.data);
        
        if (response.data.payment_successful) {
          setVerificationStatus("success");
          
          // Redirect to game page after 3 seconds
          setTimeout(() => {
            router.push(`/games/${gameId}`);
          }, 3000);
        } else {
          setVerificationStatus("error");
          setErrorMessage("Payment verification failed");
        }
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setVerificationStatus("error");
      setErrorMessage(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to verify payment. Please try again."
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return "0.00";
    return parseFloat(amount).toFixed(2);
  };

  const StatusIcon = () => {
    switch (verificationStatus) {
      case "loading":
        return <Loader2 className="h-16 w-16 text-purple-500 animate-spin" />;
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case "error":
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Clock className="h-16 w-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    if (verificationStatus === "loading") {
      return {
        title: "Verifying Payment...",
        subtitle: "Please wait while we confirm your purchase",
        color: "text-purple-400"
      };
    }
    
    if (verificationStatus === "success") {
      if (paymentData?.status === "already_purchased") {
        return {
          title: "Game Already Purchased!",
          subtitle: "You already own this game. Redirecting to game page...",
          color: "text-green-400"
        };
      }
      return {
        title: "Payment Successful!",
        subtitle: "Your purchase has been confirmed. Redirecting to game page...",
        color: "text-green-400"
      };
    }
    
    return {
      title: "Payment Verification Failed",
      subtitle: errorMessage,
      color: "text-red-400"
    };
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-jacarta-700 to-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Status Card */}
        <div className="relative transform rounded-2xl bg-white/5 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/20 dark:border-purple-900/20 shadow-2xl overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-transparent"></div>
          
          <div className="relative p-8">
            {/* Status Icon and Message */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                  <StatusIcon />
                </div>
              </div>
              
              <h1 className={`text-3xl font-bold mb-2 ${statusInfo.color}`}>
                {statusInfo.title}
              </h1>
              <p className="text-gray-300 text-lg">
                {statusInfo.subtitle}
              </p>
            </div>

            {/* Payment Details */}
            {paymentData && verificationStatus === "success" && (
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-gray-200/10 dark:border-purple-900/20 shadow-md overflow-hidden">
                  <div className="flex items-center gap-2 p-4 border-b border-gray-200/20 dark:border-gray-800/30 bg-gradient-to-r from-purple-500/20 to-purple-600/20">
                    <div className="p-1.5 rounded-lg bg-white/10">
                      <CreditCard className="h-5 w-5 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Payment Details
                    </h3>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="font-medium text-gray-300 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        Amount Paid
                      </span>
                      <span className="text-white font-mono text-lg">
                        ${formatAmount(paymentData.amount_paid)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="font-medium text-gray-300 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        Purchase Date
                      </span>
                      <span className="text-gray-400 font-mono">
                        {formatDate(paymentData.purchase_date)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <span className="font-medium text-gray-300">
                        Purchase ID
                      </span>
                      <span className="text-gray-400 font-mono text-sm">
                        {paymentData.purchase_id}
                      </span>
                    </div>
                    
                    {paymentData.session_id && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <span className="font-medium text-gray-300">
                          Session ID
                        </span>
                        <span className="text-gray-400 font-mono text-sm">
                          {paymentData.session_id}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="font-medium text-gray-300">
                        Status
                      </span>
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
                        {paymentData.status === "already_purchased" ? "Already Owned" : "Verified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              {verificationStatus === "success" && (
                <button
                  onClick={() => router.push(`/games/${gameId}`)}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white transition-all duration-200 font-medium shadow-md hover:shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Go to Game
                </button>
              )}
              
              {verificationStatus === "error" && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => {
                      setHasVerified(false); // Reset verification flag
                      verifyPayment();
                    }}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition-all duration-200 font-medium shadow-md hover:shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
                  >
                    <Loader2 className="h-5 w-5" />
                    Retry Verification
                  </button>
                  
                  <button
                    onClick={() => router.push("/games")}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white transition-all duration-200 font-medium shadow-md hover:shadow-lg shadow-gray-500/10"
                  >
                    Back to Games
                  </button>
                </div>
              )}
            </div>

            {/* Loading Progress */}
            {verificationStatus === "loading" && (
              <div className="mt-6">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Having issues? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
