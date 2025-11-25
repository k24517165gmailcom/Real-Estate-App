import React, { useEffect, useState } from "react";
import About from "../components/About";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonails";
import Team from "../components/Team";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import WorkspacePricing from "../components/WorkspacePricing";

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("visitPopup");

    if (!alreadyShown) {
      // 2-second delay
      const timer = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem("visitPopup", "true");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="bg-white px-6 py-8 rounded-lg shadow-xl w-[90%] max-w-md text-center">
            <h2 className="text-2xl font-bold mb-3">Welcome 🎉</h2>
            <p className="text-gray-600 mb-4">
              Thanks for visiting our website!
            </p>

            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <About />
      <WorkspacePricing />
      <Testimonials />
      <Team />
      <Contact />
      <Footer />
    </>
  );
};

export default Home;
