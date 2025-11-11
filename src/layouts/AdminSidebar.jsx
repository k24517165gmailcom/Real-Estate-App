import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Settings,
    FileText,
    X,
    LogOut,
    ChevronDown,
    ChevronRight,
    BarChart3,
    Building2,
    UserCog,
    ClipboardList,
    ArrowLeft,
} from "lucide-react";
import { assets } from "../assets/assets";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    // ✅ Submenu toggles
    const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
     ${isActive
            ? "bg-orange-500 text-white shadow-sm"
            : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
        }`;

    const handleLogout = () => {
        localStorage.removeItem("admin");
        window.dispatchEvent(new Event("adminUpdated"));
        navigate("/admin-login");
    };


    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r flex flex-col justify-between
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 lg:static lg:shadow-none`}
            aria-label="Admin Sidebar"
        >
            {/* --- Mobile Close Button --- */}
            <button
                onClick={() => setIsOpen(false)}
                aria-label="Close sidebar"
                className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-orange-500"
            >
                <X size={22} />
            </button>

            {/* --- Header (Logo) --- */}
            <div className="flex items-center justify-center py-6 border-b bg-orange-50 lg:bg-white">
                <img
                    src={assets.brandLogo}
                    alt="Admin Logo"
                    className="w-32 cursor-pointer"
                    onClick={() => navigate("/admin")}
                />
            </div>

            {/* --- Navigation --- */}
            <nav className="mt-6 space-y-1 px-2 flex-1 overflow-y-auto">
                {/* Back to website */}
                <NavLink
                    to="/"
                    className={linkClasses}
                    onClick={() => setIsOpen(false)}
                >
                    <ArrowLeft size={18} /> Back to Website
                </NavLink>

                {/* Dashboard */}
                <NavLink
                    to="/admin"
                    className={linkClasses}
                    onClick={() => setIsOpen(false)}
                >
                    <LayoutDashboard size={18} /> Dashboard
                </NavLink>

                {/* --- User Management --- */}
                <div>
                    <button
                        onClick={() => setIsUserMgmtOpen(!isUserMgmtOpen)}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-medium text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
                    >
                        <span className="flex items-center gap-3">
                            <Users size={18} /> User Management
                        </span>
                        {isUserMgmtOpen ? (
                            <ChevronDown size={18} />
                        ) : (
                            <ChevronRight size={18} />
                        )}
                    </button>

                    {isUserMgmtOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                            <NavLink
                                to="/admin/users"
                                className={linkClasses}
                                onClick={() => setIsOpen(false)}
                            >
                                <UserCog size={16} /> All Users
                            </NavLink>
                            <NavLink
                                to="/admin/companies"
                                className={linkClasses}
                                onClick={() => setIsOpen(false)}
                            >
                                <Building2 size={16} /> Companies
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* --- Reports --- */}
                <div>
                    <button
                        onClick={() => setIsReportsOpen(!isReportsOpen)}
                        className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-medium text-sm text-gray-700 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
                    >
                        <span className="flex items-center gap-3">
                            <BarChart3 size={18} /> Reports
                        </span>
                        {isReportsOpen ? (
                            <ChevronDown size={18} />
                        ) : (
                            <ChevronRight size={18} />
                        )}
                    </button>

                    {isReportsOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                            <NavLink
                                to="/admin/reports"
                                className={linkClasses}
                                onClick={() => setIsOpen(false)}
                            >
                                <FileText size={16} /> Monthly Reports
                            </NavLink>
                            <NavLink
                                to="/admin/audit"
                                className={linkClasses}
                                onClick={() => setIsOpen(false)}
                            >
                                <ClipboardList size={16} /> Audit Logs
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* Settings */}
                <NavLink
                    to="/admin/settings"
                    className={linkClasses}
                    onClick={() => setIsOpen(false)}
                >
                    <Settings size={18} /> Settings
                </NavLink>
            </nav>

            {/* --- Footer --- */}
            <footer className="border-t bg-white">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 font-medium text-sm transition-all duration-200"
                >
                    <LogOut size={18} /> Logout
                </button>
            </footer>

            {/* --- Copyright --- */}
            <div className="text-center text-xs text-gray-500 py-3">
                <p>Vayuhu Admin © {new Date().getFullYear()}</p>
                <span className="text-orange-500"> Managing with clarity and control.</span>
            </div>
        </aside>
    );
};

export default AdminSidebar;
