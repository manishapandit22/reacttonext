"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";
import useUserCookie from "@/hooks/useUserCookie";

interface Profile {
  [key: string]: any;
}

interface Coupon {
  [key: string]: any;
}

interface UserContextType {
  profile: Profile | null;
  getProfile: () => Promise<void>;
  gamePointCoupons: Coupon[];
  creatorCoupons: Coupon[];
  myCreatorCoupons: Coupon[];
  fetchCoupons: () => Promise<void>;
  fetchMyCreatorCoupons: () => Promise<void>;
  redeemCreatorCoupon: (couponCode: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getCouponDetails: (couponCode: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  createCreatorCoupon: (gameId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [gamePointCoupons, setGamePointCoupons] = useState<Coupon[]>([]);
  const [creatorCoupons, setCreatorCoupons] = useState<Coupon[]>([]);
  const [myCreatorCoupons, setMyCreatorCoupons] = useState<Coupon[]>([]);

  const user = useUserCookie();

  const { axiosInstance, loading, error } = useAxiosWithAuth();
  

  async function getProfile(): Promise<void> {
    console.log("Get profile API called");
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_BACKEND_URL+"/ai-games/profile");
      // Access the data using the assumed structure: response.data.success.data
      if (response.data && response.data.success) {
        setProfile(response.data.success.data); // set user profile with data
      } else {
        console.error("Unexpected response structure:", response);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  }

  async function fetchCoupons(): Promise<void> {
    console.log("Get coupons API called");
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/coupons/");
      console.log(response);
      // Assuming the response structure contains an array of coupons
      // You can set the coupons to state here when ready to display them
      setGamePointCoupons(response.data.game_point_coupons);
      setCreatorCoupons(response.data.creator_coupons);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  }

  async function fetchMyCreatorCoupons(): Promise<void> {
    console.log("Get my creator coupons API called");
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/my-creator-point-coupons/");
      if (response.data && response.data.success) {
        setMyCreatorCoupons(response.data.coupons || []);
      }
    } catch (err) {
      console.error("Error fetching my creator coupons:", err);
    }
  }

  async function redeemCreatorCoupon(couponCode: string): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log("Redeem creator coupon API called");
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/ai-games/redeem-creator-point-coupon/", {
        coupon_code: couponCode
      });
      if (response.data && response.data.success) {
        fetchCoupons();
        getProfile();
        return { success: true, data: response.data.success.data };
      }
      return { success: false, error: response.data?.error || "Redemption failed" };
    } catch (err: any) {
      console.error("Error redeeming creator coupon:", err);
      return { success: false, error: err.response?.data?.error || "Redemption failed" };
    }
  }

  async function getCouponDetails(couponCode: string): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log("Get coupon details API called");
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/ai-games/creator-point-coupon-details/${couponCode}/`);
      if (response.data && response.data.success) {
        return { success: true, data: response.data.success.data };
      }
      return { success: false, error: response.data?.error || "Failed to get coupon details" };
    } catch (err: any) {
      console.error("Error getting coupon details:", err);
      return { success: false, error: err.response?.data?.error || "Failed to get coupon details" };
    }
  }

  async function createCreatorCoupon(gameId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log("Create creator coupon API called");
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_BACKEND_URL + `/ai-games/creator-point-coupon/${gameId}`);
      if (response.data && response.data.success) {
        fetchMyCreatorCoupons();
        return { success: true, data: response.data.coupon || response.data.success.data };
      }
      return { success: false, error: response.data?.error || "Failed to create coupon" };
    } catch (err: any) {
      console.error("Error creating creator coupon:", err);
      return { success: false, error: err.response?.data?.error || "Failed to create coupon" };
    }
  }

  useEffect(() => {
    if (user) {
      getProfile();
      fetchCoupons();
      fetchMyCreatorCoupons();
    }
  }, [user]);
  

  return (
    <UserContext.Provider value={{ 
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
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

