// AddSpaceMaster.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Configuration & Defaults
 * - Keep these near the top for easy editing
 */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

export const SPACE_GROUPS = {
  Workspace: { prefix: "WS", max: 45 },
  "Team Leads Cubicle": { prefix: "TLC", max: 4 },
  "Manager Cubicle": { prefix: "MC", max: 2 },
  "Video Conferencing": { prefix: "VC", max: 1 },
  "Executive Cabin": { prefix: "EC", max: 2 },
  "CEO Cabin": { prefix: "CD", max: 1 },
};

// Friendly labels for validation messages
const FIELD_LABELS = {
  space_code: "Space Code",
  space: "Space Type",
  per_hour: "Per Hour",
  per_day: "Per Day",
  per_month: "Per Month",
  one_week: "One Week",
  two_weeks: "Two Weeks",
  three_weeks: "Three Weeks",
  min_duration: "Min Duration",
  min_duration_desc: "Min Duration (text)",
  max_duration: "Max Duration",
  max_duration_desc: "Max Duration (text)",
  image: "Image",
};

// Default empty form (use this to reset)
const DEFAULT_FORM = {
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
};

// Default prices pulled from your screenshot (used to auto-populate when selecting a type)
const DEFAULT_PRICES = {
  Workspace: {
    per_hour: "100",
    per_day: "500",
    one_week: "4800",
    two_weeks: "5760",
    three_weeks: "7200",
    per_month: "4000",
    min_duration: "1",
    min_duration_desc: "1 Day",
    max_duration: "30",
    max_duration_desc: "30 Day",
  },
  "Team Leads Cubicle": {
    per_hour: "120",
    per_day: "600",
    one_week: "5760",
    two_weeks: "6912",
    three_weeks: "8640",
    per_month: "4500",
    min_duration: "1",
    min_duration_desc: "1 Day",
    max_duration: "30",
    max_duration_desc: "30 Day",
  },
  "Manager Cubicle": {
    per_hour: "120",
    per_day: "750",
    one_week: "7200",
    two_weeks: "8640",
    three_weeks: "10800",
    per_month: "6000",
    min_duration: "1",
    min_duration_desc: "1 Day",
    max_duration: "30",
    max_duration_desc: "30 Day",
  },
  "Video Conferencing": {
    per_hour: "100",
    per_day: "",
    one_week: "",
    two_weeks: "",
    three_weeks: "",
    per_month: "",
    min_duration: "1",
    min_duration_desc: "1 Hour",
    max_duration: "8",
    max_duration_desc: "8 Hour",
  },
  "Executive Cabin": {
    per_hour: "200",
    per_day: "1000",
    one_week: "",
    two_weeks: "",
    three_weeks: "",
    per_month: "15000",
    min_duration: "1",
    min_duration_desc: "1 Hour",
    max_duration: "8",
    max_duration_desc: "8 Hour",
  },
  "CEO Cabin": {
    per_hour: "500",
    per_day: "4000",
    one_week: "",
    two_weeks: "",
    three_weeks: "",
    per_month: "50000",
    min_duration: "1",
    min_duration_desc: "1 Hour",
    max_duration: "8",
    max_duration_desc: "8 Hour",
  },
};

