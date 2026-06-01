import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LogOut, LayoutDashboard, PlusCircle, Home } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar" id="app-navbar">
      <div className="navbar-container">
        {/* Left: Brand Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <Home className="logo-icon" size={24} />
          <span>StayFinder</span>
        </Link>

        {/* Desktop Menu links */}
        <div className="navbar-menu-desktop">
          {user ? (
            <>
              {user.role === "host" || user.role === "admin" ? (
                <Link to="/add-property" className="nav-btn-secondary">
                  <PlusCircle size={16} />
                  <span>Add Property</span>
                </Link>
              ) : null}
              <Link to="/dashboard" className="nav-btn-text">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <button onClick={handleLogoutClick} className="nav-btn-primary">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
              <div className="user-avatar-badge" title={`${user.name || "User"} (${user.role || ""})`}>
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn-text">
                Login
              </Link>
              <Link to="/register" className="nav-btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="navbar-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen ? (
        <div className="navbar-menu-mobile">
          {user ? (
            <div className="mobile-links-container">
              <div className="mobile-profile-info">
                <span className="mobile-welcome">Welcome, {user.name}</span>
                <span className="mobile-role-label">{user.role} badge</span>
              </div>
              {user.role === "host" || user.role === "admin" ? (
                <Link to="/add-property" className="mobile-link" onClick={closeMenu}>
                  Add Property
                </Link>
              ) : null}
              <Link to="/dashboard" className="mobile-link" onClick={closeMenu}>
                Dashboard
              </Link>
              <button onClick={handleLogoutClick} className="mobile-logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-links-container">
              <Link to="/login" className="mobile-link" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="mobile-link" onClick={closeMenu}>
                Register
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </nav>
  );
}
