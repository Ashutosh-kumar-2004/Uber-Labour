import { useState } from "react";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../components/context/AuthContext";

const useWorkerRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const registerWorker = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axiosInstance.post(
        "/api/worker/verify-worker",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user?.token}`,
          },
        },
      );

      if (response.data.success) {
        setSuccess(true);
        return response.data;
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong during registration.",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { registerWorker, loading, error, success };
};

export default useWorkerRegistration;
