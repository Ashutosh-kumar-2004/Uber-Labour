import { Routes, Route } from "react-router-dom";
import SignupPage from "../components/Auth/Signup";
import LoginPage from "../components/Auth/LoginPage";
import ForgotPassword from "../components/Auth/ForgotPassword";
import User_Dashboard from "../components/Auth/User_Dashboard";
import CreateTask from "../components/User/CreateTask";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* user routes */}
      <Route path="/user" element={<User_Dashboard />} />
      <Route path="/user/hire" element={<CreateTask />} />

      {/* Default Route */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
