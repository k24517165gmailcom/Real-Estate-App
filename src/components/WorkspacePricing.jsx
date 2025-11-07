import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- GLOBAL DAY MAPPINGS ---
const DAY_ABBREVIATIONS_MAP = {
    'Sunday': 'Sun',
    'Monday': 'Mon',
    'Tuesday': 'Tue',
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat'
};
// ---------------------------

// Helper function to generate time options in 24-hour format for state storage
const generateTimeOptions = () => {
    const times = [];
    for (let i = 8; i <= 20; i++) {
        const hour = i % 12 === 0 ? 12 : i % 12;
        const ampm = i < 12 || i === 24 ? "AM" : "PM";
        const timeValue = `${i.toString().padStart(2, '0')}:00`;
        const display = `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
        times.push({ value: timeValue, display: display });
    }
    return times;
};

const TIME_OPTIONS = generateTimeOptions();

// Correctly formats 24-hour time to 12-hour AM/PM display
const format24HourTo12Hour = (time24) => {
    if (!time24) return '';
    try {
        const [hours24, minutes] = time24.split(':');
        let hours = parseInt(hours24, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    } catch (error) {
        console.error("Time formatting error:", error);
        return time24;
    }
}

// Returns the chronological list of working days (Mon-Sat) for the Monthly plan, using abbreviations.
const getDaysOfWeekInDateRange = (start, end) => {
    const startObj = new Date(start);
    const endObj = new Date(end);

    if (!start || !end || startObj > endObj) return '';

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const standardWorkingOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // 1. Identify all unique working days present in the range
    const daysFoundIndices = new Set();
    let current = new Date(startObj);
    while (current <= endObj) {
        const dayIndex = current.getDay();
        if (dayIndex !== 0) { // 0 is Sunday. Only track working days.
            daysFoundIndices.add(dayIndex);
        }
        current.setDate(current.getDate() + 1);
    }

    if (daysFoundIndices.size === 0) return '';

    // 2. Filter the standard order based on the days found
    const presentWorkingDays = standardWorkingOrder.filter(day => daysFoundIndices.has(dayNames.indexOf(day)));

    // 3. Rotate the list to start with the start date's day
    const startDayName = dayNames[startObj.getDay()];
    const startIndex = presentWorkingDays.indexOf(startDayName);

    let rotatedDays = [];
    if (startIndex !== -1) {
        rotatedDays = presentWorkingDays.slice(startIndex).concat(presentWorkingDays.slice(0, startIndex));
    } else {
        rotatedDays = presentWorkingDays;
    }

    // 4. Map the full day names to abbreviations before joining
    const abbreviatedDays = rotatedDays.map(day => DAY_ABBREVIATIONS_MAP[day]);

    return abbreviatedDays.join(', ');
}


// Returns the abbreviated day name for single-day display.
const getDayAbbreviation = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return DAY_ABBREVIATIONS_MAP[dayName] || dayName;
}

const WorkspacePricing = () => {
    const location = useLocation();
    const selectedPlan = location.state?.plan;

    // State Variables
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

    const workspaces = [
        {
            id: "Individual-Working-Space",
            title: "Individual Working Space",
            desc: "Your private nook in the shared space.",
            type: "Desk",
            capacity: 45,
            monthly: 4000,
            daily: 500,
            hourly: 100,
            image: "workspaces-1.jpg",
        },
        {
            id: "Team-Leads-Cubicle",
            title: "Team Leads Cubicle",
            desc: "Lead with focus, drive success.",
            type: "Cubicle",
            capacity: 4,
            monthly: 4500,
            daily: 600,
            hourly: 120,
            image: "workspaces4.jpg",
        },
        {
            id: "Manager-Cubicle",
            title: "Manager Cubicle",
            desc: "Leadership Space, Your Way.",
            type: "Cubicle",
            capacity: 2,
            monthly: 6000,
            daily: 750,
            hourly: 120,
            image: "workspaces2.jpg",
        },
        {
            id: "Video-Conferencing",
            title: "Video Conferencing",
            desc: "Connect virtually, collaborate seamlessly.",
            type: "Conference Room",
            capacity: 8,
            hourly: 100,
            image: "workspaces3.jpg",
        },
        {
            id: "Executive-Cabin",
            title: "Executive Cabin",
            desc: "Elite Space for Strategic Leadership.",
            type: "Cabin",
            capacity: 2,
            monthly: 15000,
            daily: 1000,
            hourly: 200,
            image: "workspaces5.jpg",
        },
        {
            id: "CEO-Cabin",
            title: "CEO Cabin",
            desc: "Where Visionaries Lead and Inspire.",
            type: "Cabin",
            capacity: 1,
            monthly: 50000,
            daily: 4000,
            hourly: 500,
            image: "workspaces6.jpg",
        },
    ];

    // --- EFFECT HOOKS ---
    useEffect(() => { /* ... scroll to selected plan ... */ }, [selectedPlan]);

    // FIXED: Set default end date on start date change (handles month length correctly)
    useEffect(() => {
        if (!startDate || !modalData?.planType) return;
        const start = new Date(startDate);
        let end = new Date(start);

        if (modalData.planType === "Monthly") {
            // Recalculate end date based *only* on the current startDate
            end.setMonth(start.getMonth() + 1);
            end.setDate(end.getDate() - 1);
            setEndDate(end.toISOString().split("T")[0]);
        } else if (modalData.planType === "Daily" || modalData.planType === "Hourly") {
            end = new Date(start);
            setEndDate(end.toISOString().split("T")[0]);
        }

    }, [startDate, modalData?.planType]);

    useEffect(() => { /* ... dynamic day calculation ... */
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end < start) {
                setDays(0);
                return;
            }
            const timeDiff = end.getTime() - start.getTime();
            const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
            const calculatedDays = Math.round(dayDiff) + 1;
            setDays(calculatedDays > 0 ? calculatedDays : 1);
        } else {
            setDays(0);
        }
    }, [startDate, endDate]);

    useEffect(() => { /* ... calculate total hours ... */
        if (modalData?.planType === "Hourly" && startTime && endTime) {
            const startHour = parseInt(startTime.split(':')[0]);
            const endHour = parseInt(endTime.split(':')[0]);
            let calculatedHours = endHour - startHour;
            setTotalHours(calculatedHours > 0 ? calculatedHours : 1);
        } else {
            setTotalHours(1);
        }
    }, [startTime, endTime, modalData?.planType]);

    // Apply coupon (remains the same)
    const handleApplyCoupon = () => {
        if (coupon.trim().toLowerCase() === "vayuhu10") {
            setDiscount(10);
            toast.success("Coupon applied! You got ₹10 off!");
            setCoupon("");
        } else {
            toast.error("Invalid coupon code");
            setCoupon("");
        }
    };

    // CALCULATE BASE AMOUNT (Remains the same)
    const calculateBaseAmount = () => {
        const basePrice = modalData?.price || 0;
        let baseAmount = 0;
        if (modalData?.planType === "Daily") {
            baseAmount = basePrice * days;
        } else if (modalData?.planType === "Monthly") {
            baseAmount = basePrice;
        } else if (modalData?.planType === "Hourly") {
            const isPerPersonRate = modalData.title === "Video Conferencing";
            if (isPerPersonRate) {
                baseAmount = basePrice * numAttendees * totalHours * days;
            } else {
                baseAmount = basePrice * totalHours * days;
            }
        }
        return baseAmount;
    }

    const calculateTotal = () => {
        const finalBaseAmount = calculateBaseAmount();
        const gst = finalBaseAmount * 0.18;
        return finalBaseAmount + gst - discount;
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

    // Derived values for display
    const displayAmount = calculateBaseAmount();
    const displayGst = (displayAmount * 0.18).toFixed(0);
    const totalPreDiscount = (displayAmount + parseFloat(displayGst)).toFixed(0);
    const finalTotal = calculateTotal().toFixed(0);


    return (
        <section id="WorkSpaces" className="container mx-auto px-6 md:px-20 lg:px-32 py-20">
            <ToastContainer position="top-center" autoClose={2000} />

            {/* ... (Header and Workspace Cards JSX remain the same) ... */}
            <div className="text-center mb-12">
                <h6 className="uppercase text-orange-500 tracking-widest font-medium">Pricing</h6>
                <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-2">Workspace Plans</h2>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                    Choose the workspace that fits your needs. Flexible pricing for hourly,
                    daily, or monthly use.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {workspaces.map((item) => (
                    <motion.div
                        key={item.id}
                        id={item.id}
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200"
                    >
                        <img src={item.image} alt={item.title} className="w-full h-64 object-cover" />
                        <div className="p-6 bg-white">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                            <p className="text-gray-600 mb-2">{item.desc}</p>
                            <p className="text-sm text-gray-500 mb-2">Type: {item.type}</p>
                            <p className="text-sm text-gray-500 mb-2">
                                Capacity: {item.capacity} person{item.capacity > 1 ? "s" : ""}
                            </p>

                            {/* Pricing Buttons */}
                            {["monthly", "daily", "hourly"].map(
                                (type) =>
                                    item[type] && (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setModalData({
                                                    ...item,
                                                    planType: type.charAt(0).toUpperCase() + type.slice(1),
                                                    price: item[type],
                                                });
                                                setStartDate(new Date().toISOString().split("T")[0]);
                                                setEndDate("");
                                                setStep(1);
                                                // Default times
                                                setStartTime(type === "hourly" ? "17:00" : "08:00"); // 5 PM
                                                setEndTime(type === "hourly" ? "18:00" : "20:00");   // 6 PM
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
                                            <div>
                                                <label className="block text-gray-700 mb-2">Start Time:</label>
                                                <select
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                >
                                                    <option value="" disabled>Select Start Time</option>
                                                    {TIME_OPTIONS.slice(0, -1).map(t => (
                                                        <option key={t.value} value={t.value}>{t.display}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 mb-2">End Time:</label>
                                                <select
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                                    disabled={!startTime}
                                                >
                                                    <option value="" disabled>Select End Time</option>
                                                    {TIME_OPTIONS.slice(1).map(t => (
                                                        t.value > startTime && (
                                                            <option key={t.value} value={t.value}>{t.display}</option>
                                                        )
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* ATTENDEE INPUT (Only for Video Conferencing Hourly Plan) */}
                                        {modalData.title === "Video Conferencing" && (
                                            <div className="mb-4">
                                                <label className="block text-gray-700 mb-2">Number of Attendees:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={modalData.capacity}
                                                    value={numAttendees}
                                                    onChange={(e) => {
                                                        const val = Math.max(1, Math.min(modalData.capacity, parseInt(e.target.value) || 1));
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
                                    disabled={!termsAccepted || !startDate ||
                                        (modalData.planType === "Hourly" && (!startTime || !endTime || totalHours <= 0 || numAttendees < 1))}
                                    onClick={() => setStep(2)}
                                    className={`w-full py-2 rounded-lg font-medium transition ${termsAccepted && startDate && totalHours > 0 && numAttendees >= 1
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
                                    {/* Using format24HourTo12Hour on both start and end time */}
                                    {modalData.planType === "Hourly" && startTime && endTime && ` from ${format24HourTo12Hour(startTime)} to ${format24HourTo12Hour(endTime)}`}
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
                                            toast.success("Booking Confirmed!");
                                            setTimeout(() => {
                                                resetState();
                                            }, 1500);
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