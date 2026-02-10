import { useState } from "react";
import axiosInstance from "../../api/axios.jsx";

const useSetWorkerAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(null);

  const setAvailability = async (status) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axiosInstance.patch("/api/worker/availability", {
        isOnline: status,
      });

      setSuccess(true);
      setIsOnline(response.data.isOnline);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update availability";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setAvailability, loading, error, success, isOnline };
};

export default useSetWorkerAvailability;
