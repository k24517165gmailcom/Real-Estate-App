import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "react-toastify"; // ✅ Toastify import

const VirtualOfficeBookingModal = ({ isOpen, onClose }) => {
  const [startDate, setStartDate] = useState("");
  const [years, setYears] = useState("");
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const today = new Date().toISOString().split("T")[0];

  const validateForm = () => {
    const newErrors = {};
    const selectedDate = new Date(startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (!startDate) {
      newErrors.startDate = "Start date is required.";
    } else if (selectedDate < now) {
      newErrors.startDate = "Start date cannot be in the past.";
    }

    if (!years) {
      newErrors.years = "Number of years is required.";
    } else if (isNaN(years) || years < 1 || years > 10) {
      newErrors.years = "Please enter a valid number (1–10).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      toast.success("🎉 Booking confirmed successfully!");
      setStartDate("");
      setYears("");
      setErrors({});
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative"
            initial={{ scale: 0.8, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-orange-500 transition"
            >
              <X size={22} />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              Book Your <span className="text-orange-500">Virtual Office</span>
            </h2>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Start Date */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Start Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 outline-none transition ${errors.startDate
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:ring-1"
                    }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              {/* No. of Years */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  No. of Years
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  placeholder="Enter number of years"
                  className={`w-full border rounded-xl px-4 py-3 outline-none transition ${errors.years
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:ring-1"
                    }`}
                />
                {errors.years && (
                  <p className="text-red-500 text-sm mt-1">{errors.years}</p>
                )}
              </div>

              {/* Pay & Book Button */}
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl shadow-md transition-all duration-200"
              >
                Pay & Book
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VirtualOfficeBookingModal;
