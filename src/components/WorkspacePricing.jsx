import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const WorkspacePricing = () => {
    const location = useLocation();
    const selectedPlan = location.state?.plan;

    const [modalData, setModalData] = useState(null); // stores workspace clicked

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

    return (
        <section id="WorkSpaces" className="container mx-auto px-6 md:px-20 lg:px-32 py-20">
            {/* Header */}
            <div className="text-center mb-12">
                <h6 className="uppercase text-orange-500 tracking-widest font-medium">
                    Pricing
                </h6>
                <h2 className="text-3xl sm:text-5xl font-bold text-gray-800 mt-2">
                    Workspace Plans
                </h2>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                    Choose the workspace that fits your needs. Flexible pricing for hourly,
                    daily, or monthly use.
                </p>
            </div>

            {/* Workspace Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {workspaces.map((item) => {
                    const isSelected =
                        selectedPlan && selectedPlan.replace(/\s+/g, "-") === item.id;

                    return (
                        <motion.div
                            key={item.id}
                            id={item.id}
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className={`relative rounded-2xl overflow-hidden shadow-lg border ${isSelected
                                ? "border-orange-500 shadow-[0_0_25px_rgba(255,165,0,0.5)]"
                                : "border-gray-200"
                                }`}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-64 object-cover"
                            />
                            <div className="p-6 bg-white">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 mb-2">{item.desc}</p>
                                <p className="text-sm text-gray-500 mb-2">Type: {item.type}</p>
                                <p className="text-sm text-gray-500 mb-2">
                                    Capacity: {item.capacity} person{item.capacity > 1 ? "s" : ""}
                                </p>

                                {/* Pricing buttons */}
                                {item.monthly && (
                                    <button
                                        onClick={() => setModalData({ ...item, planType: "Monthly", price: item.monthly })}
                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mr-2 mb-2 hover:bg-orange-600 transition"
                                    >
                                        Monthly ₹{item.monthly}
                                    </button>
                                )}
                                {item.daily && (
                                    <button
                                        onClick={() => setModalData({ ...item, planType: "Daily", price: item.daily })}
                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mr-2 mb-2 hover:bg-orange-600 transition"
                                    >
                                        Daily ₹{item.daily}
                                    </button>
                                )}
                                {item.hourly && (
                                    <button
                                        onClick={() => setModalData({ ...item, planType: "Hourly", price: item.hourly })}
                                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium mb-2 hover:bg-orange-600 transition"
                                    >
                                        Hourly ₹{item.hourly}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {modalData && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl relative"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                onClick={() => setModalData(null)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✕
                            </button>

                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                {modalData.title} - {modalData.planType} Plan
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Choose your required timings for the workspace plan & {modalData.planType.toLowerCase()} pack
                            </p>

                            {/* Start Date */}
                            <label className="block text-gray-700 mb-2">Start Date:</label>
                            <input
                                type="date"
                                defaultValue={new Date().toISOString().split("T")[0]}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
                            />

                            {/* Terms & Conditions */}
                            <label className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                />
                                Accept Terms & Conditions
                            </label>

                            <button className="bg-orange-500 text-white w-full py-2 rounded-lg font-medium hover:bg-orange-600 transition">
                                Next
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default WorkspacePricing;
