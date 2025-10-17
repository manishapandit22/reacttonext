"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import { toast } from "react-toastify";
import { useUser } from '@/contexts/UserContext';

export default function Coupons() {

  const { axiosInstance } = useAxiosWithAuth();
  const { 
    profile, 
    getProfile, 
    gamePointCoupons, 
    creatorCoupons, 
    myCreatorCoupons,
    fetchCoupons, 
    fetchMyCreatorCoupons,
    redeemCreatorCoupon,
    getCouponDetails,
    createCreatorCoupon
  } = useUser();

  const [couponCode, setCouponCode] = useState("");
  const [couponDetails, setCouponDetails] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [userGames, setUserGames] = useState([]);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);

    const isCouponExpired = (coupon) => {
    if (!coupon.expiration_date) return false;
    return new Date(coupon.expiration_date) < new Date();
  };


  useEffect(() => {
    fetchUserGames();
  }, []);

  async function fetchUserGames() {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/games/all");
      if (response.data && response.data.success) {
        setUserGames(response.data.success.data || []);
      }
    } catch (err) {
      console.error("Error fetching user games:", err);
    }
  }

  const getGamesWithoutCoupons = () => {
    const gamesWithCoupons = new Set(myCreatorCoupons.map(coupon => coupon.game_id));
    return userGames.filter(game => game.published && !gamesWithCoupons.has(game.game_id));
  };

  async function handleCreateCouponForGame(gameId) {
    setIsCreatingCoupon(true);
    try {
      const result = await createCreatorCoupon(gameId);
      if (result.success) {
        toast.success("Creator coupon created successfully!");
        fetchMyCreatorCoupons();
        fetchUserGames();
      } else {
        toast.error(result.error || "Failed to create coupon");
      }
    } catch (error) {
      toast.error("Error creating coupon");
    } finally {
      setIsCreatingCoupon(false);
    }
  }

  async function handleRedeem(code) {
    console.log(code,"code");
    const response = await axiosInstance.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/redeem-game-point-coupon/", {
      coupon_code: code
    });
    console.log(response,"response");
    if (response.status === 200) {
      fetchCoupons(); 
      getProfile();
      toast.success("Coupon redeemed successfully");
    } else {
      toast.error("Coupon redemption failed");
    }
  }

  async function handleRedeemCreatorCoupon() {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsRedeeming(true);
    try {
      const result = await redeemCreatorCoupon(couponCode);
      if (result.success) {
        toast.success("Creator coupon redeemed successfully!");
        setCouponCode("");
        setCouponDetails(null);
        fetchCoupons();
        getProfile();
      } else {
        toast.error(result.error || "Failed to redeem coupon");
      }
    } catch (error) {
      toast.error("Error redeeming coupon");
    } finally {
      setIsRedeeming(false);
    }
  }

  async function handleValidateCoupon() {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidating(true);
    try {
      const result = await getCouponDetails(couponCode);
      if (result.success) {
        setCouponDetails(result.data);
        toast.success("Coupon validated successfully!");
      } else {
        setCouponDetails(null);
        toast.error(result.error || "Invalid coupon code");
      }
    } catch (error) {
      setCouponDetails(null);
      toast.error("Error validating coupon");
    } finally {
      setIsValidating(false);
    }
  }

  async function handleCancelSubscription(){
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/subscription/cancel/");
      if (response.status === 200) {
        getProfile();
        toast.success("Subscription cancelled successfully");
      } else {
        toast.error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("Failed to cancel subscription");
    }
  }

    const filteredGamePointCoupons = gamePointCoupons.filter(elm => !isCouponExpired(elm));
  const filteredCreatorCoupons = creatorCoupons.filter(elm => !isCouponExpired(elm));
  const filteredMyCreatorCoupons = myCreatorCoupons.filter(elm => !isCouponExpired(elm));

  return (
    <section className="relative pb-20 pt-28 dark:bg-jacarta-800">
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
          {!profile?.subscription && (profile?.game_points === 0 || profile?.game_points === undefined) && (
            <div className="mb-8 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <svg width="320" height="80" className="animate-pulse opacity-60">
                  <g>
                    <circle cx="40" cy="40" r="18" fill="#FFD700" opacity="0.7">
                      <animate attributeName="cy" values="40;30;40" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="120" cy="30" r="10" fill="#FFB300" opacity="0.5">
                      <animate attributeName="cy" values="30;50;30" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="200" cy="50" r="14" fill="#FFDF80" opacity="0.6">
                      <animate attributeName="cy" values="50;35;50" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="280" cy="25" r="8" fill="#FFD700" opacity="0.4">
                      <animate attributeName="cy" values="25;45;25" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                  <g>
                    <polygon points="60,10 62,16 68,16 63,19 65,25 60,21 55,25 57,19 52,16 58,16" fill="#fffbe6" opacity="0.7">
                      <animateTransform attributeName="transform" type="rotate" from="0 60 18" to="360 60 18" dur="3s" repeatCount="indefinite"/>
                    </polygon>
                    <polygon points="250,60 252,64 257,64 253,67 255,71 250,68 245,71 247,67 243,64 248,64" fill="#fffbe6" opacity="0.5">
                      <animateTransform attributeName="transform" type="rotate" from="0 250 67" to="360 250 67" dur="2.2s" repeatCount="indefinite"/>
                    </polygon>
                  </g>
                </svg>
              </div>
              <div className="relative z-10 rounded-2xl border-2 border-red-400 bg-gradient-to-br from-[#ffb1b1bb] via-[#ffeaea] to-[#ffb1b1bb] shadow-2xl px-8 py-6 text-center dark:bg-gradient-to-br dark:from-red-900/40 dark:via-red-900/10 dark:to-red-900/30 dark:border-red-700 dark:text-red-200">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="h-8 w-8 text-red-500 animate-bounce" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="#FFD6D6" />
                      <path d="M8 12h8M12 8v8" stroke="#FF3B3B" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-2xl font-extrabold text-red-700 dark:text-red-300 drop-shadow-lg tracking-wide animate-pulse">
                      No Game Points!
                    </span>
                  </div>
                  <p className="text-lg font-medium text-red-700 dark:text-red-200">
                    Oops! Your game points wallet is empty.<br />
                    <span className="text-base text-red-500 dark:text-red-300">
                      Buy game points now to unlock new adventures and keep playing!
                    </span>
                  </p>
                  <button
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 px-6 py-2.5 text-lg font-bold text-white shadow-lg hover:scale-105 hover:from-red-600 hover:to-yellow-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                    data-bs-toggle="modal"
                    data-bs-target="#buyPointsModal"
                  >
                    <svg className="h-5 w-5 text-yellow-200 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 018 8h-2a6 6 0 10-6 6v2a8 8 0 010-16z" />
                    </svg>
                    Buy Game Points
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="mb-8 rounded-2xl bg-white dark:bg-jacarta-700 shadow-lg p-6">
            <h2 className="font-display text-2xl font-medium dark:text-white mb-6">Profile Information</h2>
            {profile?.subscription ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span data-tippy-content="Premium" className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7">
                        <path fill="#FFD700" d="M12 2L8.5 8.5 2 9.27l5 4.87L5.5 21 12 17.77 18.5 21 17 14.14l5-4.87L15.5 8.5z"/>
                      </svg>
                    </span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xl">{profile.subscription.plan_type}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 mr-4">
                      Expires on {new Date(profile.subscription.end_date).toLocaleDateString()}
                    </span>
                    <span className={`px-4 py-2 ${
                      profile.subscription.status === 'cancelled' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    } text-sm font-semibold rounded-lg`}>
                      Status: {profile.subscription.status === 'cancelled' ? 'Cancelled' : 'Active'}
                    </span>
                  </div>
                </div>
                {profile.subscription.status === 'active' && (
                  <div className="flex justify-end">
                    <button
                      onClick={handleCancelSubscription}
                      className="group relative inline-flex items-center justify-center rounded-lg border-2 border-red-600 bg-red-600/90 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-red-700 hover:border-red-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-jacarta-800 dark:bg-red-500/90 dark:border-red-500 dark:hover:bg-red-600 dark:hover:border-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Cancel Subscription
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl">
                    <Image
                      src="/img/wallets/coin.png"
                      alt="Game Points" 
                      width={24}
                      height={24}
                      className="animate-pulse"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Current Balance</span>
                    <span className="text-2xl font-bold text-jacarta-700 dark:text-white">
                      {profile?.game_points} GP
                    </span>
                  </div>
                </div>
                {/* <button
                  className="js-copy-clipboard select-none rounded-lg bg-accent/20 dark:bg-accent/10 px-4 py-2 text-accent hover:bg-accent/30 dark:hover:bg-accent/20 transition-colors duration-200"
                  data-tippy-content="Copy Balance"
                >
                  Copy
                </button> */}
              </div>
            )}
          </div>

          <div className="pt-12"></div>

          {/* Creator Coupon Redemption Section */}
          <div className="mb-8 rounded-2xl bg-white dark:bg-jacarta-700 shadow-lg p-6">
            <h2 className="font-display text-2xl font-medium dark:text-white mb-6">Redeem Creator Coupon</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter creator coupon code..."
                  className="flex-1 rounded-lg border border-jacarta-100 bg-white py-3 px-4 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:placeholder-jacarta-400"
                />
                
                                  <button
                    onClick={handleRedeemCreatorCoupon}
                    disabled={!couponCode.trim() || isRedeeming}
                    className="rounded-lg bg-accent py-3 px-6 text-sm font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRedeeming ? "Redeeming..." : "Redeem"}
                  </button>
              </div>
              
              {couponDetails && (
                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold text-green-800 dark:text-green-200">Valid Coupon</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-300">Game:</span>
                      <span className="ml-2 text-green-600 dark:text-green-400">{couponDetails.game_name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-300">Points:</span>
                      <span className="ml-2 text-green-600 dark:text-green-400">{couponDetails.points} GP</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-300">Creator:</span>
                      <span className="ml-2 text-green-600 dark:text-green-400">{couponDetails.creator_username}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-300">Expires:</span>
                      <span className="ml-2 text-green-600 dark:text-green-400">
                        {couponDetails.expiration_date ? new Date(couponDetails.expiration_date).toLocaleDateString() : 'No expiration'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-300">Used:</span>
                      <span className="ml-2 text-green-600 dark:text-green-400">
                        {couponDetails.current_redemptions}/{couponDetails.max_redemptions}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-green-700 dark:text-green-300">Status:</span>
                      <span className={`ml-2 ${couponDetails.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {couponDetails.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-12"></div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="font-display text-3xl font-medium dark:text-white">Game Point Coupons</h1>
            {!profile?.subscription && (
              <button
                className="rounded-full bg-accent py-2 px-6 text-sm font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                data-bs-toggle="modal"
                data-bs-target="#buyPointsModal"
              >
                Buy Game Points
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredGamePointCoupons.length === 0 && (
            <div className="col-span-full text-center py-6">
              <p className="text-base dark:text-white">No game point coupons available at the moment.</p>
            </div>
          )}
          {filteredGamePointCoupons.slice(-4).map((elm, i) => {
            const isExpired = elm.expiration_date && new Date(elm.expiration_date) < new Date();
            return (
              <div
                key={i}
                className="relative rounded-xl border border-jacarta-100 bg-white p-4 text-center transition-shadow hover:shadow-lg dark:border-jacarta-600 dark:bg-jacarta-700"
              >
                {elm.redeemed ? (
                  <div className="absolute top-0 right-0 bg-red-500 dark:text-white px-2 py-0.5 text-xs rounded-tr-xl rounded-bl-xl">
                    Redeemed
                  </div>
                ) : isExpired ? (
                  <div className="absolute top-0 right-0 bg-red-500 dark:text-white px-2 py-0.5 text-xs rounded-tr-xl rounded-bl-xl">
                    Expired
                  </div>
                ) : (
                  <div className="absolute top-0 right-0 bg-green-500 dark:text-white px-2 py-0.5 text-xs rounded-tr-xl rounded-bl-xl">
                    Available
                  </div>
                )}
                <Image
                  width={48}
                  height={48}
                  src="/img/wallets/coin.png"
                  className="mx-auto mb-3 h-12 w-12 rounded-full border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-700"
                  alt="coupon"
                />
                {elm.expiration_date && (
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <span className="font-semibold text-jacarta-700 dark:text-white">Expires:</span>
                      <span className="dark:text-jacarta-300">
                        {new Date(elm.expiration_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Points:</span>
                    <span className="dark:text-jacarta-300">{elm.points}</span>
                  </div>
                  {elm.shared_by && (
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-semibold text-jacarta-700 dark:text-white">By:</span>
                      <span className="dark:text-jacarta-300 truncate">{elm.shared_by}</span>
                    </div>
                  )}
                  
                  {!elm.redeemed && !isExpired && (
                    <button 
                      className="mt-2 w-full rounded-full bg-accent py-2 px-4 text-xs font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                      onClick={() => handleRedeem(elm.code)}
                    >
                      Redeem
                    </button>
                  )}
                  {isExpired && !elm.redeemed && (
                    <p className="text-red-500 text-xs">
                      Expired coupon. Redeem same day.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          <div className="pt-12"></div>

          <div className="flex justify-between items-center mb-8">
            <h1 className="font-display text-3xl font-medium dark:text-white">Creator Discount Coupon</h1>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredCreatorCoupons.length === 0 && (
            <div className="col-span-full text-center py-6">
              <p className="text-base dark:text-white">No creator coupons available at the moment.</p>
            </div>
          )}
          {filteredCreatorCoupons.map((elm, i) => (
              <div
                key={i}
                className="relative rounded-xl border border-jacarta-100 bg-white p-4 text-center transition-shadow hover:shadow-lg dark:border-jacarta-600 dark:bg-jacarta-700"
              >
                {elm.current_redemptions >= elm.max_redemptions ? (
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-0.5 text-xs rounded-tr-xl rounded-bl-xl">
                    Redeemed
                  </div>
                ) : !elm.is_active ? (
                  <div className="absolute top-0 right-0 bg-gray-500 text-white px-2 py-0.5 text-xs rounded-tr-xl rounded-bl-xl">
                    Inactive
                  </div>
                ) : (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-2 py-0.5 text-xs rounded-tr-xl rounded-bl-xl">
                    Available
                  </div>
                )}
                <Image
                  width={48}
                  height={48}
                  src="/img/wallets/coin.png"
                  className="mx-auto mb-3 h-12 w-12 rounded-full border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-700"
                  alt="coupon"
                />
                <h3 className="mb-2 font-display text-sm text-jacarta-700 dark:text-white truncate">
                  {elm.code}
                </h3>
                <p className="mb-3 text-xs dark:text-jacarta-300 line-clamp-2">{elm.description || 'No description available'}</p>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Game:</span>
                    <span className="dark:text-jacarta-300 truncate">{elm.game_name}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Points:</span>
                    <span className="dark:text-jacarta-300">{elm.points} GP</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Creator:</span>
                    <span className="dark:text-jacarta-300 truncate">{elm.creator_username}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Expires:</span>
                    <span className="dark:text-jacarta-300">
                      {elm.expiration_date ? new Date(elm.expiration_date).toLocaleDateString() : 'No expiration'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Used:</span>
                    <span className="dark:text-jacarta-300">{elm.current_redemptions}/{elm.max_redemptions}</span>
                  </div>
                  {elm.is_active && elm.current_redemptions < elm.max_redemptions && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(elm.code);
                        toast.success('Coupon code copied to clipboard!');
                      }}
                      className="mt-2 w-full rounded-full bg-accent py-2 px-4 text-xs font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                    >
                      Share
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-12"></div>

          {/* My Creator Coupons Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-display text-3xl font-medium dark:text-white">Creator Points Coupon</h1>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredMyCreatorCoupons.length === 0 && (
            <div className="col-span-full text-center py-6">
              <p className="text-base dark:text-white">You haven't created any creator coupons yet.</p>
            </div>
          )}
          {filteredMyCreatorCoupons.map((elm, i) => (
              <div
                key={i}
                className="relative rounded-xl border border-jacarta-100 bg-white p-4 text-center transition-shadow hover:shadow-lg dark:border-jacarta-600 dark:bg-jacarta-700"
              >
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-0.5 text-xs rounded-tr-xl rounded-bl-xl">
                  My Coupon
                </div>
                <Image
                  width={48}
                  height={48}
                  src="/img/wallets/coin.png"
                  className="mx-auto mb-3 h-12 w-12 rounded-full border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-700"
                  alt="coupon"
                />
                <h3 className="mb-2 font-display text-sm text-jacarta-700 dark:text-white truncate">
                  {elm.code}
                </h3>
                <p className="mb-3 text-xs dark:text-jacarta-300 line-clamp-2">{elm.description || 'No description available'}</p>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Game:</span>
                    <span className="dark:text-jacarta-300 truncate">{elm.game_name}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Points:</span>
                    <span className="dark:text-jacarta-300">{elm.points} GP</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Creator:</span>
                    <span className="dark:text-jacarta-300 truncate">{elm.creator_username}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Expires:</span>
                    <span className="dark:text-jacarta-300">
                      {elm.expiration_date ? new Date(elm.expiration_date).toLocaleDateString() : 'No expiration'}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Used:</span>
                    <span className="dark:text-jacarta-300">{elm.current_redemptions}/{elm.max_redemptions}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Status:</span>
                    <span className={`${elm.is_active ? 'text-green-500' : 'text-red-500'}`}>
                      {elm.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {elm.is_active && elm.current_redemptions < elm.max_redemptions && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(elm.code);
                        toast.success('Coupon code copied to clipboard!');
                      }}
                      className="mt-2 w-full rounded-full bg-accent py-2 px-4 text-xs font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                    >
                      Share
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-12"></div>

          {/* Games Without Creator Coupons Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-display text-3xl font-medium dark:text-white">Games Without Creator Coupons</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {userGames.length === 0 ? (
              <div className="col-span-full text-center py-6">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-base dark:text-white">Loading your games...</p>
              </div>
            ) : getGamesWithoutCoupons().length === 0 ? (
              <div className="col-span-full text-center py-6">
                <p className="text-base dark:text-white">All your games already have creator coupons!</p>
              </div>
            ) : null}
            {getGamesWithoutCoupons().map((game, i) => (
              <div
                key={i}
                className="relative rounded-xl border border-jacarta-100 bg-white p-4 text-center transition-shadow hover:shadow-lg dark:border-jacarta-600 dark:bg-jacarta-700"
              >
                <div className="absolute top-0 right-0 bg-yellow-500 text-white px-2 py-0.5 text-xs rounded-tr-xl rounded-bl-xl">
                  Create Coupon
                </div>
                <Image
                  width={48}
                  height={48}
                  src="/img/wallets/coin.png"
                  className="mx-auto mb-3 h-12 w-12 rounded-full border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-700"
                  alt="game"
                />
                <h3 className="mb-2 font-display text-sm text-jacarta-700 dark:text-white truncate">
                  {game.game_name}
                </h3>
                <p className="mb-3 text-xs dark:text-jacarta-300 line-clamp-2">{game.description || 'No description available'}</p>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Points:</span>
                    <span className="dark:text-jacarta-300">{game.game_points} GP</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Creator:</span>
                    <span className="dark:text-jacarta-300 truncate">{game.creator_username}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-jacarta-700 dark:text-white">Status:</span>
                    <span className="dark:text-jacarta-300">Published</span>
                  </div>
                  <button
                    onClick={() => handleCreateCouponForGame(game.game_id)}
                    disabled={isCreatingCoupon}
                    className="mt-2 w-full rounded-full bg-accent py-2 px-4 text-xs font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingCoupon ? "Creating..." : "Create Coupon"}
                  </button>
                </div>
              </div>
            ))}
          </div>
      </div>
    </section>
  );
}
