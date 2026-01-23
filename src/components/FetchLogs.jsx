import axios from "axios";
import BASE_URL from "../config/apiConfig";
import Datepicker from "react-tailwindcss-datepicker";

const FetchLogs = ({ pageState, setPageState }) => {
  // Use lifted state from App.jsx
  const fetchMode = pageState?.fetchMode ?? "latest";
  const selectedDate = pageState?.selectedDate ?? null;
  const logsData = pageState?.logsData ?? null;
  const loading = pageState?.loading ?? false;
  const error = pageState?.error ?? null;
  const expandedOperations = pageState?.expandedOperations ?? [];
  const modalData = pageState?.modalData ?? null;
  const toast = pageState?.toast ?? null;

  // Setter functions
  const setFetchMode = (val) =>
    setPageState?.((prev) => ({ ...prev, fetchMode: val }));
  const setSelectedDate = (val) =>
    setPageState?.((prev) => ({ ...prev, selectedDate: val }));
  const setLogsData = (val) =>
    setPageState?.((prev) => ({ ...prev, logsData: val }));
  const setLoading = (val) =>
    setPageState?.((prev) => ({ ...prev, loading: val }));
  const setError = (val) => setPageState?.((prev) => ({ ...prev, error: val }));
  const setExpandedOperations = (val) =>
    setPageState?.((prev) => ({ ...prev, expandedOperations: val }));
  const setModalData = (val) =>
    setPageState?.((prev) => ({ ...prev, modalData: val }));
  const setToast = (val) => {
    setPageState?.((prev) => ({ ...prev, toast: val }));
    // Auto-hide toast after 2 seconds
    if (val) {
      setTimeout(() => {
        setPageState?.((prev) => ({ ...prev, toast: null }));
      }, 2000);
    }
  };

  // Toggle operation expansion
  const toggleOperation = (index) => {
    setPageState?.((prev) => {
      const currentExpanded = prev.expandedOperations ?? [];
      if (currentExpanded.includes(index)) {
        return {
          ...prev,
          expandedOperations: currentExpanded.filter((i) => i !== index),
        };
      }
      return {
        ...prev,
        expandedOperations: [...currentExpanded, index],
      };
    });
  };

  // Format date for display - show as-is without timezone conversion
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";

    // Extract date from ISO string (YYYY-MM-DD)
    const datePart = dateString.split("T")[0];
    const [year, month, day] = datePart.split("-");

    // Create month name array
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

  // Format timestamp - show as-is without timezone conversion
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "-";

    // Extract date and time from ISO string
    const [datePart, timePart] = timestamp.split("T");
    const [year, month, day] = datePart.split("-");
    const time = timePart.split(".")[0]; // Remove milliseconds
    const [hours, minutes, seconds] = time.split(":");

    // Create month name
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

    // Convert to 12-hour format
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? "PM" : "AM";

    return `${monthName} ${day}, ${year}, ${String(hour12).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
  };

  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      let url;
      if (fetchMode === "latest") {
        url = `${BASE_URL}/api/fetch-logs/latest`;
      } else {
        if (!selectedDate) {
          setError("Please select a date");
          setLoading(false);
          return;
        }
        url = `${BASE_URL}/api/fetch-logs/${selectedDate}`;
      }

      const response = await axios.get(url);
      setLogsData(response.data);

      // Auto-populate date when fetching latest - extract date string directly
      if (fetchMode === "latest" && response.data.date) {
        // Extract just the date part (YYYY-MM-DD) from ISO string
        const dateString = response.data.date.split("T")[0];
        setSelectedDate(dateString);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to fetch logs",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments and then auto-fetch latest logs
  const fetchAppointments = async () => {
    setLoading(true);

    try {
      // Call the POST API to fetch and save appointments
      await axios.post(
        `${BASE_URL}/api/appointments/fetch-and-save-appointments`,
      );

      // Show success toast
      setToast({
        type: "success",
        message: "Appointments fetched successfully!",
      });

      // After successful fetch, switch to latest mode and fetch logs
      setFetchMode("latest");

      // Small delay to ensure state is updated
      setTimeout(async () => {
        try {
          const url = `${BASE_URL}/api/fetch-logs/latest`;
          const response = await axios.get(url);
          setLogsData(response.data);

          // Auto-populate date when fetching latest - extract date string directly
          if (response.data.date) {
            // Extract just the date part (YYYY-MM-DD) from ISO string
            const dateString = response.data.date.split("T")[0];
            setSelectedDate(dateString);
          }
        } catch (err) {
          console.error("Error fetching logs after appointment fetch:", err);
          setToast({
            type: "error",
            message: err.response?.data?.message || "Failed to fetch logs",
          });
        } finally {
          setLoading(false);
        }
      }, 100);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setToast({
        type: "error",
        message: err.response?.data?.message || "Failed to fetch appointments",
      });
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (newValue) => {
    if (newValue?.startDate) {
      setSelectedDate(newValue.startDate);
    }
  };

  // Open modal with appointment details
  const openModal = (title, appointments) => {
    setModalData({ title, appointments });
  };

  // Close modal
  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div className="h-full bg-slate-50 overflow-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] animate-fade-in">
          <div
            className={`rounded-lg shadow-lg px-6 py-4 flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-slate-700 font-medium">
                Loading logs...
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow border border-slate-200 p-4 mb-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800">
              📋 Appointments Logs Dashboard
            </h2>

            {/* Filters */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {/* Toggle Switch for Latest/Date */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700">
                    Fetch Mode:
                  </label>
                  <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => setFetchMode("latest")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        fetchMode === "latest"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => setFetchMode("date")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        fetchMode === "date"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Date
                    </button>
                  </div>
                </div>

                {/* Date Picker */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                    Select Date:
                  </label>
                  <div className="relative z-50">
                    <div className="border border-slate-300 rounded-lg bg-white">
                      <Datepicker
                        value={
                          selectedDate
                            ? { startDate: selectedDate, endDate: selectedDate }
                            : null
                        }
                        onChange={handleDateChange}
                        asSingle={true}
                        useRange={false}
                        inputClassName={`text-sm px-3 py-2 border-0 focus:ring-0 ${
                          fetchMode === "latest"
                            ? "cursor-not-allowed bg-slate-50"
                            : ""
                        }`}
                        toggleClassName="text-slate-500"
                        placeholder="Select date..."
                        disabled={fetchMode === "latest"}
                        readOnly={fetchMode === "latest"}
                      />
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={fetchLogs}
                  disabled={loading || (fetchMode === "date" && !selectedDate)}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Fetch Appointments Button */}
              <button
                onClick={fetchAppointments}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Fetch Appointments
              </button>
            </div>
          </div>
        </div>

        {/* Logs Data Display */}
        {logsData && (
          <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
            {/* Summary Header */}
            <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-200">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-xs font-medium text-blue-600 mb-1">
                  Date
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {formatDisplayDate(logsData.date)}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-xs font-medium text-green-600 mb-1">
                  Total Operations
                </div>
                <div className="text-lg font-bold text-green-900">
                  {logsData.totalOperations}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-xs font-medium text-purple-600 mb-1">
                  Status
                </div>
                <div className="text-lg font-bold text-purple-900">
                  {logsData.success ? "Success" : "Failed"}
                </div>
              </div>
            </div>

            {/* Fetch Operations List */}
            <div className="space-y-4">
              {logsData.fetchOperations?.map((operation, opIndex) => (
                <div
                  key={opIndex}
                  className="border border-slate-200 rounded-lg overflow-hidden"
                >
                  {/* Operation Header - Collapsible */}
                  <button
                    onClick={() => toggleOperation(opIndex)}
                    className="w-full bg-slate-50 hover:bg-slate-100 transition-colors px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-slate-900 font-semibold">
                        {opIndex + 1}
                      </div>
                      <div className="text-xs text-slate-600">
                        {formatTimestamp(operation.timestamp)}
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          operation.executionType === "manual"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {operation.executionType === "manual"
                          ? "Manual"
                          : "Automatic"}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-4 text-xs">
                        <span className="text-slate-600">
                          Total Fetched:{" "}
                          <span className="font-semibold text-slate-900">
                            {operation.totalFetched}
                          </span>
                        </span>
                        <span className="text-green-600">
                          New:{" "}
                          <span className="font-semibold">
                            {operation.totalNewAdded}
                          </span>
                        </span>
                        <span className="text-orange-600">
                          Archived:{" "}
                          <span className="font-semibold">
                            {operation.totalArchived}
                          </span>
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-slate-600 transition-transform ${
                          expandedOperations.includes(opIndex)
                            ? "rotate-180"
                            : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Operation Details Table - Expandable */}
                  {expandedOperations.includes(opIndex) && (
                    <div className="p-4 bg-white">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border-b border-slate-200">
                                Office Name
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 border-b border-slate-200">
                                Total Fetched
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 border-b border-slate-200">
                                New Appointments
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 border-b border-slate-200">
                                Archived Appointments
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border-b border-slate-200">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {operation.officeDetails?.map(
                              (office, offIndex) => (
                                <tr
                                  key={offIndex}
                                  className="hover:bg-slate-50 transition-colors"
                                >
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                    {office.officeName}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                      {office.fetchedCount}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {office.newCount > 0 ? (
                                      <button
                                        onClick={() =>
                                          openModal(
                                            `New Appointments - ${office.officeName}`,
                                            office.newAppointmentsData,
                                          )
                                        }
                                        className="inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors cursor-pointer"
                                      >
                                        {office.newCount}
                                      </button>
                                    ) : (
                                      <span className="inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-200">
                                        0
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    {office.archivedCount > 0 ? (
                                      <button
                                        onClick={() =>
                                          openModal(
                                            `Archived Appointments - ${office.officeName}`,
                                            office.archivedAppointmentsData,
                                          )
                                        }
                                        className="inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200 transition-colors cursor-pointer"
                                      >
                                        {office.archivedCount}
                                      </button>
                                    ) : (
                                      <span className="inline-flex items-center justify-center px-3 py-1 rounded text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-200">
                                        0
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                          office.status === "success"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {office.status}
                                      </span>
                                      {office.message && (
                                        <span className="text-xs text-slate-600 italic">
                                          {office.message}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data Message */}
        {!logsData && !loading && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12">
            <div className="text-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No Logs Data
              </h3>
              <p className="text-slate-500 text-sm">
                Click the "Search" button to fetch logs data.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Appointment Details */}
      {modalData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {modalData.title}
              </h3>
              <button
                onClick={closeModal}
                className="text-white hover:text-slate-300 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="overflow-auto"
              style={{ maxHeight: "calc(90vh - 80px)" }}
            >
              {modalData.appointments && modalData.appointments.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border-b border-slate-200">
                        Patient ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border-b border-slate-200">
                        Patient Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border-b border-slate-200">
                        Appointment Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border-b border-slate-200">
                        Appointment Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border-b border-slate-200">
                        Insurance Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 border-b border-slate-200">
                        Appointment Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalData.appointments.map((apt, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {apt.patientId || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {apt.patientName || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {formatDisplayDate(apt.appointmentDate)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {apt.appointmentTime || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {apt.insuranceName || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {apt.appointmentType || "-"}
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
                    No appointments available for this selection.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FetchLogs;
