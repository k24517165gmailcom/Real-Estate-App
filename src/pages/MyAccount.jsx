import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyAccount = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // ✅ Load user from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            // If no user, redirect to signup
            navigate("/signup");
        }
    }, [navigate]);

    const handleLogout = () => {
        // 1️⃣ Remove user data
        localStorage.removeItem("user");
        setUser(null);

        // 2️⃣ Notify Navbar to update instantly
        window.dispatchEvent(new Event("userUpdated"));

        // 3️⃣ Redirect to signup page
        navigate("/auth");
    };

    if (!user) return null; // prevent flash before redirect

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
                <h2 className="text-2xl font-semibold mb-4">My Account</h2>

                <div className="text-left mb-6">
                    <p className="mb-2"><strong>Name:</strong> {user.name}</p>
                    <p className="mb-2"><strong>Email:</strong> {user.email}</p>
                    <p className="mb-2"><strong>User ID:</strong> {user.id}</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-full transition-all duration-300"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default MyAccount;
