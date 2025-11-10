import React, { useState } from "react";
import Layout from "../components/Layout";

const CompanyProfile = () => {
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    companyName: "",
    gstNo: "",
    email: "",
    contact: "",
    address: "",
  });

  // Handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Company Data:", formData);
    console.log("Logo File:", logo);

    alert("Company profile saved successfully!");

    // ✅ Reset form after submission
    setFormData({
      companyName: "",
      gstNo: "",
      email: "",
      contact: "",
      address: "",
    });
    setLogo(null);
    setPreview(null);

    // Optional: clear file input manually (since file inputs can't be controlled)
    e.target.reset();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Company Profile
      </h1>

      <div className="bg-white rounded-2xl shadow p-6 mt-6">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* Company Logo Upload */}
          <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-6 mb-4">
            <div className="w-32 h-32 rounded-xl border overflow-hidden bg-gray-100 flex items-center justify-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Company Logo Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-sm">No Logo</div>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Upload Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="border border-gray-300 rounded-md p-2 text-sm w-60 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter Company Name"
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* GST No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST No
            </label>
            <input
              type="text"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleChange}
              placeholder="Enter GST Number"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Company Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Email Id <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Company Email Id"
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Company Contact No */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Contact No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter Company Contact No"
              required
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {/* Company Address */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Address
            </label>
            <textarea
              name="address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Company Address"
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

export default CompanyProfile;
