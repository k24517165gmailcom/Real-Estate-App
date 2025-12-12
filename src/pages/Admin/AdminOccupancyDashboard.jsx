import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { RefreshCcw, LayoutDashboard, CheckCircle, XCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const COLORS = {
  Available: "#22c55e", // Green-500
  Booked: "#ef4444",    // Red-500
  Maintenance: "#f59e0b", // Amber-500
};

const AdminOccupancyDashboard = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/get_spaces.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSpaces(data.spaces);
          setLastUpdated(new Date());
        }
      })
      .catch((err) => console.error("Failed to load admin data", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 1. Calculate Data for PIE CHART (Overall Status)
  const pieData = useMemo(() => {
    let available = 0;
    let booked = 0;

    spaces.forEach((s) => {
      // Assuming 'is_available' comes as string "1"/"0" or boolean from PHP
      // Adjust logic based on your exact API response type
      const isFree = s.is_available == 1 || s.is_available === true;
      if (isFree) available++;
      else booked++;
    });

    return [
      { name: "Available", value: available },
      { name: "Booked", value: booked },
    ];
  }, [spaces]);

  // 2. Calculate Data for BAR CHART (Category Breakdown)
  const barData = useMemo(() => {
    const map = {};

    spaces.forEach((s) => {
      const type = s.space; // e.g., "Hot Desk", "Private Cabin"
      if (!map[type]) {
        map[type] = { name: type, Available: 0, Booked: 0 };
      }

      const isFree = s.is_available == 1 || s.is_available === true;
      if (isFree) map[type].Available += 1;
      else map[type].Booked += 1;
    });

    return Object.values(map);
  }, [spaces]);

  // Calculate quick stats
  const totalSpaces = spaces.length;
  const totalBooked = pieData.find((d) => d.name === "Booked")?.value || 0;
  const occupancyRate = totalSpaces > 0 ? ((totalBooked / totalSpaces) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutDashboard className="text-orange-500" />
            Workspace Live Status
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time visual overview of workspace inventory
          </p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <span className="text-xs text-gray-400">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchData}
            className="p-2 bg-white border rounded-full hover:bg-gray-100 shadow-sm transition"
            title="Refresh Data"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin text-orange-500" : "text-gray-600"} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Capacity" 
          value={totalSpaces} 
          icon={<LayoutDashboard size={24} />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Currently Available" 
          value={pieData[0].value} 
          icon={<CheckCircle size={24} />} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Occupancy Rate" 
          value={`${occupancyRate}%`} 
          icon={<XCircle size={24} />} 
          color="bg-orange-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bar Chart: Detailed Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Type Breakdown</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Legend />
                {/* Stacked Bars */}
                <Bar dataKey="Available" stackId="a" fill={COLORS.Available} radius={[0, 0, 4, 4]} />
                <Bar dataKey="Booked" stackId="a" fill={COLORS.Booked} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart: Overall Ratio */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Overall Occupancy</h3>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Available" ? COLORS.Available : COLORS.Booked} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
                {/* Center Text overlay */}
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                  <tspan x="50%" dy="-10" fontSize="24" fontWeight="bold" fill="#374151">
                    {totalBooked}
                  </tspan>
                  <tspan x="50%" dy="20" fontSize="14" fill="#9ca3af">
                    Booked
                  </tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper Component for the Top Cards
const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between"
  >
    <div>
      <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</p>
      <h4 className="text-3xl font-bold text-gray-800 mt-1">{value}</h4>
    </div>
    <div className={`${color} text-white p-3 rounded-lg shadow-lg`}>
      {icon}
    </div>
  </motion.div>
);

export default AdminOccupancyDashboard;