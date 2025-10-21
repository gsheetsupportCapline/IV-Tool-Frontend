// Import necessary hooks and components
import { useState, useEffect } from 'react';
import Header from './Header';
import Datepicker from 'react-tailwindcss-datepicker';
import BASE_URL from '../config/apiConfig';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import { fetchOfficeOptions } from '../utils/fetchOfficeOptions';

const AwaitingIV = () => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedOffice, setSelectedOffice] = useState(''); // Initialize as empty string for consistency
  const [appointments, setAppointments] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [error, setError] = useState(false);

  // Function to filter offices based on user role
  const filterOffices = async () => {
    try {
      const offices = await fetchOfficeOptions();
      const userRole = localStorage.getItem('role');

      if (userRole === 'officeuser') {
        const assignedOffice = localStorage.getItem('assignedOffice');
        const assignedOfficesList = assignedOffice
          ? assignedOffice.split(',').map((o) => o.trim())
          : [];

        const filtered = offices.filter((office) =>
          assignedOfficesList.includes(office.name)
        );
        setFilteredOffices(filtered);

        if (assignedOffice) {
          setSelectedOffice(assignedOffice.trim());
        }
      } else {
        setFilteredOffices(offices);
      }
    } catch (error) {
      console.error('Error filtering offices:', error);
      setFilteredOffices([]);
    }
  };

  useEffect(() => {
    filterOffices();
  }, []);

  const handleValueChange = (newValue) => {
    setValue({
      startDate: new Date(newValue.startDate),
      endDate: new Date(newValue.endDate),
    });
  };

  const handleOfficeChange = (event) => {
    setSelectedOffice(event.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedOffice || !value.startDate || !value.endDate) {
        setAppointments([]); // Clear appointments when filters are incomplete
        return;
      }

      setLoading(true);
      setError(false);

      try {
        let params = '';
        if (selectedOffice) {
          params += `&officeName=${selectedOffice}`;
        }
        const startDateParam = value.startDate.toISOString().split('T')[0];
        const endDateParam = value.endDate.toISOString().split('T')[0];

        const url = `${BASE_URL}/api/appointments/appointments-by-office-and-remarks?${params}&startDate=${startDateParam}&endDate=${endDateParam}`;
        console.log('Fetching IVs Awaiting data:', url);

        const response = await fetch(url);
        const responseData = await response.json();

        setAppointments(responseData || []);
        console.log('Fetched IVs Awaiting data:', responseData);
      } catch (error) {
        console.error('Error fetching IVs Awaiting data:', error);
        setError(true);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [value, selectedOffice]);

  return (
    <div className="h-screen bg-slate-50 overflow-hidden relative">
      <Header />

      {/* Loading Overlay - Same as Home.jsx */}
      {loading && (
        <div className="absolute inset-0 bg-gray-500 bg-opacity-30 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-slate-700 font-medium">
                Loading IVs awaiting...
              </span>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="p-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Data</h3>
                <p className="text-red-700 text-sm mt-1">
                  Unable to fetch IVs awaiting data. Please try again.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="h-full overflow-hidden"
          style={{ height: 'calc(100vh - 4rem)' }}
        >
          <div className="p-3">
            {/* Compact Filters Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-3">
              <div className="grid grid-cols-2 gap-4 items-center">
                {/* Office Selector */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[80px]">
                    Office Name:
                  </label>
                  <div className="flex-1 h-8">
                    <select
                      className="w-full h-8 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors bg-white"
                      onChange={handleOfficeChange}
                      value={selectedOffice}
                    >
                      {filteredOffices.length === 1 ? (
                        <option value={filteredOffices[0].name}>
                          {filteredOffices[0].name}
                        </option>
                      ) : (
                        <>
                          <option value="">Select Office</option>
                          {filteredOffices.map((office) => (
                            <option key={office.id} value={office.name}>
                              {office.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-slate-700 whitespace-nowrap min-w-[100px]">
                    Date Range:
                  </label>
                  <div className="flex-1 h-8">
                    <Datepicker
                      value={value}
                      onChange={handleValueChange}
                      inputClassName="w-full h-8 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors"
                      containerClassName="relative"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Results Section - Matching Scheduled Patients design */}
            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
              {appointments.length > 0 ? (
                <Box sx={{ height: 'calc(100vh - 12rem)', width: '100%' }}>
                  <DataGrid
                    rows={appointments}
                    columns={[
                      {
                        field: 'patientName',
                        headerName: 'Patient Name',
                        flex: 1.2,
                        minWidth: 150,
                      },
                      {
                        field: 'patientId',
                        headerName: 'Patient ID',
                        flex: 1,
                        minWidth: 120,
                      },
                      {
                        field: 'appointmentDate',
                        headerName: 'Appointment Date',
                        flex: 1,
                        minWidth: 130,
                      },
                      {
                        field: 'appointmentTime',
                        headerName: 'Appointment Time',
                        flex: 0.8,
                        minWidth: 100,
                      },
                      {
                        field: 'ivType',
                        headerName: 'IV Type',
                        flex: 1,
                        minWidth: 120,
                      },
                      {
                        field: 'ivRemarks',
                        headerName: 'IV Remarks',
                        flex: 1.5,
                        minWidth: 180,
                      },
                      {
                        field: 'planType',
                        headerName: 'Plan Type',
                        flex: 1,
                        minWidth: 120,
                      },
                      {
                        field: 'insuranceName',
                        headerName: 'Insurance Name',
                        flex: 1.2,
                        minWidth: 140,
                      },
                    ]}
                    pageSize={50}
                    rowsPerPageOptions={[25, 50, 100]}
                    getRowId={(row) => row._id}
                    disableSelectionOnClick
                    sx={{
                      '.MuiDataGrid-columnHeader': {
                        fontFamily: 'Tahoma',
                        backgroundColor: '#1e293b', // slate-800
                        color: '#ffffff',
                        fontWeight: 600,
                      },
                      '.MuiDataGrid-columnHeaderTitle': {
                        color: '#ffffff',
                        fontWeight: 600,
                      },
                      '.MuiDataGrid-columnSeparator': {
                        color: '#ffffff',
                      },
                      '.MuiDataGrid-iconSeparator': {
                        color: '#ffffff',
                      },
                      '.MuiDataGrid-sortIcon': {
                        color: '#ffffff',
                      },
                      '.MuiDataGrid-menuIcon': {
                        color: '#ffffff',
                      },
                      '.MuiDataGrid-columnHeaderTitleContainer .MuiDataGrid-iconButtonContainer':
                        {
                          color: '#ffffff',
                        },
                      '.MuiDataGrid-root': {
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      },
                    }}
                  />
                </Box>
              ) : (
                <div
                  style={{ height: 'calc(100vh - 12rem)' }}
                  className="flex items-center justify-center"
                >
                  {selectedOffice && value.startDate && value.endDate ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-6 h-6 text-slate-400"
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
                        No IVs awaiting found
                      </div>
                      <div className="text-slate-400 text-sm mt-1">
                        No appointments match your current filter criteria
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-6 h-6 text-blue-500"
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
                        Please select filters
                      </div>
                      <div className="text-slate-400 text-sm mt-1">
                        Choose office and date range to view IVs awaiting
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AwaitingIV;
