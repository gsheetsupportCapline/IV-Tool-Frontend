// Import necessary hooks and components
import { useState, useEffect } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';
import * as DropdownValues from './DropdownValues';
import BASE_URL from '../config/apiConfig';

const PendingIV = () => {
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleValueChange = (newValue) => {
    console.log('New Value:', newValue);
    setValue({
      startDate: new Date(newValue.startDate),
      endDate: new Date(newValue.endDate),
    });
  };

  useEffect(() => {
    if (!value.startDate || !value.endDate) return;

    const fetchData = async () => {
      setLoading(true);
      const startDateParam = value.startDate.toISOString().split('T')[0];
      const endDateParam = value.endDate.toISOString().split('T')[0];

      const url = `${BASE_URL}/api/appointments/fetch-unassigned-appointments?startDate=${startDateParam}&endDate=${endDateParam}`;

      try {
        const response = await fetch(url);
        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [value]);

  const processDataForTable = () => {
    const processedData = {};

    data.forEach((item) => {
      item.offices.forEach((office) => {
        if (!processedData[item._id]) {
          processedData[item._id] = {};
        }
        if (office && office.officeName) {
          processedData[item._id][office.officeName] = office.count;
        }
      });
    });

    // Ensure all offices are present for every date, filling missing counts with 0
    const officeNames = DropdownValues.officeNames.map(
      (name) => name.officeName
    );
    officeNames.forEach((officeName) => {
      data.forEach((item) => {
        if (!processedData[item._id]) {
          processedData[item._id] = {};
        }
        if (!processedData[item._id][officeName]) {
          processedData[item._id][officeName] = 0;
        }
      });
    });

    return processedData;
  };

  const renderTable = () => {
    const processedData = processDataForTable();
    const uniqueDates = [...new Set(data.map((item) => item._id))].sort();
    const headers = ['Office', ...uniqueDates, 'Total'];

    // Calculate totals
    const officeTotals = DropdownValues.officeNames.map((office) => {
      return uniqueDates.reduce((total, date) => {
        return total + (processedData[date]?.[office.officeName] || 0);
      }, 0);
    });

    const dateTotals = uniqueDates.map((date) => {
      return DropdownValues.officeNames.reduce((total, office) => {
        return total + (processedData[date]?.[office.officeName] || 0);
      }, 0);
    });

    const grandTotal = officeTotals.reduce((sum, total) => sum + total, 0);

    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div
          className="overflow-auto"
          style={{ maxHeight: 'calc(100vh - 16rem)' }}
        >
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 sticky top-0 z-30">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className={`px-4 py-3 text-left text-sm font-semibold text-white border-b border-slate-600 min-w-[120px] ${
                      header === 'Total'
                        ? 'sticky right-0 bg-gradient-to-r from-slate-800 to-slate-900 border-l-2 border-slate-600 z-40'
                        : ''
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {DropdownValues.officeNames.map((officeNameObj, index) => (
                <tr
                  key={index}
                  className={`hover:bg-blue-50 transition-colors duration-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-slate-900 text-sm border-r border-slate-100">
                    {officeNameObj.officeName}
                  </td>
                  {uniqueDates.map((date) => {
                    const count =
                      processedData[date]?.[officeNameObj.officeName] || 0;
                    return (
                      <td key={date} className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-semibold min-w-[40px] ${
                            count > 0
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-gray-50 text-gray-400 border border-gray-200'
                          }`}
                        >
                          {count}
                        </span>
                      </td>
                    );
                  })}
                  {/* Office Total */}
                  <td className="px-4 py-3 text-center sticky right-0 bg-slate-50 border-l-2 border-slate-300 z-20">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold min-w-[40px] ${
                        officeTotals[index] > 0
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-50 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {officeTotals[index]}
                    </span>
                  </td>
                </tr>
              ))}

              {/* Bottom Total Row */}
              <tr className="bg-slate-100 border-t-2 border-slate-300 sticky bottom-0 z-30">
                <td className="px-4 py-3 font-bold text-slate-900 text-sm border-r border-slate-200">
                  Total
                </td>
                {dateTotals.map((total, index) => (
                  <td key={index} className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold min-w-[40px] ${
                        total > 0
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-50 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {total}
                    </span>
                  </td>
                ))}
                {/* Grand Total */}
                <td className="px-4 py-3 text-center sticky right-0 bg-slate-200 border-l-2 border-slate-300 z-50">
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold min-w-[40px] ${
                      grandTotal > 0
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {grandTotal}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-200">
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Total Offices: {DropdownValues.officeNames.length}</span>
            <span>Date Range: {uniqueDates.length} days</span>
            <span>Total Pending: {grandTotal}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-slate-50 overflow-auto relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-slate-700 font-medium">
                Loading pending IVs...
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4" style={{ padding: '15px' }}>
        {/* Date Filter Section */}
        <div className="bg-white rounded-lg shadow border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Appointment Date:
              </label>
              <div className="border border-slate-300 rounded-lg bg-white">
                <Datepicker
                  value={value}
                  onChange={handleValueChange}
                  inputClassName="text-sm px-3 py-2 border-0 focus:ring-0"
                  toggleClassName="text-slate-500"
                  placeholder="Select date range..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        {value.startDate && value.endDate ? (
          data.length > 0 ? (
            renderTable()
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12">
              <div className="text-center">
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
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  No Pending IVs Found
                </h3>
                <p className="text-slate-500 text-sm">
                  No unassigned appointments found for the selected date range.
                </p>
              </div>
            </div>
          )
        ) : (
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
                    d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Select Date Range
              </h3>
              <p className="text-slate-500 text-sm">
                Please select a date range to view pending IV assignments.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingIV;
