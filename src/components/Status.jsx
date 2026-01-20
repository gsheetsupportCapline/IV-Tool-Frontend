import { useState, useEffect, useMemo, useCallback } from "react";
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

const Status = ({
  data,
  dateRange,
  patientId,
  statusState,
  setStatusState,
}) => {
  // Use lifted state if available, otherwise use local state
  const selectedOption = statusState?.selectedOption ?? "yes";
  const columnFilters = useMemo(
    () => statusState?.columnFilters ?? {},
    [statusState?.columnFilters],
  );

  const [filteredData, setFilteredData] = useState([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilterColumn, setCurrentFilterColumn] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Update functions that use the lifted state
  const setSelectedOption = (value) => {
    if (setStatusState) {
      setStatusState((prev) => ({ ...prev, selectedOption: value }));
    }
  };

  const setColumnFilters = (value) => {
    if (setStatusState) {
      const newValue =
        typeof value === "function" ? value(columnFilters) : value;
      setStatusState((prev) => ({ ...prev, columnFilters: newValue }));
    }
  };

  const dataHeaderMapping = {
    "Patient Name": "patientName",
    "Patient ID": "patientId",
    "Appointment Date": "appointmentDate",
    "Completion Status": "completionStatus",
    "Plan Type": "planType",
    "IV Type": "ivType",
    Remarks: "ivRemarks",
    "Insurance Name": "insuranceName",
  };

  const hasValidFilters = () => {
    const hasDateRange = dateRange?.startDate && dateRange?.endDate;
    const hasPatientId = patientId && patientId.trim() !== "";
    return hasDateRange || hasPatientId;
  };

  const matchesPatientId = (item) => {
    if (!item || !item.patientId) {
      return false;
    }

    try {
      const searchValue = String(patientId).toLowerCase().trim();
      if (searchValue === "") {
        return true; // Return true when no patient ID filter
      }

      return String(item.patientId).toLowerCase().includes(searchValue);
    } catch (error) {
      console.error("Error matching patient ID:", error);
      return false;
    }
  };

  const isInDateRange = (itemDate, startDate, endDate) => {
    if (!startDate || !endDate || !itemDate) return false;

    const item = new Date(itemDate);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return item >= start && item <= end;
  };

  const filterData = () => {
    if (!data || data.length === 0) return [];

    let filtered = data.filter((item) => {
      // Patient ID filter
      if (patientId && patientId.trim() !== "") {
        if (!matchesPatientId(item)) return false;
      }

      // Date range filter
      if (dateRange?.startDate && dateRange?.endDate) {
        if (
          !isInDateRange(
            item.appointmentDate,
            dateRange.startDate,
            dateRange.endDate,
          )
        ) {
          return false;
        }
      }

      return true;
    });

    // Status filter
    if (selectedOption === "no") {
      filtered = filtered.filter(
        (item) =>
          !item.completionStatus ||
          item.completionStatus.toLowerCase() !== "completed",
      );
    } else if (selectedOption === "yesno") {
      filtered = filtered.filter(
        (item) =>
          item.completionStatus &&
          item.completionStatus.toLowerCase() === "completed",
      );
    }

    return filtered;
  };

  useEffect(() => {
    setFilteredData(filterData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedOption, patientId, dateRange]);

  // Memoized transform data
  const transformedData = useMemo(() => {
    return filteredData.map((item, index) => {
      const transformed = { id: index.toString() };
      Object.entries(dataHeaderMapping).forEach(([displayName, dataKey]) => {
        if (dataKey === "appointmentDate" && item[dataKey]) {
          const dateString = item[dataKey].split("T")[0];
          const [year, month, day] = dateString.split("-");
          transformed[displayName] = `${month}/${day}/${year}`;
        } else {
          transformed[displayName] = item[dataKey] || "";
        }
      });
      return transformed;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData]);

  // Get unique values for a column based on currently filtered data (excluding the current column filter)
  const getUniqueValues = useCallback(
    (columnName) => {
      // Get data filtered by all columns except the current one
      const otherFilters = Object.entries(columnFilters).filter(
        ([col]) => col !== columnName,
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
        .filter(
          (val) =>
            val !== null && val !== undefined && val !== "" && val !== "-",
        );
      return [...new Set(values)].sort();
    },
    [transformedData, columnFilters],
  );

  // Filter data based on column filters
  const finalFilteredData = useMemo(() => {
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
    return Object.keys(dataHeaderMapping).map((header) => ({
      field: header,
      headerName: header,
      flex: 1,
      minWidth: 150,
      sortable: true,
      filterable: false,
      renderHeader: renderHeader,
      disableColumnMenu: false,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters]);

  const getBaseCounts = () => {
    const validData = data.filter((item) => {
      // Patient ID filter
      if (patientId && patientId.trim() !== "") {
        if (!matchesPatientId(item)) return false;
      }

      // Date range filter
      if (dateRange?.startDate && dateRange?.endDate) {
        if (
          !isInDateRange(
            item.appointmentDate,
            dateRange.startDate,
            dateRange.endDate,
          )
        ) {
          return false;
        }
      }

      return true;
    });

    const all = validData.length;
    const completed = validData.filter(
      (item) =>
        item.completionStatus &&
        item.completionStatus.toLowerCase() === "completed",
    ).length;
    const inProcess = validData.filter(
      (item) =>
        !item.completionStatus ||
        item.completionStatus.toLowerCase() !== "completed",
    ).length;

    return { all, completed, inProcess };
  };

  const counts = getBaseCounts();

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
      {/* Compact Tab Navigation */}
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
        <div className="grid grid-cols-3 gap-2">
          {/* All Appointments Tab */}
          <button
            onClick={() => setSelectedOption("yes")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border-2 focus:outline-none ${
              selectedOption === "yes"
                ? "bg-yellow-100 border-yellow-300 text-yellow-800 shadow-md"
                : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>All Appointments</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedOption === "yes"
                    ? "bg-yellow-200 text-yellow-900"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {counts.all}
              </span>
            </div>
          </button>

          {/* In-Process Tab */}
          <button
            onClick={() => setSelectedOption("no")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border-2 focus:outline-none ${
              selectedOption === "no"
                ? "bg-orange-100 border-orange-300 text-orange-800 shadow-md"
                : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>In-Process IVs</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedOption === "no"
                    ? "bg-orange-200 text-orange-900"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {counts.inProcess}
              </span>
            </div>
          </button>

          {/* Completed Tab */}
          <button
            onClick={() => setSelectedOption("yesno")}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border-2 focus:outline-none ${
              selectedOption === "yesno"
                ? "bg-green-100 border-green-300 text-green-800 shadow-md"
                : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Completed IVs</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedOption === "yesno"
                    ? "bg-green-200 text-green-900"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {counts.completed}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Table Content with calculated height */}
      <div
        style={{ height: "calc(100vh - 14rem)" }}
        className="overflow-hidden relative"
      >
        {/* Clear All Filters Button */}
        {Object.keys(columnFilters).length > 0 && (
          <div className="absolute top-2 right-2 z-50">
            <button
              onClick={handleClearAllFilters}
              className="w-8 h-8 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              title={`Clear ${Object.keys(columnFilters).length} filter(s)`}
            >
              <ClearIcon style={{ fontSize: "16px" }} />
            </button>
          </div>
        )}

        {hasValidFilters() ? (
          filteredData.length > 0 ? (
            <Box sx={{ height: "100%", width: "100%" }}>
              <DataGrid
                rows={finalFilteredData}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 50 },
                  },
                }}
                pageSizeOptions={[25, 50, 100]}
                pagination
                sortingOrder={["asc", "desc"]}
                disableSelectionOnClick
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
                    color: "#ffffff",
                    fontWeight: 600,
                  },
                  ".MuiDataGrid-iconButtonContainer": {
                    visibility: "visible",
                    width: "auto",
                    marginLeft: "2px",
                  },
                  ".MuiDataGrid-menuIcon": {
                    visibility: "visible",
                    width: "auto",
                    color: "#ffffff",
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
                  ".MuiDataGrid-columnHeaderTitleContainer .MuiDataGrid-iconButtonContainer":
                    {
                      color: "#ffffff",
                    },
                  ".MuiDataGrid-filterIcon": {
                    color: "#ffffff",
                  },
                  ".MuiDataGrid-row:hover": {
                    backgroundColor: "#f8fafc",
                  },
                  ".MuiDataGrid-cell": {
                    borderColor: "#e2e8f0",
                    fontSize: "0.875rem",
                  },
                  ".MuiDataGrid-footerContainer": {
                    backgroundColor: "#f8fafc",
                    borderTop: "1px solid #e2e8f0",
                  },
                  ".MuiTablePagination-root": {
                    color: "#475569",
                  },
                }}
              />
            </Box>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                No appointments found
              </div>
              <div className="text-slate-400 text-sm mt-1">
                No appointments match your current filter criteria
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <div className="text-slate-500 text-lg font-medium">
              Select filters to view appointments
            </div>
            <div className="text-slate-400 text-sm mt-1">
              Please select an office and date range, or enter a patient ID to
              search
            </div>
          </div>
        )}
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

export default Status;
