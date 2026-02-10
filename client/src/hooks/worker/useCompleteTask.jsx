import { useState } from "react";
import axiosInstance from "../../api/axios.jsx";

const useCompleteTask = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [completedTask, setCompletedTask] = useState(null);

  const completeTask = async (taskId) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axiosInstance.post(
        `/api/worker/tasks/${taskId}/complete`
      );

      setSuccess(true);
      setCompletedTask(response.data.task);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to complete task";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { completeTask, loading, error, success, completedTask };
};

export default useCompleteTask;
