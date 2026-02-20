import React from "react";
import Navbar from "../src/navbar/Navbar.jsx";
import Sidebar from "../src/sidebar/Sidebar.jsx";
import ApiMonitor from "./components/ApiMonitor.jsx";

import "./App.css";

function App() {
  return (
    <div className="app-layout">
      {/* <Sidebar /> */}

      <div className="main-content">
        <Navbar />
        <ApiMonitor />
      </div>
    </div>
  );
}

export default App;
