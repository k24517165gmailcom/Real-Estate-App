import React, { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost/vayuhu_backend";

const AdminVisitorsOverview = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // -----------------------------
  // Fetch Visitors
  // -----------------------------
  const fetchVisitors = async () => {
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/get_all_visitors.php`);
      const data = await res.json();

      if (!data.success) {
        setMessage(data.message || "Failed to load visitors");
        setLoading(false);
        return;
      }

      setVisitors(data.visitors);
    } catch (err) {
      console.error("Error fetching visitors:", err);
      setMessage("Something went wrong while fetching visitors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // -----------------------------
  // Render Helpers
  // -----------------------------
  const totalVisitors = visitors.length;

  // Aggregate visitors per user
  const userMap = {};
  visitors.forEach((v) => {
    if (!userMap[v.user_id]) {
      userMap[v.user_id] = {
        userId: v.user_id,
        userName: v.user_name || "Unknown User",
        companyName: v.company_name || "—",
        totalVisitors: 0,
      };
    }
    userMap[v.user_id].totalVisitors += 1;
  });

  const userStats = Object.values(userMap);

  const totalUsers = userStats.length;
  const avgVisitorsPerUser = totalUsers ? (totalVisitors / totalUsers).toFixed(1) : 0;

  // Format date/time
  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString() : "-");
  const formatTime = (timeStr) => (timeStr ? timeStr.slice(0, 5) : "-");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-orange-600">
          Admin Visitors Overview
        </h1>
        <p className="text-sm text-gray-500">
          Overview of users and their visitors
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4 flex flex-col justify-center hover:shadow-md transition">
          <h2 className="text-sm text-gray-500">Total Visitors</h2>
          <p className="text-2xl font-bold text-orange-600">{totalVisitors}</p>
        </div>
        <div className="bg-white shadow-sm border border-green-100 rounded-2xl p-4 flex flex-col justify-center hover:shadow-md transition">
          <h2 className="text-sm text-gray-500">Total Users Who Added Visitors</h2>
          <p className="text-2xl font-bold text-green-600">{totalUsers}</p>
        </div>
        <div className="bg-white shadow-sm border border-blue-100 rounded-2xl p-4 flex flex-col justify-center hover:shadow-md transition">
          <h2 className="text-sm text-gray-500">Average Visitors per User</h2>
          <p className="text-2xl font-bold text-blue-600">{avgVisitorsPerUser}</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <p
          className={`text-sm mt-3 text-center ${
            message.toLowerCase().includes("success")
              ? "text-green-600"
              : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}

      {/* Visitors Table */}
      <div className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Loading visitor data...</p>
        ) : visitors.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No visitor records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-orange-50 text-gray-700 uppercase text-xs sticky top-0 z-10">
                <tr>
                  {[
                    "S.No",
                    "Visitor Name",
                    "Contact No",
                    "Email",
                    "Company Name",
                    "Visiting Date",
                    "Visiting Time",
                    "Reason",
                    "Added By",
                  ].map((col) => (
                    <th key={col} className="p-2 border">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, i) => (
                  <tr
                    key={v.id}
                    className="hover:bg-orange-50 transition duration-150"
                  >
                    <td className="p-2 border">{i + 1}</td>
                    <td className="p-2 border">{v.name}</td>
                    <td className="p-2 border">{v.contact}</td>
                    <td className="p-2 border">{v.email || "-"}</td>
                    <td className="p-2 border">{v.company_name || "-"}</td>
                    <td className="p-2 border">{formatDate(v.visiting_date)}</td>
                    <td className="p-2 border">{formatTime(v.visiting_time)}</td>
                    <td className="p-2 border">{v.reason || "-"}</td>
                    <td className="p-2 border">{v.user_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVisitorsOverview;
