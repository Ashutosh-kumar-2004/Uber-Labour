import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axios";

const useMyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/user/my-works"); // Fixed path
      setTasks(response.data.tasks);
      setError(null);
    } catch (err) {
      console.error("Error fetching my tasks:", err);
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const deleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axiosInstance.delete(`/api/user/delete/${taskId}`); // Fixed path
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  const renewTask = async (taskId, newDate) => {
    try {
      setLoading(true);
      const payload = newDate ? { newScheduledDate: newDate } : {};
      const response = await axiosInstance.put(`/api/user/task/${taskId}/renew`, payload); // Fixed path with payload

      // Update local state with renewed task
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? response.data.task : t))
      );
      alert("Task renewed successfully! It is now visible to workers again.");
    } catch (err) {
      console.error("Error renewing task:", err);
      // Re-throw to let component handle UI feedback if needed, or keep alert
      // The component (Dashboard) seems to handle errors via its own try-catch when calling this.
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, error, deleteTask, renewTask, refetch: fetchTasks };
};

export default useMyTasks;
