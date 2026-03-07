import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";

import SignupPage from "../components/Auth/Signup";
import LoginPage from "../components/Auth/LoginPage";
import ForgotPassword from "../components/Auth/ForgotPassword";
import PageLoader from "../components/constants/PageLoader";

const User_Dashboard = lazy(() => import("../components/User/User_Dashboard"));
const CreateTask = lazy(() => import("../components/User/CreateTask"));
const UserProfile = lazy(() => import("../components/User/UserProfile"));
const Registration = lazy(() => import("../components/Labor/Registration"));
const WorkerDashboard = lazy(() => import("../components/Labor/WorkerDashboard"));
const WorkerProfile = lazy(() => import("../components/Labor/WorkerProfile"));
const WorkerHistory = lazy(() => import("../components/Labor/WorkerHistory"));
const WorkerReviews = lazy(() => import("../components/Labor/WorkerReviews"));
const MyReviews = lazy(() => import("../components/User/MyReviews"));

/* Redirects unauthenticated users to /login, preserving the attempted path */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { authLoading } = useAuth();

  if (authLoading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="*" element={<LoginPage />} />

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* user routes - require login */}
        <Route path="/user"             element={<ProtectedRoute><User_Dashboard /></ProtectedRoute>} />
        <Route path="/user/profile"     element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/user/hire"        element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
        <Route path="/user/reviews"     element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />

        {/* Labor routes - require login */}
        <Route path="/worker"           element={<ProtectedRoute><Registration /></ProtectedRoute>} />
        <Route path="/worker/dashboard" element={<ProtectedRoute><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/worker/profile"   element={<ProtectedRoute><WorkerProfile /></ProtectedRoute>} />
        <Route path="/worker/history"   element={<ProtectedRoute><WorkerHistory /></ProtectedRoute>} />
        <Route path="/worker/reviews"   element={<ProtectedRoute><WorkerReviews /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
