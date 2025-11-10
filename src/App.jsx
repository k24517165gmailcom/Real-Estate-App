import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import AboutPage from './pages/AboutPage';
import VirtualOfficeServices from './pages/VirtualOfficeServices';
import Auth from './pages/Auth';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CompanyProfile from './pages/CompanyProfile';
import Reservations from './pages/Reservations';
//import MyAccount from './pages/MyAccount';

// Protected Route Wrapper
import ProtectedRoute from './components/ProtectedRoute';
import Visitors from './pages/Visitors';

const Layout = ({ children }) => {
  const location = useLocation();

  // 🧠 Hide Header on these dashboard routes only
  const hideHeaderRoutes = [
    '/dashboard',
    '/profile',
    '/company-profile',
    '/reservations',
    '/visitors',
  ];

  const hideHeader = hideHeaderRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div className="w-full overflow-hidden">
      <ToastContainer />
      {!hideHeader && <Header />} {/* ✅ show Header except for dashboard routes */}
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

          {/* 🔒 Protected Dashboard Routes */}
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
          {/*<Route
            path="/my-account"
            element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            }
          />*/}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
