import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TableHead,
  Snackbar,
  Alert,
  Popover,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import axios from "axios";
import Header from "./Header";
import DatePicker from "./DatePicker";
import BASE_URL from "../config/apiConfig";
import { getCSTDateTime } from "../utils/timezoneUtils";

const fetchDropdownOptions = async (category) => {
  try {
    const encodedCategory = encodeURIComponent(category);
    const response = await axios.get(
      `${BASE_URL}/api/dropdownValues/${encodedCategory}`,
    );
    return response.data.options;
  } catch (error) {
    console.error(`Error fetching ${category} options:`, error);
    return [];
  }
};

const IVUsers = ({ ivUsersState, setIvUsersState }) => {
  // Use lifted state if available, otherwise use local state
  const appointments = useMemo(
    () => ivUsersState?.appointments ?? [],
    [ivUsersState?.appointments],
  );
  const selectedAppointment = ivUsersState?.selectedAppointment ?? null;
  const loading = ivUsersState?.loading ?? false;
  const dateRange = ivUsersState?.dateRange ?? {
    startDate: null,
    endDate: null,
  };
  const noteRemarks = ivUsersState?.noteRemarks ?? "";
  const columnFilters = useMemo(
    () => ivUsersState?.columnFilters ?? {},
    [ivUsersState?.columnFilters],
  );
  const sortConfig = useMemo(
    () => ivUsersState?.sortConfig ?? { key: null, direction: "desc" },
    [ivUsersState?.sortConfig],
  );

  const [error, setError] = useState(null);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [planTypeOptions, setPlanTypeOptions] = useState([]);
  const [ivRemarksOptions, setIvRemarksOptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Update functions that use the lifted state
  const setAppointments = (value) => {
    if (setIvUsersState) {
      const newValue =
        typeof value === "function" ? value(appointments) : value;
      setIvUsersState((prev) => ({ ...prev, appointments: newValue }));
    }
  };

  const setSelectedAppointment = (value) => {
    if (setIvUsersState) {
      setIvUsersState((prev) => ({ ...prev, selectedAppointment: value }));
    }
  };

  const setLoading = (value) => {
    if (setIvUsersState) {
      setIvUsersState((prev) => ({ ...prev, loading: value }));
    }
  };

  const setDateRange = (value) => {
    if (setIvUsersState) {
      setIvUsersState((prev) => ({ ...prev, dateRange: value }));
    }
  };

  const setNoteRemarks = (value) => {
    if (setIvUsersState) {
      setIvUsersState((prev) => ({ ...prev, noteRemarks: value }));
    }
  };

  const setColumnFilters = (value) => {
    if (setIvUsersState) {
      const newValue =
        typeof value === "function" ? value(columnFilters) : value;
      setIvUsersState((prev) => ({ ...prev, columnFilters: newValue }));
    }
  };

  const setSortConfig = (value) => {
    if (setIvUsersState) {
      const newValue = typeof value === "function" ? value(sortConfig) : value;
      setIvUsersState((prev) => ({ ...prev, sortConfig: newValue }));
    }
  };

  // Check user authentication (after hooks)
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("loggedinUserId");
  const userName = localStorage.getItem("loggedinUserName") || "User";
  // const userRole = localStorage.getItem('role') || 'user'; // Not used currently

  // Redirect to login if not authenticated
  useEffect(() => {
    if (
      !token ||
      token === "null" ||
      token.trim() === "" ||
      !userId ||
      userId === "null" ||
      userId.trim() === ""
    ) {
      window.location.href = "/";
    }
  }, [token, userId]);

  // Load dropdown options
  useEffect(() => {
    const loadOptions = async () => {
      const sourceOptions = await fetchDropdownOptions("Source");
      const planTypeOptions = await fetchDropdownOptions("Plan Type");
      const ivRemarksOptions = await fetchDropdownOptions("IV Remarks");

      setSourceOptions(sourceOptions);
      setPlanTypeOptions(planTypeOptions);
      setIvRemarksOptions(ivRemarksOptions);
    };

    loadOptions();
  }, []);

  // Date change handler for DatePicker
  const handleDateChange = (newDateRange) => {
    console.log("🗓️ Date range changed:", newDateRange);
    if (newDateRange && newDateRange.startDate && newDateRange.endDate) {
      // Keep dates as strings to avoid timezone conversion issues
      const updatedRange = {
        startDate: newDateRange.startDate,
        endDate: newDateRange.endDate,
      };
      console.log("📊 Setting new date range:", updatedRange);
      setDateRange(updatedRange);
    }
  };

  // Manual search function for button click
  const handleSearch = () => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchAppointmentsWithRange(dateRange);
    } else {
      setError("Please select a valid date range");
    }
  };

  // Function to fetch appointments with specific date range
  const fetchAppointmentsWithRange = async (range) => {
    try {
      setLoading(true);
      setError(null);

      if (!range || !range.startDate || !range.endDate) {
        setError("Please select a valid date range");
        setLoading(false);
        return;
      }

      // Format dates for API - keep as strings to avoid timezone conversion
      const startDate =
        typeof range.startDate === "string"
          ? range.startDate
          : range.startDate.toISOString().split("T")[0];
      const endDate =
        typeof range.endDate === "string"
          ? range.endDate
          : range.endDate.toISOString().split("T")[0];

      console.log("Fetching appointments for user:", userId);
      console.log("Date range:", { startDate, endDate });

      const apiUrl = `${BASE_URL}/api/appointments/user-appointments/${userId}?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📋 Raw API response:", data);
      console.log("📋 Data type:", typeof data);
      console.log("📋 Is array:", Array.isArray(data));

      let processedAppointments = [];
      if (Array.isArray(data)) {
        processedAppointments = data;
        console.log("📋 Using direct array, length:", data.length);
      } else if (data && data.success && Array.isArray(data.data)) {
        processedAppointments = data.data;
        console.log("📋 Using data.data array, length:", data.data.length);
      } else if (data && Array.isArray(data.appointments)) {
        processedAppointments = data.appointments;
        console.log(
          "📋 Using data.appointments array, length:",
          data.appointments.length,
        );
      } else {
        console.log("📋 No valid array found in response");
        processedAppointments = [];
      }

      console.log("📋 Final processed appointments:", processedAppointments);
      setAppointments(processedAppointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch appointments (for manual retry)
  const fetchAppointments = async () => {
    if (dateRange.startDate && dateRange.endDate) {
      await fetchAppointmentsWithRange(dateRange);
    } else {
      setError("Please select a date range first");
    }
  };

  // Only load dropdown options on mount, no automatic API call
  // API will be called only when user selects date range

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (
        !selectedAppointment ||
        !selectedAppointment.source ||
        !selectedAppointment.planType ||
        !selectedAppointment.ivRemarks
      ) {
        setSnackbarOpen(true);
        setSnackbarSeverity("error");
        setSnackbarMessage("Source, Plan Type and IV Remarks are mandatory.");
        return;
      }

      const payload = {
        userAppointmentId: selectedAppointment.assignedUser,
        appointmentId: selectedAppointment._id,
        ivRemarks: selectedAppointment.ivRemarks,
        source: selectedAppointment.source,
        planType: selectedAppointment.planType,
        completedBy: userName,
        noteRemarks: noteRemarks,
        ivCompletedDate: getCSTDateTime(), // Use CST timezone
      };

      await axios.post(
        `${BASE_URL}/api/appointments/update-individual-appointment-details`,
        payload,
      );

      setSelectedAppointment(null);
      setNoteRemarks("");
      setSnackbarOpen(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Appointment updated successfully!");
      // Refresh data with current date range
      if (dateRange.startDate && dateRange.endDate) {
        fetchAppointmentsWithRange(dateRange);
      }
    } catch (error) {
      console.error("Error submitting:", error);
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
      setSnackbarMessage("An error occurred while updating the appointment.");
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedAppointment({
      ...selectedAppointment,
      [field]: value,
    });
  };

  // Handle column sort
  const handleSort = (columnKey) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.key === columnKey) {
        // Toggle direction if same column
        return {
          key: columnKey,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      // New column, default to ascending
      return { key: columnKey, direction: "asc" };
    });
  };

  // Transform appointments data for filtering and sorting
  const transformedAppointments = useMemo(() => {
    const transformed = [...appointments].map((appointment, index) => ({
      id: appointment._id || index.toString(),
      office: appointment.office || "N/A",
      patientId: appointment.patientId || "N/A",
      appointmentDate: appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toLocaleDateString()
        : "N/A",
      appointmentTime: appointment.appointmentTime || "No time",
      completionStatus: appointment.completionStatus || "Pending",
      _original: appointment,
      _appointmentDateRaw: appointment.appointmentDate, // Keep raw date for sorting
    }));

    // Apply sorting if configured
    if (sortConfig.key) {
      transformed.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Special handling for date sorting
        if (sortConfig.key === "appointmentDate") {
          aVal = a._appointmentDateRaw
            ? new Date(a._appointmentDateRaw).getTime()
            : 0;
          bVal = b._appointmentDateRaw
            ? new Date(b._appointmentDateRaw).getTime()
            : 0;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return transformed;
  }, [appointments, sortConfig]);

  // Get unique values for a column based on currently filtered data
  const getUniqueValues = useCallback(
    (columnName) => {
      const otherFilters = Object.entries(columnFilters).filter(
        ([col]) => col !== columnName,
      );

      let dataToUse = transformedAppointments;
      if (otherFilters.length > 0) {
        dataToUse = transformedAppointments.filter((row) => {
          return otherFilters.every(([column, selectedValues]) => {
            if (!selectedValues || selectedValues.length === 0) return true;
            const cellValue = row[column];
            return selectedValues.includes(cellValue);
          });
        });
      }

      const values = dataToUse
        .map((row) => row[columnName])
        .filter((val) => val !== null && val !== undefined && val !== "N/A");
      return [...new Set(values)].sort();
    },
    [transformedAppointments, columnFilters],
  );

  // Filter data based on column filters
  const filteredAppointments = useMemo(() => {
    if (Object.keys(columnFilters).length === 0) {
      return transformedAppointments;
    }

    return transformedAppointments.filter((row) => {
      return Object.entries(columnFilters).every(([column, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return true;
        const cellValue = row[column];
        return selectedValues.includes(cellValue);
      });
    });
  }, [transformedAppointments, columnFilters]);

  // Handle filter icon click
  const handleFilterClick = (event, columnName) => {
    event.stopPropagation();
    setCurrentFilterColumn(columnName);
    setFilterAnchorEl(event.currentTarget);
    setSearchText("");
  };

  // Handle filter close
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
    setCurrentFilterColumn(null);
    setSearchText("");
  };

  // Handle checkbox change
  const handleCheckboxChange = (columnName, value) => {
    setColumnFilters((prev) => {
      const currentFilters = prev[columnName] || [];
      const newFilters = currentFilters.includes(value)
        ? currentFilters.filter((v) => v !== value)
        : [...currentFilters, value];

      if (newFilters.length === 0) {
        // eslint-disable-next-line no-unused-vars
        const { [columnName]: removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [columnName]: newFilters };
    });
  };

  // Handle select all
  const handleSelectAll = (columnName) => {
    const uniqueValues = getUniqueValues(columnName);
    setColumnFilters((prev) => ({
      ...prev,
      [columnName]: uniqueValues,
    }));
  };

  // Handle clear all for a column
  const handleClearColumn = (columnName) => {
    setColumnFilters((prev) => {
      // eslint-disable-next-line no-unused-vars
      const { [columnName]: removed, ...rest } = prev;
      return rest;
    });
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setColumnFilters({});
  };

  // Custom header renderer with filter icon
  const renderFilterIcon = (columnName) => {
    const hasFilter =
      columnFilters[columnName] && columnFilters[columnName].length > 0;

    return (
      <FilterListIcon
        onClick={(e) => handleFilterClick(e, columnName)}
        style={{
          cursor: "pointer",
          fontSize: "14px",
          color: hasFilter ? "#2563eb" : "#64748b",
          marginLeft: "4px",
          fontWeight: hasFilter ? "bold" : "normal",
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 relative">
      <Header />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-600"></div>
            <span className="text-slate-700 font-medium text-lg">
              Loading appointments...
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold">
              Error Loading Dashboard
            </h3>
            <p className="text-red-700 mt-2">
              <strong>Error:</strong> {error}
            </p>
            <button
              onClick={fetchAppointments}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Retry Loading
            </button>
          </div>
        </div>
      )}

      {/* Main Layout - Sidebar + Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Completely Sticky */}
        <div className="w-1/3 bg-white shadow-lg border-r border-slate-200 flex flex-col h-full overflow-hidden">
          {/* Date Range Selector - Fixed */}
          <div className="p-6 border-b border-slate-200 flex-shrink-0 relative z-50">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              📅 Select Date Range
            </h2>
            <DatePicker
              onDateChange={handleDateChange}
              value={
                dateRange.startDate && dateRange.endDate
                  ? {
                      startDate: dateRange.startDate,
                      endDate: dateRange.endDate,
                    }
                  : null
              }
            />
            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={!dateRange.startDate || !dateRange.endDate || loading}
              className="mt-3 w-full h-9 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Search
            </button>
          </div>

          {/* Assignments List */}
          <div className="flex-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  📋 Assigned IVs
                </h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {appointments.length}
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-slate-500 font-medium">
                    No assignments found
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Please select a date range to view assignments
                  </p>
                </div>
              ) : (
                <div className="h-[calc(100vh-400px)] border border-slate-200 rounded-lg relative">
                  {/* Clear All Filters Button */}
                  {Object.keys(columnFilters).length > 0 && (
                    <div className="absolute -top-8 right-0 z-50">
                      <button
                        onClick={handleClearAllFilters}
                        className="w-7 h-7 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                        title={`Clear ${Object.keys(columnFilters).length} filter(s)`}
                      >
                        <ClearIcon style={{ fontSize: "14px" }} />
                      </button>
                    </div>
                  )}

                  <TableContainer component={Paper} sx={{ height: "100%" }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              backgroundColor: "#f8fafc",
                              fontWeight: 600,
                              color: "#374151",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onClick={() => handleSort("office")}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <span>Office</span>
                                {sortConfig.key === "office" && (
                                  <span style={{ fontSize: "10px" }}>
                                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                                  </span>
                                )}
                              </div>
                              {renderFilterIcon("office")}
                            </div>
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#f8fafc",
                              fontWeight: 600,
                              color: "#374151",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onClick={() => handleSort("patientId")}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <span>Patient ID</span>
                                {sortConfig.key === "patientId" && (
                                  <span style={{ fontSize: "10px" }}>
                                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                                  </span>
                                )}
                              </div>
                              {renderFilterIcon("patientId")}
                            </div>
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#f8fafc",
                              fontWeight: 600,
                              color: "#374151",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onClick={() => handleSort("appointmentDate")}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <span>Date & Time</span>
                                {sortConfig.key === "appointmentDate" && (
                                  <span style={{ fontSize: "10px" }}>
                                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                                  </span>
                                )}
                              </div>
                              {renderFilterIcon("appointmentDate")}
                            </div>
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: "#f8fafc",
                              fontWeight: 600,
                              color: "#374151",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              userSelect: "none",
                            }}
                            onClick={() => handleSort("completionStatus")}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <span>Status</span>
                                {sortConfig.key === "completionStatus" && (
                                  <span style={{ fontSize: "10px" }}>
                                    {sortConfig.direction === "asc" ? "▲" : "▼"}
                                  </span>
                                )}
                              </div>
                              {renderFilterIcon("completionStatus")}
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAppointments.map((item) => (
                          <TableRow
                            key={item.id}
                            onClick={() =>
                              setSelectedAppointment(item._original)
                            }
                            sx={{
                              cursor: "pointer",
                              "&:hover": { backgroundColor: "#f8fafc" },
                              backgroundColor:
                                selectedAppointment?._id === item._original._id
                                  ? "#eff6ff"
                                  : item._original.isPreviouslyCompleted
                                    ? "#fee2e2" // Light red for previously completed
                                    : "inherit",
                              borderLeft:
                                selectedAppointment?._id === item._original._id
                                  ? "4px solid #3b82f6"
                                  : "none",
                            }}
                          >
                            <TableCell
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                color: "#1f2937",
                                py: 1,
                              }}
                            >
                              {item.office}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: 500,
                                color: "#1f2937",
                                py: 1,
                              }}
                            >
                              {item.patientId}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontSize: "0.75rem",
                                color: "#4b5563",
                                py: 1,
                              }}
                            >
                              <div>
                                <div>{item.appointmentDate}</div>
                                <div className="text-xs text-slate-500">
                                  {item.appointmentTime}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell sx={{ py: 1 }}>
                              <span
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "9999px",
                                  fontSize: "0.75rem",
                                  fontWeight: 500,
                                  backgroundColor:
                                    item.completionStatus === "Completed"
                                      ? "#dcfce7"
                                      : "#fed7aa",
                                  color:
                                    item.completionStatus === "Completed"
                                      ? "#166534"
                                      : "#c2410c",
                                }}
                              >
                                {item.completionStatus}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-50 overflow-y-auto">
          {selectedAppointment ? (
            <div className="p-6">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        📝 Appointment Details
                      </h2>
                      <p className="text-slate-600 mt-1">
                        Patient ID: {selectedAppointment.patientId} •{" "}
                        {new Date(
                          selectedAppointment.appointmentDate,
                        ).toLocaleDateString()}{" "}
                        • {selectedAppointment.appointmentTime || "No time"}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedAppointment(null)}
                      className="text-slate-400 hover:text-slate-600 transition-colors text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                  <Box component="form" className="space-y-6">
                    {/* Required Fields Section */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h3 className="text-amber-800 font-semibold mb-4 flex items-center">
                        ⚠️ Required Information
                      </h3>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Source *</InputLabel>
                            <Select
                              value={selectedAppointment.source || ""}
                              label="Source *"
                              onChange={(e) =>
                                handleInputChange("source", e.target.value)
                              }
                            >
                              {sourceOptions.map((source) => (
                                <MenuItem key={source.id} value={source.name}>
                                  {source.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Plan Type *</InputLabel>
                            <Select
                              value={selectedAppointment.planType || ""}
                              label="Plan Type *"
                              onChange={(e) =>
                                handleInputChange("planType", e.target.value)
                              }
                            >
                              {planTypeOptions.map((plan) => (
                                <MenuItem key={plan.id} value={plan.name}>
                                  {plan.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>IV Remarks *</InputLabel>
                            <Select
                              value={selectedAppointment.ivRemarks || ""}
                              label="IV Remarks *"
                              onChange={(e) =>
                                handleInputChange("ivRemarks", e.target.value)
                              }
                            >
                              {ivRemarksOptions.map((remark) => (
                                <MenuItem key={remark.id} value={remark.name}>
                                  {remark.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </div>

                    {/* Patient Information */}
                    <div>
                      <h3 className="text-slate-800 font-semibold mb-4 flex items-center">
                        👤 Patient Information
                      </h3>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Patient Name"
                            value={selectedAppointment.patientName || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Patient DOB"
                            value={selectedAppointment.patientDOB || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Office"
                            value={selectedAppointment.office || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Appointment Time"
                            value={selectedAppointment.appointmentTime || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                      </Grid>
                    </div>

                    {/* Insurance Information */}
                    <div>
                      <h3 className="text-slate-800 font-semibold mb-4 flex items-center">
                        🏥 Insurance Information
                      </h3>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Insurance Name"
                            value={selectedAppointment.insuranceName || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Member ID"
                            value={selectedAppointment.memberId || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Policy Holder Name"
                            value={selectedAppointment.policyHolderName || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Policy Holder DOB"
                            value={selectedAppointment.policyHolderDOB || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="MID/SSN"
                            value={selectedAppointment.MIDSSN || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Appointment Type"
                            value={selectedAppointment.appointmentType || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Insurance Phone"
                            value={selectedAppointment.insurancePhone || ""}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                      </Grid>
                    </div>

                    {/* Notes Section */}
                    <div>
                      <h3 className="text-slate-800 font-semibold mb-4 flex items-center">
                        📝 Additional Notes
                      </h3>
                      <TextField
                        fullWidth
                        label="Note Remarks"
                        multiline
                        rows={4}
                        value={noteRemarks}
                        onChange={(e) => setNoteRemarks(e.target.value)}
                        placeholder="Add any additional notes or comments here..."
                        variant="outlined"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        size="large"
                        className="bg-slate-800 hover:bg-slate-900 px-8"
                      >
                        💾 Submit & Complete
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setSelectedAppointment(null)}
                        size="large"
                        className="px-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </Box>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-8xl mb-6">👈</div>
                <h2 className="text-2xl font-bold text-slate-600 mb-3">
                  Select an Assignment
                </h2>
                <p className="text-slate-500 text-lg">
                  Click on any appointment from the sidebar to view and edit
                  details
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <div style={{ padding: "16px", minWidth: "280px", maxWidth: "400px" }}>
          {currentFilterColumn && (
            <>
              <div
                style={{
                  marginBottom: "12px",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#1e293b",
                }}
              >
                Filter: {currentFilterColumn}
              </div>

              {/* Search Box */}
              <TextField
                size="small"
                placeholder="Search values..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                fullWidth
                style={{ marginBottom: "12px" }}
              />

              {/* Select All / Clear All Buttons */}
              <div
                style={{ display: "flex", gap: "8px", marginBottom: "12px" }}
              >
                <Button
                  size="small"
                  onClick={() => handleSelectAll(currentFilterColumn)}
                  style={{ fontSize: "12px", textTransform: "none" }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={() => handleClearColumn(currentFilterColumn)}
                  style={{ fontSize: "12px", textTransform: "none" }}
                >
                  Clear
                </Button>
              </div>

              {/* Checkbox List */}
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {getUniqueValues(currentFilterColumn)
                  .filter(
                    (value) =>
                      searchText === "" ||
                      String(value)
                        .toLowerCase()
                        .includes(searchText.toLowerCase()),
                  )
                  .map((value) => (
                    <FormControlLabel
                      key={value}
                      control={
                        <Checkbox
                          checked={
                            columnFilters[currentFilterColumn]?.includes(
                              value,
                            ) || false
                          }
                          onChange={() =>
                            handleCheckboxChange(currentFilterColumn, value)
                          }
                          size="small"
                        />
                      }
                      label={<span style={{ fontSize: "13px" }}>{value}</span>}
                      style={{ display: "block", margin: "4px 0" }}
                    />
                  ))}
              </div>

              {/* Apply and Close Button */}
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleFilterClose}
                  style={{
                    backgroundColor: "#1e293b",
                    textTransform: "none",
                    fontSize: "12px",
                  }}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Popover>
    </div>
  );
};

export default IVUsers;
