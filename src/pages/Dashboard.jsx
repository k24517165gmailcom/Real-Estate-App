import React from "react";
import Layout from "../components/Layout";

const Dashboard = () => {
    const renderTable = (title) => (
        <div className="bg-white rounded-2xl shadow p-4 mt-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Show</span>
                    <select className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500">
                        {[10, 25, 50, 100].map((n) => (
                            <option key={n}>{n}</option>
                        ))}
                    </select>
                    <span>entries</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-600">Search:</label>
                    <input
                        type="text"
                        className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder="Search..."
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="border-b bg-gray-50 text-gray-700">
                            {[
                                "S.No.",
                                "Space",
                                "Pack",
                                "Date",
                                "Timings",
                                "Amount",
                                "Discount",
                                "Final Total",
                            ].map((col) => (
                                <th key={col} className="p-3 font-semibold">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td
                                colSpan="8"
                                className="text-center text-gray-500 py-6 text-sm"
                            >
                                No data available in table
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600">
                <p>Showing 0 to 0 of 0 entries</p>
                <div className="flex gap-2 mt-2 sm:mt-0">
                    <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-100">
                        Previous
                    </button>
                    <button className="px-3 py-1 border rounded-md text-gray-500 hover:bg-gray-100">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <Layout>
            <h1 className="text-2xl font-semibold mb-4 text-gray-800">
                Dashboard Overview
            </h1>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {["Total Reservations", "Ongoing", "Completed", "Upcoming"].map(
                    (label) => (
                        <div
                            key={label}
                            className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-all text-center sm:text-left"
                        >
                            <h2 className="text-lg font-medium text-gray-600">{label}</h2>
                            <p className="text-3xl font-bold text-orange-500 mt-2">0</p>
                        </div>
                    )
                )}
            </div>

            {/* Today’s Reservations Table */}
            <h2 className="text-xl font-semibold mt-10 text-gray-700">
                Today’s Reservations
            </h2>
            {renderTable("Today’s Reservations")}

            {/* All Reservations Table */}
            <h2 className="text-xl font-semibold mt-10 text-gray-700">
                All Reservations
            </h2>
            {renderTable("All Reservations")}
        </Layout>
    );
};

export default Dashboard;
