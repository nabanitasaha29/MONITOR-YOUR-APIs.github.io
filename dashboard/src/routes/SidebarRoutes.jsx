// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import ApiMonitor from "../pages/APIMonitorPage/ApiMonitor.jsx";
// import DahsboardLandingPage from "../pages/dashboard/DahsboardLandingPage.jsx";
// import GroupsPage from "../pages/GroupsPage/GroupsPage.jsx";
// import MonitorMainPage from "../pages/APIMonitorPage/MonitorMainPage.jsx";

// const SidebarRoutes = () => {
//   return (
//     <Routes>

//       <Route path="/" element={<Navigate to="/dashboard" replace />} />

//       <Route path="/dashboard" element={<DahsboardLandingPage />} />
//       <Route path="/api-monitor" element={<MonitorMainPage />} />
//       <Route path="/groups" element={<GroupsPage />} />

//       <Route path="*" element={<Navigate to="/dashboard" replace />} />
//     </Routes>
//   );
// };

// export default SidebarRoutes;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ApiMonitor from "../pages/APIMonitorPage/ApiMonitor.jsx";
import DahsboardLandingPage from "../pages/dashboard/DahsboardLandingPage.jsx";
import GroupsPage from "../pages/GroupsPage/GroupsPage.jsx";
//import MonitorMainPage from "../pages/APIMonitorPage/MonitorMainPage.jsx";

const SidebarRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/api-monitor" replace />} />

      <Route path="/dashboard" element={<DahsboardLandingPage />} />
      <Route path="/api-monitor" element={<ApiMonitor />} />
      <Route path="/groups" element={<GroupsPage />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default SidebarRoutes;
