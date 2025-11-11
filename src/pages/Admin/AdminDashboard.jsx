import React, { useState } from "react";
import Chart from "react-apexcharts";

const AdminDashboard = () => {
  const revenueData = {
    options: {
      chart: {
        id: "monthly-revenue",
        toolbar: { show: true },
      },
      xaxis: {
        categories: [
          "2024-06", "2024-07", "2024-08", "2024-09", "2024-10", "2024-11",
          "2024-12", "2025-01", "2025-02", "2025-03", "2025-04", "2025-05",
          "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12",
        ],
        title: { text: "Month" },
      },
      yaxis: {
        title: { text: "Total Revenue" },
      },
      plotOptions: {
        bar: { borderRadius: 4, horizontal: false, columnWidth: "55%" },
      },
      dataLabels: { enabled: false },
      colors: ["#f97316"], // Orange color
      grid: { borderColor: "#f1f1f1" },
    },
    series: [
      {
        name: "Revenue",
        data: [
          5000, 8000, 12000, 22000, 28000, 18000, 10000,
          23000, 26000, 15000, 22000, 35000, 49000,
          33000, 27000, 14000, 19000, 21000, 18000,
        ],
      },
    ],
  };

  const reservations = [
    {
      id: 1,
      name: "Suresh K",
      mobile: "9566003177",
      space: "Workspace",
      pack: "Monthly",
      date: "11/11/2025",
      time: "08:00 AM - 06:00 PM",
      amount: 4720,
      discount: 0,
      total: 4720,
    },
    {
      id: 2,
      name: "Uniborne Food Ingredients LLP",
      mobile: "9865627870",
      space: "Team Leads Cubicle",
      pack: "Monthly",
      date: "24/10/2025",
      time: "08:00 AM - 06:00 PM",
      amount: 5280,
      discount: 0,
      total: 5280,
    },
    {
      id: 3,
      name: "Anitha Rani",
      mobile: "9945678200",
      space: "Executive Cabin",
      pack: "Monthly",
      date: "01/10/2025",
      time: "08:00 AM - 06:00 PM",
      amount: 17000,
      discount: 0,
      total: 17000,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-orange-600">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Vayuhu: Elevate Your Workday, Where Collaboration Meets Innovation
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "New Reservations", value: 0 },
          { label: "Ongoing Reservations", value: 5 },
          { label: "Completed Reservations", value: 310 },
          { label: "Today's Contact Request", value: 0 },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4 flex flex-col justify-center hover:shadow-md transition"
          >
            <h2 className="text-sm text-gray-500">{stat.label}</h2>
            <p className="text-2xl font-bold text-orange-600">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4 mb-8">
        <h2 className="text-lg font-semibold mb-2 text-center text-orange-600">
          Monthly Revenue
        </h2>
        <Chart
          options={revenueData.options}
          series={revenueData.series}
          type="bar"
          height={350}
        />
      </div>

      {/* Reservations Table */}
      <div className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-orange-600">
          Reservations
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-orange-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-2 border">S.No</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Mobile No</th>
                <th className="p-2 border">Space</th>
                <th className="p-2 border">Pack</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Timings</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Discount</th>
                <th className="p-2 border">Final Total</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, i) => (
                <tr
                  key={r.id}
                  className="hover:bg-orange-50 transition duration-150"
                >
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{r.name}</td>
                  <td className="p-2 border">{r.mobile}</td>
                  <td className="p-2 border">{r.space}</td>
                  <td className="p-2 border">{r.pack}</td>
                  <td className="p-2 border">{r.date}</td>
                  <td className="p-2 border">{r.time}</td>
                  <td className="p-2 border">₹{r.amount}</td>
                  <td className="p-2 border">{r.discount}</td>
                  <td className="p-2 border font-medium text-orange-600">
                    ₹{r.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact Requests Table */}
      <div className="bg-white shadow-sm border border-orange-100 rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-4 text-orange-600">
          Contact Request Today's
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-orange-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="p-2 border">S.No</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Mobile No</th>
                <th className="p-2 border">Email ID</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No data available in table
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
