import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Send, User, Mail, Phone, MessageSquare } from "lucide-react";

const VirtualOfficeForm = () => {
    const [result, setResult] = useState("");
    const nameInputRef = useRef(null); // 👈 Ref for focusing

    // Handle form submission
    const onSubmit = async (event) => {
        event.preventDefault();
        setResult("Sending...");
        const formData = new FormData(event.target);
        formData.append("access_key", "a0392f81-43c1-4555-a543-989e0cb4772f");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (data.success) {
                toast.success("Message sent successfully!");
                event.target.reset();
            } else {
                toast.error("Failed to send. Please try again.");
            }
        } catch {
            toast.error("⚠️ Network error. Please try again later.");
        } finally {
            setResult("");
        }
    };

    // Focus first input on Enquiry click
    const handleEnquiryClick = () => {
        if (nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    return (
        <motion.section
            id="VirtualOfficeForm"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="py-20 px-6 lg:px-32 bg-white text-center"
        >
            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    className="flex items-center gap-2 bg-white text-orange-600 border border-orange-300 px-6 py-2 rounded-xl shadow-md hover:bg-orange-50 hover:shadow-lg transition-all duration-300"
                >
                    <span>»</span> Book Now
                </button>

                <button
                    onClick={handleEnquiryClick}
                    className="flex items-center gap-2 bg-white text-orange-600 border border-orange-300 px-6 py-2 rounded-xl shadow-md hover:bg-orange-50 hover:shadow-lg transition-all duration-300"
                >
                    <span>»</span> Enquiry Now
                </button>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-10">
                Get Started with Your <span className="text-orange-500">Virtual Office</span> Today
            </h2>

            {/* Form Card */}
            <form
                onSubmit={onSubmit}
                className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="relative">
                        <input
                            ref={nameInputRef}
                            type="text"
                            name="Name"
                            placeholder="Your Name"
                            required
                            className="w-full border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none transition"
                        />
                        <User className="absolute right-3 top-3.5 text-orange-500" size={20} />
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <input
                            type="email"
                            name="Email"
                            placeholder="Email Address"
                            required
                            className="w-full border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none transition"
                        />
                        <Mail className="absolute right-3 top-3.5 text-orange-500" size={20} />
                    </div>

                    {/* Contact */}
                    <div className="relative">
                        <input
                            type="tel"
                            name="Contact"
                            placeholder="Contact Number"
                            required
                            className="w-full border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none transition"
                        />
                        <Phone className="absolute right-3 top-3.5 text-orange-500" size={20} />
                    </div>

                    {/* Referral Source */}
                    <div className="relative">
                        <select
                            name="Referral"
                            required
                            className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none transition"
                        >
                            <option value="">Referral Source</option>
                            <option>Google Search</option>
                            <option>Friend / Colleague</option>
                            <option>Social Media</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

                {/* Message Box */}
                <div className="relative mt-6">
                    <textarea
                        name="Message"
                        rows="4"
                        placeholder="Your Message..."
                        required
                        className="w-full border border-gray-300 rounded-lg py-3 pl-4 pr-10 focus:border-orange-500 focus:ring-1 focus:ring-orange-400 outline-none transition resize-none"
                    ></textarea>
                    <MessageSquare className="absolute right-3 top-3.5 text-orange-500" size={20} />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="mt-6 w-full flex justify-center items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg shadow-md transition-all duration-300"
                >
                    <span>»</span> {result ? result : "Submit"}
                </button>
            </form>
        </motion.section>
    );
};

export default VirtualOfficeForm;
