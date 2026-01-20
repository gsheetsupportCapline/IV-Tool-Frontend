import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import BASE_URL from "../config/apiConfig.js";
import DatePicker from "./DatePicker";
import { fetchOfficeOptions } from "../utils/fetchOfficeOptions";

const AssignedIV = ({ pageState, setPageState }) => {
  // Use lifted state from App.jsx
  const users = pageState?.users ?? [];
  const appointments = pageState?.appointments ?? {};
  const selectedUserId = pageState?.selectedUserId ?? "";
  const selectedOffice = pageState?.selectedOffice ?? "";
  const assignedCounts = pageState?.assignedCounts ?? [];
  const loading = pageState?.loading ?? false;
  const dateRange = pageState?.dateRange ?? { startDate: null, endDate: null };
  const officeNames = pageState?.officeNames ?? [];

  // Setter functions to update lifted state
  const setUsers = (val) => setPageState?.((prev) => ({ ...prev, users: val }));
  const setAppointments = (val) =>
    setPageState?.((prev) => ({ ...prev, appointments: val }));
  const setSelectedUserId = (val) =>
    setPageState?.((prev) => ({ ...prev, selectedUserId: val }));
  const setSelectedOffice = (val) =>
    setPageState?.((prev) => ({ ...prev, selectedOffice: val }));
  const setAssignedCounts = (val) =>
    setPageState?.((prev) => ({ ...prev, assignedCounts: val }));
  const setLoading = (val) =>
    setPageState?.((prev) => ({ ...prev, loading: val }));
  const setDateRange = (val) =>
    setPageState?.((prev) => ({ ...prev, dateRange: val }));
  const setOfficeNames = (val) =>
    setPageState?.((prev) => ({ ...prev, officeNames: val }));

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

  // Fetch users on component mount (only once)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userResponse = await axios.get(`${BASE_URL}/api/auth/users`);
        const usersData = userResponse.data.data;

        console.log("Total users fetched:", usersData.length);
        console.log("All users:", usersData);

        // Filter users with role 'user' and isActive true
        const filteredUsers = usersData.filter(
          (user) => user.role === "user" && user.isActive === true,
        );
        console.log(
          "Filtered users (role=user & isActive=true):",
          filteredUsers.length,
        );
        console.log("Filtered users data:", filteredUsers);

        const usersWithName = filteredUsers.map((userData) => ({
          ...userData,
          firstName: userData.name,
        }));

        setUsers(usersWithName);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    if (users.length === 0) {
      fetchUsers();
    }
  }, []);

  // Manual fetch function for user appointments
  const fetchUserAppointments = async () => {
    // Only fetch data if user is selected and date range is provided
    if (!selectedUserId || !dateRange.startDate || !dateRange.endDate) {
      setAppointments({});
      return;
    }

    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dateType: "ivAssignedDate",
      });

      const appointmentsResponse = await axios.get(
        `${BASE_URL}/api/appointments/user-appointments/${selectedUserId}?${queryParams}`,
      );

      // Data is now in response.data.data format
      const userAppointments = appointmentsResponse.data.data || [];

      // Group appointments by office for the selected user
      const groupedByOffice = userAppointments.reduce((acc, appointment) => {
        const { office } = appointment;
        if (!acc[office]) {
          acc[office] = 0;
        }
        acc[office]++;
        return acc;
      }, {});

      // Set appointments in the format expected by the component
      setAppointments({
        [selectedUserId]: groupedByOffice,
      });
    } catch (error) {
      console.error("Error fetching user appointments", error);
      setAppointments({});
    } finally {
      setLoading(false);
    }
  };

  // Manual fetch function for office assignments
  const fetchOfficeAssignments = async () => {
    if (!selectedOffice || !dateRange.startDate || !dateRange.endDate) {
      setAssignedCounts([]);
      return;
    }

    setLoading(true);

    const queryParams = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      dateType: "ivAssignedDate",
    });

    try {
      const response = await axios.get(
        `${BASE_URL}/api/appointments/assigned-counts/${selectedOffice}?${queryParams}`,
      );
      // Updated response structure: response.data.data.assignedCounts
      const responseData = response.data.data;
      const assignedCounts = responseData.assignedCounts || {};

      const formattedData = Object.entries(assignedCounts).map(
        ([userId, count], index) => ({
          id: index,
          userName:
            users.find((user) => user._id === userId)?.name || "Unknown",
          count,
        }),
      );
      setAssignedCounts(formattedData);
    } catch (error) {
      console.error("Error fetching assigned counts", error);
      setAssignedCounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (event) => {
    setSelectedUserId(event.target.value);
    setAppointments({}); // Clear previous data
  };

  const handleOfficeChange = (event) => {
    setSelectedOffice(event.target.value);
    setAssignedCounts([]); // Clear previous data
  };

  const getUserOfficeData = () => {
    if (selectedUserId && appointments[selectedUserId]) {
      return Object.entries(appointments[selectedUserId]).map(
        ([office, count], index) => ({
          id: index,
          office,
          count,
        }),
      );
    }
    return [];
  };

  const userOfficeData = getUserOfficeData();

  return (
    <div className="h-full bg-slate-50 overflow-auto relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-slate-700 font-medium">
                Loading assignments...
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4" style={{ padding: "15px" }}>
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mb-6">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">
                Date Range:
              </label>
              <div className="w-80">
                <DatePicker onDateChange={setDateRange} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User-based Assignments Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              {/* User Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select User
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedUserId}
                    onChange={handleUserChange}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-700"
                  >
                    <option value="">Choose a user...</option>
                    {users
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={fetchUserAppointments}
                    disabled={
                      !selectedUserId ||
                      !dateRange.startDate ||
                      !dateRange.endDate ||
                      loading
                    }
                    className="px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* User Office Data Table */}
            <div className="p-6">
              {selectedUserId ? (
                userOfficeData.length > 0 ? (
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                              Office
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                              Count
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {userOfficeData.map((row) => (
                            <tr
                              key={row.id}
                              className="hover:bg-blue-50 transition-colors duration-200"
                            >
                              <td className="px-4 py-3 text-sm text-slate-900">
                                {row.office}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold min-w-[50px] ${
                                    row.count > 0
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : "bg-gray-50 text-gray-400 border border-gray-200"
                                  }`}
                                >
                                  {row.count}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Card */}
                    <div className="mt-4 bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Total Offices:</span>
                        <span className="font-semibold text-slate-800">
                          {userOfficeData.length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-slate-600">
                          Total Assignments:
                        </span>
                        <span className="font-semibold text-blue-600">
                          {userOfficeData.reduce(
                            (sum, row) => sum + row.count,
                            0,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm">
                      No assignments found for selected user
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Please select a user to view assignments
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Office-based Assignments Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              {/* Office Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Office
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOffice}
                    onChange={handleOfficeChange}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-slate-700"
                  >
                    <option value="">Choose an office...</option>
                    {officeNames.map((office) => (
                      <option key={office.id} value={office.name}>
                        {office.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={fetchOfficeAssignments}
                    disabled={
                      !selectedOffice ||
                      !dateRange.startDate ||
                      !dateRange.endDate ||
                      loading
                    }
                    className="px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Office User Data Table */}
            <div className="p-6">
              {selectedOffice ? (
                assignedCounts.length > 0 ? (
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                              User Name
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                              Count
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assignedCounts.map((row) => (
                            <tr
                              key={row.id}
                              className="hover:bg-green-50 transition-colors duration-200"
                            >
                              <td className="px-4 py-3 text-sm text-slate-900">
                                {row.userName}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold min-w-[50px] ${
                                    row.count > 0
                                      ? "bg-orange-100 text-orange-800 border border-orange-200"
                                      : "bg-gray-50 text-gray-400 border border-gray-200"
                                  }`}
                                >
                                  {row.count}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Card */}
                    <div className="mt-4 bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Active Users:</span>
                        <span className="font-semibold text-slate-800">
                          {assignedCounts.filter((row) => row.count > 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-slate-600">
                          Total Assignments:
                        </span>
                        <span className="font-semibold text-green-600">
                          {assignedCounts.reduce(
                            (sum, row) => sum + row.count,
                            0,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-500 text-sm">
                      No assignments found for selected office
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm">
                    Please select an office to view assignments
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedIV;
