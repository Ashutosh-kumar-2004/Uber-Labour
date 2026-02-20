import { Routes, Route } from "react-router-dom";
import SignupPage from "../components/Auth/Signup";
import LoginPage from "../components/Auth/LoginPage";
import ForgotPassword from "../components/Auth/ForgotPassword";
import User_Dashboard from "../components/User/User_Dashboard";
import CreateTask from "../components/User/CreateTask";
import Registration from "../components/Labor/Registration";
import WorkerDashboard from "../components/Labor/WorkerDashboard";
import WorkerProfile from "../components/Labor/WorkerProfile";
import UserProfile from "../components/User/UserProfile";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* user routes */}
      <Route path="/user" element={<User_Dashboard />} />
      <Route path="/user/profile" element={<UserProfile />} />
      <Route path="/user/hire" element={<CreateTask />} />

      {/* Labor routes */}
      <Route path="/worker" element={<Registration />} />
      <Route path="/worker/dashboard" element={<WorkerDashboard />} />
      <Route path="/worker/profile" element={<WorkerProfile />} />
      {/* Default Route */}
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
};

export default AppRoutes;
