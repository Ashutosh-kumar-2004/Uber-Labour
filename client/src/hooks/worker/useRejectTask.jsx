import { useState } from "react";
import axiosInstance from "../../api/axios.jsx";

const useRejectTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const rejectTask = async (taskId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axiosInstance.post(
        `/api/worker/tasks/${taskId}/reject`
      );

      setSuccess(true);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to reject task";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { rejectTask, loading, error, success };
};

export default useRejectTask;
