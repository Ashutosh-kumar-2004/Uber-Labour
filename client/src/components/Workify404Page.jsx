import React from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";

const Workify404Page = () => {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col overflow-hidden">
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="grid grid-cols-12 h-full">
          {[...Array(144)].map((_, i) => (
            <div key={i} className="border border-gray-200" />
          ))}
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">🔧</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight">Workify</h1>
          </div>

          {/* BUTTON */}
          <Link
            to="/"
            className="px-6 py-3 border border-gray-300 rounded-2xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
          >
            Go Home
          </Link>
        </div>
      </nav>

      {/* MAIN */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}
          <div>
            {/* TITLE */}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-5 leading-tight">
              Oops! <br />
              Page Not Found
            </h1>

            {/* DESCRIPTION */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl mb-12">
              The page you're looking for may have been moved, deleted, or never
              existed. Let’s get you back to Workify and help you find trusted
              workers faster.
            </p>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-5">
              <Link
                to="/"
                className="px-8 py-4 bg-black text-white rounded-2xl font-semibold hover:bg-blue-600 transition-all duration-300 active:scale-95 shadow-xl"
              >
                ← Back to Home
              </Link>

              <button
                onClick={() => window.history.back()}
                className="px-8 py-4 border border-gray-300 rounded-2xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300"
              >
                Go Back
              </button>
            </div>
          </div>

          {/* RIGHT ILLUSTRATION */}
          <div className="flex justify-center">
            <div className="relative w-[320px] h-80">
              {/* MAIN 404 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-[180px] md:text-[220px] font-black text-gray-100 select-none leading-none">
                  404
                </h1>
              </div>

              {/* FLOATING SEARCH */}
              <div className="absolute top-10 left-10 w-24 h-24 rounded-full border-[6px] border-black bg-white flex items-center justify-center shadow-2xl">
                <div className="w-10 h-10 rounded-full border-4 border-black relative">
                  <div className="absolute -bottom-4 -right-4 w-6 h-2 bg-blue-600 rotate-45 rounded-full border border-black" />
                </div>
              </div>

              {/* FLOATING CARD */}
              <div className="absolute bottom-12 right-0 bg-white border-2 border-black rounded-3xl px-6 py-4 shadow-2xl rotate-6">
                <p className="font-bold text-lg">Route Lost</p>

                <p className="text-sm text-gray-500 mt-1">Worker not found</p>
              </div>

              {/* BLUE CIRCLE */}
              <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-blue-600 border-4 border-black" />

              {/* BLACK SHAPE */}
              <div className="absolute top-0 right-8 w-10 h-10 rounded-2xl bg-black rotate-12" />

              {/* ORBIT */}
              <svg
                className="absolute inset-0 w-full h-full animate-spin"
                style={{ animationDuration: "18s" }}
                viewBox="0 0 320 320"
              >
                <circle
                  cx="160"
                  cy="160"
                  r="120"
                  stroke="black"
                  strokeWidth="3"
                  strokeDasharray="10 10"
                  fill="none"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Workify404Page;
