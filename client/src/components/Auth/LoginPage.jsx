import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useLogin from "../../hooks/auth/useLogin";
import ImageSection from "./ImageSection";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [localError, setLocalError] = useState("");
  const { loginUser, loading, error: loginError } = useLogin();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setLocalError(""); // Clear local error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setLocalError("Please fill in all fields");
      return;
    }

    try {
      const response = await loginUser(form);
      const userType = response.user.userType;
      console.log(response);
      if (userType === "admin") {
        navigate("/admin");
      } else if (userType === "worker" && response.user.isVerified === false) {
        navigate("/worker");
      } 
      else if (userType === "worker" && response.user.isVerified === true) {
        navigate("/worker/dashboard");
      }
      else {
        navigate("/user");
      }
    } catch (err) {
      // Error is handled by the hook and exposed via loginError
      console.error("Login failed", err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Image Section */}
      <ImageSection />
      

      {/* Right Login Form */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <FiMail className="absolute top-4 left-3 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute top-4 left-3 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:ring-black"
              />

              <div className="text-right mt-1">
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
            </div>

            {(localError || loginError) && (
              <p className="text-red-500 text-sm">{localError || loginError}</p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <hr className="flex-grow border-gray-300" />
              <span className="text-gray-400 text-sm">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border py-3 rounded-lg hover:bg-gray-100 transition"
            >
              <FcGoogle size={22} />
              Continue with Google
            </button>

            {/* Signup Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Don’t have an account?{" "}
              <a
                href="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
