import { useState, useMemo, useEffect } from "react";
import { ChevronDown, X, Camera } from "lucide-react";
import {
  TIME_SLOTS,
  TASK_CATEGORIES,
  TASK_FORM_DEFAULTS,
  MAX_DESCRIPTION_LENGTH,
  PHONE_REGEX,
} from "../../constants/user/task.constants";
import Map from "../../map/User/Map";

export default function CreateTask() {
  const [formData, setFormData] = useState(TASK_FORM_DEFAULTS);
  const [previewImage, setPreviewImage] = useState(null);

  const selectedCategory = useMemo(
    () => TASK_CATEGORIES.find((c) => c.id === formData.category),
    [formData.category],
  );

  const selectedSubCategory = useMemo(
    () =>
      selectedCategory?.subCategories.find(
        (s) => s.label === formData.subcategory,
      ),
    [formData.subcategory, selectedCategory],
  );

  const minPrice =
    selectedSubCategory?.minPrice || selectedCategory?.minPrice || null;

  useEffect(() => {
    if (minPrice) {
      setFormData((prev) => ({ ...prev, cost: minPrice }));
    }
  }, [minPrice]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && { subcategory: "", cost: "" }),
    }));
  };

  const toggleSlot = (slot) => {
    setFormData((prev) => ({
      ...prev,
      availabilityTimeSlots: prev.availabilityTimeSlots.includes(slot)
        ? prev.availabilityTimeSlots.filter((s) => s !== slot)
        : [...prev.availabilityTimeSlots, slot],
    }));
  };

  /* IMAGE HANDLING */

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 3) return;

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const handleLocationSelect = async (lat, lng) => {
    // 1. Update form location state
    setFormData((prev) => ({
      ...prev,
      location: { lat, lng },
    }));

    // 2. Reverse Geocode using Nominatim (OSM)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await response.json();

      if (data && data.display_name) {
        setFormData((prev) => ({
          ...prev,
          address: data.display_name,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch address:", error);
      // Optional: don't overwrite address if fetch fails, or show toast
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewImage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Task Data:", formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* MAIN CONTAINER */}
      <div className="w-[80%] h-[80vh] grid grid-cols-2 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-lg shadow-xl border">
        {/* MAP */}
        <div className="relative bg-gray-200 flex flex-col items-center justify-center">
          <Map
            onLocationSelect={handleLocationSelect}
            selectedLocation={formData.location}
          />
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4 no-scrollbar"
        >
          <h1 className="text-2xl font-semibold text-gray-900">Create Task</h1>

          {/* CATEGORY & SUBCATEGORY ROW */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="relative">
                <select
                  name="category"
                  onChange={handleChange}
                  className="w-full rounded-lg border px-4 py-2 appearance-none bg-white pr-10"
                  required
                >
                  <option value="">Select Category</option>
                  {TASK_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <div className="relative">
                <select
                  name="subcategory"
                  onChange={handleChange}
                  disabled={!selectedCategory}
                  className="w-full rounded-lg border px-4 py-2 appearance-none bg-white pr-10 disabled:bg-gray-100 disabled:text-gray-400"
                  required
                >
                  <option value="">Select Subcategory</option>
                  {selectedCategory?.subCategories.map((s) => (
                    <option key={s.label} value={s.label}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              name="taskTitle"
              value={formData.taskTitle}
              onChange={handleChange}
              placeholder="Task title"
              className="w-full rounded-lg border px-4 py-2"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              maxLength={MAX_DESCRIPTION_LENGTH}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your task"
              className="w-full rounded-lg border px-4 py-2 h-24 resize-none"
            />
            <p className="text-xs text-gray-400 text-right">
              {formData.description.length}/{MAX_DESCRIPTION_LENGTH}
            </p>
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              className="w-full rounded-lg border px-4 py-2 h-20 resize-none"
              required
            />
          </div>

          {/* CONTACT DETAILS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="10-digit mobile"
                className="w-full rounded-lg border px-4 py-2"
                pattern={PHONE_REGEX.source}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Phone{" "}
                <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                name="alternateContactNumber"
                value={formData.alternateContactNumber}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full rounded-lg border px-4 py-2"
                pattern={PHONE_REGEX.source}
              />
            </div>
          </div>

          {/* BUDGET DISPLAY */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget
            </label>
            <div className="w-full rounded-lg border px-4 py-2 bg-gray-50 text-gray-900 font-medium">
              {minPrice ? `₹${minPrice}` : "Select category to see budget"}
            </div>
          </div>

          {/* AVAILABILITY (DATE & TIME) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>

            <div className="mb-3">
              <input
                type="date"
                name="availabilityDate"
                value={formData.availabilityDate}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-2"
                required
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => toggleSlot(slot.value)}
                  className={`px-4 py-2 rounded-full border text-sm cursor-pointer ${
                    formData.availabilityTimeSlots.includes(slot.value)
                      ? "bg-black text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* IMAGES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Task Images{" "}
              <span className="text-gray-400 font-normal">(Max 3)</span>
            </label>

            <div className="flex flex-wrap gap-4">
              {/* PREVIEW LIST */}
              {formData.images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group shadow-sm"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    onClick={() => setPreviewImage({ img, index: i })}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(i);
                    }}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 backdrop-blur-sm transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* UPLOAD BUTTON */}
              {formData.images.length < 3 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-all group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageAdd}
                    className="hidden"
                    disabled={formData.images.length >= 3}
                  />
                  <div className="bg-gray-100 p-2 rounded-full mb-1 group-hover:bg-gray-200 transition-colors">
                    <Camera size={20} className="text-gray-500" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                    Add Photo
                  </span>
                </label>
              )}
            </div>
          </div>

          <button className="w-full py-3 rounded-xl bg-black text-white font-medium cursor-pointer">
            Post Task
          </button>
        </form>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="relative bg-white rounded-xl p-4 max-w-lg">
            <img
              src={URL.createObjectURL(previewImage.img)}
              alt="full preview"
              className="max-h-[70vh] rounded-lg"
            />
            <button
              onClick={() => removeImage(previewImage.index)}
              className="mt-4 w-full py-2 bg-red-600 text-white rounded-lg cursor-pointer"
            >
              Remove Image
            </button>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
