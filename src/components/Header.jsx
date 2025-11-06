import React from "react";
import Navbar from "./Navbar";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleScrollNavigation = (sectionId) => {
        if (location.pathname !== "/") {
            navigate("/"); // Go to homepage first
            setTimeout(() => {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
            }, 500);
        } else {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <header
            id="Header"
            className="relative min-h-screen bg-cover bg-center flex flex-col justify-between overflow-hidden"
            style={{ backgroundImage: "url('/vayuhuu.jpg')" }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Navbar */}
            <div className="relative z-20">
                <Navbar />
            </div>

            {/* Hero Content */}
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-10 md:px-16 lg:px-32 py-20 md:py-28 flex-grow"
            >
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[80px] font-bold leading-tight text-white max-w-4xl mx-auto">
                    Work. Connect.{" "}
                    <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                        Grow.
                    </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-gray-200 px-4">
                    Discover flexible and inspiring coworking spaces at{" "}
                    <span className="font-semibold text-orange-400">Vayuhu</span> — built
                    for creators, freelancers, and teams to collaborate and thrive.
                </p>

                {/* Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <button
                        onClick={() => handleScrollNavigation("WorkSpaces")}
                        className="w-full sm:w-auto border border-orange-400 text-orange-400 px-8 py-3 rounded-full text-sm sm:text-base font-medium hover:bg-orange-500 hover:text-white transition-all duration-300"
                    >
                        Explore Workspaces
                    </button>
                    <button
                        onClick={() => handleScrollNavigation("Contact")}
                        className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300"
                    >
                        Contact Us
                    </button>
                </div>
            </motion.div>
        </header>
    );
};

export default Header;
