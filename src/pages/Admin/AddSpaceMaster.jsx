import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const AddSpaceMaster = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    space_code: "",
    space: "",
    per_hour: "",
    per_day: "",
    one_week: "",
    two_weeks: "",
    three_weeks: "",
    per_month: "",
    min_duration: "",
    min_duration_desc: "",
    max_duration: "",
    max_duration_desc: "",
    status: "Active",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // -------------------------
  // Simplified Positive Number Check
  // -------------------------
  const isPositiveNumber = (val) => val !== "" && !isNaN(val) && Number(val) >= 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------
  // Improved Image Handling + Memory Optimization
  // -------------------------
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, JPEG)");
      return;
    }

    // Revoke old object URL to save memory (CPU optimization)
    if (preview) URL.revokeObjectURL(preview);

    const newPreviewURL = URL.createObjectURL(file);
    setImage(file);
    setPreview(newPreviewURL);
  };

  // Cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const fieldLabel = (key) => {
    const map = {
      space_code: "Space Code",
      space: "Space",
      per_hour: "Per Hour",
      per_day: "Per Day",
      one_week: "One Week",
      two_weeks: "Two Weeks",
      three_weeks: "Three Weeks",
      per_month: "Per Month",
      min_duration: "Min Duration",
      max_duration: "Max Duration",
    };
    return map[key] || key;
  };

  // -------------------------
  // Validation
  // -------------------------
  const validate = () => {
    if (!form.space_code.trim()) return toast.error("Space Code is required");
    if (!form.space.trim()) return toast.error("Space name is required");

    const hasAnyRate =
      form.per_hour !== "" || form.per_day !== "" || form.per_month !== "";

    if (!hasAnyRate) {
      return toast.error("Please supply at least one rate (Hour/Day/Month).");
    }

    const numericFields = [
      "per_hour",
      "per_day",
      "one_week",
      "two_weeks",
      "three_weeks",
      "per_month",
      "min_duration",
      "max_duration",
    ];

    for (const key of numericFields) {
      const val = form[key];
      if (val !== "" && !isPositiveNumber(val)) {
        return toast.error(`${fieldLabel(key)} must be a valid non-negative number`);
      }
    }

    if (form.min_duration && form.max_duration) {
      if (Number(form.min_duration) > Number(form.max_duration)) {
        return toast.error("Min Duration cannot be greater than Max Duration");
      }
    }

    if (!image) return toast.error("Please upload a space image");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v || ""));
      payload.append("image", image);

      const res = await fetch(`${API_URL}/add_space.php`, {
        method: "POST",
        body: payload,
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid or unexpected server response");
      }

      if (res.ok && data.success) {
        toast.success("Space added successfully!");
        setTimeout(() => navigate("/admin/space-master-list"), 600);
      } else {
        toast.error(data?.message || "Failed to add space");
      }
    } catch (err) {
      toast.error(err.message || "Error adding space");
    } finally {
      setLoading(false);
    }
  };

  // Render UI -------------------------------------
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Add New Space</h1>
        <button
          onClick={() => navigate("/admin/space-master-list")}
          className="px-3 py-1 border border-orange-400 text-orange-500 rounded hover:bg-orange-50 transition"
        >
          Space List
        </button>
      </div>

      {/* --- FORM START --- */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Space Code <span className="text-red-500">*</span>
              </label>
              <input
                name="space_code"
                value={form.space_code}
                onChange={handleChange}
                className="w-full border border-orange-400 rounded px-3 py-2"
                placeholder="Enter Space Code..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Space <span className="text-red-500">*</span>
              </label>
              <input
                name="space"
                value={form.space}
                onChange={handleChange}
                className="w-full border border-orange-400 rounded px-3 py-2"
                placeholder="Enter Space..."
              />
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["per_hour", "per_day", "per_month"].map((f) => (
                <div key={f}>
                  <label className="block text-sm text-gray-700 mb-1">
                    {fieldLabel(f)}
                  </label>
                  <input
                    name={f}
                    value={form[f]}
                    onChange={handleChange}
                    inputMode="numeric"
                    className="w-full border border-orange-400 rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            {/* Weekly Rates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["one_week", "two_weeks", "three_weeks"].map((f) => (
                <div key={f}>
                  <label className="block text-sm text-gray-700 mb-1">
                    {fieldLabel(f)}
                  </label>
                  <input
                    name={f}
                    value={form[f]}
                    onChange={handleChange}
                    inputMode="numeric"
                    className="w-full border border-orange-400 rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            {/* Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["min_duration", "min_duration_desc", "max_duration"].map((f) => (
                <div key={f}>
                  <label className="block text-sm text-gray-700 mb-1">
                    {fieldLabel(f)}
                  </label>
                  <input
                    name={f}
                    value={form[f]}
                    onChange={handleChange}
                    inputMode={f.includes("duration") ? "numeric" : "text"}
                    className="w-full border border-orange-400 rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Max Duration Description
              </label>
              <input
                name="max_duration_desc"
                value={form.max_duration_desc}
                onChange={handleChange}
                className="w-full border border-orange-400 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Space Image <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-orange-400 rounded px-3 py-2 bg-white"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 flex flex-col items-center">
            <div className="w-full flex justify-center mt-2">
              <div className="p-2 border border-orange-300 rounded-lg bg-orange-50 shadow-sm">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-64 h-64 object-cover rounded-md shadow-md"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">
                    No image selected
                  </div>
                )}
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-orange-400 rounded px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="pt-4 w-full">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition disabled:opacity-60"
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </form>
      {/* --- FORM END --- */}
    </div>
  );
};

export default AddSpaceMaster;
