import { useState, useCallback } from "react";
import axiosInstance from "../../api/axios";
import { WORKER_API_ENDPOINTS } from "../../constants/task.constants";

const useAvailableTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async ({ lat, lng, distance, category }) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        lat,
        lng,
        distance,
      };

      if (category && category !== "All") {
        params.category = category;
      }

      const response = await axiosInstance.get(WORKER_API_ENDPOINTS.GET_AVAILABLE_TASKS, {
        params,
      });

      if (response.data.success) {
        setTasks(response.data.tasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  return { tasks, loading, error, fetchTasks, setError };
};

export default useAvailableTasks;
