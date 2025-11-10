import React, { useState } from "react";
import Layout from "../components/Layout";

const Profile = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    dob: "1990-01-01",
    address: "",
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form Data:", formData);
    console.log("Profile Pic:", profilePic);

    alert("Profile saved successfully!");

    // ✅ Reset form fields
    setFormData({
      name: "",
      contact: "",
      email: "",
      dob: "1990-01-01",
      address: "",
    });

    // ✅ Reset image preview and file
    setProfilePic(null);
    setPreview(null);

    // ✅ Reset file input manually
    e.target.reset();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">User Profile</h1>

      <div className="bg-white rounded-2xl shadow p-6 mt-6">
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          onSubmit={handleSubmit}
        >
          {/* Profile Picture Upload */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="w-32 h-32 rounded-full border overflow-hidden bg-gray-100">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Upload Profile Pic
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border border-gray-300 rounded-md p-2 text-sm w-60 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Your Name"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          {/* Contact No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter Your Contact No"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Id
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Your Email Id"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Address"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="sm:col-span-2 mt-4 flex justify-end">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-lg shadow transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
