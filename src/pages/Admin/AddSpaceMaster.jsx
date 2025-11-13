import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Get API URL from Vite environment variable
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

  // ✅ Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle image input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, JPEG)");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ Helpers
  const isPositiveNumber = (val) => {
    if (val === "" || val === null) return false;
    const num = Number(val);
    return !Number.isNaN(num) && num >= 0;
  };

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

  // ✅ Validation
  const validate = () => {
    if (!form.space_code.trim()) {
      toast.error("Space Code is required");
      return false;
    }
    if (!form.space.trim()) {
      toast.error("Space name is required");
      return false;
    }

    const hasAnyRate =
      form.per_hour !== "" || form.per_day !== "" || form.per_month !== "";
    if (!hasAnyRate) {
      toast.error("Please supply at least one rate (Per Hour / Per Day / Per Month).");
      return false;
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
        toast.error(`${fieldLabel(key)} must be a valid non-negative number`);
        return false;
      }
    }

    if (form.min_duration !== "" && form.max_duration !== "") {
      if (Number(form.min_duration) > Number(form.max_duration)) {
        toast.error("Min Duration cannot be greater than Max Duration");
        return false;
      }
    }

    if (!image) {
      toast.error("Please upload a space image");
      return false;
    }

    return true;
  };

  // ✅ Field definitions
  const rateFields = [
    { name: "per_hour", label: "Per Hour" },
    { name: "per_day", label: "Per Day" },
    { name: "per_month", label: "Per Month" },
  ];

  const weekFields = [
    { name: "one_week", label: "One Week" },
    { name: "two_weeks", label: "Two Weeks" },
    { name: "three_weeks", label: "Three Weeks" },
  ];

  const durationFields = [
    { name: "min_duration", label: "Min Duration", inputMode: "numeric" },
    { name: "min_duration_desc", label: "Min Duration Description" },
    { name: "max_duration", label: "Max Duration", inputMode: "numeric" },
  ];

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) =>
        payload.append(k, v === null || v === undefined ? "" : v)
      );
      payload.append("image", image);

      const res = await fetch(`${API_URL}/add_space.php`, {
        method: "POST",
        body: payload,
      });

      // ✅ Handle invalid/non-JSON responses
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid or unexpected server response");
      }

      if (res.ok && data?.success) {
        toast.success("Space added successfully!");
        setTimeout(() => navigate("/admin/space-master-list"), 700);
      } else {
        toast.error(data?.message || "Failed to add space");
      }
    } catch (err) {
      console.error("Add space error:", err);
      toast.error(err.message || "Something went wrong while adding space");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render
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

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm rounded-lg p-6 border border-orange-100"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-4">
            {/* Space Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Space Code <span className="text-red-500">*</span>
              </label>
              <input
                name="space_code"
                value={form.space_code}
                onChange={handleChange}
                placeholder="Enter Space Code.."
                className="w-full border border-orange-400 rounded px-3 py-2 focus:outline-none"
              />
            </div>

            {/* Space */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Space <span className="text-red-500">*</span>
              </label>
              <input
                name="space"
                value={form.space}
                onChange={handleChange}
                placeholder="Enter Space.."
                className="w-full border border-orange-400 rounded px-3 py-2 focus:outline-none"
              />
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rateFields.map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-sm text-gray-700 mb-1">{label}</label>
                  <input
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={`${label} Rate..`}
                    inputMode="numeric"
                    className="w-full border border-orange-400 rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            {/* Multi-week rates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {weekFields.map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-sm text-gray-700 mb-1">{label}</label>
                  <input
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={`${label} Rate..`}
                    inputMode="numeric"
                    className="w-full border border-orange-400 rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            {/* Durations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {durationFields.map(({ name, label, inputMode }) => (
                <div key={name}>
                  <label className="block text-sm text-gray-700 mb-1">{label}</label>
                  <input
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={`${label}..`}
                    inputMode={inputMode}
                    className="w-full border border-orange-400 rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>

            {/* Max Duration Description */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Max Duration Description
              </label>
              <input
                name="max_duration_desc"
                value={form.max_duration_desc}
                onChange={handleChange}
                placeholder="Max Duration Description.."
                className="w-full border border-orange-400 rounded px-3 py-2"
              />
            </div>

            {/* Image Upload */}
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
            {/* Image Preview */}
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

            {/* Status */}
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

            {/* Submit */}
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
    </div>
  );
};

export default AddSpaceMaster;
