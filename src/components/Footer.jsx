import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { assets } from "../assets/assets";

const Footer = () => {
    return (
        <footer
            id="Footer"
            className="bg-gray-900 text-gray-400 pt-16 px-6 md:px-20 lg:px-32 overflow-hidden"
        >
            <div className="container mx-auto flex flex-col md:flex-row justify-between gap-12 text-center md:text-left">

                {/* About Section */}
                <div className="md:w-1/3">
                    {/*<h2 className="text-2xl font-bold text-white mb-3">
                        <span className="text-orange-400">V</span>ayuhu
                    </h2>*/}
                    <img
                        src={assets.brandLogo}
                        alt="Vayuhu Logo"
                        className="w-32 h-auto md:w-40 object-contain"
                    />

                    <p className="text-sm leading-relaxed">
                        At <span className="text-orange-500 font-medium">Vayuhu</span>, we’re building more than just
                        workspaces — we’re creating a community where innovation thrives.
                        Whether you're a freelancer, startup, or small team, our space is designed
                        to help you work, connect, and grow together.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="md:w-1/5">
                    <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
                    <ul className="flex flex-col gap-2 text-sm">
                        <a href="#Header" className="hover:text-white transition-all">Home</a>
                        <a href="#About" className="hover:text-white transition-all">About</a>
                        <a href="#Projects" className="hover:text-white transition-all">Workspaces</a>
                        <a href="#Testimonials" className="hover:text-white transition-all">Testimonials</a>
                        <a href="#Contact" className="hover:text-white transition-all">Contact</a>
                    </ul>
                </div>

                {/* Contact Info */}
                <div className="md:w-1/3">
                    <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
                    <div className="flex flex-col gap-3 text-sm">
                        <div className="flex justify-center md:justify-start items-center gap-2">
                            <MapPin size={18} className="text-orange-500" />
                            <span>25 Kalpana Chawla Road, Bangalore 560094</span>
                        </div>
                        <div className="flex justify-center md:justify-start items-center gap-2">
                            <Phone size={18} className="text-orange-500" />
                            <a
                                href="tel:+917348857574"
                                className="hover:text-white transition"
                            >
                                +91 73488 57574
                            </a>
                        </div>
                        <div className="flex justify-center md:justify-start items-center gap-2">
                            <Mail size={18} className="text-orange-500" />
                            <a
                                href="mailto:support@vayuhu.com"
                                className="hover:text-white transition"
                            >
                                support@vayuhu.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 mt-12 py-6 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Vayuhu. All Rights Reserved.
                <br className="md:hidden" />
                <span className="text-orange-500"> Built with passion for modern professionals.</span>
            </div>
        </footer>
    );
};

export default Footer;
