// import React, { useState } from "react";
// import Navbar from "../src/navbar/Navbar.jsx";
// import Sidebar from "../src/sidebar/Sidebar.jsx";
// import SidebarRoutes from "./routes/SidebarRoutes.jsx";
// import "./App.css";

// function App() {
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div className={`app-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
//       <Sidebar
//         collapsed={collapsed}
//         onToggle={() => setCollapsed(!collapsed)}
//       />

//       <div className="main-content">
//         <Navbar />
//         <div className="content-scroll">
//           <div className="monitor-wrapper">
//             <SidebarRoutes />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;














import React, { useState } from "react";
import Navbar from "../src/navbar/Navbar.jsx";
import Sidebar from "../src/sidebar/Sidebar.jsx";
import SidebarRoutes from "./routes/SidebarRoutes.jsx";
import "./App.css";

function App() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className={`app-layout ${collapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />

      <div className="main-content">
        <Navbar />
        <SidebarRoutes />
        {/* not in use this time */}
        {/* <div className="content-scroll">
          <div className="monitor-wrapper">
            
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default App;
