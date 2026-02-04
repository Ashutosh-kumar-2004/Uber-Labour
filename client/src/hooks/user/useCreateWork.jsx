import { useState } from "react";
import axiosInstance from "../../api/axios.jsx";
import { useDispatch } from "react-redux";
import { addWork } from "../../redux/slices/userWorkSlice.jsx";

const useCreateWork = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();

  /**
   * createWork
   * @param {Object} data - Task form data
   * @param {string} token - JWT token for authentication
   * @returns {Object} - Response from backend
   */
  const createWork = async (data, token) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();

      // Append primitive and array fields
      Object.entries(data).forEach(([key, value]) => {
        if (!value) return;

        if (key === "images") return; // handled separately
        if (key === "location") {
          formData.append("location", JSON.stringify(value));
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else {
          formData.append(key, value);
        }
      });

      // Append images
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      // Axios config with JWT token
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      // POST request to backend
      // Assuming baseURL is /api, so path is /user/create
      const response = await axiosInstance.post(
        "/user/create",
        formData,
        config,
      );

      setSuccess(true);

      // Dispatch to Redux store if task is returned
      if (response.data?.task) {
        dispatch(addWork(response.data.task));
      }

      return response.data;
    } catch (err) {
      console.error("Create work error:", err);
      const message =
        err.response?.data?.message || err.message || "Failed to create task";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { createWork, loading, error, success };
};

export default useCreateWork;
