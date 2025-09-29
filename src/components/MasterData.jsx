import { useState, useEffect } from 'react';
import DatePicker from './DatePicker';
import BASE_URL from '../config/apiConfig';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const MasterData = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedDateType, setSelectedDateType] = useState('');
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dateTypeOptions = [
    { name: 'Appointment Date', value: 'appointmentDate' },
    { name: 'Request Date', value: 'ivRequestedDate' },
    { name: 'Assigned Date', value: 'ivAssignedDate' },
    { name: 'Completion Date', value: 'completedDate' },
  ];

  const columnMapping = {
    officeName: 'Office',
    appointmentDate: 'Apt. Date',
    appointmentTime: 'Apt. Time',
    patientId: 'Patient ID',
    patientName: 'Patient Name',
    patientDOB: 'Patient DOB',
    insuranceName: 'Insurance Name',
    insurancePhone: 'Insurance Phone',
    policyHolderName: 'Policy Holder Name',
    policyHolderDOB: 'Policy Holder DOB',
    memberId: 'Member ID',
    employerName: 'Employer Name',
    groupNumber: 'Group No.',
    relationWithPatient: 'Relation With Patient',
    medicaidId: 'Medicaid Id',
    carrierId: 'Carrier Id',
    confirmationStatus: 'Confirmation Status',
    cellPhone: 'Cell Phone',
    homePhone: 'Home Phone',
    workPhone: 'Work Phone',
    appointmentType: 'Apt. Type',
    ivType: 'IV Type',
    status: 'Status',
    completionStatus: 'Completion Status',
    assignedUser: 'Assigned User',
    ivRemarks: 'IV Remarks',
    source: 'Source',
    planType: 'Plan Type',
    completedBy: 'Completed By',
    noteRemarks: 'Remarks',
    ivRequestedDate: 'IV Requested Date',
    ivAssignedDate: 'IV Assigned Date',
    ivCompletedDate: 'IV Completed Date',
    ivAssignedByUserName: 'IV Assigned By',
    provider: 'Provider',
  };

  // Fetch users for name resolution
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users using /api/auth/users endpoint...');
        const response = await fetch(`${BASE_URL}/api/auth/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Users API Response:', result);

          // Check if result is an array or has users property
          const userData = Array.isArray(result)
            ? result
            : result.users || result.data || [];

          if (Array.isArray(userData) && userData.length > 0) {
            console.log('Successfully loaded users:', userData.length);
            console.log('Sample user:', userData[0]);
            setUsers(userData);
          } else {
            console.error('No users found in response:', result);
          }
        } else {
          console.error(
            'Failed to fetch users:',
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Get user name by ID
  const getUserName = (userId) => {
    if (!userId || userId === '-NO-DATA-') return '-';

    // Debug: Log what we're trying to find
    console.log('Looking for user ID:', userId);
    console.log('Available users count:', users.length);

    if (users.length === 0) {
      console.log('No users loaded yet, returning ID');
      return userId; // Return ID if users not loaded yet
    }

    // Handle different possible user ID formats
    const user = users.find((u) => {
      const match =
        u._id === userId ||
        u.id === userId ||
        u._id?.toString() === userId?.toString() ||
        u.id?.toString() === userId?.toString();

      if (match) {
        console.log('Found user:', u);
      }
      return match;
    });

    if (user) {
      const userName =
        user.name ||
        user.username ||
        user.firstName ||
        user.fullName ||
        'Unknown User';
      console.log('Returning user name:', userName);
      return userName;
    }

    // If user not found, log for debugging
    console.log('User not found for ID:', userId);
    console.log('First few users for reference:', users.slice(0, 3));
    return '-'; // Return dash instead of ID if user not found
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (error) {
      return '-';
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString || timeString === '-NO-DATA-') return '-';

    try {
      // If it's already in HH:MM:SS format, just convert to 12-hour format
      if (typeof timeString === 'string' && timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);

        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
        }
      }

      // If it's a date object or date string, try to extract time
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      }

      // If nothing works, return the original string
      return timeString;
    } catch (error) {
      // If all parsing fails, return the original string or '-'
      return timeString || '-';
    }
  };

  // Transform data for table display
  const transformData = (dataArray) => {
    return dataArray.map((item, index) => {
      const transformed = { id: index.toString() };

      Object.entries(columnMapping).forEach(([dataKey, displayName]) => {
        let value = item[dataKey];

        // Handle special cases
        if (dataKey === 'assignedUser') {
          value = getUserName(value);
        } else if (dataKey.includes('Date') && dataKey !== 'appointmentTime') {
          value = formatDate(value);
        } else if (dataKey === 'appointmentTime') {
          value = formatTime(value);
        } else if (dataKey.includes('DOB')) {
          value = formatDate(value);
        }

        // Handle null, undefined, empty values, and -NO-DATA-
        transformed[displayName] =
          value === null ||
          value === undefined ||
          value === '' ||
          value === '-NO-DATA-'
            ? '-'
            : value;
      });

      return transformed;
    });
  };

  // Generate DataGrid columns
  const generateColumns = () => {
    return Object.values(columnMapping).map((header) => ({
      field: header,
      headerName: header,
      flex: 1,
      minWidth: 120,
      sortable: true,
      filterable: true,
    }));
  };

  // Fetch data from API
  const fetchData = async () => {
    if (!dateRange.startDate || !dateRange.endDate || !selectedDateType) {
      setError('Please select date range and date type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${BASE_URL}/api/office-data/office-data-by-date-range`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
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
          if (result.message.includes('date range exceeds 31 days')) {
            setError(
              'Date range cannot exceed 31 days. Please select a shorter period.'
            );
          } else if (
            result.message.includes('fromDate cannot be later than toDate')
          ) {
            setError('Start date cannot be later than end date.');
          } else if (result.message.includes('Invalid date format')) {
            setError('Please select valid dates.');
          } else if (result.message.includes('Invalid dateType')) {
            setError('Please select a valid date type.');
          } else if (result.message.includes('required fields')) {
            setError('Please fill in all required fields.');
          } else {
            setError('Invalid request. Please check your inputs.');
          }
        } else if (response.status === 401) {
          setError('You are not authorized to access this data.');
        } else if (response.status === 403) {
          setError('Access denied. Please contact administrator.');
        } else if (response.status === 500) {
          setError('Server error occurred. Please try again later.');
        } else {
          setError('Failed to fetch data. Please try again.');
        }
        return;
      }

      if (result.success) {
        setData(result.data?.appointments || []);
      } else {
        setError('No data found for the selected criteria.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(
        'Network error occurred. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    fetchData();
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
            <div className="grid grid-cols-3 gap-6 items-end">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Date Range
                </label>
                <div className="h-10">
                  <DatePicker onDateChange={setDateRange} />
                </div>
              </div>

              {/* Date Type Dropdown */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Date Type
                </label>
                <select
                  value={selectedDateType}
                  onChange={(e) => setSelectedDateType(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-0 focus:border-slate-400 transition-colors bg-white text-slate-700"
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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  &nbsp;
                </label>
                <button
                  onClick={handleSearch}
                  disabled={
                    !dateRange.startDate ||
                    !dateRange.endDate ||
                    !selectedDateType ||
                    loading
                  }
                  className="w-full h-10 px-4 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-0 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  Search Data
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 min-h-0 mb-2">
            <Box
              sx={{
                height: 'calc(100vh - 200px)',
                width: '100%',
              }}
            >
              <DataGrid
                rows={data.length > 0 ? transformData(data) : []}
                columns={generateColumns()}
                pageSize={100}
                rowsPerPageOptions={[50, 100, 200]}
                pagination
                sortingOrder={['asc', 'desc']}
                disableSelectionOnClick
                loading={loading}
                sx={{
                  border: 'none',
                  '.MuiDataGrid-columnHeader': {
                    backgroundColor: '#1e293b', // slate-800
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.75rem',
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
                  '.MuiDataGrid-filterIcon': {
                    color: '#ffffff',
                  },
                  '.MuiDataGrid-row:hover': {
                    backgroundColor: '#f8fafc', // slate-50
                  },
                  '.MuiDataGrid-cell': {
                    borderColor: '#e2e8f0', // slate-200
                    fontSize: '0.875rem',
                  },
                  '.MuiDataGrid-footerContainer': {
                    backgroundColor: '#f8fafc', // slate-50
                    borderTop: '1px solid #e2e8f0', // slate-200
                  },
                  '.MuiTablePagination-root': {
                    color: '#475569', // slate-600
                  },
                  '.MuiDataGrid-overlay': {
                    backgroundColor: 'rgba(248, 250, 252, 0.8)',
                  },
                }}
                components={{
                  NoRowsOverlay: () => (
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
                          ? 'Please select date range and date type to view data'
                          : 'No records found for the selected criteria'}
                      </div>
                    </div>
                  ),
                }}
              />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterData;
