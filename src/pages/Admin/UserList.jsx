import React, { useState, useEffect } from "react";
import { toast } from "react-toastify"; // ✅ Import toastify
import "react-toastify/dist/ReactToastify.css";
import UserProfileModal from "./UserProfileModal";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost/vayuhu_backend/get_users.php");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  // Update user details to backend
  const handleSaveUser = async (updatedData) => {
    try {
      const response = await fetch("http://localhost/vayuhu_backend/update_user.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUser.id,
          ...updatedData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User updated successfully!");
        fetchUsers();
        setSelectedUser(null);
      } else {
        toast.error(data.message || "Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Something went wrong!");
    }
  };

  // Filtered & paginated users
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search)
  );

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

  return (
    <div className="p-6 mt-10">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-2xl font-semibold">Users</h2>

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
              placeholder="Search by name, email, or phone"
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
              <th className="py-2 px-4 border">Email ID</th>
              <th className="py-2 px-4 border">Status</th>
              <th className="py-2 px-4 border">Comments</th>
              <th className="py-2 px-4 border">User Details</th>
              <th className="py-2 px-4 border">Company</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr
                  key={user.id || index}
                  className="text-center hover:bg-orange-50 transition"
                >
                  <td className="py-2 px-4 border">{indexOfFirst + index + 1}</td>
                  <td className="py-2 px-4 border">{user.name}</td>
                  <td className="py-2 px-4 border">{user.phone}</td>
                  <td className="py-2 px-4 border">{user.email}</td>
                  <td className="py-2 px-4 border text-orange-500">
                    {user.status || "Pending"}
                  </td>
                  <td className="py-2 px-4 border">
                    <button className="text-orange-500 border border-orange-500 px-3 py-1 rounded hover:bg-orange-50">
                      View
                    </button>
                  </td>
                  <td className="py-2 px-4 border">
                    <button
                      className="text-orange-500 border border-orange-500 px-3 py-1 rounded hover:bg-orange-50"
                      onClick={() => setSelectedUser(user)}
                    >
                      Edit
                    </button>
                  </td>
                  <td className="py-2 px-4 border">
                    <button className="text-orange-500 border border-orange-500 px-3 py-1 rounded hover:bg-orange-50">
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-2">
        <p>
          Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredUsers.length)} of{" "}
          {filteredUsers.length} entries
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

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default UserList;
