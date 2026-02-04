import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice.jsx";

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
