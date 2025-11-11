import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Admin login only (no signup toggle)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const url = "http://localhost/vayuhu_backend/admin_login.php"; // ⚙️ your admin login endpoint
    const payload = { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setMessage(result.message);

      if (result.status === "success" && result.admin) {
        // ✅ Save admin info
        localStorage.setItem("admin", JSON.stringify(result.admin));

        // Optional: event listener for reactivity
        window.dispatchEvent(new Event("adminUpdated"));

        // ✅ Navigate to admin dashboard
        setTimeout(() => navigate("/admin"), 800);
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  // Optional scroll animation
  useEffect(() => {
    window.scrollTo({ top: 700, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Admin Login 👨‍💼
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 mb-3 rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 mb-4 rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-semibold py-2 rounded hover:bg-orange-600 transition-all"
          >
            Login
          </button>

          {message && (
            <p
              className={`mt-4 text-center text-sm font-medium ${
                message.includes("success") ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>

        <p className="text-center text-sm mt-6 text-gray-600">
          Back to{" "}
          <span
            onClick={() => navigate("/")}
            className="text-orange-500 font-medium cursor-pointer hover:underline"
          >
            main site
          </span>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
