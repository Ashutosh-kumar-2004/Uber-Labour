import React, { useState } from "react";
import {
  Upload,
  CheckCircle,
  Briefcase,
  Award,
  ShieldCheck,
} from "lucide-react";
import useWorkerRegistration from "../../hooks/user/useWorkerRegistration";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [step, setStep] = useState(1); // 1: Info, 2: Upload, 3: Pending
  const [formData, setFormData] = useState({
    primarySkill: "Construction & Renovation",
    contactNumber: "",
    experience: "",
    adharCardNumber: "",
    address: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const { registerWorker, loading, error, success } = useWorkerRegistration();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload your ID card.");
      return;
    }

    const payload = {
      ...formData,
      file,
    };

    try {
      await registerWorker(payload);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1 rounded">
              <Briefcase size={20} />
            </div>
            <span className="font-black uppercase tracking-tighter text-xl">
              Workify Partner
            </span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Step {step} of 3
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Professional Details
            </h2>
            <p className="text-gray-500 font-medium">
              Tell us about your expertise to get matched with tasks.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">
                  Primary Skill
                </label>
                <select
                  name="primarySkill"
                  value={formData.primarySkill}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-black rounded-xl font-bold appearance-none bg-white focus:ring-4 focus:ring-gray-100 transition-all"
                >
                  <option>Construction & Renovation</option>
                  <option>Maintenance & Repair</option>
                  <option>Household & Lifestyle</option>
                  <option>Design & Installation</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">
                  Contact Number
                </label>
                <input
                  type="number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1234567890"
                  className="w-full p-4 border-2 border-black rounded-xl font-bold"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className="w-full p-4 border-2 border-black rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">
                  Adhar Card Number (Mandatory)
                </label>
                <input
                  type="number"
                  name="adharCardNumber"
                  value={formData.adharCardNumber}
                  onChange={handleChange}
                  placeholder="e.g. 1234 5678 9012"
                  className="w-full p-4 border-2 border-black rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2">
                  Residential Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your full address"
                  className="w-full p-4 border-2 border-black rounded-xl font-bold"
                  required
                />
              </div>

              <button
                onClick={() => {
                  if (
                    !formData.adharCardNumber ||
                    !formData.address ||
                    !formData.contactNumber
                  ) {
                    alert("Please fill all mandatory fields");
                    return;
                  }
                  setStep(2);
                }}
                className="w-full py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all"
              >
                Continue to Verification
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Verify Identity
            </h2>
            <p className="text-gray-500 font-medium">
              Upload your Aadhaar or ID card to build trust with clients.
            </p>

            <label className="border-4 border-dashed border-gray-100 rounded-3xl p-12 flex flex-col items-center justify-center hover:border-black transition-colors cursor-pointer group relative overflow-hidden">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              {file ? (
                <div className="text-center w-full h-full">
                  <img
                    src={preview}
                    alt="ID Preview"
                    className="w-full h-48 object-contain mb-4 rounded-lg"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={20} className="text-green-500" />
                    <span className="font-bold uppercase tracking-widest text-xs text-green-600 block">
                      {file.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-2 block">
                    Click to change
                  </span>
                </div>
              ) : (
                <>
                  <Upload
                    size={48}
                    className="mb-4 group-hover:scale-110 transition-transform"
                  />
                  <span className="font-bold uppercase tracking-widest text-xs">
                    Drop ID Photo Here
                  </span>
                </>
              )}
            </label>

            {error && (
              <p className="text-red-500 text-sm font-bold text-center">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6 animate-in zoom-in duration-500">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-black">
                <ShieldCheck size={48} />
              </div>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              Under Review
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed px-8">
              Thanks for applying! Our team will verify your documents within 24
              hours. You'll receive an email once your dashboard is ready.
            </p>
            <Link to="/">
              <button className="px-8 py-3 border-2 border-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-black hover:text-white transition-all">
                Return to Home
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registration;
