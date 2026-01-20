// src/components/UserDashboard.jsx

import { useState, useEffect } from "react";
import { Redirect } from "react-router-dom";
import ProductionIV from "./ProductionIV";
import Header from "./Header";

const UserDashboard = ({ pageState, setPageState }) => {
  const [selectedItem, setSelectedItem] = useState("ProductionIV");

  // Check user role for access control
  const userRole = localStorage.getItem("role");

  // Prevent body scroll when component mounts
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // If user is not regular user, redirect them
  if (userRole !== "user") {
    console.log(
      "Unauthorized access attempt to UserDashboard by role:",
      userRole,
    );
    return (
      <Redirect
        to={userRole === "admin" ? "/admin-dashboard" : "/schedule-patient"}
      />
    );
  }

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <Header />
      <div className="flex" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Modern Business Sidebar */}
        <div className="w-1/5 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl overflow-y-auto">
          {/* Sidebar Header */}
          <div className="px-6 py-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white tracking-wide">
              User Dashboards
            </h2>
          </div>

          {/* Navigation Menu */}
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {/* IV Team Production */}
              <button
                onClick={() => setSelectedItem("ProductionIV")}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                  selectedItem === "ProductionIV"
                    ? "bg-blue-600 text-white shadow-lg transform scale-[1.02]"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>IV Team Production</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-50 overflow-hidden">
          <div className="h-full overflow-auto">
            {/* Production IV */}
            <div
              style={{
                display: selectedItem === "ProductionIV" ? "block" : "none",
                height: "100%",
              }}
            >
              <ProductionIV pageState={pageState} setPageState={setPageState} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
