import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    Home,
    Users,
    CalendarDays,
    FileText,
    ArrowLeft,
    X,
    LogOut,
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();

    const navItems = [
        { to: "/", icon: ArrowLeft, label: "Go Back To Website" },
        { to: "/dashboard", icon: Home, label: "Dashboard" },
        { to: "/profile", icon: Users, label: "Users" },
        { to: "/reservations", icon: CalendarDays, label: "Reservations" },
        { to: "/visitors", icon: FileText, label: "Visitors" },
    ];

    const linkClasses = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
     ${isActive
            ? "bg-orange-500 text-white shadow-sm"
            : "text-gray-700 hover:bg-orange-100 hover:text-orange-600"
        }`;

    const handleLogout = () => {
        // 🧹 Clear local storage and redirect to login
        localStorage.removeItem("user");
        navigate("/");
        window.dispatchEvent(new Event("userUpdated"));
    };

    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r flex flex-col justify-between
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 lg:static lg:shadow-none`}
            aria-label="Sidebar"
        >
            {/* --- Mobile Close Button --- */}
            <button
                onClick={() => setIsOpen(false)}
                aria-label="Close sidebar"
                className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-orange-500"
            >
                <X size={22} />
            </button>

            {/* --- Header --- */}
            <div className="flex items-center justify-center py-6 border-b bg-orange-50 lg:bg-white">
                <h1 className="text-2xl font-bold text-orange-500">Vayuhu</h1>
            </div>

            {/* --- Navigation Links --- */}
            <nav className="mt-6 space-y-1 px-2 flex-1 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={linkClasses}
                        onClick={() => setIsOpen(false)}
                    >
                        <Icon size={18} /> {label}
                    </NavLink>
                ))}
            </nav>

            {/* --- Footer --- */}
            <footer className="border-t bg-white">{/* --- Logout Button --- */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 border-t text-red-500 hover:bg-red-50 
                     font-medium text-sm transition-all duration-200"
                >
                    <LogOut size={18} /> Logout
                </button>
            </footer>
            <div className="text-center text-xs text-gray-500 py-3">
                <p>Vayuhu © {new Date().getFullYear()}</p>
                <span className="text-orange-500">
                    {" "}
                    Built with passion for modern professionals.
                </span>
            </div>


        </aside>
    );
};

export default Sidebar;
