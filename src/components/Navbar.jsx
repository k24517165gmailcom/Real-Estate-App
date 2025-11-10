import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Load user from localStorage once
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ✅ Detect scroll to change navbar style
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Helper for smooth scrolling
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Navigation handlers
  const handleNavClick = (id) => {
    setShowMobileMenu(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => scrollToSection(id), 400);
    } else {
      scrollToSection(id);
    }
  };

  const handleVirtualOffice = () => {
    setShowMobileMenu(false);
    if (location.pathname !== "/virtual") {
      navigate("/virtual");
      setTimeout(() => scrollToSection("VirtualOfficeServices"), 400);
    } else {
      scrollToSection("VirtualOfficeServices");
    }
  };

  return (
    <>
      {/* ✅ Navbar */}
      <div
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/80 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center py-3 px-4 sm:px-8 md:px-16 lg:px-24">
          {/* Logo */}
          <img
            src={assets.brandLogo}
            alt="Vayuhu Logo"
            className="w-28 sm:w-32 md:w-36 lg:w-40 cursor-pointer"
            onClick={() => {
              setShowMobileMenu(false);
              if (location.pathname !== "/") {
                navigate("/");
                setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 400);
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          />

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center gap-6 lg:gap-8 text-white font-medium">
            <button onClick={() => handleNavClick("Header")} className="hover:text-orange-400">Home</button>
            <button onClick={() => handleNavClick("About")} className="hover:text-orange-400">About</button>
            <button onClick={() => handleNavClick("WorkSpaces")} className="hover:text-orange-400">WorkSpaces</button>
            <button onClick={() => handleNavClick("Testimonials")} className="hover:text-orange-400">Testimonials</button>
            <button onClick={handleVirtualOffice} className="hover:text-orange-400">Virtual Office</button>
          </ul>

          {/* CTA Button */}
          <button
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className="hidden md:block bg-white text-black font-semibold px-6 py-2 rounded-full 
                       hover:bg-orange-500 hover:text-white transition-all duration-300"
          >
            {user ? "My Account" : "Sign up / Login"}
          </button>

          {/* Mobile Menu Icon */}
          <img
            onClick={() => setShowMobileMenu(true)}
            src={assets.menu_icon}
            className="md:hidden w-6 sm:w-7 cursor-pointer invert"
            alt="menu icon"
          />
        </div>
      </div>

      {/* ✅ Frosted Glass Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-[9999] 
          bg-black/60 backdrop-blur-lg flex flex-col items-center justify-center 
          transition-all duration-500 ease-in-out
          ${showMobileMenu ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      >
        {/* Close Button */}
        <img
          onClick={() => setShowMobileMenu(false)}
          src={assets.cross_icon}
          className="absolute top-6 right-6 w-6 cursor-pointer"
          alt="close menu"
        />

        {/* Nav Links */}
        <ul className="flex flex-col items-center gap-6 text-lg font-semibold">
          <button onClick={() => handleNavClick("Header")} className="hover:text-orange-400">Home</button>
          <button onClick={() => handleNavClick("About")} className="hover:text-orange-400">About</button>
          <button onClick={() => handleNavClick("WorkSpaces")} className="hover:text-orange-400">WorkSpaces</button>
          <button onClick={() => handleNavClick("Testimonials")} className="hover:text-orange-400">Testimonials</button>
          <button onClick={handleVirtualOffice} className="hover:text-orange-400">Virtual Office</button>
        </ul>

        {/* CTA Button */}
        <button
          onClick={() => {
            setShowMobileMenu(false);
            navigate(user ? "/dashboard" : "/auth");
          }}
          className="mt-8 bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-2 rounded-full transition-all duration-300"
        >
          {user ? "My Account" : "Sign up / Login"}
        </button>
      </div>
    </>
  );
};

export default Navbar;
