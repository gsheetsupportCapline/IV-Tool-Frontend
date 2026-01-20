// ProductionIV.jsx
import { useState, useEffect } from "react";
import axios from "axios";

import Datepicker from "react-tailwindcss-datepicker";
import BASE_URL from "../config/apiConfig";
import { fetchOfficeOptions } from "../utils/fetchOfficeOptions";

const ProductionIV = ({ pageState, setPageState }) => {
  // Use lifted state from App.jsx
  const users = pageState?.users ?? [];
  const data = pageState?.data ?? [];
  const dateRange = pageState?.dateRange ?? { startDate: null, endDate: null };
  const userIdToUserMap = pageState?.userIdToUserMap ?? {};
  const dateType = pageState?.dateType ?? "appointmentDate";
  const officeNames = pageState?.officeNames ?? [];
  const loading = pageState?.loading ?? false;

  // Setter functions to update lifted state
  const setUsers = (val) => setPageState?.((prev) => ({ ...prev, users: val }));
  const setData = (val) => setPageState?.((prev) => ({ ...prev, data: val }));
  const setDateRange = (val) =>
    setPageState?.((prev) => ({ ...prev, dateRange: val }));
  const setUserIdToUserMap = (val) =>
    setPageState?.((prev) => ({ ...prev, userIdToUserMap: val }));
  const setDateType = (val) =>
    setPageState?.((prev) => ({ ...prev, dateType: val }));
  const setOfficeNames = (val) =>
    setPageState?.((prev) => ({ ...prev, officeNames: val }));
  const setLoading = (val) =>
    setPageState?.((prev) => ({ ...prev, loading: val }));

  // Fetch offices from API on component mount (only once)
  useEffect(() => {
    const loadOffices = async () => {
      try {
        const offices = await fetchOfficeOptions();
        setOfficeNames(offices);
      } catch (error) {
        console.error("Error loading offices:", error);
        setOfficeNames([]);
      }
    };

    if (officeNames.length === 0) {
      loadOffices();
    }
  }, []);
  const handleValueChange = (newValue) => {
    console.log("New Value:", newValue); // Debugging
    if (newValue?.startDate && newValue?.endDate) {
      setDateRange({
        startDate: newValue.startDate,
        endDate: newValue.endDate,
      });
    }
  };

  const handleDateTypeChange = (e) => {
    setDateType(e.target.value);
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/auth/users`);
        const usersData = response.data.data;
        console.log(usersData);
        // Create a mapping of userId to user details
        const userMap = usersData.reduce((acc, user) => {
          acc[user._id] = user;
          return acc;
        }, {});

        setUserIdToUserMap(userMap);

        // Set the users state
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    if (users.length === 0) {
      fetchUsers();
    }
  }, []);

  // Manual fetch function - only called when Search button is clicked
  const fetchData = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return; // Don't fetch data if dates are not selected
    }

    setLoading(true);
    // Dates are already in YYYY-MM-DD format as strings
    const startDateParam = dateRange.startDate;
    const endDateParam = dateRange.endDate;

    const url = `${BASE_URL}/api/appointments/completed-appointments?startDate=${startDateParam}&endDate=${endDateParam}&dateType=${dateType}`;

    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processDataForTable = () => {
    const processedData = {};

    data.forEach(({ office, completedCount }) => {
      completedCount.forEach(({ userId, count }) => {
        const user = userIdToUserMap[userId];
        if (!processedData[office]) {
          processedData[office] = {};
        }
        if (user) {
          processedData[office][user.name] =
            (processedData[office][user.name] || 0) + count;
        } else {
          console.warn(`No user found for userId: ${userId}`);
        }
      });
    });
    console.log(processedData);
    return processedData;
  };
  const renderTable = () => {
    const processedData = processDataForTable(userIdToUserMap);
    const userName = users
      .filter((user) => user.role == "user")
      .map((user) => user.name);
    const headers = ["Office", ...userName, "Total"];

    // Calculate column totals (for each user)
    const columnTotals = userName.map((username) =>
      officeNames.reduce(
        (total, officeNameObj) =>
          total + (processedData[officeNameObj.name]?.[username] || 0),
        0,
      ),
    );

    // Calculate grand total
    const grandTotal = columnTotals.reduce(
      (total, colTotal) => total + colTotal,
      0,
    );

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div
          className="overflow-auto"
          style={{ maxHeight: "calc(100vh - 12rem)" }}
        >
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b border-slate-200 ${
                      header === "Office"
                        ? "sticky left-0 bg-slate-100 border-r-2 border-slate-300 z-10"
                        : header === "Total"
                          ? "sticky right-0 bg-slate-100 border-l-2 border-slate-300 z-10"
                          : ""
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {officeNames.map((officeNameObj, index) => {
                const rowTotal = userName.reduce(
                  (total, username) =>
                    total +
                    (processedData[officeNameObj.name]?.[username] || 0),
                  0,
                );

                return (
                  <tr
                    key={index}
                    className={`hover:bg-blue-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-25"
                    }`}
                  >
                    <td className="px-4 py-2 font-medium text-slate-900 border-r-2 border-slate-300 text-sm sticky left-0 bg-white z-[5]">
                      {officeNameObj.name}
                    </td>
                    {userName.map((username, userIndex) => {
                      const count =
                        processedData[officeNameObj.name]?.[username] || 0;
                      return (
                        <td key={userIndex} className="px-4 py-2 text-center">
                          <div
                            className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold min-w-[40px] ${
                              count > 0
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-gray-50 text-gray-400 border border-gray-200"
                            }`}
                          >
                            {count}
                          </div>
                        </td>
                      );
                    })}
                    {/* Row Total Column */}
                    <td className="px-4 py-2 text-center sticky right-0 bg-slate-50 border-l-2 border-slate-300">
                      <div
                        className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold min-w-[40px] ${
                          rowTotal > 0
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : "bg-gray-50 text-gray-400 border border-gray-200"
                        }`}
                      >
                        {rowTotal}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Bottom Total Row */}
              <tr className="bg-slate-100 border-t-2 border-slate-300 sticky bottom-0">
                <td className="px-4 py-3 font-bold text-slate-900 text-sm border-r-2 border-slate-300 sticky left-0 bg-slate-100 z-20">
                  Total
                </td>
                {columnTotals.map((colTotal, index) => (
                  <td key={index} className="px-4 py-3 text-center">
                    <div
                      className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold min-w-[40px] ${
                        colTotal > 0
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : "bg-gray-50 text-gray-400 border border-gray-200"
                      }`}
                    >
                      {colTotal}
                    </div>
                  </td>
                ))}
                {/* Grand Total Cell */}
                <td className="px-4 py-3 text-center sticky right-0 bg-slate-200 border-l-2 border-slate-300">
                  <div
                    className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold min-w-[40px] ${
                      grandTotal > 0
                        ? "bg-green-200 text-green-900 border border-green-300"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    {grandTotal}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Total Offices: {officeNames.length}</span>
            <span>Active Team Members: {userName.length}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow border border-slate-200 p-4 mb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Date Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
              Date Type:
            </label>
            <select
              value={dateType}
              onChange={handleDateTypeChange}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-700 text-sm"
            >
              <option value="appointmentDate">Appointment Date</option>
              <option value="ivCompletedDate">Completion Date</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
              Date Range:
            </label>
            <div className="border border-slate-300 rounded-lg bg-white">
              <Datepicker
                value={dateRange}
                onChange={handleValueChange}
                inputClassName="text-sm px-3 py-2 border-0 focus:ring-0"
                toggleClassName="text-slate-500"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={fetchData}
            disabled={!dateRange.startDate || !dateRange.endDate || loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </div>

      {/* Production Table */}
      {renderTable()}
    </div>
  );
};

export default ProductionIV;
