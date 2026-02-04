import { useState } from "react";
import axiosInstance from "../../api/axios.jsx";

const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signupUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/api/auth/signup", userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { signupUser, loading, error };
};

export default useSignup;
