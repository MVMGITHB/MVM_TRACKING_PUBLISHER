"use client";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { useAuth } from "./components/helper/auth";
import Sidebar from "./components/sidebar/sidebar.jsx";
import ProtectedRoute from "./components/UserManagement/ProtectedRoute.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import StatisticsPage from "./pages/StatisticsPage.jsx";
import Settings from "./pages/Settings.jsx";
import LoginForm from "./components/UserManagement/login.jsx";
import ConversionReport from "./components/conversion/ConversionReport.jsx";
import Conversion from "./pages/Conversion.jsx";

// Elegant Layout wrapper for protected routes
function AppLayout({ active, setActive, children }) {
  return (
    <div className="flex h-screen bg-sky-100
 ">
      {/* Sidebar */}
      <Sidebar active={active} setActive={setActive} />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("/partner/dashboard");
  const { user } = useAuth();

  return (
    <Router>
      {/* Global Toasts */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
        }}
      />

      <Routes>
        {/* Public Login */}
        <Route path="/login" element={<LoginForm />} />
        {/* <Route path="/" element={<LoginForm />} /> */}

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout active={active} setActive={setActive}>
                <Routes>
                  <Route
                    path="/partner/statistics-dashboard"
                    element={<StatisticsPage />}
                  />
                  <Route
                    path="/partner/marketplace"
                    element={<Marketplace />}
                  />

                  <Route
                    path="/partner/conversion"
                    element={<Conversion />}
                  />
                  {/* <Route path="/partner/" element={} /> */}
                  <Route path="/partner/my-settings" element={<Settings />} />
                  <Route
                    path="*"
                    element={
                      <div className="flex items-center justify-center h-full text-center">
                        <div>
                          <h1 className="text-6xl font-bold text-orange-500">
                            404
                          </h1>
                          <p className="text-lg text-gray-600 mt-2">
                            Oops! The page you’re looking for doesn’t exist.
                          </p>
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
