import React, { useState, useEffect } from 'react';
import DatePicker from './DatePicker';
import axios from 'axios';
import BASE_URL from '../config/apiConfig';

const SmilepointIVInfo = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [dateType, setDateType] = useState('appointmentDate');
  const [ivType, setIvType] = useState('Normal');

  // Handle date change from DatePicker
  const handleDateChange = (dateValues) => {
    if (dateValues?.startDate && dateValues?.endDate) {
      setDateRange({
        startDate: new Date(dateValues.startDate),
        endDate: new Date(dateValues.endDate),
      });
    }
  };

  // Fetch completion analysis data
  const fetchCompletionAnalysis = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select a valid date range');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedStartDate = dateRange.startDate
        .toISOString()
        .split('T')[0];
      const formattedEndDate = dateRange.endDate.toISOString().split('T')[0];

      const response = await axios.get(
        `${BASE_URL}/api/appointments/completion-analysis`,
        {
          params: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            dateType,
            ivType,
          },
        }
      );

      console.log('API Response:', response.data);

      // Handle different possible response formats
      let responseData = response.data;

      // If response has a 'data' property, use that
      if (responseData.data) {
        responseData = responseData.data;
      }

      // If response has 'success' and 'data' properties
      if (responseData.success && responseData.data) {
        responseData = responseData.data;
      }

      if (Array.isArray(responseData)) {
        setData(responseData);
      } else if (responseData && typeof responseData === 'object') {
        // If it's an object, try to convert it to array format
        const dataArray = Object.keys(responseData).map((key) => ({
          officeName: key,
          ...responseData[key],
        }));
        setData(dataArray);
      } else {
        setData([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching completion analysis:', err);
      setError(
        err.response?.data?.message ||
          'Failed to fetch IV completion analysis data'
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when filters change
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchCompletionAnalysis();
    }
  }, [dateRange, dateType, ivType]);

  // Calculate percentage for individual office - (Completed After Appointment / Total Completed IVs) * 100
  const calculatePercentage = (afterCount, totalCompletedIVs) => {
    if (!totalCompletedIVs || totalCompletedIVs === 0) return '0.00';
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

  return (
    <div
      className="flex flex-col h-full p-4"
      style={{
        minHeight: 'calc(100vh - 7.5rem)',
        maxHeight: 'calc(100vh - 7.5rem)',
        padding: '15px',
      }}
    >
      {/* Filters Header */}
      <div className="bg-gray-100 p-4 rounded border mb-4">
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
                          startDate: dateRange.startDate
                            .toISOString()
                            .split('T')[0],
                          endDate: dateRange.endDate
                            .toISOString()
                            .split('T')[0],
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
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 font-medium">
              Loading IV completion data...
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {!loading && !error && data.length > 0 && (
          <div className="bg-white rounded border">
            <div className="max-h-96 overflow-auto">
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
                        {office.totalCompletedIVs}
                      </td>

                      {/* New Patient Data */}
                      <td className="px-3 py-2 text-sm text-center text-gray-700 bg-blue-25">
                        {office.newPatient?.completedAfterAppointmentCount || 0}
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-gray-700 bg-blue-25">
                        {office.newPatient?.completedWithinOneHourCount || 0}
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-blue-700 font-semibold border-r border-gray-200 bg-blue-25">
                        {calculatePercentage(
                          office.newPatient?.completedAfterAppointmentCount,
                          office.totalCompletedIVs
                        )}
                        %
                      </td>

                      {/* Other Patient Data */}
                      <td className="px-3 py-2 text-sm text-center text-gray-700 bg-amber-25">
                        {office.others?.completedAfterAppointmentCount || 0}
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-gray-700 bg-amber-25">
                        {office.others?.completedWithinOneHourCount || 0}
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-amber-700 font-semibold bg-amber-25">
                        {calculatePercentage(
                          office.others?.completedAfterAppointmentCount,
                          office.totalCompletedIVs
                        )}
                        %
                      </td>
                    </tr>
                  ))}

                  {/* Totals Row */}
                  {(() => {
                    const totals = calculateTotals();
                    return (
                      <tr className="bg-gray-100 border-t-2 border-gray-300 sticky bottom-0">
                        <td className="px-4 py-2 text-sm font-bold text-gray-900 border-r border-gray-200">
                          TOTAL
                        </td>
                        <td className="px-4 py-2 text-sm text-center font-bold text-gray-900 border-r border-gray-200">
                          {totals.totalCompletedIVs}
                        </td>

                        {/* New Patient Totals */}
                        <td className="px-3 py-2 text-sm text-center font-semibold text-blue-800">
                          {totals.newPatient.completedAfterAppointmentCount}
                        </td>
                        <td className="px-3 py-2 text-sm text-center font-semibold text-blue-800">
                          {totals.newPatient.completedWithinOneHourCount}
                        </td>
                        <td className="px-3 py-2 text-sm text-center font-bold text-blue-800 border-r border-gray-200">
                          {calculatePercentage(
                            totals.newPatient.completedAfterAppointmentCount,
                            totals.totalCompletedIVs
                          )}
                          %
                        </td>

                        {/* Other Patient Totals */}
                        <td className="px-3 py-2 text-sm text-center font-semibold text-amber-800">
                          {totals.others.completedAfterAppointmentCount}
                        </td>
                        <td className="px-3 py-2 text-sm text-center font-semibold text-amber-800">
                          {totals.others.completedWithinOneHourCount}
                        </td>
                        <td className="px-3 py-2 text-sm text-center font-bold text-amber-800">
                          {calculatePercentage(
                            totals.others.completedAfterAppointmentCount,
                            totals.totalCompletedIVs
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
                  No IV completion data available for the selected filters and
                  date range.
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
                Please select a date range to view IV completion analysis data.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SmilepointIVInfo;
