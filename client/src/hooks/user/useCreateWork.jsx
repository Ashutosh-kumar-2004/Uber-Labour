import { useState } from "react";
import axiosInstance from "../../api/axios.jsx";
import { useDispatch } from "react-redux";
import { addWork } from "../../redux/slices/userWorkSlice.jsx";

const useCreateWork = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();

  // Cloudinary Config
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  /**
   * Uploads a single file to Cloudinary
   */
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (!res.ok) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

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
      // 1. Upload Images to Cloudinary first
      let imageUrls = [];
      if (data.images && data.images.length > 0) {
        // Upload all images in parallel
        const uploadPromises = data.images.map((img) => {
          // If it's already a URL (string), just return it
          if (typeof img === "string") return img;
          return uploadToCloudinary(img);
        });
        
        imageUrls = await Promise.all(uploadPromises);
      }

      // 2. Prepare JSON payload
      // We process the location and other fields to match backend expectations
      const payload = {
        ...data,
        images: imageUrls,
        // location is already an object {lat, lng} in data, backend handles it or stringified
        // Backend now expects JSON, so we can pass the object directly if backend supports it,
        // OR we conform to the stringify logic if backend still parses string
      };

      // Backend expects 'location' as object or string. passing object is cleaner for JSON.
      // But let's check backend logic:
      // if (typeof location === "string") location = JSON.parse(location);
      // So passing object is fine.

      // Axios config with JWT token - Content-Type application/json is default for axios post with object
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // POST request to backend
      const response = await axiosInstance.post(
        "/api/user/create",
        payload,
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
      // Handle cleanup if backend fails but images uploaded? 
      // For now, complex rollback is skipped, but ideal.
      
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
