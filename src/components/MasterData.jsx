import React, { useState, useEffect, useMemo, useCallback } from "react";
import DatePicker from "./DatePicker";
import BASE_URL from "../config/apiConfig";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Popover,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

const MasterData = ({
  masterDataState,
  setMasterDataState,
  isVisible = true,
}) => {
  // Use lifted state from App.jsx instead of local state
  const { dateRange, selectedDateType, data, loading, error } = masterDataState;

  // Local state for column filters
  const [columnFilters, setColumnFilters] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Helper function to update specific parts of the state
  const updateMasterDataState = (updates) => {
    setMasterDataState((prev) => ({ ...prev, ...updates }));
  };

  const dateTypeOptions = [
    { name: "Appointment Date", value: "appointmentDate" },
    { name: "Request Date", value: "ivRequestedDate" },
    { name: "Assigned Date", value: "ivAssignedDate" },
    { name: "Completion Date", value: "completedDate" },
  ];

  const columnMapping = {
    officeName: "Office",
    appointmentDate: "Apt. Date",
    appointmentTime: "Apt. Time",
    patientId: "Patient ID",
    patientName: "Patient Name",
    patientDOB: "Patient DOB",
    insuranceName: "Insurance Name",
    insurancePhone: "Insurance Phone",
    policyHolderName: "Policy Holder Name",
    policyHolderDOB: "Policy Holder DOB",
    memberId: "Member ID",
    employerName: "Employer Name",
    groupNumber: "Group No.",
    relationWithPatient: "Relation With Patient",
    medicaidId: "Medicaid Id",
    carrierId: "Carrier Id",
    confirmationStatus: "Confirmation Status",
    cellPhone: "Cell Phone",
    homePhone: "Home Phone",
    workPhone: "Work Phone",
    appointmentType: "Apt. Type",
    ivType: "IV Type",
    status: "Status",
    completionStatus: "Completion Status",
    assignedUserName: "Assigned User",
    ivRemarks: "IV Remarks",
    source: "Source",
    planType: "Plan Type",
    completedBy: "Completed By",
    noteRemarks: "Remarks",
    ivRequestedDate: "IV Requested Date",
    ivAssignedDate: "IV Assigned Date",
    ivCompletedDate: "IV Completed Date",
    ivAssignedByUserName: "IV Assigned By",
    provider: "Provider",
  };

  // Format date for display (keep original timezone)
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    // Return date as-is from database without conversion
    return dateString;
  };

  // Format date and time for IV related columns (no timezone conversion - display as-is from database)
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      // Parse the date string without timezone conversion
      // Input format from DB: "2025-12-09T22:46:00.000Z" or "2025-12-09 22:46"
      const dateStr = dateString
        .replace("T", " ")
        .replace("Z", "")
        .split(".")[0];
      const [datePart, timePart] = dateStr.split(" ");

      if (!datePart || !timePart) return dateString;

      const [year, month, day] = datePart.split("-");
      const [hours, minutes] = timePart.split(":");

      // Convert to 12-hour format
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;

      // Format: MM/DD/YYYY HH:MM AM/PM
      return `${month}/${day}/${year} ${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return dateString || "-";
    }
  };

  // Format time for display (keep original timezone)
  const formatTime = (timeString) => {
    if (!timeString || timeString === "-NO-DATA-") return "-";

    try {
      // If it's already in HH:MM:SS format, just convert to 12-hour format
      if (typeof timeString === "string" && timeString.includes(":")) {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);

        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          const ampm = hour >= 12 ? "PM" : "AM";
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
        }
      }

      // If it's a date object or date string, extract time (keep original timezone)
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      // If nothing works, return the original string
      return timeString;
    } catch (error) {
      // If all parsing fails, return the original string or '-'
      return timeString || "-";
    }
  };

  // Memoized transform data function for better performance
  const transformedData = useMemo(() => {
    if (!data.length) return [];

    return data.map((item, index) => {
      const transformed = { id: index.toString() };

      Object.entries(columnMapping).forEach(([dataKey, displayName]) => {
        let value = item[dataKey];

        // Handle special cases
        if (
          dataKey === "ivCompletedDate" ||
          dataKey === "ivRequestedDate" ||
          dataKey === "ivAssignedDate"
        ) {
          // Show date and time for IV related dates (original timezone)
          value = formatDateTime(value);
        } else if (dataKey === "appointmentDate") {
          // Show only date part (before T) for appointment date
          if (value && typeof value === "string" && value.includes("T")) {
            value = value.split("T")[0];
          } else {
            value = value || "-";
          }
        } else if (dataKey.includes("Date") && dataKey !== "appointmentTime") {
          // Show only date for other date fields (original timezone)
          value = formatDate(value);
        } else if (dataKey === "appointmentTime") {
          value = formatTime(value);
        } else if (dataKey.includes("DOB")) {
          // Show DOB as-is from database
          value = value || "-";
        }

        // Handle null, undefined, empty values, and -NO-DATA-
        transformed[displayName] =
          value === null ||
          value === undefined ||
          value === "" ||
          value === "-NO-DATA-"
            ? "-"
            : value;
      });

      return transformed;
    });
  }, [data]);

  // Get unique values for a column based on currently filtered data (excluding the current column filter)
  const getUniqueValues = useCallback(
    (columnName) => {
      // Get data filtered by all columns except the current one
      const otherFilters = Object.entries(columnFilters).filter(
        ([col]) => col !== columnName
      );

      let dataToUse = transformedData;
      if (otherFilters.length > 0) {
        dataToUse = transformedData.filter((row) => {
          return otherFilters.every(([column, selectedValues]) => {
            if (!selectedValues || selectedValues.length === 0) return true;
            const cellValue = row[column];
            return selectedValues.includes(cellValue);
          });
        });
      }

      const values = dataToUse
        .map((row) => row[columnName])
        .filter((val) => val !== null && val !== undefined && val !== "-");
      return [...new Set(values)].sort();
    },
    [transformedData, columnFilters]
  );

  // Filter data based on column filters
  const filteredData = useMemo(() => {
    if (Object.keys(columnFilters).length === 0) {
      return transformedData;
    }

    return transformedData.filter((row) => {
      return Object.entries(columnFilters).every(([column, selectedValues]) => {
        if (!selectedValues || selectedValues.length === 0) return true;
        const cellValue = row[column];
        return selectedValues.includes(cellValue);
      });
    });
  }, [transformedData, columnFilters]);

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
      const { [columnName]: removed, ...rest } = prev;
      return rest;
    });
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setColumnFilters({});
  };

  // Custom header renderer with filter icon
  const renderHeader = (params) => {
    const columnName = params.colDef.headerName;
    const hasFilter =
      columnFilters[columnName] && columnFilters[columnName].length > 0;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          minWidth: 0,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {columnName}
        </span>
        <FilterListIcon
          onClick={(e) => handleFilterClick(e, columnName)}
          style={{
            cursor: "pointer",
            fontSize: "18px",
            color: hasFilter ? "#2563eb" : "#64748b",
            marginLeft: "4px",
            flexShrink: 0,
            fontWeight: hasFilter ? "bold" : "normal",
          }}
        />
      </div>
    );
  };

  // Memoized columns generation with custom header
  const columns = useMemo(() => {
    return Object.values(columnMapping).map((header) => ({
      field: header,
      headerName: header,
      flex: 1,
      minWidth: 150,
      sortable: true,
      filterable: false, // Disable default filtering
      renderHeader: renderHeader,
      disableColumnMenu: false,
    }));
  }, [columnFilters]);

  // Fetch data from API
  const fetchData = async () => {
    if (!dateRange.startDate || !dateRange.endDate || !selectedDateType) {
      updateMasterDataState({
        error: "Please select date range and date type",
      });
      return;
    }

    updateMasterDataState({ loading: true, error: "" });

    try {
      const response = await fetch(
        `${BASE_URL}/api/office-data/office-data-by-date-range`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            fromDate: dateRange.startDate,
            toDate: dateRange.endDate,
            dateType: selectedDateType,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // Handle different error scenarios
        if (response.status === 400) {
          if (result.message.includes("date range exceeds 31 days")) {
            updateMasterDataState({
              error:
                "Date range cannot exceed 31 days. Please select a shorter period.",
            });
          } else if (
            result.message.includes("fromDate cannot be later than toDate")
          ) {
            updateMasterDataState({
              error: "Start date cannot be later than end date.",
            });
          } else if (result.message.includes("Invalid date format")) {
            updateMasterDataState({ error: "Please select valid dates." });
          } else if (result.message.includes("Invalid dateType")) {
            updateMasterDataState({
              error: "Please select a valid date type.",
            });
          } else if (result.message.includes("required fields")) {
            updateMasterDataState({
              error: "Please fill in all required fields.",
            });
          } else {
            updateMasterDataState({
              error: "Invalid request. Please check your inputs.",
            });
          }
        } else if (response.status === 401) {
          updateMasterDataState({
            error: "You are not authorized to access this data.",
          });
        } else if (response.status === 403) {
          updateMasterDataState({
            error: "Access denied. Please contact administrator.",
          });
        } else if (response.status === 500) {
          updateMasterDataState({
            error: "Server error occurred. Please try again later.",
          });
        } else {
          updateMasterDataState({
            error: "Failed to fetch data. Please try again.",
          });
        }
        return;
      }

      if (result.success) {
        updateMasterDataState({ data: result.data?.appointments || [] });
      } else {
        updateMasterDataState({
          error: "No data found for the selected criteria.",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      updateMasterDataState({
        error:
          "Network error occurred. Please check your connection and try again.",
      });
    } finally {
      updateMasterDataState({ loading: false });
    }
  };

  // Handle search button click
  const handleSearch = () => {
    fetchData();
  };

  // Handle CSV download
  const handleDownloadCSV = () => {
    if (!transformedData || transformedData.length === 0) {
      alert("No data available to download");
      return;
    }

    try {
      // Get headers from column mapping
      const headers = Object.values(columnMapping);

      // Create CSV content
      let csvContent = headers.join(",") + "\n";

      // Add data rows
      transformedData.forEach((row) => {
        const rowData = headers.map((header) => {
          const value = row[header];
          // Handle values that contain commas, quotes, or newlines
          if (
            value &&
            (value.toString().includes(",") ||
              value.toString().includes('"') ||
              value.toString().includes("\n"))
          ) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value || "";
        });
        csvContent += rowData.join(",") + "\n";
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      // Generate filename with date range
      const fileName = `MasterData_${dateRange.startDate}_to_${dateRange.endDate}_${selectedDateType}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      alert("Error downloading CSV file. Please try again.");
    }
  };

  return (
    <div className="h-full bg-slate-50 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
              <span className="text-slate-700 font-medium">
                Loading master data...
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="h-full overflow-hidden">
        <div className="p-4 h-full flex flex-col">
          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4 flex-shrink-0">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Date Range */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Date Range:
                </label>
                <div className="h-10">
                  <DatePicker
                    onDateChange={(newDateRange) =>
                      updateMasterDataState({ dateRange: newDateRange })
                    }
                    value={dateRange}
                  />
                </div>
              </div>

              {/* Date Type Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Date Type:
                </label>
                <select
                  value={selectedDateType}
                  onChange={(e) =>
                    updateMasterDataState({ selectedDateType: e.target.value })
                  }
                  className="h-10 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors bg-white text-slate-700"
                >
                  <option value="">Select Date Type</option>
                  {dateTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={
                  !dateRange.startDate ||
                  !dateRange.endDate ||
                  !selectedDateType ||
                  loading
                }
                className="h-10 px-6 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-0 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                Search
              </button>

              {/* Download CSV Button - Only visible when data exists */}
              {transformedData && transformedData.length > 0 && (
                <button
                  onClick={handleDownloadCSV}
                  disabled={loading}
                  className="h-10 px-6 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-0 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download CSV
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 min-h-0 mb-2 relative">
            {/* Clear All Filters Button - Floating above the Box, outside table area */}
            {Object.keys(columnFilters).length > 0 && (
              <div className="absolute -top-10 right-2 z-50">
                <button
                  onClick={handleClearAllFilters}
                  className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded shadow-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <ClearIcon style={{ fontSize: "14px" }} />
                  Clear Filters ({Object.keys(columnFilters).length})
                </button>
              </div>
            )}
            <Box
              sx={{
                height: "calc(100vh - 200px)",
                width: "100%",
              }}
            >
              {/* Only render DataGrid when component is visible for better performance */}
              {isVisible ? (
                <DataGrid
                  rows={filteredData}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 100 },
                    },
                  }}
                  pageSizeOptions={[50, 100, 200, 500]}
                  pagination
                  sortingOrder={["asc", "desc"]}
                  disableSelectionOnClick
                  loading={loading}
                  density="compact"
                  filterMode="client"
                  sortingMode="client"
                  getRowId={(row) => row.id}
                  sx={{
                    border: "none",
                    ".MuiDataGrid-columnHeader": {
                      backgroundColor: "#1e293b", // slate-800
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      padding: "0 8px",
                    },
                    ".MuiDataGrid-columnHeaderTitle": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                    ".MuiDataGrid-iconButtonContainer": {
                      visibility: "visible",
                      width: "auto",
                      marginLeft: "2px",
                    },
                    ".MuiDataGrid-menuIcon": {
                      visibility: "visible",
                      width: "auto",
                    },
                    ".MuiDataGrid-sortIcon": {
                      color: "#ffffff",
                      opacity: 0.7,
                    },
                    ".MuiDataGrid-menuIconButton": {
                      color: "#ffffff",
                      opacity: 0.8,
                      "&:hover": {
                        opacity: 1,
                      },
                    },
                    ".MuiDataGrid-columnSeparator": {
                      color: "#475569",
                    },
                    ".MuiDataGrid-columnHeaderTitle": {
                      color: "#ffffff",
                      fontWeight: 600,
                    },
                    ".MuiDataGrid-columnSeparator": {
                      color: "#ffffff",
                    },
                    ".MuiDataGrid-iconSeparator": {
                      color: "#ffffff",
                    },
                    ".MuiDataGrid-sortIcon": {
                      color: "#ffffff",
                    },
                    ".MuiDataGrid-menuIcon": {
                      color: "#ffffff",
                    },
                    ".MuiDataGrid-columnHeaderTitleContainer .MuiDataGrid-iconButtonContainer":
                      {
                        color: "#ffffff",
                      },
                    ".MuiDataGrid-filterIcon": {
                      color: "#ffffff",
                    },
                    ".MuiDataGrid-row:hover": {
                      backgroundColor: "#f8fafc", // slate-50
                    },
                    ".MuiDataGrid-cell": {
                      borderColor: "#e2e8f0", // slate-200
                      fontSize: "0.875rem",
                    },
                    ".MuiDataGrid-footerContainer": {
                      backgroundColor: "#f8fafc", // slate-50
                      borderTop: "1px solid #e2e8f0", // slate-200
                    },
                    ".MuiTablePagination-root": {
                      color: "#475569", // slate-600
                    },
                    ".MuiDataGrid-overlay": {
                      backgroundColor: "rgba(248, 250, 252, 0.8)",
                    },
                    // Performance optimizations
                    ".MuiDataGrid-virtualScroller": {
                      willChange: "transform",
                    },
                    ".MuiDataGrid-virtualScrollerContent": {
                      willChange: "transform",
                    },
                  }}
                  slotProps={{
                    loadingOverlay: {
                      variant: "skeleton",
                      noRowsVariant: "skeleton",
                    },
                  }}
                  slots={{
                    noRowsOverlay: () => (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <svg
                            className="w-8 h-8 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <div className="text-slate-500 text-lg font-medium">
                          No Data Found
                        </div>
                        <div className="text-slate-400 text-sm mt-1">
                          {!dateRange.startDate ||
                          !dateRange.endDate ||
                          !selectedDateType
                            ? "Please select date range and date type to view data"
                            : "No records found for the selected criteria"}
                        </div>
                      </div>
                    ),
                  }}
                />
              ) : (
                // Show a placeholder when not visible to maintain layout
                <div className="h-full flex items-center justify-center text-slate-500">
                  <span>MasterData ready to display</span>
                </div>
              )}
            </Box>
          </div>
        </div>
      </div>

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
                        .includes(searchText.toLowerCase())
                  )
                  .map((value) => (
                    <FormControlLabel
                      key={value}
                      control={
                        <Checkbox
                          checked={
                            columnFilters[currentFilterColumn]?.includes(
                              value
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

export default React.memo(MasterData);
