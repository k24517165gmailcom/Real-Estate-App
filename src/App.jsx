import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Gallery from './pages/Gallery';
import AboutPage from './pages/AboutPage';
import VirtualOfficeServices from './pages/VirtualOfficeServices';
import MyAccount from './pages/MyAccount';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute'; // 👈 new import

const App = () => {
  return (
    <Router>
      <div className="w-full overflow-hidden">
        <ToastContainer />
        <Header />

        <Routes>
          {/* 👇 Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-account"
            element={
              <ProtectedRoute>
                <MyAccount />
              </ProtectedRoute>
            }
          />

          {/* 👇 Public routes */}
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/virtual" element={<VirtualOfficeServices />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
