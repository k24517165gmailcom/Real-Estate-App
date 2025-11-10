import React from "react";
import Layout from "../components/Layout";

const Reservations = () => {
  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        All Reservations
      </h1>
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="flex justify-between mb-4">
          <select className="border rounded-lg p-2 text-sm">
            <option>Show 10 entries</option>
            <option>Show 25 entries</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <table className="w-full text-sm border-collapse">
          <thead className="bg-orange-100 text-gray-700">
            <tr>
              {[
                "S.No.",
                "Space",
                "Pack",
                "Date",
                "Timings",
                "Amount",
                "Discount",
                "Final Total",
                "Invoice",
              ].map((col) => (
                <th key={col} className="p-2 border text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="9" className="text-center p-4 text-gray-500">
                No data available in table
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between mt-4 text-sm text-gray-600">
          <p>Showing 0 to 0 of 0 entries</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-lg hover:bg-orange-100">
              Previous
            </button>
            <button className="px-3 py-1 border rounded-lg hover:bg-orange-100">
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reservations;
