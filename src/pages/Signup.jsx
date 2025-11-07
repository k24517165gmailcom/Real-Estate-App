import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const location = useLocation();

    const handleSignup = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost/vayuhu_backend/signup.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const result = await response.json();
        setMessage(result.message);
    };

    // ✅ Smooth scroll only if state.scrollToSignup is true
    useEffect(() => {
        if (location.state?.scrollToSignup) {
            const section = document.getElementById("signup-section");
            if (section) {
                setTimeout(() => {
                    section.scrollIntoView({ behavior: "smooth" });
                }, 400); // slight delay ensures smoothness
            }
        }
    }, [location.state]);

    return (
        <div className="min-h-screen bg-gray-100">


            {/* ✅ Signup Section */}
            <section
                id="signup-section"
                className="flex flex-col items-center justify-center min-h-screen"
            >
                <form
                    onSubmit={handleSignup}
                    className="bg-white p-8 rounded-2xl shadow-lg w-80"
                >
                    <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border p-2 mb-3 rounded"
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border p-2 mb-3 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border p-2 mb-4 rounded"
                    />

                    <button
                        type="submit"
                        className="w-full bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition-all"
                    >
                        Sign Up
                    </button>

                    {message && <p className="mt-4 text-center">{message}</p>}
                </form>
            </section>
        </div>
    );
};

export default Signup;
