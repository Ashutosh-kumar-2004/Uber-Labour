import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useWorkerProfile from "../../hooks/worker/useWorkerProfile";
import {
  ArrowLeft,
  Mail,
  Phone,
  Star,
  Briefcase,
  Shield,
  Calendar,
  LogOut,
  ChevronRight,
  User as UserIcon,
  Zap,
  Award,
  TrendingUp,
  Edit3,
  IndianRupee,
  CheckCircle,
} from "lucide-react";

const WorkerProfile = () => {
  const { user, logout } = useAuth();
  const { data: profile, loading } = useWorkerProfile();
  const navigate = useNavigate();

  const worker = profile?.worker;
  const activeTask = profile?.activeTask;

  const memberSince = worker?.createdAt
    ? new Date(worker.createdAt).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    })
    : "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => navigate("/worker/dashboard")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span className="text-lg font-black uppercase tracking-tight">
          My Profile
        </span>
      </nav>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* ── Avatar Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 h-28 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.08),transparent)]" />
          </div>
          <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-zinc-400 bg-zinc-100">
              {user?.name?.[0] || "W"}
            </div>
            <h2 className="text-xl font-black mt-3 text-gray-900">
              {user?.name || "Worker"}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                Worker
              </span>
              {worker?.status === "verified" && (
                <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={10} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<Star size={18} className="text-amber-500" />}
            value={worker?.rating?.toFixed(1) || "0.0"}
            label="Rating"
            bg="bg-amber-50"
          />
          <StatCard
            icon={<CheckCircle size={18} className="text-green-500" />}
            value={worker?.completedTasks ?? 0}
            label="Completed"
            bg="bg-green-50"
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-blue-500" />}
            value={`${worker?.acceptanceRate ?? 100}%`}
            label="Acceptance"
            bg="bg-blue-50"
          />
        </div>

        {/* ── Account Info ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          <div className="px-6 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Account Details
            </p>
          </div>

          <InfoRow icon={<Mail size={16} />} label="Email" value={user?.email || "—"} />
          <InfoRow icon={<Phone size={16} />} label="Phone" value={user?.contactNumber || "Not set"} />
          <InfoRow
            icon={<Shield size={16} />}
            label="Aadhaar"
            value={worker?.adharCardNumber ? `XXXX-XXXX-${worker.adharCardNumber.slice(-4)}` : "—"}
          />
          <InfoRow icon={<Calendar size={16} />} label="Member Since" value={memberSince} />
        </div>

        {/* ── Services ── */}
        {worker?.services?.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                My Services
              </p>
            </div>
            <div className="px-6 pb-4 space-y-3">
              {worker.services.map((s, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900">
                      {s.category}
                    </p>
                    {s.subCategories?.length > 0 && (
                      <p className="text-[10px] text-gray-400 font-medium truncate">
                        {s.subCategories.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {s.hourlyRate && (
                      <p className="text-sm font-black text-green-600 flex items-center gap-0.5">
                        <IndianRupee size={12} />{s.hourlyRate}/hr
                      </p>
                    )}
                    {s.experience != null && (
                      <p className="text-[10px] text-gray-400 font-bold">
                        {s.experience} yr{s.experience !== 1 ? "s" : ""} exp
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Quick Actions ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Quick Actions
            </p>
          </div>

          <ActionRow
            icon={<Edit3 size={16} className="text-blue-500" />}
            label="Edit Profile"
            onClick={() => { }}
          />
          <ActionRow
            icon={<Award size={16} className="text-amber-500" />}
            label="My Reviews"
            onClick={() => { }}
          />
          <ActionRow
            icon={<LogOut size={16} className="text-red-500" />}
            label="Logout"
            danger
            onClick={() => logout()}
          />
        </div>

        {/* Bottom spacing */}
        <div className="h-6" />
      </main>
    </div>
  );
};

// ── Helper components ─────────────────────────────────
const StatCard = ({ icon, value, label, bg }) => (
  <div className={`${bg} rounded-2xl p-4 text-center border border-gray-100`}>
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-xl font-black text-gray-900">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
      {label}
    </p>
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="px-6 py-3.5 flex items-center gap-4">
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

const ActionRow = ({ icon, label, danger = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors ${danger ? "text-red-600" : "text-gray-700"
      }`}
  >
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <span className="text-sm font-bold flex-1 text-left">{label}</span>
    <ChevronRight size={16} className="text-gray-300" />
  </button>
);

export default WorkerProfile;
