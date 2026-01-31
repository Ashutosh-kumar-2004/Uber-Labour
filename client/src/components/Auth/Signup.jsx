import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    userType: "user",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!/^[A-Za-z\s]+$/.test(form.name)) {
      newErrors.name = "Name should not contain special characters or numbers";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(form.password)
    ) {
      newErrors.password =
        "Password must be 8+ chars with uppercase, lowercase, number & special character";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form Submitted", form);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Image Section */}
      <div
        className="hidden md:flex w-3/5 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521791136064-7986c2920216')",
        }}
      >
        <div className="bg-black/50 flex flex-col justify-center items-center text-white p-10">
          <h1 className="text-5xl font-bold mb-4">Uber Labour</h1>
          <p className="text-xl text-center max-w-md">
            Connecting skilled workers with opportunities — fast, reliable, and secure.
          </p>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full md:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* User Type */}
            <div className="flex gap-6">
                Account Type: 
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="userType"
                  value="user"
                  checked={form.userType === "user"}
                  onChange={handleChange}
                />
                User
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="userType"
                  value="worker"
                  checked={form.userType === "worker"}
                  onChange={handleChange}
                />
                Worker
              </label>
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Sign Up
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <hr className="flex-grow border-gray-300" />
              <span className="text-gray-400 text-sm">OR</span>
              <hr className="flex-grow border-gray-300" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border py-3 rounded-lg hover:bg-gray-100 transition"
            >
              <FcGoogle size={22} />
              Sign up with Google
            </button>

            {/* Already have account */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                Login here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
