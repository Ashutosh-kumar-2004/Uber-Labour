import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "../components/Auth/Signup";
import LoginPage from "../components/Auth/LoginPage";
import ForgotPassword from "../components/Auth/ForgotPassword";
import User_Dashboard from "../components/Auth/User_Dashboard";
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/User_dashboard" element={<User_Dashboard/>}/>
        {/* Default Route */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
