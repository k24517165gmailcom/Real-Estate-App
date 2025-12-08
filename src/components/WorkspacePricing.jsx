import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import FloatingCartButton from "../components/FloatingCartButton";

// Helper to get logged-in user id (same as yours)
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.id || null;
  } catch {
    return null;
  }
};

// Day maps and time helpers copied from your original file:
const DAY_ABBREVIATIONS_MAP = {
  Sunday: "Sun",
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
};

const generateTimeOptions = () => {
  const times = [];
  // Workspace hours 08:00 AM → 07:59 PM (so include 19 = 7 PM)
  for (let i = 8; i <= 19; i++) {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? "AM" : "PM";
    const timeValue = `${i.toString().padStart(2, "0")}:00`;
    const display = `${hour.toString().padStart(2, "0")}:00 ${ampm}`;
    times.push({ value: timeValue, display });
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

const getDayAbbreviation = (dateString) => {
  if (!dateString) return "";
  const dayName = new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
  });
  return DAY_ABBREVIATIONS_MAP[dayName] || dayName;
};

const WorkspacePricing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlan = location.state?.plan;

  // workspaces from backend
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & booking states (kept same as your original)
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

  // NEW: data for the small radio popup to pick a space code
  const [codeSelectModal, setCodeSelectModal] = useState(null);
  // structure: { groupTitle, codes: [{id, code, raw}], planType, price }

  const { addToCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost/vayuhu_backend/get_spaces.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const formatted = data.spaces
            .filter((i) => i.status === "Active")
            .map((i) => ({
              id: i.id,
              title: i.space,
              desc: i.min_duration_desc || "",
              type: i.space_code, // space code
              capacity: Number(i.capacity) || 10,
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

  // GROUP workspaces by title + pricing (so duplicates with same pricing collapse)
  const groupedWorkspaces = useMemo(() => {
    // key by title + hourly + daily + monthly for grouping
    const map = new Map();
    workspaces.forEach((w) => {
      const key = `${w.title}||${w.hourly ?? 0}||${w.daily ?? 0}||${
        w.monthly ?? 0
      }`;
      if (!map.has(key)) {
        map.set(key, {
          title: w.title,
          desc: w.desc,
          image: w.image,
          hourly: w.hourly,
          daily: w.daily,
          monthly: w.monthly,
          items: [{ id: w.id, code: w.type, raw: w.raw }],
          capacity: w.capacity,
        });
      } else {
        map.get(key).items.push({ id: w.id, code: w.type, raw: w.raw });
      }
    });
    return Array.from(map.values());
  }, [workspaces]);

  // Auth check (same as yours)
  const isAuthenticated = () => {
    const user = localStorage.getItem("user");
    return !!user;
  };

  // Auto-set end date logic (preserved)
  useEffect(() => {
    if (!startDate || !modalData?.planType) return;
    const start = new Date(startDate);
    let end = new Date(start);

    if (modalData.planType === "Monthly") {
      end.setMonth(start.getMonth() + 1);
      end.setDate(end.getDate() - 1);
    } else if (modalData.planType === "Daily") {
      end = new Date(start);
    } else if (modalData.planType === "Hourly") {
      end = new Date(start);
    }

    setEndDate(end.toISOString().split("T")[0]);
  }, [startDate, modalData?.planType]);

  // Days calculation
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

  // Auto-update End Time for Hourly
  useEffect(() => {
    if (modalData?.planType === "Hourly" && startTime) {
      const startHour = parseInt(startTime.split(":")[0]);
      // Ensure the end time doesn't go beyond 7:59 PM (19:59)
      const endHour = Math.min(19, startHour);
      setEndTime(`${endHour.toString().padStart(2, "0")}:59`);
    }
  }, [startTime, modalData?.planType]);

  // Coupons
  const handleApplyCoupon = async () => {
    if (!coupon) return toast.error("Please enter a coupon code");

    try {
      const res = await fetch(
        "http://localhost/vayuhu_backend/apply_coupon.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coupon_code: coupon,
            workspace_title: modalData?.title,
            plan_type: modalData?.planType,
            total_amount: calculateBaseAmount(),
            user_id: getUserId(),
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setDiscount(Number(data.discount_amount || 0));
        toast.success(data.message || "Coupon applied successfully!");
      } else {
        setDiscount(0);
        toast.error(data.message || "Invalid coupon code");
      }
    } catch (err) {
      toast.error("Error validating coupon. Please try again.");
    }
  };

  // Billing calculations (same)
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
    setCodeSelectModal(null);
  };

  // When user clicks a Plan button on a grouped card:
  const handlePlanClick = (group, planType) => {
    // Auth check first
    if (!isAuthenticated()) {
      toast.error("Please log in to book a workspace!");
      setTimeout(() => navigate("/auth"), 1000);
      return;
    }

    // Normalize planType for consistent capitalization
    const normalizedPlan =
      planType.toLowerCase() === "hourly"
        ? "Hourly"
        : planType.toLowerCase() === "daily"
        ? "Daily"
        : "Monthly";

    // If group has more than one code, open the small code selection modal (radio)
    if (group.items.length > 1) {
      setCodeSelectModal({
        groupTitle: group.title,
        codes: group.items, // [{id, code, raw}]
        planType: normalizedPlan,
        price:
          normalizedPlan === "Hourly"
            ? group.hourly
            : normalizedPlan === "Daily"
            ? group.daily
            : group.monthly,
      });
      return;
    }

    // else (only one space code) proceed directly with selecting that workspace
    const sole = group.items[0];
    const chosenRaw = sole.raw;

    setModalData({
      id: sole.id,
      title: group.title,
      desc: group.desc,
      type: sole.code,
      capacity: group.capacity,
      planType: normalizedPlan,
      price:
        normalizedPlan === "Hourly"
          ? group.hourly
          : normalizedPlan === "Daily"
          ? group.daily
          : group.monthly,
      raw: chosenRaw,
    });

    // set defaults
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setStep(1);

    if (normalizedPlan === "Hourly") {
      const now = new Date();
      now.setHours(now.getHours() + (now.getMinutes() > 0 ? 1 : 0), 0, 0, 0);
      const h = now.getHours();
      setStartTime(`${h.toString().padStart(2, "0")}:00`);
      const nextHour = Math.min(19, h + 1); // 7 PM = max hour
      setEndTime(`${nextHour.toString().padStart(2, "0")}:59`);
    } else {
      setStartTime("08:00");
      setEndTime("20:00");
    }

    setNumAttendees(1);
  };

  // Called when user confirms a code from the small radio popup
  const confirmCodeSelection = (selectedId, planType) => {
    // find raw by id in workspaces
    const found = workspaces.find((w) => String(w.id) === String(selectedId));
    if (!found) {
      toast.error("Selected space not found");
      setCodeSelectModal(null);
      return;
    }

    // Normalize planType for consistent capitalization
    const normalizedPlan =
      planType.toLowerCase() === "hourly"
        ? "Hourly"
        : planType.toLowerCase() === "daily"
        ? "Daily"
        : "Monthly";

    setModalData({
      id: found.id,
      title: found.title,
      desc: found.desc,
      type: found.type,
      capacity: found.capacity,
      planType: normalizedPlan,
      price:
        normalizedPlan === "Hourly"
          ? found.hourly
          : normalizedPlan === "Daily"
          ? found.daily
          : found.monthly,
      raw: found.raw,
    });

    // close code selector
    setCodeSelectModal(null);

    // initialize booking defaults (same as before)
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setStep(1);

    if (normalizedPlan === "Hourly") {
      const now = new Date();
      now.setHours(now.getHours() + (now.getMinutes() > 0 ? 1 : 0), 0, 0, 0);
      const h = now.getHours();
      setStartTime(`${h.toString().padStart(2, "0")}:00`);
      const nextHour = Math.min(19, h + 1); // 7 PM = max hour
      setEndTime(`${nextHour.toString().padStart(2, "0")}:59`);
    } else {
      setStartTime("08:00");
      setEndTime("20:00");
    }

    setNumAttendees(1);
  };

  // Display numbers for billing
  const displayAmount = calculateBaseAmount();
  const displayGst = (displayAmount * 0.18).toFixed(0);
  const totalPreDiscount = (displayAmount + Number(displayGst)).toFixed(0);
  const finalTotal = calculateTotal().toFixed(0);

  // Helper to render each seat
  const renderSeat = (c) => {
    const isSelected = codeSelectModal.selectedId === c.id;
    const isDisabled = !c.raw.is_available;

    return (
      <motion.button
        key={c.id}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        disabled={isDisabled}
        title={
          isDisabled
            ? (() => {
                const reason = c.raw.availability_reason || "";
                const endDate = c.raw.end_date || "";
                const endTime = c.raw.end_time || "";

                // If both date and time exist (hourly)
                if (
                  endTime &&
                  endDate === new Date().toISOString().split("T")[0]
                ) {
                  const [hour, minute] = endTime.split(":");
                  const formattedHour = hour % 12 || 12;
                  const ampm = hour >= 12 ? "PM" : "AM";
                  return `Booked until ${formattedHour}:${minute} ${ampm} today`;
                }

                // Fallback to backend-provided reason (for daily/monthly)
                return reason;
              })()
            : "Available"
        }
        onClick={() => {
          if (!isDisabled) {
            setCodeSelectModal((prev) => ({
              ...prev,
              selectedId: c.id,
            }));
          }
        }}
        className={`w-14 h-10 rounded-md flex items-center justify-center text-xs font-semibold transition-all border
        ${
          isDisabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : isSelected
            ? "bg-orange-500 text-white border-orange-600"
            : "bg-green-100 text-gray-700 border-green-300 hover:bg-green-200"
        }`}
      >
        {c.code}
      </motion.button>
    );
  };

  return (
    <section
      id="WorkSpaces"
      className="container mx-auto px-6 md:px-20 lg:px-32 py-20"
    >
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="text-center mb-12">
        <h6 className="uppercase text-orange-500 tracking-widest font-medium">
          Pricing
        </h6>
        <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-2">
          Workspace Plans
        </h2>
        <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
          Choose the workspace that fits your needs. Flexible pricing for
          hourly, daily, or monthly use.
        </p>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-500 text-lg">
          Loading workspaces...
        </div>
      )}
      {error && (
        <div className="text-center py-10 text-red-500 text-lg">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {groupedWorkspaces.map((group, idx) => (
            <motion.div
              key={`${group.title}-${idx}`}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200"
            >
              <img
                src={group.image}
                alt={group.title}
                className="w-full h-56 bg-gray-100 overflow-hidden rounded-t-lg object-cover"
              />
              <div className="p-6 bg-white">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {group.title}
                </h3>
                <p className="text-gray-600 mb-2">{group.desc}</p>
                <p className="text-sm text-gray-500 mb-2">
                  {group.items.length > 1 ? (
                    <span className="italic text-sm text-gray-600">
                      Multiple space codes (
                      {group.items.map((it) => it.code).join(", ")})
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Code: {group.items[0].code}
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap">
                  {group.hourly && (
                    <button
                      onClick={() => handlePlanClick(group, "hourly")}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mr-2 mb-2 hover:bg-orange-600 transition"
                    >
                      Hourly ₹{group.hourly}
                    </button>
                  )}
                  {group.daily && (
                    <button
                      onClick={() => handlePlanClick(group, "daily")}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mr-2 mb-2 hover:bg-orange-600 transition"
                    >
                      Daily ₹{group.daily}
                    </button>
                  )}
                  {group.monthly && (
                    <button
                      onClick={() => handlePlanClick(group, "monthly")}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mr-2 mb-2 hover:bg-orange-600 transition"
                    >
                      Monthly ₹{group.monthly}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* BookMyShow-style Space Code Selection Modal */}
      <AnimatePresence>
        {codeSelectModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-10 w-full max-w-2xl shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* ✕ Close button */}
              <button
                onClick={() => setCodeSelectModal(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>

              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                Select Space Code for{" "}
                <span className="text-orange-500">
                  {codeSelectModal.groupTitle}
                </span>
              </h3>

              {/* Seat-style selection grid (Conditional Walkway) */}
              <div className="flex flex-col items-center gap-5 mb-6">
                {(() => {
                  // sort space codes so WS01 starts at top
                  const seats = [...codeSelectModal.codes].sort((a, b) =>
                    a.code.localeCompare(b.code, undefined, { numeric: true })
                  );

                  // Check if we should show walkways
                  const noWalkway = [
                    "Team Leads Cubicle",
                    "Manager Cubicle",
                    "Executive Cabin",
                  ].includes(codeSelectModal.groupTitle);

                  return (
                    <>
                      {/* Row 1 → first 3 */}
                      <div className="flex justify-center gap-4">
                        {seats.slice(0, 3).map(renderSeat)}
                      </div>
                      {/* Walkway separator (only if allowed) */}
                      {!noWalkway && (
                        <div className="w-3/4 border-t border-gray-300 my-2"></div>
                      )}

                      {/* Row 2 → next 7 */}
                      <div className="flex justify-center gap-4">
                        {seats.slice(3, 10).map(renderSeat)}
                      </div>

                      {/* Row 3 → 7 front + 7 back */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex justify-center gap-4">
                          {seats.slice(10, 17).map(renderSeat)}
                        </div>
                        {!noWalkway && (
                          <div className="w-3/4 border-t border-gray-300 my-2"></div>
                        )}
                        <div className="flex justify-center gap-4">
                          {seats.slice(17, 24).map(renderSeat)}
                        </div>
                      </div>

                      {/* Row 4 → 7 front + 7 back */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex justify-center gap-4">
                          {seats.slice(24, 31).map(renderSeat)}
                        </div>
                        {!noWalkway && (
                          <div className="w-3/4 border-t border-gray-300 my-2"></div>
                        )}
                        <div className="flex justify-center gap-4">
                          {seats.slice(31, 38).map(renderSeat)}
                        </div>
                      </div>

                      {/* Row 5 → remaining 7 */}
                      <div className="flex justify-center gap-4">
                        {seats.slice(38, 45).map(renderSeat)}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-green-100 border border-green-300 rounded-md"></span>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-orange-500 border border-orange-600 rounded-md"></span>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-gray-200 border border-gray-300 rounded-md"></span>
                  <span>Unavailable</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setCodeSelectModal(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={!codeSelectModal.selectedId}
                  onClick={() => {
                    const sel =
                      codeSelectModal.selectedId ?? codeSelectModal.codes[0].id;
                    confirmCodeSelection(sel, codeSelectModal.planType);
                  }}
                  className={`px-5 py-2 rounded-lg font-semibold transition-all ${
                    codeSelectModal.selectedId
                      ? "bg-orange-500 text-white hover:bg-orange-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Booking Modal (Steps 1-3). Reused from your original with slight adjustments */}
      <AnimatePresence>
        {modalData && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Step 1 */}
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
                  max={() => {
                    const maxDate = new Date();
                    maxDate.setMonth(maxDate.getMonth() + 2);
                    return maxDate.toISOString().split("T")[0];
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                />
                <p className="text-sm text-gray-500 mb-3">
                  You can select a start date within the next 2 months only.
                </p>

                {modalData.planType === "Hourly" && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Start Time:
                        </label>
                        <select
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                        >
                          <option value="" disabled>
                            Select Start Time
                          </option>
                          {TIME_OPTIONS.map((t) => {
                            const now = new Date();
                            const currentTimeValue = `${now
                              .getHours()
                              .toString()
                              .padStart(2, "0")}:00`;

                            const isToday =
                              startDate ===
                              new Date().toISOString().split("T")[0];

                            // Hide or disable times that are in the past for today's date
                            const isPast =
                              isToday && t.value <= currentTimeValue;

                            return (
                              <option
                                key={t.value}
                                value={t.value}
                                disabled={isPast}
                              >
                                {t.display} {isPast ? "(Past)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          End Time:
                        </label>
                        <select
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2"
                          disabled={!startTime}
                        >
                          <option value="" disabled>
                            Select End Time
                          </option>
                          {(() => {
                            const startHour = startTime
                              ? parseInt(startTime.split(":")[0])
                              : -1;

                            // Workspace closes at 07:59 PM (19:59)
                            const options = [];
                            for (let i = startHour; i <= 19; i++) {
                              if (i >= startHour) {
                                const hour24 = i;
                                const labelHour =
                                  hour24 % 12 === 0 ? 12 : hour24 % 12;
                                const ampm = hour24 < 12 ? "AM" : "PM";
                                options.push({
                                  value: `${hour24
                                    .toString()
                                    .padStart(2, "0")}:59`,
                                  label: `${labelHour
                                    .toString()
                                    .padStart(2, "0")}:59 ${ampm}`,
                                });
                              }
                            }

                            return options.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ));
                          })()}
                        </select>
                      </div>
                    </div>

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
                              Math.min(
                                modalData.capacity,
                                parseInt(e.target.value) || 1
                              )
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
                      (!startTime ||
                        !endTime ||
                        totalHours <= 0 ||
                        numAttendees < 1))
                  }
                  onClick={() => setTimeout(() => setStep(2), 0)}
                  className={`w-full py-2 rounded-lg font-medium transition ${
                    termsAccepted &&
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

            {/* Step 2 */}
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
                  <span className="text-red-500 font-bold uppercase">
                    CHOOSE YOUR END DATE FOR RECURSION
                  </span>
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  {modalData.title} & {modalData.planType} Pack
                  {modalData.planType === "Hourly" && startTime && endTime && (
                    <>
                      {" "}
                      from {format24HourTo12Hour(startTime)} to{" "}
                      {format24HourTo12Hour(endTime)}
                    </>
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Start Date:
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      End Date:
                    </label>
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
                    disabled={
                      !endDate || new Date(endDate) < new Date(startDate)
                    }
                    onClick={() => setStep(3)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      endDate && new Date(endDate) >= new Date(startDate)
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Next »
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 */}
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
                  <span className="text-red-500 font-bold uppercase">
                    REVIEW DETAILS
                  </span>
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Selected Dates: {startDate} – {endDate} ({days} days)
                  {modalData.planType === "Hourly" &&
                    ` (${totalHours} hours/day)`}
                  {modalData.title === "Video Conferencing" &&
                    ` for ${numAttendees} person(s)`}
                </p>

                <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-1">Plan</label>
                    <input
                      value={modalData.title}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Pack</label>
                    <input
                      value={modalData.planType}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      {modalData.planType === "Monthly"
                        ? "No of Days:"
                        : "No of Days"}
                    </label>
                    <input
                      value={days}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Days:</label>
                    <input
                      value={
                        modalData.planType === "Monthly"
                          ? getDaysOfWeekInDateRange(startDate, endDate)
                          : days === 1
                          ? getDayAbbreviation(startDate)
                          : `${days} Days Recurrence`
                      }
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      value={startDate}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">End Date</label>
                    <input
                      value={endDate}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input
                      value={
                        modalData.planType === "Hourly"
                          ? format24HourTo12Hour(startTime)
                          : "08:00 AM"
                      }
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">End Time</label>
                    <input
                      value={
                        modalData.planType === "Hourly"
                          ? format24HourTo12Hour(endTime)
                          : "08:00 PM"
                      }
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Amount (
                      {modalData.title === "Video Conferencing" &&
                      modalData.planType === "Hourly"
                        ? `₹${modalData.price}/hr/person`
                        : `₹${
                            modalData.price
                          }/${modalData.planType.toLowerCase()}`}
                      )
                    </label>
                    <input
                      value={`₹${displayAmount.toFixed(0)}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      GST (18%)
                    </label>
                    <input
                      value={`₹${displayGst}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">
                      Total (Pre-Discount)
                    </label>
                    <input
                      value={`₹${totalPreDiscount}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Apply Coupon
                    </label>
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

                  <div>
                    <label className="block text-gray-700 mb-1">Discount</label>
                    <input
                      value={`₹${discount}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">
                      Final Total (including GST)
                    </label>
                    <input
                      value={`₹${finalTotal}`}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2 font-semibold"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-gray-700 mb-1">
                      Select Referral Source
                    </label>
                    <select
                      value={referral}
                      onChange={(e) => setReferral(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select</option>
                      <option>Instagram</option>
                      <option>Facebook</option>
                      <option>Google</option>
                      <option>friend</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    « Back
                  </button>

                  {/* 🛒 Add to Cart Button */}
                  <button
                    onClick={() => {
                      const bookingItem = {
                        id: modalData.id,
                        title: modalData.title,
                        plan_type: modalData.planType,
                        start_date: startDate,
                        end_date: endDate,
                        start_time: startTime,
                        end_time: endTime,
                        total_days: days,
                        total_hours: totalHours,
                        num_attendees: numAttendees,
                        final_amount: parseFloat(finalTotal),
                      };
                      addToCart(bookingItem);
                      toast.success("✅ Added to cart!");
                      resetState();
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Add to Cart
                  </button>

                  <button
                    onClick={async () => {
                      // 🟢 Step 0 — Check workspace availability before payment
                      const availabilityResponse = await fetch(
                        "http://localhost/vayuhu_backend/check_workspace_availability.php",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            space_id: modalData.id,
                            plan_type: modalData.planType.toLowerCase(),
                            start_date: startDate,
                            end_date: endDate,
                            start_time: startTime,
                            end_time: endTime,
                          }),
                        }
                      ).then((res) => res.json());

                      if (!availabilityResponse.success) {
                        // 🧠 If backend sends available slots, show them in a friendly way
                        if (availabilityResponse.available_slots?.length) {
                          const slots = availabilityResponse.available_slots
                            .map((slot) => `• ${slot}`)
                            .join("\n");

                          toast.error(
                            `${availabilityResponse.message}\n\nAvailable Slots:\n${slots}`,
                            { autoClose: 5000 }
                          );
                        } else {
                          toast.error(availabilityResponse.message);
                        }
                        return; // ⛔ stop before payment
                      }

                      // 🔹 Step 0 — Load Razorpay script dynamically before anything else
                      const loadRazorpayScript = () => {
                        return new Promise((resolve) => {
                          if (window.Razorpay) {
                            resolve(true);
                            return;
                          }
                          const script = document.createElement("script");
                          script.src =
                            "https://checkout.razorpay.com/v1/checkout.js";
                          script.onload = () => resolve(true);
                          script.onerror = () => resolve(false);
                          document.body.appendChild(script);
                        });
                      };

                      const loaded = await loadRazorpayScript();
                      if (!loaded) {
                        toast.error(
                          "Razorpay SDK failed to load. Check your internet connection."
                        );
                        return;
                      }

                      // 🧾 Your original code starts exactly as you had it
                      const bookingData = {
                        user_id: getUserId(),
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

                      // 1️⃣ Create Razorpay Order
                      fetch(
                        "http://localhost/vayuhu_backend/create_razorpay_order.php",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            amount: bookingData.final_amount,
                          }),
                        }
                      )
                        .then((res) => res.json())
                        .then((data) => {
                          if (!data.success) throw new Error(data.message);

                          const options = {
                            key: data.key,
                            amount: bookingData.final_amount * 100,
                            currency: "INR",
                            name: "Vayuhu Workspaces",
                            description: `${modalData.title} Booking`,
                            order_id: data.order_id,
                            handler: function (response) {
                              // 2️⃣ Verify payment on backend
                              fetch(
                                "http://localhost/vayuhu_backend/verify_payment.php",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify(response),
                                }
                              )
                                .then((res) => res.json())
                                .then((verify) => {
                                  if (verify.success) {
                                    // 3️⃣ Add booking now
                                    fetch(
                                      "http://localhost/vayuhu_backend/add_workspace_booking.php",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(bookingData),
                                      }
                                    )
                                      .then((r) => r.json())
                                      .then((result) => {
                                        if (result.success) {
                                          // ✅ Show toast immediately
                                          toast.success(
                                            "🎉 Booking confirmed! Sending confirmation email..."
                                          );

                                          // 📨 Trigger backend email
                                          fetch(
                                            "http://localhost/vayuhu_backend/send_booking_email.php",
                                            {
                                              method: "POST",
                                              headers: {
                                                "Content-Type":
                                                  "application/json",
                                              },
                                              body: JSON.stringify({
                                                user_id: getUserId(),
                                                user_email:
                                                  JSON.parse(
                                                    localStorage.getItem("user")
                                                  )?.email || "",
                                                workspace_title:
                                                  modalData.title,
                                                plan_type: modalData.planType,
                                                start_date: startDate,
                                                end_date: endDate,
                                                start_time: startTime,
                                                end_time: endTime,
                                                total_amount: finalTotal,
                                                coupon_code: coupon || null,
                                                referral_source:
                                                  referral || null,
                                              }),
                                            }
                                          )
                                            .then((res) => res.json())
                                            .then((emailRes) => {
                                              if (emailRes.success) {
                                                toast.success(
                                                  "📧 Confirmation email sent!"
                                                );
                                              } else {
                                                toast.warn(
                                                  "Booking saved, but email failed: " +
                                                    emailRes.message
                                                );
                                              }
                                            })
                                            .catch((err) => {
                                              console.error(
                                                "Email error:",
                                                err
                                              );
                                              toast.warn(
                                                "Booking saved, but email sending failed."
                                              );
                                            });

                                          // ✅ Reset after short delay
                                          setTimeout(() => resetState(), 2000);
                                        } else {
                                          toast.error(
                                            result.message || "Booking failed"
                                          );
                                        }
                                      });
                                  } else {
                                    toast.error("Payment verification failed!");
                                  }
                                });
                            },
                            theme: { color: "#F97316" },
                          };

                          const rzp = new window.Razorpay(options);
                          rzp.open();
                        })
                        .catch((err) => {
                          toast.error("Payment setup failed: " + err.message);
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

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          // 🔸 Optional: call your Razorpay logic for totalAmount
          toast.info("Proceeding to checkout...");
        }}
      />

      <FloatingCartButton onClick={() => setCartOpen(true)} />
    </section>
  );
};

export default WorkspacePricing;
