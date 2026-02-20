import React, { useState } from "react";
import "./Sidebar.css";
import { Menu, Home, Activity, Layers, Settings } from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  console.log("Sidebar component loaded");

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-top">
        <button className="hamburger" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>

        {!collapsed && <span className="sidebar-title"></span>}
      </div>

      <div className="sidebar-menu">
        <div className="sidebar-item">
          <Home size={18} />
          {!collapsed && <span>Dashboard</span>}
        </div>

        <div className="sidebar-item">
          <Activity size={18} />
          {!collapsed && <span>API Monitor</span>}
        </div>

        <div className="sidebar-item">
          <Layers size={18} />
          {!collapsed && <span>Groups</span>}
        </div>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-item settings">
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
