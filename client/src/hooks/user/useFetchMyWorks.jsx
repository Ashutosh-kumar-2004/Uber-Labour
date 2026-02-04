import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../api/axios.jsx";
import {
  fetchWorksStart,
  fetchWorksSuccess,
  fetchWorksFailure,
} from "../../redux/slices/userWorkSlice.jsx";

const useFetchMyWorks = () => {
  const dispatch = useDispatch();
  const { works, loading, error } = useSelector((state) => state.userWorks);

  const fetchMyWorks = useCallback(
    async (token) => {
      dispatch(fetchWorksStart());
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axiosInstance.get("/api/user/my-works", config);
        dispatch(fetchWorksSuccess(response.data.tasks));
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || "Failed to fetch works";
        dispatch(fetchWorksFailure(message));
        console.error("Fetch works error:", err);
      }
    },
    [dispatch],
  );

  return { fetchMyWorks, works, loading, error };
};

export default useFetchMyWorks;