const AddSpaceMaster = () => {
  const navigate = useNavigate();

  // states
  const [loading, setLoading] = useState(false);
  const [allCodes, setAllCodes] = useState([]); // existing codes fetched from server
  const [form, setForm] = useState(DEFAULT_FORM);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // ---------- Fetch existing codes ----------
  const fetchExistingCodes = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/get_spaces.php`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.spaces)) {
        setAllCodes(data.spaces.map((s) => s.space_code).filter(Boolean));
      } else {
        setAllCodes([]);
      }
    } catch (err) {
      console.error("fetchExistingCodes error", err);
      setAllCodes([]);
    }
  }, []);

  useEffect(() => {
    fetchExistingCodes();
  }, [fetchExistingCodes]);

  // ---------- Generate next available code ----------
  const generateNextCode = useCallback(
    (spaceName) => {
      const group = SPACE_GROUPS[spaceName];
      if (!group) return "";
      const { prefix, max } = group;

      const usedNumbers = allCodes
        .filter((c) => c.startsWith(prefix))
        .map((c) => Number(c.replace(prefix, "")))
        .filter((n) => !Number.isNaN(n))
        .sort((a, b) => a - b);

      let next = 1;
      for (const n of usedNumbers) {
        if (n === next) next++;
        else if (n > next) break;
      }

      if (next > max) return "";
      return prefix + String(next).padStart(2, "0");
    },
    [allCodes]
  );

  // ---------- Utility: is positive number ----------
  const isPositiveNumber = (val) => val !== "" && !isNaN(val) && Number(val) >= 0;

  // ---------- Input handler (single function for all inputs) ----------
  const handleInput = useCallback((e) => {
    const { name, value } = e.target;
    // When space type is selected, auto-generate code + optionally pre-fill defaults (only for empty fields)
    if (name === "space") {
      const nextCode = generateNextCode(value);
      if (!nextCode && value && SPACE_GROUPS[value]) {
        toast.error(`${value} limit reached or auto-code unavailable`);
      }

      // prepare new form; fill defaults only if fields are empty
      const defaults = DEFAULT_PRICES[value] || {};
      setForm((prev) => {
        const updated = { ...prev, space: value, space_code: nextCode || "" };

        // Auto-fill price/duration defaults only if currently empty
        for (const key of Object.keys(defaults)) {
          if ((updated[key] === "" || updated[key] === null) && defaults[key] !== "") {
            updated[key] = defaults[key];
          }
        }

        return updated;
      });

      return;
    }

    // generic update for other fields
    setForm((prev) => ({ ...prev, [name]: value }));
  }, [generateNextCode]);

  // ---------- Image handling (preview + cleanup) ----------
  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG/PNG/WebP)");
      return;
    }
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch (err) {
        // ignore
      }
    }
    const url = URL.createObjectURL(file);
    setImage(file);
    setPreview(url);
  }, [preview]);

  useEffect(() => {
    return () => {
      if (preview) {
        try {
          URL.revokeObjectURL(preview);
        } catch (err) {
          // ignore
        }
      }
    };
  }, [preview]);

  // ---------- Validation ----------
  const validate = useCallback(() => {
    if (!form.space || form.space.trim() === "") {
      toast.error("Select Space Type");
      return false;
    }
    if (!form.space_code || form.space_code.trim() === "") {
      toast.error("Auto-generated space code is missing");
      return false;
    }

    const hasAnyRate = form.per_hour !== "" || form.per_day !== "" || form.per_month !== "";
    if (!hasAnyRate) {
      toast.error("Please provide at least one rate (Per Hour / Per Day / Per Month)");
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
    for (const field of numericFields) {
      if (form[field] !== "" && !isPositiveNumber(form[field])) {
        toast.error(`${FIELD_LABELS[field] || field} must be a non-negative number`);
        return false;
      }
    }

    if (!image) {
      toast.error("Please upload a space image");
      return false;
    }

    return true;
  }, [form, image]);

  // ---------- Submit single space ----------
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (image) fd.append("image", image);

      const res = await fetch(`${API_URL}/add_space.php`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (data && data.success) {
        toast.success("Space added successfully!");
        // refresh existing codes so next auto-generation is accurate
        await fetchExistingCodes();
        // reset form and image preview
        setForm(DEFAULT_FORM);
        if (preview) {
          try {
            URL.revokeObjectURL(preview);
          } catch (err) {}
        }
        setImage(null);
        setPreview(null);
        // optional: navigate to list
        navigate("/admin/space-master-list");
      } else {
        toast.error(data?.message || "Failed to add space");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network or server error while adding space");
    } finally {
      setLoading(false);
    }
  }, [form, image, preview, fetchExistingCodes, navigate, validate]);

  // ---------- Bulk generate (one-click create all missing for a group) ----------
  const bulkGenerate = useCallback(async (spaceName) => {
    if (!SPACE_GROUPS[spaceName]) return;
    if (!window.confirm(`Generate all ${spaceName} entries now? This will create every code for this type that doesn't already exist.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bulk_generate_spaces.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group: spaceName }),
      });
      const data = await res.json();
      if (data && data.success) {
        toast.success(`${data.created_count} spaces created. ${data.skipped_count} skipped.`);
        await fetchExistingCodes();
      } else {
        toast.error(data?.message || "Bulk generation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network/server error while bulk generating");
    } finally {
      setLoading(false);
    }
  }, [fetchExistingCodes]);

  // ---------- Disable bulk button if all codes already exist ----------
  const groupStatus = useMemo(() => {
    const status = {};
    Object.entries(SPACE_GROUPS).forEach(([name, { prefix, max }]) => {
      const count = allCodes.filter((c) => c.startsWith(prefix)).length;
      status[name] = { existing: count, max };
    });
    return status;
  }, [allCodes]);

  // ---------- GenerateButtons component (memoized for perf) ----------
  const GenerateButtons = useMemo(() => {
    return (
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.keys(SPACE_GROUPS).map((name) => {
          const { existing, max } = groupStatus[name] || { existing: 0, max: SPACE_GROUPS[name].max };
          const fullyCreated = existing >= max;
          return (
            <button
              key={name}
              onClick={() => bulkGenerate(name)}
              disabled={loading || fullyCreated}
              className={`px-3 py-2 border rounded bg-orange-50 text-orange-600 hover:bg-orange-100 disabled:opacity-50 ${fullyCreated ? "line-through text-gray-400" : ""}`}
              title={fullyCreated ? `${name} already fully created` : `Create all ${name} entries`}
            >
              {fullyCreated ? `All ${name} created` : `Generate ${name} (${existing}/${max})`}
            </button>
          );
        })}
      </div>
    );
  }, [bulkGenerate, groupStatus, loading]);

  // ---------- Loading overlay ----------
  const LoadingOverlay = () =>
    loading ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white p-4 rounded shadow">Processing…</div>
      </div>
    ) : null;

  // ---------- Render ----------
  return (
    <div className="p-6 relative">
      <LoadingOverlay />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Add New Space</h1>
        <button
          onClick={() => navigate("/admin/space-master-list")}
          className="px-3 py-1 border border-orange-400 text-orange-500 rounded hover:bg-orange-50 transition"
        >
          Space List
        </button>
      </div>

      {/* Generate all quick buttons */}
      {GenerateButtons}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Space Name <span className="text-red-500">*</span></label>
              <select name="space" value={form.space} onChange={handleInput} className="w-full border border-orange-400 rounded px-3 py-2">
                <option value="">Select Space Type</option>
                {Object.keys(SPACE_GROUPS).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Space Code <span className="text-red-500">*</span></label>
              <input name="space_code" value={form.space_code} readOnly className="w-full border border-orange-400 rounded px-3 py-2 bg-gray-100" placeholder="Auto-generated" />
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["per_hour", "per_day", "per_month"].map((f) => (
                <div key={f}>
                  <label className="block text-sm text-gray-700 mb-1">{FIELD_LABELS[f] || f}</label>
                  <input name={f} value={form[f]} onChange={handleInput} inputMode="numeric" className="w-full border border-orange-400 rounded px-3 py-2" />
                </div>
              ))}
            </div>

            {/* Weekly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["one_week", "two_weeks", "three_weeks"].map((f) => (
                <div key={f}>
                  <label className="block text-sm text-gray-700 mb-1">{FIELD_LABELS[f] || f}</label>
                  <input name={f} value={form[f]} onChange={handleInput} inputMode="numeric" className="w-full border border-orange-400 rounded px-3 py-2" />
                </div>
              ))}
            </div>

            {/* Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["min_duration", "min_duration_desc", "max_duration"].map((f) => (
                <div key={f}>
                  <label className="block text-sm text-gray-700 mb-1">{FIELD_LABELS[f] || f}</label>
                  <input name={f} value={form[f]} onChange={handleInput} className="w-full border border-orange-400 rounded px-3 py-2" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Max Duration Description</label>
              <input name="max_duration_desc" value={form.max_duration_desc} onChange={handleInput} className="w-full border border-orange-400 rounded px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Space Image <span className="text-red-500">*</span></label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border border-orange-400 rounded px-3 py-2 bg-white" />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6 flex flex-col items-center">
            <div className="w-full flex justify-center mt-2">
              <div className="p-2 border border-orange-300 rounded-lg bg-orange-50 shadow-sm">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-64 h-64 object-cover rounded-md shadow-md" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">No image selected</div>
                )}
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleInput} className="w-full border border-orange-400 rounded px-3 py-2">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="pt-4 w-full">
              <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition disabled:opacity-60">
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
