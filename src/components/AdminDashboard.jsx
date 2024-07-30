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
      <div className="flex sticky">
        {/* Sidebar */}
        <div className="w-1/5 border-r border-gray-300 p-4 bg-slate-700 rounded-lg shadow-lg">
          <h2 className="text-lg text-white font-semibold font-tahoma">
            IV Status
          </h2>
          <ul>
            <li
              className={`cursor-pointer px-4 py-2 rounded-lg font-tahoma hover:shadow ${
                selectedItem === "PendingIV" ? "bg-gray-500 text-white" : ""
              }`}
              onClick={() => setSelectedItem("PendingIV")}
            >
              Pending IV
            </li>
            <li
              className={`cursor-pointer px-4 py-2 rounded-lg  font-tahoma hover:shadow ${
                selectedItem === "AssignedIV" ? "bg-gray-500 text-white" : ""
              }`}
              onClick={() => setSelectedItem("AssignedIV")}
            >
              Assigned IV
            </li>
            <li
              className={`cursor-pointer px-4 rounded-lg  py-2 font-tahoma  hover:shadow ${
                selectedItem === "ProductionIV" ? "bg-gray-500 text-white" : ""
              }`}
              onClick={() => setSelectedItem("ProductionIV")}
            >
              IV Team Production
            </li>
          </ul>
        </div>

        {/* Content Area */}
        <div className="w-4/5 p-4 bg-slate-100 rounded-lg shadow-lg sticky top-0">
          {selectedItem === "PendingIV" && <PendingIV />}
          {selectedItem === "AssignedIV" && <AssignedIV />}
          {selectedItem === "ProductionIV" && <ProductionIV />}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
