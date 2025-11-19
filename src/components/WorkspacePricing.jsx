import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ Added useNavigate
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ⭐ ADDED — function to extract user_id from localStorage
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || null;
  } catch {
    return null;
  }
};


// --- GLOBAL DAY MAPPINGS ---
const DAY_ABBREVIATIONS_MAP = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};
// ---------------------------

// Helper function to generate time options in 24-hour format for state storage
const generateTimeOptions = () => {
  const times = [];
  for (let i = 8; i <= 20; i++) {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 || i === 24 ? "AM" : "PM";
    const timeValue = `${i.toString().padStart(2, "0")}:00`;
    const display = `${hour.toString().padStart(2, "0")}:00 ${ampm}`;
    times.push({ value: timeValue, display: display });
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

const format24HourTo12Hour = (time24) => {
  if (!time24) return "";
  try {
    const [hours24, minutes] = time24.split(":");
    let hours = parseInt(hours24, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  } catch {
    return time24;
  }
};

// Returns chronological list of working days (Mon–Sat)
const getDaysOfWeekInDateRange = (start, end) => {
  const startObj = new Date(start);
  const endObj = new Date(end);
  if (!start || !end || startObj > endObj) return "";
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const standardWorkingOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const daysFoundIndices = new Set();
  let current = new Date(startObj);
  while (current <= endObj) {
    const dayIndex = current.getDay();
    if (dayIndex !== 0) daysFoundIndices.add(dayIndex);
    current.setDate(current.getDate() + 1);
  }
  if (daysFoundIndices.size === 0) return "";
  const presentWorkingDays = standardWorkingOrder.filter((day) =>
    daysFoundIndices.has(dayNames.indexOf(day))
  );
  const startDayName = dayNames[startObj.getDay()];
  const startIndex = presentWorkingDays.indexOf(startDayName);
  const rotated =
    startIndex !== -1
      ? presentWorkingDays
        .slice(startIndex)
        .concat(presentWorkingDays.slice(0, startIndex))
      : presentWorkingDays;
  return rotated.map((d) => DAY_ABBREVIATIONS_MAP[d]).join(", ");
};

// Single day abbreviation
const getDayAbbreviation = (dateString) => {
  if (!dateString) return "";
  const dayName = new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
  });
  return DAY_ABBREVIATIONS_MAP[dayName] || dayName;
};


const WorkspacePricing = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ Added for redirect after auth
  const selectedPlan = location.state?.plan;

  // 🔥 NEW — Workspaces from backend
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---- Fetch workspace list ----
  useEffect(() => {
    fetch("http://localhost/vayuhu_backend/get_spaces.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const formatted = data.spaces
            .filter((i) => i.status === "Active") // ⭐ only active spaces
            .map((i) => ({
              id: i.id,
              title: i.space,
              desc: i.min_duration_desc || "",
              type: i.space_code,
              capacity: 10,
              monthly: Number(i.per_month) || null,
              daily: Number(i.per_day) || null,
              hourly: Number(i.per_hour) || null,
              image: i.image_url,
              status: i.status || "Active",
              raw: i,
            }));



          setWorkspaces(formatted);
        } else {
          setError("No spaces found");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load workspace data");
        setLoading(false);
      });
  }, []);

  // ---------------------------
  // STATE VARIABLES
  // ---------------------------
  const [modalData, setModalData] = useState(null);
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [referral, setReferral] = useState("");
  const [days, setDays] = useState(0);
  const [totalHours, setTotalHours] = useState(1);
  const [numAttendees, setNumAttendees] = useState(1);

  // ✅ Auth Check Function
  const isAuthenticated = () => {
    const user = localStorage.getItem("user");
    return !!user;
  };

  // ---- Auto-set end date based on start date ----
  useEffect(() => {
    if (!startDate || !modalData?.planType) return;
    const start = new Date(startDate);
    let end = new Date(start);

    if (modalData.planType === "Monthly") {
      end.setMonth(start.getMonth() + 1);
      end.setDate(end.getDate() - 1);
    }
    else if (modalData.planType === "Daily") {
      end = new Date(start);
    }
    else if (modalData.planType === "Hourly") {
      // ✅ Keep the same date but preserve time duration difference
      end = new Date(start);
    }

    setEndDate(end.toISOString().split("T")[0]);
  }, [startDate, modalData?.planType]);


  // ---- Calculate Days ----
  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (e < s) return setDays(0);
      const diff = e - s;
      const d = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
      setDays(d);
    }
  }, [startDate, endDate]);

  // Auto-update End Time when Start Time changes (Hourly plan)
  useEffect(() => {
    if (modalData?.planType === "Hourly" && startTime) {
      const startHour = parseInt(startTime.split(":")[0]);
      if (!endTime || parseInt(endTime.split(":")[0]) <= startHour) {
        const nextHour = Math.min(20, startHour + 1);
        setEndTime(`${nextHour.toString().padStart(2, "0")}:00`);
      }
    }
  }, [startTime, modalData?.planType]);
  ;

  // ---- Coupons ----
  const handleApplyCoupon = () => {
    if (coupon.trim().toLowerCase() === "vayuhu10") {
      setDiscount(10);
      toast.success("Coupon applied! You got ₹10 off!");
    } else {
      toast.error("Invalid coupon code");
    }
    setCoupon("");
  };

  // ---- Calculation ----
  const calculateBaseAmount = () => {
    const price = modalData?.price || 0;
    if (modalData?.planType === "Daily") return price * days;
    if (modalData?.planType === "Monthly") return price;
    if (modalData?.planType === "Hourly") {
      return price * totalHours * days * numAttendees;
    }
    return 0;
  };

  const calculateTotal = () => {
    const base = calculateBaseAmount();
    const gst = base * 0.18;
    return base + gst - discount;
  };

  const resetState = () => {
    setModalData(null);
    setStep(1);
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setTermsAccepted(false);
    setCoupon("");
    setDiscount(0);
    setReferral("");
    setDays(0);
    setTotalHours(1);
    setNumAttendees(1);
  };

  const displayAmount = calculateBaseAmount();
  const displayGst = (displayAmount * 0.18).toFixed(0);
  const totalPreDiscount = (displayAmount + Number(displayGst)).toFixed(0);
  const finalTotal = calculateTotal().toFixed(0);



  return (
    <section id="WorkSpaces" className="container mx-auto px-6 md:px-20 lg:px-32 py-20">
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="text-center mb-12">
        <h6 className="uppercase text-orange-500 tracking-widest font-medium">Pricing</h6>
        <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-2">Workspace Plans</h2>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
          Choose the workspace that fits your needs. Flexible pricing for hourly,
          daily, or monthly use.
        </p>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-10 text-gray-500 text-lg">
          Loading workspaces...
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-500 text-lg">
          {error}
        </div>
      )}

      {/* Workspace Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {workspaces.map((item) => (
            <motion.div
              key={item.id}
              id={item.id}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200"
            >
              <img src={item.image} alt={item.title} className="w-full h-56 bg-gray-100 overflow-hidden rounded-t-lg" />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-2">{item.desc}</p>
                <p className="text-sm text-gray-500 mb-2">Type: {item.type}</p>
                <p className="text-sm text-gray-500 mb-2">
                  Capacity: {item.capacity} persons
                </p>

                {["monthly", "daily", "hourly"].map(
                  (type) =>
                    item[type] && (
                      <button
                        key={type}
                        onClick={() => {

                          // ✅ AUTH CHECK before showing modal
                          if (!isAuthenticated()) {
                            toast.error("Please log in to book a workspace!");
                            setTimeout(() => navigate("/auth"), 1000);
                            return;
                          }

                          setModalData({
                            ...item,
                            planType: type.charAt(0).toUpperCase() + type.slice(1),
                            price: item[type],
                          });

                          setStartDate(new Date().toISOString().split("T")[0]);
                          setEndDate("");
                          setStep(1);

                          if (type === "hourly") {
                            const now = new Date();
                            now.setHours(
                              now.getHours() + (now.getMinutes() > 0 ? 1 : 0),
                              0,
                              0,
                              0
                            );
                            const h = now.getHours();
                            setStartTime(`${h.toString().padStart(2, "0")}:00`);
                            setEndTime(
                              `${Math.min(20, h + 1).toString().padStart(2, "0")}:00`
                            );
                          } else {
                            setStartTime("08:00");
                            setEndTime("20:00");
                          }

                          setNumAttendees(1);
                        }}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mr-2 mb-2 hover:bg-orange-600 transition"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)} ₹{item[type]}
                      </button>
                    )
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* All existing modal steps remain unchanged */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Step 1: Start Date & Time + Attendees */}
            {step === 1 && (
              <motion.div
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button
                  onClick={() => resetState()}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  {modalData.title} - {modalData.planType} Plan
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose your required timings for the workspace plan &{" "}
                  {modalData.planType.toLowerCase()} pack
                </p>

                <label className="block text-gray-700 mb-2">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  max={(() => {
                    const maxDate = new Date();
                    maxDate.setMonth(maxDate.getMonth() + 2);
                    return maxDate.toISOString().split("T")[0];
                  })()}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                />
                <p className="text-sm text-gray-500 mb-3">
                  You can select a start date within the next 2 months only.
                </p>

                {/* Time Selection (only for Hourly plans) */}
                {modalData.planType === "Hourly" && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* --- Start Time --- */}
                      <div>
                        <label className="block text-gray-700 mb-2">Start Time:</label>
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                          <option value="" disabled>Select Start Time</option>
                          {TIME_OPTIONS.slice(0, -1).map((t) => {
                            const now = new Date();
                            const currentTimeValue = `${now.getHours().toString().padStart(2, "0")}:00`;
                            const isToday = startDate === new Date().toISOString().split("T")[0];
                            const isPast = isToday && t.value <= currentTimeValue;

                            return (
                              <option key={t.value} value={t.value} disabled={isPast}>
                                {t.display} {isPast ? "(Past)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* --- End Time --- */}
                      <div>
                        <label className="block text-gray-700 mb-2">End Time:</label>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          disabled={!startTime}
                        >
                          <option value="" disabled>Select End Time</option>
                          {TIME_OPTIONS.slice(1).map((t) => {
                            const startHour = parseInt(startTime.split(":")[0]);
                            const optionHour = parseInt(t.value.split(":")[0]);
                            return (
                              optionHour > startHour && (
                                <option key={t.value} value={t.value}>
                                  {t.display}
                                </option>
                              )
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    {/* ATTENDEE INPUT (Only for Video Conferencing Hourly Plan) */}
                    {modalData.title === "Video Conferencing" && (
                      <div className="mb-4">
                        <label className="block text-gray-700 mb-2">
                          Number of Attendees:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={modalData.capacity}
                          value={numAttendees}
                          onChange={(e) => {
                            const val = Math.max(
                              1,
                              Math.min(modalData.capacity, parseInt(e.target.value) || 1)
                            );
                            setNumAttendees(val);
                          }}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          placeholder={`Max ${modalData.capacity} persons`}
                        />
                      </div>
                    )}
                  </>
                )}

                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  Accept Terms & Conditions
                </label>

                <button
                  disabled={
                    !termsAccepted ||
                    !startDate ||
                    (modalData.planType === "Hourly" &&
                      (!startTime || !endTime || totalHours <= 0 || numAttendees < 1))
                  }
                  onClick={() => {
                    console.log("Next clicked:", startTime, endTime);
                    setTimeout(() => setStep(2), 0); // ensures state settles
                  }}
                  className={`w-full py-2 rounded-lg font-medium transition ${termsAccepted &&
                    startDate &&
                    totalHours > 0 &&
                    numAttendees >= 1
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  Next »
                </button>
              </motion.div>
            )}


            {/* Step 2: End Date for Recurrence */}
            {step === 2 && (
              <motion.div
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl relative"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button
                  onClick={() => resetState()}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                  <span className="text-red-500 font-bold uppercase">CHOOSE YOUR END DATE FOR RECURSION</span>
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {modalData.title} & {modalData.planType} Pack
                  {modalData.planType === "Hourly" && startTime && endTime && (
                    <> from {format24HourTo12Hour(startTime)} to {format24HourTo12Hour(endTime)}</>
                  )}
                </p>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Start Date:</label>
                    <input
                      type="date"
                      value={startDate}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">End Date:</label>
                    <input
                      type="date"
                      value={endDate}
                      readOnly
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm bg-gray-100 cursor-not-allowed text-gray-600"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      End date is auto-calculated based on your selected plan.
                    </p>
                  </div>

                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    « Back
                  </button>
                  <button
                    disabled={!endDate || new Date(endDate) < new Date(startDate)}
                    onClick={() => setStep(3)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${endDate && new Date(endDate) >= new Date(startDate)
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    Next »
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review Details and Payment */}
            {step === 3 && (
              <motion.div
                className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-xl relative overflow-y-auto max-h-[90vh]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <button
                  onClick={() => resetState()}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                  <span className="text-red-500 font-bold uppercase">REVIEW DETAILS</span>
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Selected Dates: {startDate} – {endDate} ({days} days)
                  {modalData.planType === "Hourly" && ` (${totalHours} hours/day)`}
                  {modalData.title === "Video Conferencing" && ` for ${numAttendees} person(s)`}
                </p>

                {/* START: Two-Column Clean Layout */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">

                  {/* Row 1: Plan & Pack (Aligned with screenshot) */}
                  <div>
                    <label className="block text-gray-700 mb-1">Plan</label>
                    <input value={modalData.title} readOnly className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Pack</label>
                    <input value={modalData.planType} readOnly className="w-full border rounded-lg px-3 py-2" />
                  </div>

                  {/* Row 2: No of Days & Days of Week List */}
                  <div>
                    <label className="block text-gray-700 mb-1">
                      {modalData.planType === "Monthly" ? "No of Days:" : "No of Days"}
                    </label>
                    <input value={days} readOnly className="w-full border rounded-lg px-3 py-2" />
                  </div>

                  {/* Right side of Row 2: Days of Week (Chronological & Abbreviated) */}
                  <div>
                    <label className="block text-gray-700 mb-1">Days:</label>
                    <input
                      value={
                        modalData.planType === "Monthly"
                          ? getDaysOfWeekInDateRange(startDate, endDate)
                          : (days === 1 ? getDayAbbreviation(startDate) : `${days} Days Recurrence`)
                      }
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* Row 3: Start/End Date */}
                  <div>
                    <label className="block text-gray-700 mb-1">Start Date</label>
                    <input value={startDate} readOnly className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">End Date</label>
                    <input value={endDate} readOnly className="w-full border rounded-lg px-3 py-2" />
                  </div>

                  {/* Row 4: Start/End Time */}
                  <div>
                    <label className="block text-gray-700 mb-1">Start Time</label>
                    <input
                      value={modalData.planType === "Hourly" ? format24HourTo12Hour(startTime) : "08:00 AM"}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">End Time</label>
                    <input
                      value={modalData.planType === "Hourly" ? format24HourTo12Hour(endTime) : "08:00 PM"}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* Row 5: Amount & GST (Financials start) */}
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Amount (
                      {modalData.title === "Video Conferencing" && modalData.planType === "Hourly"
                        ? `₹${modalData.price}/hr/person`
                        : `₹${modalData.price}/${modalData.planType.toLowerCase()}`
                      }
                      )
                    </label>
                    <input value={`₹${displayAmount.toFixed(0)}`} readOnly className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">GST (18%)</label>
                    <input value={`₹${displayGst}`} readOnly className="w-full border rounded-lg px-3 py-2" />
                  </div>

                  {/* Row 6: Total & Coupon */}
                  <div>
                    <label className="block text-gray-700 mb-1">Total (Pre-Discount)</label>
                    <input value={`₹${totalPreDiscount}`} readOnly className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Apply Coupon</label>
                    <div className="flex">
                      <input
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="Enter code"
                        className="border rounded-l-lg px-3 py-2 w-full"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Row 7: Discount & Final Total */}
                  <div>
                    <label className="block text-gray-700 mb-1">Discount</label>
                    <input value={`₹${discount}`} readOnly className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Final Total (including GST)</label>
                    <input
                      value={`₹${finalTotal}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2 font-semibold"
                    />
                  </div>

                  {/* Row 8: Referral Source (Full Width) */}
                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-1">Select Referral Source</label>
                    <select
                      value={referral}
                      onChange={(e) => setReferral(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                      <option>Google</option>
                      <option>Friend</option>
                    </select>
                  </div>
                </div>
                {/* END: Two-Column Clean Layout */}


                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    « Back
                  </button>
                  <button
                    onClick={() => {
                      const bookingData = {
                        user_id: getUserId(),   // ⭐ ADDED — send logged in user_id

                        space_id: modalData.id,
                        workspace_title: modalData.title,
                        plan_type: modalData.planType,
                        start_date: startDate,
                        end_date: endDate,
                        start_time: startTime || null,
                        end_time: endTime || null,
                        total_days: days,
                        total_hours: totalHours,
                        num_attendees: numAttendees,
                        price_per_unit: modalData.price,
                        base_amount: displayAmount,
                        gst_amount: parseFloat(displayGst),
                        discount_amount: discount,
                        final_amount: parseFloat(finalTotal),
                        coupon_code: coupon || null,
                        referral_source: referral || null,
                        terms_accepted: termsAccepted ? 1 : 0,
                      };


                      fetch("http://localhost/vayuhu_backend/add_workspace_booking.php", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify(bookingData),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.success) {
                            toast.success("Booking saved successfully!");
                            setTimeout(() => resetState(), 1500);
                          } else {
                            toast.error("Booking failed: " + data.message);
                          }
                        })
                        .catch((err) => {
                          toast.error("Error: " + err.message);
                        });

                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Pay & Book »
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default WorkspacePricing;