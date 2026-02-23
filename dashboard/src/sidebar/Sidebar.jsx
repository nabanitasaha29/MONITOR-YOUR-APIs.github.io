import React from "react";
import "./Sidebar.css";
import { Menu, Home, Activity, Layers, Settings } from "lucide-react";

const Sidebar = ({ collapsed, onToggle }) => {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <button className="hamburger" onClick={onToggle} aria-label="Toggle sidebar">
          <Menu className="hamburger-icon" size={28} />
        </button>
       
      </div>

      <nav className="sidebar-menu">
        <button className="sidebar-item active" title={collapsed ? "Dashboard" : undefined}>
          <Home size={18} />
          {!collapsed && <span>Dashboard</span>}
          {collapsed && <span className="sr-only">Dashboard</span>}
        </button>

        <button className="sidebar-item" title={collapsed ? "API Monitor" : undefined}>
          <Activity size={18} />
          {!collapsed && <span>API Monitor</span>}
          {collapsed && <span className="sr-only">API Monitor</span>}
        </button>

        <button className="sidebar-item" title={collapsed ? "Groups" : undefined}>
          <Layers size={18} />
          {!collapsed && <span>Groups</span>}
          {collapsed && <span className="sr-only">Groups</span>}
        </button>
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-item settings" title={collapsed ? "Settings" : undefined}>
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
          {collapsed && <span className="sr-only">Settings</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;