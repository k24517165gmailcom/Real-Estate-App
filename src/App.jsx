import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🌐 Public Pages
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import AboutPage from "./pages/AboutPage";
import VirtualOfficeServices from "./pages/VirtualOfficeServices";
import Auth from "./pages/Auth";

// 👤 User Dashboard Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CompanyProfile from "./pages/CompanyProfile";
import Reservations from "./pages/Reservations";
import Visitors from "./pages/Visitors";
import ProtectedRoute from "./components/ProtectedRoute";

// 🧑‍💼 Admin Pages
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminReports from "./pages/Admin/AdminReports";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminLogin from "./pages/Admin/AdminLogin";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";

const Layout = ({ children }) => {
  const location = useLocation();

  // 🧠 Hide header for dashboard + admin routes
  const hideHeaderRoutes = [
    "/dashboard",
    "/profile",
    "/company-profile",
    "/reservations",
    "/visitors",
    "/admin", // ✅ hide header for all admin routes
  ];

  const hideHeader = hideHeaderRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="w-full overflow-hidden">
      <ToastContainer />
      {!hideHeader && <Header />}
      {children}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* 🧡 Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/virtual" element={<VirtualOfficeServices />} />
          <Route path="/auth" element={<Auth />} />

          {/* 🔒 Protected User Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-profile"
            element={
              <ProtectedRoute>
                <CompanyProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <Reservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/visitors"
            element={
              <ProtectedRoute>
                <Visitors />
              </ProtectedRoute>
            }
          />

          {/* 🧑‍💼 Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} /> {/* ✅ Admin Login Route */}

          {/* 🔒 Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <AdminReports />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRouteAdmin>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRouteAdmin>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
