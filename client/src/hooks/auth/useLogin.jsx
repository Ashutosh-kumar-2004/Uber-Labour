import { useState } from "react";
import axiosInstance from "../../api/axios.jsx";
import { useAuth } from "../../components/context/AuthContext.jsx";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice.jsx";

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const dispatch = useDispatch();

  const loginUser = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/api/auth/login", credentials);
      login(response.data); // response.data contains { user, token }
      dispatch(setUser(response.data.user));
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
