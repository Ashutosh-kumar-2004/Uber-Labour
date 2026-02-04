import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice.jsx";
import userWorkReducer from "./slices/userWorkSlice.jsx";

const store = configureStore({
  reducer: {
    user: userReducer,
    userWorks: userWorkReducer,
  },
});

export default store;
