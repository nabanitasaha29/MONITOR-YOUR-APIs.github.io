
// import React from "react";
// import "./Sidebar.css";
// import { NavLink } from "react-router-dom";
// import { Menu, Home, Activity, Layers, Settings } from "lucide-react";

// const Sidebar = ({ collapsed, onToggle }) => {
//   return (
//     <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
//       <div className="sidebar-top">
//         <button className="hamburger" onClick={onToggle} aria-label="Toggle sidebar">
//           <Menu className="hamburger-icon" size={28} />
//         </button>
//       </div>

//       <nav className="sidebar-menu">
//         <NavLink
//           to="/dashboard"
//           className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
//           title={collapsed ? "Dashboard" : undefined}
//         >
//           <Home size={18} />
//           {!collapsed && <span>Dashboard</span>}
//           {collapsed && <span className="sr-only">Dashboard</span>}
//         </NavLink>

//         <NavLink
//           to="/api-monitor"
//           className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
//           title={collapsed ? "API Monitor" : undefined}
//         >
//           <Activity size={18} />
//           {!collapsed && <span>API Monitor</span>}
//           {collapsed && <span className="sr-only">API Monitor</span>}
//         </NavLink>

//         <NavLink
//           to="/groups"
//           className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
//           title={collapsed ? "Groups" : undefined}
//         >
//           <Layers size={18} />
//           {!collapsed && <span>Groups</span>}
//           {collapsed && <span className="sr-only">Groups</span>}
//         </NavLink>
//       </nav>

//       <div className="sidebar-bottom">
//         <NavLink
//           to="/settings"
//           className={({ isActive }) => `sidebar-item settings ${isActive ? "active" : ""}`}
//           title={collapsed ? "Settings" : undefined}
//         >
//           <Settings size={18} />
//           {!collapsed && <span>Settings</span>}
//           {collapsed && <span className="sr-only">Settings</span>}
//         </NavLink>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;










import React from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
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
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          title={collapsed ? "Dashboard" : undefined}
        >
          <Home size={18} />
          {!collapsed && <span>Dashboard</span>}
          {collapsed && <span className="sr-only">Dashboard</span>}
        </NavLink>

        <NavLink
          to="/api-monitor"
          className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          title={collapsed ? "API Monitor" : undefined}
        >
          <Activity size={18} />
          {!collapsed && <span>API Monitor</span>}
          {collapsed && <span className="sr-only">API Monitor</span>}
        </NavLink>

        <NavLink
          to="/groups"
          className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
          title={collapsed ? "Groups" : undefined}
        >
          <Layers size={18} />
          {!collapsed && <span>Groups</span>}
          {collapsed && <span className="sr-only">Groups</span>}
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          className={({ isActive }) => `sidebar-item settings ${isActive ? "active" : ""}`}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
          {collapsed && <span className="sr-only">Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
