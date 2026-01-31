import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock } from "react-icons/fi";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    console.log("Login Data:", form);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Image Section */}
      <div
        className="hidden md:flex w-3/5 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d')",
        }}
      >
        <div className="bg-black/60 flex flex-col justify-center items-center text-white p-10">
          <h1 className="text-5xl font-bold mb-4">Uber Labour</h1>
          <p className="text-xl text-center max-w-md">
            Find trusted workers or get hired for your skills — all in one place.
          </p>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Welcome Back</h2>

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

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Login
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
              <a href="/signup" className="text-blue-600 hover:underline font-medium">
                Sign up here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
