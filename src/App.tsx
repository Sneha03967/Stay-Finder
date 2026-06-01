import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

// Page imports
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PropertyDetails from "./pages/PropertyDetails";
import SearchResults from "./pages/SearchResults";
import AddProperty from "./pages/AddProperty";
import BookingPage from "./pages/BookingPage";
import Dashboard from "./pages/Dashboard";

// ProtectedRoute component helper definition
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="state-container loading-state content-height-center">
        <p>Verifying secure user session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but cache search route so we can jump back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell" id="app-root-shell">
          {/* Header Sticky Navigation Menu */}
          <Navbar />

          {/* Main App Page Body Router Outlet */}
          <main className="app-main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route path="/search" element={<SearchResults />} />

              {/* Protected host or guest routes */}
              <Route
                path="/add-property"
                element={
                  <ProtectedRoute>
                    <AddProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/:propertyId"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Humble Aesthetic Footer */}
          <footer className="global-footer" id="main-global-footer">
            <div className="container footer-grid">
              <div className="footer-copyright">
                <p>© 2026 StayFinder, Inc. All rights reserved. • Privacy • Terms • Subelements</p>
              </div>
              <div className="footer-tech-tag font-mono text-xs text-gray-500">
                MERN Stack Integrated Engine
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
