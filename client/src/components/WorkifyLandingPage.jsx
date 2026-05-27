import React from "react";
import {
  Briefcase,
  MapPin,
  ShieldCheck,
  Bell,
  Search,
  ArrowRight,
  CheckCircle,
  Clock3,
  Users,
} from "lucide-react";
import Footer from "./Footer";

export default function WorkifyLandingPage() {
  return (
    <div className="min-h-screen bg-white text-black overflow-hidden">
      {/* NAVBAR */}
      <nav className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-xl">
              <Briefcase size={24} />
            </div>

            <h1 className="text-3xl font-black tracking-tight">Workify</h1>
          </div>

          <div className="hidden md:flex items-center gap-10 font-medium">
            <a href="#" className="hover:text-blue-600 transition">
              Home
            </a>

            <a href="#" className="hover:text-blue-600 transition">
              Find Work
            </a>

            <a href="#" className="hover:text-blue-600 transition">
              Post Task
            </a>

            <a href="#" className="hover:text-blue-600 transition">
              Categories
            </a>

            <a href="#" className="hover:text-blue-600 transition">
              Contact
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button className="border border-black px-5 py-2.5 rounded-xl font-semibold hover:bg-black hover:text-white transition">
              Log In
            </button>

            <button className="bg-black text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-600 transition">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm font-medium mb-8">
              <ShieldCheck size={16} className="text-blue-600" />
              Verified Workers • Real-Time Tracking
            </div>

            <h1 className="text-6xl leading-tight font-black tracking-tight">
              On-Demand Help,
              <br />
              Whenever You Need
            </h1>

            <p className="mt-7 text-xl text-gray-600 leading-relaxed max-w-2xl">
              Workify connects users with verified workers for real-world tasks.
              Post work, track workers live, verify arrivals using OTP, and get
              the job done securely.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <button className="bg-black hover:bg-blue-600 transition text-white px-7 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-lg">
                <Briefcase size={20} />
                Post a Task
              </button>

              <button className="border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition px-7 py-4 rounded-2xl font-semibold flex items-center gap-3">
                <Search size={20} />
                Find Work
              </button>
            </div>

            {/* SEARCH BAR */}
            <div className="mt-12 bg-white border border-gray-200 rounded-3xl p-5 shadow-xl">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-2xl p-4">
                  <p className="text-sm text-gray-500 mb-2">Select Category</p>

                  <select className="w-full outline-none font-semibold bg-transparent">
                    <option>All Categories</option>
                    <option>Electrician</option>
                    <option>Plumber</option>
                    <option>Painter</option>
                  </select>
                </div>

                <div className="border border-gray-200 rounded-2xl p-4">
                  <p className="text-sm text-gray-500 mb-2">Your Location</p>

                  <div className="flex items-center gap-2 font-semibold">
                    <MapPin size={18} />
                    Use My Location
                  </div>
                </div>

                <button className="bg-black hover:bg-blue-600 transition text-white rounded-2xl font-semibold flex items-center justify-center gap-3">
                  Find Nearby Workers
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* FEATURES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <FeatureCard
                icon={<ShieldCheck size={24} />}
                title="Verified Workers"
                subtitle="100% Verified"
              />

              <FeatureCard
                icon={<MapPin size={24} />}
                title="Live Tracking"
                subtitle="Real-time GPS"
              />

              <FeatureCard
                icon={<Bell size={24} />}
                title="Instant Alerts"
                subtitle="Task Notifications"
              />

              <FeatureCard
                icon={<Clock3 size={24} />}
                title="24/7 Support"
                subtitle="Always Available"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative flex justify-center">
            {/* PHONE */}
            <div className="relative z-10 w-85 h-172.5 bg-black rounded-[45px] p-4 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[36px] overflow-hidden">
                {/* APP HEADER */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xl">Live Tracking</h3>

                    <span className="bg-black text-white text-xs px-3 py-1 rounded-full">
                      LIVE
                    </span>
                  </div>
                </div>

                {/* MAP */}
                <div className="relative h-72 bg-gray-100 overflow-hidden">
                  <div className="absolute inset-0 opacity-40">
                    <div className="grid grid-cols-6 h-full">
                      {[...Array(36)].map((_, i) => (
                        <div key={i} className="border border-gray-200" />
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-10 left-10 bg-white px-4 py-3 rounded-2xl shadow-lg">
                    <p className="font-semibold text-sm">
                      Worker is on the way
                    </p>

                    <p className="text-xs text-gray-500 mt-1">2.4 km away</p>
                  </div>

                  <div className="absolute bottom-16 left-16 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                    <Users size={22} />
                  </div>

                  <div className="absolute top-28 right-20 w-5 h-5 rounded-full bg-blue-600" />

                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 300 300"
                  >
                    <path
                      d="M80 220 C120 200, 160 160, 220 120"
                      stroke="black"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="8 8"
                    />
                  </svg>
                </div>

                {/* WORKER CARD */}
                <div className="p-5">
                  <div className="border border-gray-200 rounded-3xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center">
                        <Users size={28} />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold text-lg">Ramesh Kumar</h4>

                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-yellow-500">★</span>

                          <span className="font-medium">4.8</span>

                          <span className="text-gray-500 text-sm">
                            120 tasks completed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <button className="border border-gray-300 py-3 rounded-2xl font-semibold hover:border-blue-600 hover:text-blue-600 transition">
                        Call
                      </button>

                      <button className="bg-black text-white py-3 rounded-2xl font-semibold hover:bg-blue-600 transition">
                        Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WORKER SVG STYLE */}
            <div className="absolute right-0 bottom-0 hidden lg:block">
              <div className="relative">
                <div className="w-65 h-125 relative">
                  {/* HEAD */}
                  <div className="w-28 h-28 rounded-full border-4 border-black bg-white absolute top-0 left-16 z-20" />

                  {/* CAP */}
                  <div className="absolute top-0 left-14 w-32 h-14 bg-blue-600 rounded-t-full border-4 border-black z-30" />

                  {/* BODY */}
                  <div className="absolute top-24 left-10 w-44 h-56 bg-blue-600 border-4 border-black rounded-[40px]" />

                  {/* HANDS */}
                  <div className="absolute top-40 left-0 w-24 h-10 bg-white border-4 border-black rounded-full rotate-12" />

                  <div className="absolute top-40 right-0 w-24 h-10 bg-white border-4 border-black rounded-full -rotate-12" />

                  {/* LEGS */}
                  <div className="absolute bottom-0 left-16 w-12 h-36 bg-blue-600 border-4 border-black rounded-b-3xl" />

                  <div className="absolute bottom-0 right-16 w-12 h-36 bg-blue-600 border-4 border-black rounded-b-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-5xl font-black tracking-tight">
              How Workify Works
            </h2>

            <p className="text-gray-600 text-lg mt-5">
              Simple steps to get your work done quickly
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mt-16">
            <StepCard
              number="1"
              title="Post a Task"
              description="Add budget, category, schedule, and task details."
            />

            <StepCard
              number="2"
              title="Get Matched"
              description="Nearby verified workers receive your task instantly."
            />

            <StepCard
              number="3"
              title="Track Live"
              description="Monitor worker location and receive arrival OTP."
            />

            <StepCard
              number="4"
              title="Work Completed"
              description="Verify completion, review worker, and close task."
            />
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
}

function FeatureCard({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-2xl border border-gray-200 flex items-center justify-center">
        {icon}
      </div>

      <div>
        <h4 className="font-bold">{title}</h4>

        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }) {
  return (
    <div className="border border-gray-200 rounded-3xl p-8 hover:border-blue-600 transition-all duration-300">
      <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-black">
        {number}
      </div>

      <h3 className="text-2xl font-bold mt-6">{title}</h3>

      <p className="text-gray-600 leading-relaxed mt-4">{description}</p>

      <div className="mt-6">
        <CheckCircle className="text-blue-600" size={28} />
      </div>
    </div>
  );
}
