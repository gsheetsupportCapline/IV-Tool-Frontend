import { useState, useEffect } from 'react';
import Table from './Table';

const Status = ({ data, dateRange, patientId }) => {
  const [selectedOption, setSelectedOption] = useState('yes');
  const [filteredData, setFilteredData] = useState([]);

  const dataHeaderMapping = {
    'Patient ID': 'patientId',
    'Appointment Date': 'appointmentDate',
    'Completion Status': 'completionStatus',
    'Plan Type': 'planType',
    'IV Type': 'ivType',
    Remarks: 'ivRemarks',
    'Insurance Name': 'insuranceName',
  };

  const hasValidFilters = () => {
    const hasDateRange = dateRange?.startDate && dateRange?.endDate;
    const hasPatientId = patientId && patientId.trim() !== '';
    return hasDateRange || hasPatientId;
  };

  const matchesPatientId = (item) => {
    if (!item || !item.patientId) {
      return false;
    }

    try {
      const searchValue = String(patientId).toLowerCase().trim();
      if (searchValue === '') {
        return true; // Return true when no patient ID filter
      }

      return String(item.patientId).toLowerCase().includes(searchValue);
    } catch (error) {
      console.error('Error matching patient ID:', error);
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
      if (patientId && patientId.trim() !== '') {
        if (!matchesPatientId(item)) return false;
      }

      // Date range filter
      if (dateRange?.startDate && dateRange?.endDate) {
        if (
          !isInDateRange(
            item.appointmentDate,
            dateRange.startDate,
            dateRange.endDate
          )
        ) {
          return false;
        }
      }

      return true;
    });

    // Status filter
    if (selectedOption === 'no') {
      filtered = filtered.filter(
        (item) =>
          !item.completionStatus ||
          item.completionStatus.toLowerCase() !== 'completed'
      );
    } else if (selectedOption === 'yesno') {
      filtered = filtered.filter(
        (item) =>
          item.completionStatus &&
          item.completionStatus.toLowerCase() === 'completed'
      );
    }

    return filtered;
  };

  useEffect(() => {
    setFilteredData(filterData());
  }, [data, selectedOption, patientId, dateRange]);

  const transformData = (dataArray) => {
    return dataArray.map((item) => {
      const transformed = {};
      Object.entries(dataHeaderMapping).forEach(([displayName, dataKey]) => {
        if (dataKey === 'appointmentDate' && item[dataKey]) {
          // Format appointment date to show only date part
          const date = new Date(item[dataKey]);
          transformed[displayName] = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
        } else {
          transformed[displayName] = item[dataKey] || '';
        }
      });
      return transformed;
    });
  };

  const getBaseCounts = () => {
    const validData = data.filter((item) => {
      // Patient ID filter
      if (patientId && patientId.trim() !== '') {
        if (!matchesPatientId(item)) return false;
      }

      // Date range filter
      if (dateRange?.startDate && dateRange?.endDate) {
        if (
          !isInDateRange(
            item.appointmentDate,
            dateRange.startDate,
            dateRange.endDate
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
        item.completionStatus.toLowerCase() === 'completed'
    ).length;
    const inProcess = validData.filter(
      (item) =>
        !item.completionStatus ||
        item.completionStatus.toLowerCase() !== 'completed'
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
            onClick={() => setSelectedOption('yes')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border-2 focus:outline-none ${
              selectedOption === 'yes'
                ? 'bg-yellow-100 border-yellow-300 text-yellow-800 shadow-md'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>All Appointments</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedOption === 'yes'
                    ? 'bg-yellow-200 text-yellow-900'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {counts.all}
              </span>
            </div>
          </button>

          {/* In-Process Tab */}
          <button
            onClick={() => setSelectedOption('no')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border-2 focus:outline-none ${
              selectedOption === 'no'
                ? 'bg-orange-100 border-orange-300 text-orange-800 shadow-md'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>In-Process IVs</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedOption === 'no'
                    ? 'bg-orange-200 text-orange-900'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {counts.inProcess}
              </span>
            </div>
          </button>

          {/* Completed Tab */}
          <button
            onClick={() => setSelectedOption('yesno')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 border-2 focus:outline-none ${
              selectedOption === 'yesno'
                ? 'bg-green-100 border-green-300 text-green-800 shadow-md'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Completed IVs</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedOption === 'yesno'
                    ? 'bg-green-200 text-green-900'
                    : 'bg-gray-200 text-gray-700'
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
        style={{ height: 'calc(100vh - 14rem)' }}
        className="overflow-hidden"
      >
        {hasValidFilters() ? (
          filteredData.length > 0 ? (
            <div className="h-full">
              <Table
                data={transformData(filteredData)}
                headers={Object.keys(dataHeaderMapping)}
              />
            </div>
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
    </div>
  );
};

export default Status;
