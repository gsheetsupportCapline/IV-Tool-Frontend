import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  TextField,
  Button,
  Typography,
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
} from '@mui/material';
import axios from 'axios';
import Header from './Header';
import DatePicker from './DatePicker';
import BASE_URL from '../config/apiConfig';

const fetchDropdownOptions = async (category) => {
  try {
    const encodedCategory = encodeURIComponent(category);
    const response = await axios.get(
      `${BASE_URL}/api/dropdownValues/${encodedCategory}`
    );
    return response.data.options;
  } catch (error) {
    console.error(`Error fetching ${category} options:`, error);
    return [];
  }
};

const IVUsers = () => {
  // Check user authentication
  const userId = localStorage.getItem('loggedinUserId');
  const userName = localStorage.getItem('loggedinUserName') || 'User';
  const userRole = localStorage.getItem('role') || 'user';

  if (!userId || userId === 'null' || userId.trim() === '') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Authentication Required
            </h2>
            <p className="text-slate-600 mb-6">
              Please log in to access your IV assignments
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State management
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  // Form states
  const [noteRemarks, setNoteRemarks] = useState('');
  const [sourceOptions, setSourceOptions] = useState([]);
  const [planTypeOptions, setPlanTypeOptions] = useState([]);
  const [ivRemarksOptions, setIvRemarksOptions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load dropdown options
  useEffect(() => {
    const loadOptions = async () => {
      const sourceOptions = await fetchDropdownOptions('Source');
      const planTypeOptions = await fetchDropdownOptions('Plan Type');
      const ivRemarksOptions = await fetchDropdownOptions('IV Remarks');

      setSourceOptions(sourceOptions);
      setPlanTypeOptions(planTypeOptions);
      setIvRemarksOptions(ivRemarksOptions);
    };

    loadOptions();
  }, []);

  // Date change handler for DatePicker
  const handleDateChange = (newDateRange) => {
    console.log('🗓️ Date range changed:', newDateRange);
    if (newDateRange && newDateRange.startDate && newDateRange.endDate) {
      const updatedRange = {
        startDate: new Date(newDateRange.startDate),
        endDate: new Date(newDateRange.endDate),
      };
      console.log('📊 Setting new date range:', updatedRange);
      setDateRange(updatedRange);
      // Trigger API call immediately when valid date range is selected
      fetchAppointmentsWithRange(updatedRange);
    }
  };

  // Function to fetch appointments with specific date range
  const fetchAppointmentsWithRange = async (range) => {
    try {
      setLoading(true);
      setError(null);

      if (!range || !range.startDate || !range.endDate) {
        setError('Please select a valid date range');
        setLoading(false);
        return;
      }

      // Format dates for API
      const startDate = range.startDate.toISOString().split('T')[0];
      const endDate = range.endDate.toISOString().split('T')[0];

      console.log('Fetching appointments for user:', userId);
      console.log('Date range:', { startDate, endDate });

      const apiUrl = `${BASE_URL}/api/appointments/user-appointments/${userId}?startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Raw API response:', data);
      console.log('📋 Data type:', typeof data);
      console.log('📋 Is array:', Array.isArray(data));

      let processedAppointments = [];
      if (Array.isArray(data)) {
        processedAppointments = data;
        console.log('📋 Using direct array, length:', data.length);
      } else if (data && data.success && Array.isArray(data.data)) {
        processedAppointments = data.data;
        console.log('📋 Using data.data array, length:', data.data.length);
      } else if (data && Array.isArray(data.appointments)) {
        processedAppointments = data.appointments;
        console.log(
          '📋 Using data.appointments array, length:',
          data.appointments.length
        );
      } else {
        console.log('📋 No valid array found in response');
        processedAppointments = [];
      }

      console.log('📋 Final processed appointments:', processedAppointments);
      setAppointments(processedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to fetch appointments');
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
      setError('Please select a date range first');
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
        setSnackbarSeverity('error');
        setSnackbarMessage('Source, Plan Type and IV Remarks are mandatory.');
        return;
      }

      const currentDate = new Date();
      const payload = {
        userAppointmentId: selectedAppointment.assignedUser,
        appointmentId: selectedAppointment._id,
        ivRemarks: selectedAppointment.ivRemarks,
        source: selectedAppointment.source,
        planType: selectedAppointment.planType,
        completedBy: userName,
        noteRemarks: noteRemarks,
        ivCompletedDate: currentDate.toISOString(),
      };

      await axios.post(
        `${BASE_URL}/api/appointments/update-individual-appointment-details`,
        payload
      );

      setSelectedAppointment(null);
      setNoteRemarks('');
      setSnackbarOpen(true);
      setSnackbarSeverity('success');
      setSnackbarMessage('Appointment updated successfully!');
      // Refresh data with current date range
      if (dateRange.startDate && dateRange.endDate) {
        fetchAppointmentsWithRange(dateRange);
      }
    } catch (error) {
      console.error('Error submitting:', error);
      setSnackbarOpen(true);
      setSnackbarSeverity('error');
      setSnackbarMessage('An error occurred while updating the appointment.');
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedAppointment((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const sortAppointments = (appointments) => {
    return appointments.sort(
      (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
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
      <div className="flex h-screen pt-0">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-white shadow-lg border-r border-slate-200 flex flex-col">
          {/* Date Range Selector */}
          <div className="p-6 border-b border-slate-200">
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
                <div className="max-h-96 overflow-y-auto border border-slate-200 rounded-lg">
                  <TableContainer component={Paper} sx={{ maxHeight: '100%' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              backgroundColor: '#f8fafc',
                              fontWeight: 600,
                              color: '#374151',
                              fontSize: '0.75rem',
                            }}
                          >
                            Patient ID
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: '#f8fafc',
                              fontWeight: 600,
                              color: '#374151',
                              fontSize: '0.75rem',
                            }}
                          >
                            Date & Time
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: '#f8fafc',
                              fontWeight: 600,
                              color: '#374151',
                              fontSize: '0.75rem',
                            }}
                          >
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortAppointments(appointments).map(
                          (appointment, index) => (
                            <TableRow
                              key={appointment._id || index}
                              onClick={() =>
                                setSelectedAppointment(appointment)
                              }
                              sx={{
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#f8fafc' },
                                backgroundColor:
                                  selectedAppointment?._id === appointment._id
                                    ? '#eff6ff'
                                    : 'inherit',
                                borderLeft:
                                  selectedAppointment?._id === appointment._id
                                    ? '4px solid #3b82f6'
                                    : 'none',
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  color: '#1f2937',
                                  py: 1,
                                }}
                              >
                                {appointment.patientId || 'N/A'}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontSize: '0.75rem',
                                  color: '#4b5563',
                                  py: 1,
                                }}
                              >
                                <div>
                                  <div>
                                    {appointment.appointmentDate
                                      ? new Date(
                                          appointment.appointmentDate
                                        ).toLocaleDateString()
                                      : 'N/A'}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {appointment.appointmentTime || 'No time'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell sx={{ py: 1 }}>
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    backgroundColor:
                                      appointment.completionStatus ===
                                      'Completed'
                                        ? '#dcfce7'
                                        : '#fed7aa',
                                    color:
                                      appointment.completionStatus ===
                                      'Completed'
                                        ? '#166534'
                                        : '#c2410c',
                                  }}
                                >
                                  {appointment.completionStatus || 'Pending'}
                                </span>
                              </TableCell>
                            </TableRow>
                          )
                        )}
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
                        Patient ID: {selectedAppointment.patientId} •{' '}
                        {new Date(
                          selectedAppointment.appointmentDate
                        ).toLocaleDateString()}{' '}
                        • {selectedAppointment.appointmentTime || 'No time'}
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
                              value={selectedAppointment.source || ''}
                              label="Source *"
                              onChange={(e) =>
                                handleInputChange('source', e.target.value)
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
                              value={selectedAppointment.planType || ''}
                              label="Plan Type *"
                              onChange={(e) =>
                                handleInputChange('planType', e.target.value)
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
                              value={selectedAppointment.ivRemarks || ''}
                              label="IV Remarks *"
                              onChange={(e) =>
                                handleInputChange('ivRemarks', e.target.value)
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
                            value={selectedAppointment.patientName || ''}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Patient DOB"
                            value={selectedAppointment.patientDOB || ''}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Office"
                            value={selectedAppointment.office || ''}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Appointment Time"
                            value={selectedAppointment.appointmentTime || ''}
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
                            value={selectedAppointment.insuranceName || ''}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Member ID"
                            value={selectedAppointment.memberId || ''}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Policy Holder Name"
                            value={selectedAppointment.policyHolderName || ''}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="MID/SSN"
                            value={selectedAppointment.MIDSSN || ''}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Appointment Type"
                            value={selectedAppointment.appointmentType || ''}
                            InputProps={{ readOnly: true }}
                            className="bg-slate-50"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Insurance Phone"
                            value={selectedAppointment.insurancePhone || ''}
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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
    </div>
  );
};

export default IVUsers;
