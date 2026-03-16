import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useWorkerProfile from "../../hooks/worker/useWorkerProfile";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Mail,
  Phone,
  FileImage,
  Shield,
  ExternalLink,
  User,
  CircleCheck,
  CircleX,
} from "lucide-react";

const WorkerProfile = () => {
  const { user: authUser } = useAuth();
  const { data: profile, loading, updateProfile } = useWorkerProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("contact");
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
  });

  const profileUser = profile?.user || authUser;
  const worker = profile?.worker;

  useEffect(() => {
    setForm({
      name: profileUser?.name || "",
      email: profileUser?.email || "",
      contactNumber: profileUser?.contactNumber || "",
      address: profileUser?.address || "",
    });
    setProfilePreview(profileUser?.profileImage || "");
  }, [
    profileUser?.name,
    profileUser?.email,
    profileUser?.contactNumber,
    profileUser?.address,
    profileUser?.profileImage,
  ]);

  const memberSince = profileUser?.createdAt
    ? new Date(profileUser.createdAt).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    })
    : "N/A";

  const maskedAadhaar = useMemo(() => {
    if (!worker?.adharCardNumber) return "Not available";
    return `XXXX-XXXX-${worker.adharCardNumber.slice(-4)}`;
  }, [worker?.adharCardNumber]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showPopup = (type, message) => {
    setPopup({ type, message });
    window.setTimeout(() => setPopup(null), 2500);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        contactNumber: form.contactNumber,
        address: form.address,
      });
      showPopup("success", "Profile updated successfully.");
    } catch (error) {
      showPopup("error", error.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {popup && (
        <div className="fixed top-5 right-5 z-120 animate-in slide-in-from-top-2 fade-in duration-300">
          <div
            className={`min-w-65 max-w-sm rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm text-sm font-medium flex items-center gap-2 ${
              popup.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {popup.type === "success" ? <CircleCheck size={16} /> : <CircleX size={16} />}
            <span>{popup.message}</span>
          </div>
        </div>
      )}

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

      <main className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-[300px_1fr]">
            <aside className="border-r border-gray-200 p-5 space-y-5 bg-gray-50/60">
              <p className="text-xs font-bold tracking-wide text-gray-500 uppercase">
                Account Management
              </p>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="aspect-4/3 w-full rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-500 px-3">
                      <User size={26} className="mx-auto mb-2" />
                      <p className="text-xs font-medium">No profile image uploaded</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
                <p className="text-xs font-bold uppercase text-gray-500">Verification</p>
                <p className="text-sm font-semibold text-gray-800">Aadhaar: {maskedAadhaar}</p>
                <p className="text-sm text-gray-700">Member since: {memberSince}</p>
                <p className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700">
                  <CheckCircle size={12} /> {worker?.status || "pending"}
                </p>
              </div>
            </aside>

            <section className="p-5 md:p-6">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-4 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("contact")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === "contact"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Contact Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("documents")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    activeTab === "documents"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Documents
                </button>
              </div>

              {activeTab === "contact" ? (
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Update your profile and contact information. Email is locked.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Name</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email (read-only)</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          name="email"
                          value={form.email}
                          readOnly
                          disabled
                          className="w-full border border-gray-200 bg-gray-100 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          name="contactNumber"
                          value={form.contactNumber}
                          onChange={onChange}
                          maxLength={10}
                          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                          placeholder="10-digit phone"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                      <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-700 capitalize">
                        {worker?.status || "pending"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                      placeholder="Your address"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-800 disabled:opacity-60"
                  >
                    <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Uploaded Documents</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      You can view the document used for worker verification.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                      <Shield size={15} /> Aadhaar: <span className="font-semibold">{maskedAadhaar}</span>
                    </p>

                    {worker?.idCardImage ? (
                      <>
                        <img
                          src={worker.idCardImage}
                          alt="Worker ID"
                          className="w-full max-w-xl rounded-xl border border-gray-200"
                        />
                        <a
                          href={worker.idCardImage}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-blue-700 hover:text-blue-800"
                        >
                          Open document in new tab <ExternalLink size={14} />
                        </a>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">No document uploaded yet.</div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerProfile;
