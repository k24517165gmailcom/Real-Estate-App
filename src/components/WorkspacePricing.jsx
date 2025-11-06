import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const WorkspacePricing = () => {
    const location = useLocation();
    const selectedPlan = location.state?.plan;

    // State Variables
    const [modalData, setModalData] = useState(null);
    const [step, setStep] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [referral, setReferral] = useState("");
    const [days, setDays] = useState(0);

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
            capacity: 1,
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

    // Scroll to selected workspace on page load
    useEffect(() => {
        if (selectedPlan) {
            const element = document.getElementById(selectedPlan.replace(/\s+/g, "-"));
            if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [selectedPlan]);

    // Set default end date on start date change
    useEffect(() => {
        if (!startDate || !modalData?.planType) return;

        const start = new Date(startDate);
        let end = new Date(start);

        if (modalData.planType === "Monthly") {
            end.setMonth(start.getMonth() + 1);
            // Monthly plans often end one day *before* the next month's start date
            end.setDate(end.getDate() - 1);
        } else if (modalData.planType === "Daily" || modalData.planType === "Hourly") {
            end = new Date(start);
        }

        // Only set the end date if it hasn't been manually set by the user yet
        if (!endDate || endDate === startDate) {
            setEndDate(end.toISOString().split("T")[0]);
        }
    }, [startDate, modalData?.planType]);

    // Dynamic day calculation
    useEffect(() => {
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

    // Apply coupon
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

    // Calculate the base amount depending on the plan type and duration
    const calculateBaseAmount = () => {
        const basePrice = modalData?.price || 0;
        if (modalData?.planType === "Daily") {
            return basePrice * days;
        } else if (modalData?.planType === "Monthly") {
            // Monthly price is fixed, regardless of the days calculated (30/31 days)
            return basePrice;
        } else if (modalData?.planType === "Hourly") {
            // For now, assume single session price.
            return basePrice;
        }
        return 0;
    }

    const calculateTotal = () => {
        const finalBaseAmount = calculateBaseAmount();
        const gst = finalBaseAmount * 0.18;
        return finalBaseAmount + gst - discount;
    };

    // Helper to get day name for Step 3
    const getDayName = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // --- State Reset Function ---
    const resetState = () => {
        setModalData(null);
        setStep(1);
        setStartDate("");
        setEndDate("");
        setTermsAccepted(false);
        setCoupon("");
        setDiscount(0);
        setReferral("");
        setDays(0);
    };

    // Get the base amount for display (before GST)
    const displayAmount = calculateBaseAmount();
    // Get the GST amount
    const displayGst = (displayAmount * 0.18).toFixed(0);
    // Get the total before discount
    const totalPreDiscount = (displayAmount + parseFloat(displayGst)).toFixed(0);
    // Get the final price
    const finalTotal = calculateTotal().toFixed(0);


    return (
        <section id="WorkSpaces" className="container mx-auto px-6 md:px-20 lg:px-32 py-20">
            <ToastContainer position="top-center" autoClose={2000} />

            {/* Header */}
            <div className="text-center mb-12">
                <h6 className="uppercase text-orange-500 tracking-widest font-medium">Pricing</h6>
                <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-2">Workspace Plans</h2>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                    Choose the workspace that fits your needs. Flexible pricing for hourly,
                    daily, or monthly use.
                </p>
            </div>

            {/* Workspace Cards (JSX remains the same) */}
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

            {/* Modals (Steps 1 & 2 JSX remain the same) */}
            <AnimatePresence>
                {modalData && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Step 1: Start Date */}
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
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                                />

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
                                    disabled={!termsAccepted || !startDate}
                                    onClick={() => setStep(2)}
                                    className={`w-full py-2 rounded-lg font-medium transition ${termsAccepted && startDate
                                            ? "bg-orange-500 text-white hover:bg-orange-600"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    Next »
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: End Date (Editable) */}
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
                                    {modalData.title} & {modalData.planType} Pack from 08:00 AM to 08:00 PM
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
                                        <label className="block text-gray-700 mb-2">Select End Date:</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 shadow-sm"
                                        />
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

                        {/* Step 3: Review Details and Payment (Monthly Conditional Logic Applied) */}
                        {step === 3 && (
                            <motion.div
                                className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-xl relative overflow-y-auto max-h-[90vh]"
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
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    {/* Left column */}
                                    <div>
                                        <label className="block text-gray-700 mb-1">Plan</label>
                                        <input value={modalData.title} readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />

                                        {/* CONDITIONAL FIELD: Show "Day of Week" for Daily, just "Days" for Monthly/Other */}
                                        <label className="block text-gray-700 mb-1">
                                            {modalData.planType === "Monthly" ? "Days Included" : "No of Days"}
                                        </label>
                                        <input
                                            value={days}
                                            readOnly
                                            className="w-full border rounded-lg px-3 py-2 mb-3"
                                        />

                                        <label className="block text-gray-700 mb-1">Start Date</label>
                                        <input value={startDate} readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />
                                        <label className="block text-gray-700 mb-1">Start Time</label>
                                        <input value="08:00 AM" readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />

                                        <label className="block text-gray-700 mb-1">Amount</label>
                                        <input value={`₹${displayAmount.toFixed(0)}`} readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />

                                        <label className="block text-gray-700 mb-1">Total</label>
                                        <input value={`₹${totalPreDiscount}`} readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />

                                        <label className="block text-gray-700 mb-1">Discount</label>
                                        <input value={`₹${discount}`} readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />

                                        <label className="block text-gray-700 mb-1">Select Referral Source</label>
                                        <select
                                            value={referral}
                                            onChange={(e) => setReferral(e.target.value)}
                                            className="w-full border rounded-lg px-3 py-2 mb-3"
                                        >
                                            <option value="">Select</option>
                                            <option>Instagram</option>
                                            <option>Facebook</option>
                                            <option>Google</option>
                                            <option>Friend</option>
                                        </select>
                                    </div>

                                    {/* Right column */}
                                    <div>
                                        {/* CONDITIONAL FIELD: Show Day of Week only for Daily plan */}
                                        {modalData.planType !== "Monthly" && (
                                            <>
                                                <label className="block text-gray-700 mb-1">Day of Week</label>
                                                <input value={getDayName(startDate)} readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />
                                            </>
                                        )}
                                        {/* Placeholder for monthly day of week spacing */}
                                        {modalData.planType === "Monthly" && (
                                            <>
                                                <label className="block text-gray-700 mb-1"> </label>
                                                <input value={""} readOnly className="w-full border rounded-lg px-3 py-2 mb-3 border-white bg-transparent" />
                                            </>
                                        )}

                                        <label className="block text-gray-700 mb-1">Pack</label>
                                        <input value={modalData.planType} readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />

                                        <label className="block text-gray-700 mb-1">End Date</label>
                                        <input value={endDate} readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />

                                        <label className="block text-gray-700 mb-1">End Time</label>
                                        <input value="08:00 PM" readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />

                                        <label className="block text-gray-700 mb-1">GST (18%)</label>
                                        <input value={`₹${displayGst}`} readOnly className="w-full border rounded-lg px-3 py-2 mb-3" />

                                        <label className="block text-gray-700 mb-1">Apply Coupon</label>
                                        <div className="flex mb-3">
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

                                        <label className="block text-gray-700 mb-1">Final Total (including GST)</label>
                                        <input
                                            value={`₹${finalTotal}`}
                                            readOnly
                                            className="w-full border rounded-lg px-3 py-2 mb-3 font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between">
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