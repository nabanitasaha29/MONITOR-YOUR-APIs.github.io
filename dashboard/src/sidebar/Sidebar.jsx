import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  Menu,
  Home,
  Activity,
  Layers,
  Settings,
  ChevronRight,
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ collapsed, onToggle }) => {
  const [openGroups, setOpenGroups] = useState(false);
  const [openFarmerRegistry, setOpenFarmerRegistry] = useState(false);

  // Guard to handle "expand because Groups was clicked" without instantly closing submenus.
  const expandIntentRef = useRef(false);

  useEffect(() => {
    const cls = "sidebar-is-collapsed";
    document.body.classList.toggle(cls, !!collapsed);

    // When user collapses, close submenus — unless we are in an "expand-intent" flow.
    if (collapsed) {
      if (!expandIntentRef.current) {
        setOpenGroups(false);
        setOpenFarmerRegistry(false);
      }
    }
    return () => document.body.classList.remove(cls);
  }, [collapsed]);

  /** When Groups icon is clicked:
   *  - If collapsed: expand sidebar, then open Groups submenu
   *  - If expanded: normal toggle behavior
   */
  const handleGroupsClick = () => {
    if (collapsed) {
      expandIntentRef.current = true;

      // Expand the sidebar first
      onToggle?.();

      // After layout updates, open the submenu
      requestAnimationFrame(() => {
        setOpenGroups(true);
        // Clear the guard shortly after
        setTimeout(() => {
          expandIntentRef.current = false;
        }, 200);
      });
    } else {
      setOpenGroups((v) => !v);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* TOP (pinned) */}
      <div className="sidebar-top">
        <button
          className="hamburger"
          onClick={onToggle}
          aria-label="Toggle sidebar"
          type="button"
        >
          <Menu className="hamburger-icon" size={22} />
        </button>
      </div>
      {/* DASHBOARD FOR CENTRAL VIEW */}
      {/* SCROLL (only this area scrolls) */}
      <nav className="sidebar-menu" aria-label="Primary">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Dashboard" : undefined}
          end
        >
          <span className="item-icon" aria-hidden="true">
            <Home size={18} />
          </span>
          {!collapsed && <span className="item-label">Dashboard</span>}
        </NavLink>

        {/*API MONITOR ---WILL GET DELETED ONCE BIFERCATION IS DONE  */}
        {/* <NavLink
          to="/api-monitor"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
          title={collapsed ? "API Monitor" : undefined}
          end
        >
          <span className="item-icon" aria-hidden="true">
            <Activity size={18} />
          </span>
          {!collapsed && <span className="item-label">API Monitor</span>}
        </NavLink> */}

        {/* GROUPS WHICH WILL BE BIFERCATED BASED ON TYPE [FR,DCS,MAPS] THEREAFTERER  SUB DIVIDED INTO STATES */}

        {/* ===== GROUPS ===== */}
        <div className="sidebar-group">
          <button
            type="button"
            className="sidebar-item group-toggle"
            title={collapsed ? "Groups" : undefined}
            // onClick={() => !collapsed && setOpenGroups((v) => !v)}
            onClick={handleGroupsClick} /* ← updated */
            aria-expanded={!collapsed && openGroups}
            aria-controls="submenu-groups"
          >
            <span className="item-icon" aria-hidden="true">
              <Layers size={18} />
            </span>
            {!collapsed && <span className="item-label">Groups</span>}
          </button>

          {!collapsed && openGroups && (
            <div
              id="submenu-groups"
              className="submenu open"
              role="region"
              aria-label="Groups submenu"
            >
              {/* Farmer Registry */}
              <button
                type="button"
                className="submenu-item has-children"
                onClick={() => setOpenFarmerRegistry((v) => !v)}
                aria-expanded={openFarmerRegistry}
                aria-controls="submenu-farmer-registry"
              >
                <span className="submenu-label">Farmer Registry APIs</span>
                <span
                  className={`chev ${openFarmerRegistry ? "open" : ""}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>

              {openFarmerRegistry && (
                <div
                  id="submenu-farmer-registry"
                  className="submenu nested open"
                  role="region"
                  aria-label="Farmer Registry APIs states"
                >
                  <NavLink
                    to="/groups/farmer-registry/RJ"
                    end
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="arrow" aria-hidden="true" />
                    Rajasthan
                  </NavLink>
                  <NavLink
                    to="/groups/farmer-registry/TN"
                    end
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="arrow" aria-hidden="true" />
                    Tamil Nadu
                  </NavLink>
                  <NavLink
                    to="/groups/farmer-registry/BR"
                    end
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="arrow" aria-hidden="true" />
                    Bihar
                  </NavLink>
                  <NavLink
                    to="/groups/farmer-registry/UP"
                    end
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="arrow" aria-hidden="true" />
                    Uttar Pradesh
                  </NavLink>
                  <NavLink
                    to="/groups/farmer-registry/MH"
                    end
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="arrow" aria-hidden="true" />
                    Maharashtra
                  </NavLink>
                  <NavLink
                    to="/groups/farmer-registry/AS"
                    end
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="arrow" aria-hidden="true" />
                    Assam
                  </NavLink>
                  <NavLink
                    to="/groups/farmer-registry/CG"
                    end
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="arrow" aria-hidden="true" />
                    Chhattisgarh
                  </NavLink>
                  <NavLink
                    to="/groups/farmer-registry/GJ"
                    end
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="arrow" aria-hidden="true" />
                    Gujarat
                  </NavLink>
                  <NavLink
                    to="/groups/farmer-registry/OD"
                    end
                    className={({ isActive }) =>
                      `submenu-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="arrow" aria-hidden="true" />
                    Odisha
                  </NavLink>
                </div>
              )}

              {/* Others */}
              <NavLink
                to="/groups/mapper-apis"
                className={({ isActive }) =>
                  `submenu-item ${isActive ? "active" : ""}`
                }
                end
              >
                <span className="submenu-label">Mapper APIs</span>
              </NavLink>
              <NavLink
                to="/groups/dcs-apis"
                className={({ isActive }) =>
                  `submenu-item ${isActive ? "active" : ""}`
                }
                end
              >
                <span className="submenu-label">DCS APIs</span>
              </NavLink>
              <NavLink
                to="/groups/dpe-apis"
                className={({ isActive }) =>
                  `submenu-item ${isActive ? "active" : ""}`
                }
                end
              >
                <span className="submenu-label">DPE APIs</span>
              </NavLink>
            </div>
          )}
        </div>
        {/* ===== end GROUPS ===== */}
      </nav>

      {/* BOTTOM (pinned) */}
      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Settings" : undefined}
          end
        >
          <span className="item-icon" aria-hidden="true">
            <Settings size={18} />
          </span>
          {!collapsed && <span className="item-label">Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
