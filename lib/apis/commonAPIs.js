import useAxiosWithAuth from "@/hooks/useAxiosWithAuth";

export const useCommonAPI = () => {
  const {axiosInstance} = useAxiosWithAuth();
  const url_base = process.env.NEXT_PUBLIC_BACKEND_URL;


    async function getTracks(){
        try {
            const url = `${url_base}/ai-games/tracks/`
            const response = await axiosInstance.get(url);

            if (response.data && response.data.success) {
            return response.data.success.data;
            } else {
            console.error("Unexpected response structure:", response);
            }
        } catch (err) {
            console.error("Error fetching game:", err);
        }
    }

  return {
    getTracks,
  };
};