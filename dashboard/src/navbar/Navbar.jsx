import React from "react";
import "./Navbar.css";
import { Bell, BarChart3, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">🌾 AgriStack</div>
      </div>

      <div className="navbar-right">
        <button className="nav-icon">
          <BarChart3 size={20} />
        </button>

        <button className="nav-icon">
          <Bell size={20} />
        </button>

        <button className="nav-icon">
          <User size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
