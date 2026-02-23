// import React from "react";
// import Navbar from "../src/navbar/Navbar.jsx";
// import Sidebar from "../src/sidebar/Sidebar.jsx";
// import ApiMonitor from "./components/ApiMonitor.jsx";

// import "./App.css";

// function App() {
//   return (
//     <div className="app-layout">
//       {/* <Sidebar /> */}

//       <div className="main-content">
//         <Navbar />
//         <ApiMonitor />
//       </div>
//     </div>
//   );
// }

// export default App;


















// src/App.jsx
import React, { useState } from "react";
import Navbar from "../src/navbar/Navbar.jsx";
import Sidebar from "../src/sidebar/Sidebar.jsx";
import ApiMonitor from "./components/ApiMonitor.jsx";

import "./App.css";

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <Navbar />
        <div className="content-scroll">
          {/* Add a wrapper so content area scrolls under the sticky navbar */}
          <div className="monitor-wrapper">
            <ApiMonitor />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;