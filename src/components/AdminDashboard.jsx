// src/components/AdminDashboard.jsx

import React, { useState } from "react";
import PendingIV from "./PendingIV";
import AssignedIV from "./AssignedIV";
import ProductionIV from "./ProductionIV";
import Header from "./Header";

const AdminDashboard = () => {
  const [selectedItem, setSelectedItem] = useState("PendingIV");

  return (
    <>
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/5 border-r border-gray-300 p-4">
          <h2 className="text-lg font-semibold">IV Status</h2>
          <ul>
            <li
              className={`cursor-pointer py-2 hover:shadow ${
                selectedItem === "PendingIV" ? "bg-gray-500 text-white" : ""
              }`}
              onClick={() => setSelectedItem("PendingIV")}
            >
              Pending IV
            </li>
            <li
              className={`cursor-pointer py-2 hover:shadow ${
                selectedItem === "AssignedIV" ? "bg-gray-500 text-white" : ""
              }`}
              onClick={() => setSelectedItem("AssignedIV")}
            >
              Assigned IV
            </li>
            <li
              className={`cursor-pointer py-2 hover:shadow ${
                selectedItem === "ProductionIV" ? "bg-gray-500 text-white" : ""
              }`}
              onClick={() => setSelectedItem("ProductionIV")}
            >
              IV Team Production
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="w-4/5 p-4">
          {selectedItem === "PendingIV" && <PendingIV />}
          {selectedItem === "AssignedIV" && <AssignedIV />}
          {selectedItem === "ProductionIV" && <ProductionIV />}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
