import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // ✅ Fetch Reservations
  const fetchReservations = async () => {
    try {
      const response = await fetch("http://localhost/vayuhu_backend/get_reservations.php");
      const data = await response.json();
      if (data.success) {
        setReservations(data.reservations || []);
      } else {
        toast.error("Failed to load reservations");
      }
    } catch (error) {
      console.error("Error fetching reservations:", error);
      toast.error("Something went wrong while fetching reservations!");
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // ✅ Filter by name, mobile, or space
  const filteredReservations = reservations.filter(
    (res) =>
      res.name.toLowerCase().includes(search.toLowerCase()) ||
      res.mobile_no.includes(search) ||
      res.space.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentReservations = filteredReservations.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredReservations.length / entriesPerPage);

  // ✅ Helper to format date & time
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB");
  };

  return (
    <div className="p-6 mt-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-semibold">Reservations</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="mr-2">Show</span>
            <select
              className="border rounded px-2 py-1"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="ml-1">entries</span>
          </div>
          <div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-1 rounded"
              placeholder="Search by name, mobile, or space"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-orange-50 text-left text-gray-700">
              <th className="py-2 px-4 border">S.No.</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Mobile No</th>
              <th className="py-2 px-4 border">Space</th>
              <th className="py-2 px-4 border">Space Code</th>  {/* NEW */}
              <th className="py-2 px-4 border">Pack</th>
              <th className="py-2 px-4 border">Date</th>
              <th className="py-2 px-4 border">Timings</th>
              <th className="py-2 px-4 border text-right">Amount</th>
              <th className="py-2 px-4 border text-right">Discount</th>
              <th className="py-2 px-4 border text-right">Final Total</th>
              <th className="py-2 px-4 border">Booked On</th>
            </tr>
          </thead>

          <tbody>
            {currentReservations.length > 0 ? (
              currentReservations.map((res, index) => (
                <tr
                  key={res.id || index}
                  className="text-center hover:bg-orange-50 transition"
                >
                  <td className="py-2 px-4 border">{indexOfFirst + index + 1}</td>
                  <td className="py-2 px-4 border">{res.name}</td>
                  <td className="py-2 px-4 border">{res.mobile_no}</td>
                  <td className="py-2 px-4 border">{res.space}</td>
                  <td className="py-2 px-4 border">{res.space_code}</td> {/* NEW */}
                  <td className="py-2 px-4 border">{res.pack}</td>
                  <td className="py-2 px-4 border">{formatDate(res.date)}</td>
                  <td className="py-2 px-4 border">{res.timings}</td>
                  <td className="py-2 px-4 border text-right">{res.amount}</td>
                  <td className="py-2 px-4 border text-right">{res.discount}</td>
                  <td className="py-2 px-4 border text-right">{res.final_total}</td>
                  <td className="py-2 px-4 border">{res.booked_on}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center py-4 text-gray-500">
                  No reservations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-2">
        <p>
          Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredReservations.length)} of{" "}
          {filteredReservations.length} entries
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === idx + 1 ? "bg-orange-500 text-white" : ""
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
