import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Shield,
  Wallet,
  Calendar,
  LogOut,
  ChevronRight,
  User as UserIcon,
  Star,
  Edit3,
} from "lucide-react";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    })
    : "N/A";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => navigate("/user")}
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
              {user?.name?.[0] || "U"}
            </div>
            <h2 className="text-xl font-black mt-3 text-gray-900">
              {user?.name || "User"}
            </h2>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full mt-1">
              Job Poster
            </span>
          </div>
        </div>

        {/* ── Info Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          <div className="px-6 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
              Account Details
            </p>
          </div>

          <InfoRow icon={<Mail size={16} />} label="Email" value={user?.email || "—"} />
          <InfoRow icon={<Phone size={16} />} label="Phone" value={user?.contactNumber || "Not set"} />
          <InfoRow icon={<MapPin size={16} />} label="Address" value={user?.address || "Not set"} />
          <InfoRow icon={<Shield size={16} />} label="Verified" value={user?.isVerified ? "✅ Yes" : "❌ No"} />
          <InfoRow icon={<Calendar size={16} />} label="Member Since" value={memberSince} />
          <InfoRow
            icon={<Wallet size={16} />}
            label="Wallet"
            value={
              <span className={user?.walletBalance < 0 ? "text-red-600" : "text-green-600"}>
                ₹{user?.walletBalance ?? 0}
              </span>
            }
          />
        </div>

        {/* ── Quick Actions ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Quick Actions
            </p>
          </div>

          <ActionRow
            icon={<Edit3 size={16} className="text-blue-500" />}
            label="Edit Profile"
            onClick={() => { }}
          />
          <ActionRow
            icon={<Star size={16} className="text-amber-500" />}
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
      </main>
    </div>
  );
};

// ── Row helpers ─────────────────────────────────────
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

export default UserProfile;
