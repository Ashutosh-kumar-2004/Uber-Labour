import { useState } from "react";
import axiosInstance from "../../api/axios";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUser = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loginUser, loading, error };
};

export default useLogin;
