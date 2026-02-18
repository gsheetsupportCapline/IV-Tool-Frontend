import React, { useState, useEffect } from "react";
import DatePicker from "./DatePicker";
import axios from "axios";
import BASE_URL from "../config/apiConfig";

const SmilepointIVInfo = ({ pageState, setPageState }) => {
  // Use lifted state from App.jsx
  const data = pageState?.data ?? [];
  const loading = pageState?.loading ?? false;
  const error = pageState?.error ?? null;
  const dateRange = pageState?.dateRange ?? { startDate: null, endDate: null };
  const dateType = pageState?.dateType ?? "appointmentDate";
  const ivType = pageState?.ivType ?? "Normal";
  const detailView = pageState?.detailView ?? {
    isOpen: false,
    title: "",
    detailData: [],
    officeName: "",
    category: "",
  };

  // Setter functions to update lifted state
  const setData = (val) => setPageState?.((prev) => ({ ...prev, data: val }));
  const setLoading = (val) =>
    setPageState?.((prev) => ({ ...prev, loading: val }));
  const setError = (val) => setPageState?.((prev) => ({ ...prev, error: val }));
  const setDateRange = (val) =>
    setPageState?.((prev) => ({ ...prev, dateRange: val }));
  const setDateType = (val) =>
    setPageState?.((prev) => ({ ...prev, dateType: val }));
  const setIvType = (val) =>
    setPageState?.((prev) => ({ ...prev, ivType: val }));
  const setDetailView = (val) =>
    setPageState?.((prev) => ({ ...prev, detailView: val }));

  // Handle date change from DatePicker
  const handleDateChange = (dateValues) => {
    if (dateValues?.startDate && dateValues?.endDate) {
      setDateRange({
        startDate: dateValues.startDate,
        endDate: dateValues.endDate,
      });
    }
  };

  // Manual fetch function - only called when Search button is clicked
  const fetchCompletionAnalysis = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError("Please select a valid date range");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Dates are already in YYYY-MM-DD format as strings
      const formattedStartDate = dateRange.startDate;
      const formattedEndDate = dateRange.endDate;

      const response = await axios.get(
        `${BASE_URL}/api/appointments/completion-analysis`,
        {
          params: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            dateType,
            ivType,
          },
        },
      );

      console.log("API Response:", response.data);

      // Handle different possible response formats
      let responseData = response.data;

      // If response has a 'data' property, use that
      if (responseData.data && Array.isArray(responseData.data)) {
        responseData = responseData.data;
      }

      // If response has 'success' and 'data' properties
      if (
        responseData.success &&
        responseData.data &&
        Array.isArray(responseData.data)
      ) {
        responseData = responseData.data;
      }

      console.log("Processed Response Data:", responseData);

      if (Array.isArray(responseData)) {
        console.log("Setting data with array:", responseData);
        setData(responseData);
      } else if (responseData && typeof responseData === "object") {
        // If it's an object, try to convert it to array format
        const dataArray = Object.keys(responseData).map((key) => ({
          officeName: key,
          ...responseData[key],
        }));
        console.log("Converted to array:", dataArray);
        setData(dataArray);
      } else {
        console.log("Invalid data format:", responseData);
        setData([]);
        setError("Invalid data format received from server");
      }
    } catch (err) {
      console.error("Error fetching completion analysis:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch IV completion analysis data",
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage for individual office - (Completed After Appointment / Total Completed IVs) * 100
  const calculatePercentage = (afterCount, totalCompletedIVs) => {
    if (!totalCompletedIVs || totalCompletedIVs === 0) return "0.00";
    return (((afterCount || 0) / totalCompletedIVs) * 100).toFixed(2);
  };

  // Calculate totals
  const calculateTotals = () => {
    const totals = {
      totalCompletedIVs: 0,
      newPatient: {
        completedAfterAppointmentCount: 0,
        completedWithinOneHourCount: 0,
      },
      others: {
        completedAfterAppointmentCount: 0,
        completedWithinOneHourCount: 0,
      },
    };

    data.forEach((office) => {
      totals.totalCompletedIVs += office.totalCompletedIVs || 0;
      totals.newPatient.completedAfterAppointmentCount +=
        office.newPatient?.completedAfterAppointmentCount || 0;
      totals.newPatient.completedWithinOneHourCount +=
        office.newPatient?.completedWithinOneHourCount || 0;
      totals.others.completedAfterAppointmentCount +=
        office.others?.completedAfterAppointmentCount || 0;
      totals.others.completedWithinOneHourCount +=
        office.others?.completedWithinOneHourCount || 0;
    });

    return totals;
  };

  // Handle clicking on numbers to show detail view
  const handleNumberClick = (officeName, category, dataArray, title) => {
    setDetailView({
      isOpen: true,
      title,
      detailData: dataArray || [],
      officeName,
      category,
    });
  };

  // Handle back button to return to dashboard
  const handleBackToDashboard = () => {
    setDetailView({
      isOpen: false,
      title: "",
      detailData: [],
      officeName: "",
      category: "",
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format appointment date (without time)
  const formatAppointmentDate = (dateString) => {
    if (!dateString) return "-";

    // Extract date parts directly from string to avoid timezone conversion
    let year, month, day;

    // Handle ISO format: "2026-02-02T19:00:14.947Z" or "2026-02-02"
    if (dateString.includes("T") || dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const datePart = dateString.split("T")[0];
      [year, month, day] = datePart.split("-");
    }
    // Handle SQL format: "2026-02-13 10:00:20"
    else if (dateString.includes(" ")) {
      const datePart = dateString.split(" ")[0];
      [year, month, day] = datePart.split("-");
    } else {
      return "-";
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[parseInt(month) - 1];

    return `${monthName} ${day}, ${year}`;
  };

  // Format date and time without timezone conversion (display exactly as received)
  const formatDateTimeAsIs = (dateString) => {
    if (!dateString) return "-";

    let year, month, day, hours, minutes, seconds;

    // Handle ISO format: "2026-02-02T19:00:14.947Z"
    if (dateString.includes("T")) {
      const [datePart, timePart] = dateString.split("T");
      [year, month, day] = datePart.split("-");

      // Remove Z and milliseconds if present
      const cleanTime = timePart.replace("Z", "").split(".")[0];
      [hours, minutes, seconds] = cleanTime.split(":");
    }
    // Handle SQL format: "2026-02-13 10:00:20"
    else if (dateString.includes(" ")) {
      const [datePart, timePart] = dateString.split(" ");
      [year, month, day] = datePart.split("-");
      [hours, minutes, seconds] = timePart.split(":");
    } else {
      return "-";
    }

    // Convert to 12-hour format
    const hour24 = parseInt(hours);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? "PM" : "AM";

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthName = monthNames[parseInt(month) - 1];

    return `${monthName} ${day}, ${year}, ${String(hour12).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        minHeight: "calc(100vh - 7.5rem)",
        maxHeight: "calc(100vh - 7.5rem)",
        padding: "15px",
      }}
    >
      {/* Show Detail View or Dashboard */}
      {detailView.isOpen ? (
        // Detail View
        <div className="flex flex-col h-full">
          {/* Detail View Header */}
          <div className="bg-white p-4 rounded border mb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span>Back to Dashboard</span>
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {detailView.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {detailView.officeName} - {detailView.detailData.length}{" "}
                    records
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex flex-col text-right">
                  <span>
                    <strong>Date Range:</strong> {dateRange.startDate} -{" "}
                    {dateRange.endDate}
                  </span>
                  <span>
                    <strong>Date Type:</strong> {dateType} |{" "}
                    <strong>IV Type:</strong> {ivType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Table */}
          <div className="flex-1 overflow-hidden bg-white rounded border">
            <div
              style={{ maxHeight: "calc(100vh - 14rem)" }}
              className="overflow-auto"
            >
              {detailView.detailData.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Insurance Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointment Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointment Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IV Requested Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IV Assigned Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IV Completed Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detailView.detailData.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.patientId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.patientName || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.insuranceName || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatAppointmentDate(record.appointmentDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {record.appointmentTime || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDateTimeAsIs(record.ivRequestedDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDateTimeAsIs(record.ivAssignedDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDateTimeAsIs(record.ivCompletedDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Records Found
                  </h3>
                  <p className="text-gray-500">
                    No detailed records available for this selection.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Dashboard View
        <>
          {/* Filters Header */}
          <div className="bg-gray-100 p-4 rounded border mb-4 flex-shrink-0">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  📊 Smilepoint IV Info Dashboard
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Date Range Picker */}
                <div className="flex flex-col">
                  <label className="text-gray-700 text-xs font-medium mb-1">
                    Date Range
                  </label>
                  <div className="w-56">
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
                  </div>
                </div>

                {/* Date Type Dropdown */}
                <div className="flex flex-col">
                  <label className="text-gray-700 text-xs font-medium mb-1">
                    Date Type
                  </label>
                  <select
                    value={dateType}
                    onChange={(e) => setDateType(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white w-40"
                  >
                    <option value="appointmentDate">Appointment Date</option>
                    <option value="ivCompletedDate">Completion Date</option>
                  </select>
                </div>

                {/* IV Type Dropdown */}
                <div className="flex flex-col">
                  <label className="text-gray-700 text-xs font-medium mb-1">
                    IV Type
                  </label>
                  <select
                    value={ivType}
                    onChange={(e) => setIvType(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white w-32"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Rush">Rush</option>
                  </select>
                </div>

                {/* Search Button */}
                <div className="flex flex-col">
                  <label className="text-gray-700 text-xs font-medium mb-1 opacity-0">
                    Action
                  </label>
                  <button
                    onClick={fetchCompletionAnalysis}
                    disabled={
                      !dateRange.startDate || !dateRange.endDate || loading
                    }
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? "Loading..." : "Search"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4 flex-shrink-0">
              <div className="flex items-center">
                <div className="text-red-400 mr-3">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 font-semibold text-sm">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <button
                    onClick={fetchCompletionAnalysis}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                  >
                    🔄 Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="flex items-center justify-center py-12 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 font-medium">
                  Loading IV completion data...
                </span>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {!loading && !error && data.length > 0 && (
              <div className="bg-white rounded border h-full">
                <div
                  style={{ maxHeight: "calc(100vh - 16rem)" }}
                  className="overflow-auto"
                >
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th
                          rowSpan={2}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                        >
                          Office
                        </th>
                        <th
                          rowSpan={2}
                          className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 bg-gray-50"
                        >
                          Total Completed IVs
                        </th>
                        <th
                          colSpan={3}
                          className="px-4 py-2 text-center text-xs font-medium text-blue-600 uppercase tracking-wider border-r border-gray-200 bg-blue-50"
                        >
                          New Patient
                        </th>
                        <th
                          colSpan={3}
                          className="px-4 py-2 text-center text-xs font-medium text-amber-600 uppercase tracking-wider bg-amber-50"
                        >
                          Other Patient (As per Appointment Type)
                        </th>
                      </tr>
                      <tr>
                        <th className="px-3 py-2 text-center text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">
                          Completed After Appointment
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-blue-600 uppercase tracking-wider bg-blue-50">
                          Completed Within One Hour
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-blue-600 uppercase tracking-wider border-r border-gray-200 bg-blue-50">
                          After Appointment Completion %
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-amber-600 uppercase tracking-wider bg-amber-50">
                          Completed After Appointment
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-amber-600 uppercase tracking-wider bg-amber-50">
                          Completed Within One Hour
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-amber-600 uppercase tracking-wider bg-amber-50">
                          After Appointment Completion %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((office, index) => (
                        <tr
                          key={office.officeName || index}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                            {office.officeName}
                          </td>
                          <td className="px-4 py-2 text-sm text-center text-gray-900 font-semibold border-r border-gray-200">
                            <button
                              onClick={() =>
                                handleNumberClick(
                                  office.officeName,
                                  "Total Completed IVs",
                                  office.totalCompletedData,
                                  `Total Completed IVs - ${office.officeName}`,
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                            >
                              {office.totalCompletedIVs}
                            </button>
                          </td>

                          {/* New Patient Data */}
                          <td className="px-3 py-2 text-sm text-center text-gray-700 bg-blue-25">
                            <button
                              onClick={() =>
                                handleNumberClick(
                                  office.officeName,
                                  "New Patient - Completed After Appointment",
                                  office.newPatient
                                    ?.completedAfterAppointmentData,
                                  `New Patient - Completed After Appointment - ${office.officeName}`,
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {office.newPatient
                                ?.completedAfterAppointmentCount || 0}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-gray-700 bg-blue-25">
                            <button
                              onClick={() =>
                                handleNumberClick(
                                  office.officeName,
                                  "New Patient - Completed Within One Hour",
                                  office.newPatient?.completedWithinOneHourData,
                                  `New Patient - Completed Within One Hour - ${office.officeName}`,
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {office.newPatient?.completedWithinOneHourCount ||
                                0}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-blue-700 font-semibold border-r border-gray-200 bg-blue-25">
                            {calculatePercentage(
                              office.newPatient?.completedAfterAppointmentCount,
                              office.totalCompletedIVs,
                            )}
                            %
                          </td>

                          {/* Other Patient Data */}
                          <td className="px-3 py-2 text-sm text-center text-gray-700 bg-amber-25">
                            <button
                              onClick={() =>
                                handleNumberClick(
                                  office.officeName,
                                  "Other Patient - Completed After Appointment",
                                  office.others?.completedAfterAppointmentData,
                                  `Other Patient - Completed After Appointment - ${office.officeName}`,
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {office.others?.completedAfterAppointmentCount ||
                                0}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-gray-700 bg-amber-25">
                            <button
                              onClick={() =>
                                handleNumberClick(
                                  office.officeName,
                                  "Other Patient - Completed Within One Hour",
                                  office.others?.completedWithinOneHourData,
                                  `Other Patient - Completed Within One Hour - ${office.officeName}`,
                                )
                              }
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {office.others?.completedWithinOneHourCount || 0}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-sm text-center text-amber-700 font-semibold bg-amber-25">
                            {calculatePercentage(
                              office.others?.completedAfterAppointmentCount,
                              office.totalCompletedIVs,
                            )}
                            %
                          </td>
                        </tr>
                      ))}

                      {/* Totals Row */}
                      {(() => {
                        const totals = calculateTotals();

                        // Aggregate all data for totals row
                        const allTotalCompletedData = data.flatMap(
                          (office) => office.totalCompletedData || [],
                        );
                        const allNewPatientAfterAppointment = data.flatMap(
                          (office) =>
                            office.newPatient?.completedAfterAppointmentData ||
                            [],
                        );
                        const allNewPatientWithinOneHour = data.flatMap(
                          (office) =>
                            office.newPatient?.completedWithinOneHourData || [],
                        );
                        const allOthersAfterAppointment = data.flatMap(
                          (office) =>
                            office.others?.completedAfterAppointmentData || [],
                        );
                        const allOthersWithinOneHour = data.flatMap(
                          (office) =>
                            office.others?.completedWithinOneHourData || [],
                        );

                        return (
                          <tr className="bg-gray-100 border-t-2 border-gray-300 sticky bottom-0">
                            <td className="px-4 py-2 text-sm font-bold text-gray-900 border-r border-gray-200">
                              TOTAL
                            </td>
                            <td className="px-4 py-2 text-sm text-center font-bold text-gray-900 border-r border-gray-200">
                              <button
                                onClick={() =>
                                  handleNumberClick(
                                    "All Offices",
                                    "Total Completed IVs",
                                    allTotalCompletedData,
                                    "Total Completed IVs - All Offices",
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 hover:underline font-bold"
                              >
                                {totals.totalCompletedIVs}
                              </button>
                            </td>

                            {/* New Patient Totals */}
                            <td className="px-3 py-2 text-sm text-center font-semibold text-blue-800">
                              <button
                                onClick={() =>
                                  handleNumberClick(
                                    "All Offices",
                                    "New Patient - Completed After Appointment",
                                    allNewPatientAfterAppointment,
                                    "New Patient - Completed After Appointment - All Offices",
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                              >
                                {
                                  totals.newPatient
                                    .completedAfterAppointmentCount
                                }
                              </button>
                            </td>
                            <td className="px-3 py-2 text-sm text-center font-semibold text-blue-800">
                              <button
                                onClick={() =>
                                  handleNumberClick(
                                    "All Offices",
                                    "New Patient - Completed Within One Hour",
                                    allNewPatientWithinOneHour,
                                    "New Patient - Completed Within One Hour - All Offices",
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                              >
                                {totals.newPatient.completedWithinOneHourCount}
                              </button>
                            </td>
                            <td className="px-3 py-2 text-sm text-center font-bold text-blue-800 border-r border-gray-200">
                              {calculatePercentage(
                                totals.newPatient
                                  .completedAfterAppointmentCount,
                                totals.totalCompletedIVs,
                              )}
                              %
                            </td>

                            {/* Other Patient Totals */}
                            <td className="px-3 py-2 text-sm text-center font-semibold text-amber-800">
                              <button
                                onClick={() =>
                                  handleNumberClick(
                                    "All Offices",
                                    "Other Patient - Completed After Appointment",
                                    allOthersAfterAppointment,
                                    "Other Patient - Completed After Appointment - All Offices",
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                              >
                                {totals.others.completedAfterAppointmentCount}
                              </button>
                            </td>
                            <td className="px-3 py-2 text-sm text-center font-semibold text-amber-800">
                              <button
                                onClick={() =>
                                  handleNumberClick(
                                    "All Offices",
                                    "Other Patient - Completed Within One Hour",
                                    allOthersWithinOneHour,
                                    "Other Patient - Completed Within One Hour - All Offices",
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                              >
                                {totals.others.completedWithinOneHourCount}
                              </button>
                            </td>
                            <td className="px-3 py-2 text-sm text-center font-bold text-amber-800">
                              {calculatePercentage(
                                totals.others.completedAfterAppointmentCount,
                                totals.totalCompletedIVs,
                              )}
                              %
                            </td>
                          </tr>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Data Message */}
            {!loading &&
              !error &&
              data.length === 0 &&
              dateRange.startDate &&
              dateRange.endDate && (
                <div className="bg-white rounded border p-12">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No Data Found
                    </h3>
                    <p className="text-gray-500">
                      No IV completion data available for the selected filters
                      and date range.
                    </p>
                  </div>
                </div>
              )}

            {/* Instructions */}
            {!dateRange.startDate || !dateRange.endDate ? (
              <div className="bg-white rounded border p-12">
                <div className="text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select Date Range
                  </h3>
                  <p className="text-gray-500">
                    Please select a date range to view IV completion analysis
                    data.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default SmilepointIVInfo;
