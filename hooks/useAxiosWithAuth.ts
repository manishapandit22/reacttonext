"use client";

import { useState } from "react";
import axios, { AxiosInstance, AxiosError } from "axios";
import Cookie from "js-cookie";
import { logout } from "@/utils/logoutUser";

interface UseAxiosWithAuthReturn {
  axiosInstance: AxiosInstance;
  getData: (method: string, url: string, payload?: any) => Promise<void>;
  data: any;
  loading: boolean;
  error: AxiosError | null;
}

const useAxiosWithAuth = (): UseAxiosWithAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [data, setData] = useState<any>(null);

  const getToken = (): string | undefined => {
    const token = Cookie.get("access_token");
    return token;
  };

  const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_BASE_URL,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("No token found in cookies.");
      }
      if (!config.headers["Content-Type"] && !(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }

      setLoading(true);
      return config;
    },
    (error) => {
      setError(error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      setLoading(false);
      setData(response);
      return response;
    },
    (error) => {
      setLoading(false);

      if (error.response && error.response.status === 401) {
        logout();
      }
      setError(error);
      return Promise.reject(error);
    }
  );

  const getData = async (method: string, url: string, payload: any = {}): Promise<void> => {
    try {
      setLoading(true);
      const response = await (axiosInstance as any)[method](url, payload);
      const responseData = response.data;
      setData(response.data.success.data);
    } catch (err) {
      setError(err as AxiosError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    axiosInstance,
    getData,
    data,
    loading,
    error,
  };
};

export default useAxiosWithAuth;

