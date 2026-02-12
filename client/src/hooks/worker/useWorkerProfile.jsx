import { useState, useEffect } from "react";
import axiosInstance from "../../api/axios.jsx";

const useWorkerProfile = () => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkerProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/worker/profile");
      setWorker(response.data.worker);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch worker profile");
      console.error("Error fetching worker profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerProfile();
  }, []);

  return { worker, loading, error, refetch: fetchWorkerProfile, setWorker };
};

export default useWorkerProfile;
