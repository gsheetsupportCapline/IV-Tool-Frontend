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
  // ListItem,
  // ListItemText,
} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
// import {
//   ivRemarksDropdownOptions,
//   sourceDropdownOptions,
//   planTypeDropdownOptions,
// } from "./DropdownValues";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TableHead,
} from '@mui/material';

import axios from 'axios';

import Header from './Header';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
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
  console.log('IVUsers component rendering...');

  // Check if user data exists
  const userId = localStorage.getItem('loggedinUserId');
  const userName = localStorage.getItem('loggedinUserName');
  const userRole = localStorage.getItem('role');

  console.log(
    'IVUsers - userId:',
    userId,
    'userName:',
    userName,
    'role:',
    userRole
  );

  if (!userId || userId === 'null' || userId.trim() === '') {
    console.error('No valid user ID found');
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p>Please log in again</p>
        <button onClick={() => (window.location.href = '/')}>
          Go to Login
        </button>
      </div>
    );
  }

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [noteRemarks, setNoteRemarks] = useState('');
  const [sourceOptions, setSourceOptions] = useState([]);
  const [planTypeOptions, setPlanTypeOptions] = useState([]);
  const [ivRemarksOptions, setIvRemarksOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
      .toISOString()
      .split('T')[0], // Last month
    endDate: new Date().toISOString().split('T')[0], // Today
  });

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

  // Function to get current date information
  const getCurrentDateInfo = () => {
    const now = new Date();
    return {
      local: now.toString(),
      iso: now.toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offset: now.getTimezoneOffset(),
      indian: new Date(now.getTime() + 5.5 * 60 * 60 * 1000).toISOString(),
    };
  };

  // Function to test API availability
  const testAPIEndpoints = async () => {
    console.log('Testing API endpoints availability...');
    const testEndpoints = [
      '/api/appointments',
      '/api/appointments/fetch-appointments',
      '/api/appointments/user-appointments',
      '/api/users',
      '/appointments',
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        console.log(`${endpoint} - Status: ${response.status}`);
      } catch (error) {
        console.log(`${endpoint} - Error: ${error.message}`);
      }
    }
  };

  // Function to fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching appointments for userId:', userId);

      if (!userId) {
        throw new Error('No user ID available');
      }

      // Create date range for API call using state values
      console.log(
        'Using date range:',
        dateRange.startDate,
        'to',
        dateRange.endDate
      );

      // Use the correct API endpoint with mandatory parameters
      const apiUrl = `${BASE_URL}/api/appointments/user-appointments/${userId}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl);
      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response received:', data);

      // Handle the new response structure
      if (data.success && data.data && Array.isArray(data.data)) {
        console.log('Found appointments:', data.data.length);
        setAppointments(data.data);
      } else {
        console.warn('Unexpected response format:', data);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setError(error.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

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
        setSnackbarMessage('Source, Plan Type and Iv Remarks are mandatory.');
        return;
      }
      console.log('Submitting table data...');
      if (!selectedAppointment) {
        alert('Please select an appointment to update.');
        return;
      }

      console.log('selected appointment ', selectedAppointment);

      const currentDate = new Date();
      const formattedDateTime = currentDate.toISOString(); // Format as ISO string
      // Construct the payload for the API call
      const payload = {
        userAppointmentId: selectedAppointment.assignedUser,
        appointmentId: selectedAppointment._id,
        ivRemarks: selectedAppointment.ivRemarks,
        source: selectedAppointment.source,
        planType: selectedAppointment.planType,
        completedBy: userName,
        noteRemarks: noteRemarks,
        ivCompletedDate: formattedDateTime,
      };

      console.log('Payload ', payload);
      // Make an API call to update the appointment details
      await axios.post(
        `${BASE_URL}/api/appointments/update-individual-appointment-details`,
        payload
      );

      // Optionally, reset the selectedAppointment state
      setSelectedAppointment(null);
      setNoteRemarks('');
      // Refresh the data or show a success message
      setSnackbarOpen(true);
      setSnackbarSeverity('success');
      setSnackbarMessage('Appointment updated successfully!');
    } catch (error) {
      console.error('Error submitting table data:', error);
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

  function sortAppointments(appointments) {
    return appointments.sort(
      (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
    );
  }

  return (
    <>
      <Header />

      {error && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            border: '1px solid #f44336',
            borderRadius: '8px',
            margin: '20px 0',
          }}
        >
          <h3>Error Loading Dashboard</h3>
          <p>
            <strong>Error:</strong> {error}
          </p>
          <details style={{ marginTop: '10px', color: '#d32f2f' }}>
            <summary style={{ cursor: 'pointer', fontSize: '14px' }}>
              🔍 Debug Information (Click to expand)
            </summary>
            <div
              style={{
                marginTop: '10px',
                fontSize: '12px',
                backgroundColor: '#ffcdd2',
                padding: '10px',
                borderRadius: '4px',
              }}
            >
              <p>
                <strong>User ID:</strong> {userId || 'Not available'}
              </p>
              <p>
                <strong>User Name:</strong> {userName || 'Not available'}
              </p>
              <p>
                <strong>User Role:</strong> {userRole || 'Not available'}
              </p>
              <p>
                <strong>Current Route:</strong> {window.location.pathname}
              </p>
              <p>
                <strong>Base URL:</strong> {BASE_URL}
              </p>
              <p>
                <strong>Attempted API Endpoints:</strong>
              </p>
              <ul style={{ marginLeft: '20px', listStyle: 'disc' }}>
                <li>
                  {BASE_URL}/api/appointments/fetch-appointments/all?userId=
                  {userId}
                </li>
                <li>
                  {BASE_URL}
                  /api/appointments/fetch-unassigned-appointments?userId=
                  {userId}
                </li>
                <li>
                  {BASE_URL}/api/appointments/completed-appointments?userId=
                  {userId}
                </li>
                <li>
                  {BASE_URL}/api/appointments?userId={userId}
                </li>
                <li>
                  {BASE_URL}/api/appointments?user={userId}
                </li>
                <li>
                  {BASE_URL}/api/appointments/user-appointments/{userId}
                </li>
                <li>
                  {BASE_URL}/api/appointments/{userId}
                </li>
                <li>
                  {BASE_URL}/api/appointments/user/{userId}
                </li>
                <li>
                  {BASE_URL}/api/appointment/user/{userId}
                </li>
                <li>
                  {BASE_URL}/appointments/{userId}
                </li>
                <li>
                  {BASE_URL}/appointments?userId={userId}
                </li>
                <li>
                  {BASE_URL}/api/users/{userId}/appointments
                </li>
                <li>
                  {BASE_URL}/user/{userId}/appointments
                </li>
                <li>
                  <strong>Fallback:</strong> {BASE_URL}/api/appointments (get
                  all & filter)
                </li>
              </ul>
              <p>
                <strong>Browser Info:</strong> {navigator.userAgent}
              </p>
            </div>
          </details>
          <button
            onClick={fetchAppointments}
            style={{
              padding: '10px 20px',
              marginTop: '15px',
              marginRight: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🔄 Retry Loading
          </button>
          <button
            onClick={testAPIEndpoints}
            style={{
              padding: '10px 20px',
              marginTop: '15px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            🔍 Test API Endpoints
          </button>
        </div>
      )}

      {loading && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h3>Loading Dashboard...</h3>
          <p>Please wait while we load your data.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Date Range Selector */}
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f0f8ff',
              margin: '10px 0',
              borderRadius: '4px',
            }}
          >
            <strong>📅 Select Date Range:</strong>
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '5px',
                alignItems: 'center',
              }}
            >
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                style={{
                  padding: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
              <span>to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                style={{
                  padding: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
              <button
                onClick={fetchAppointments}
                style={{
                  padding: '5px 15px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                🔍 Search
              </button>
            </div>
          </div>

          {/* Debug: Show appointments count and sample data */}
          <div
            style={{
              padding: '10px',
              backgroundColor: '#e8f5e8',
              margin: '10px 0',
              borderRadius: '4px',
            }}
          >
            <strong>✅ API Connected:</strong> Found {appointments.length}{' '}
            appointments for User ID: {userId}
            <br />
            <small>
              User: {userName} | Role: {userRole}
            </small>
            {appointments.length > 0 && (
              <details style={{ marginTop: '5px' }}>
                <summary style={{ cursor: 'pointer' }}>
                  Show sample appointment data
                </summary>
                <pre
                  style={{
                    fontSize: '11px',
                    marginTop: '5px',
                    backgroundColor: '#f0f0f0',
                    padding: '5px',
                    borderRadius: '3px',
                  }}
                >
                  {JSON.stringify(appointments[0], null, 2)}
                </pre>
              </details>
            )}
          </div>

          <Grid container spacing={2} sx={{ padding: '20px', height: '100vh' }}>
            <Grid
              item
              xs={3}
              sx={{
                backgroundColor: '#374e76',
                padding: '10px',
                borderRadius: '8px',
              }}
            >
              <Typography variant="h6" gutterBottom color="white">
                Assigned IVs ({appointments.length})
              </Typography>

              <div>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontSize: '0.8rem',
                            px: 1,
                            fontFamily: "'Tahoma', sans-serif",
                          }}
                        >
                          Patient ID
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '0.8rem',
                            px: 1,
                            fontFamily: "'Tahoma', sans-serif",
                          }}
                        >
                          Appointment Date
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '0.8rem',
                            px: 1,
                            fontFamily: "'Tahoma', sans-serif",
                          }}
                        >
                          Appointment Time
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: '0.8rem',
                            px: 1,
                            fontFamily: "'Tahoma', sans-serif",
                          }}
                        >
                          Completion Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortAppointments(appointments).map((appointment) => (
                        <TableRow
                          key={appointment._id}
                          onClick={() => setSelectedAppointment(appointment)}
                          sx={{
                            '&:hover': {
                              backgroundColor: '#f0f0f0',
                            },
                            cursor: 'pointer',
                          }}
                        >
                          <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                            {appointment.patientId}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                            {new Date(appointment.appointmentDate)
                              .toISOString()
                              .slice(0, 10)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                            {appointment.appointmentTime}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                            {appointment.completionStatus}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </Grid>

            {selectedAppointment && (
              <Grid
                item
                xs={9}
                sx={{ backgroundColor: '#dbeafe', padding: '10px' }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  style={{ fontFamily: "'Tahoma', sans-serif" }}
                >
                  Appointment Details
                </Typography>

                <Grid item xs={8}>
                  <Card sx={{ padding: 2, backgroundColor: '#f1f5f9' }}>
                    <Box
                      component="form"
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              Source
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={selectedAppointment.source}
                              label="Source"
                              required
                              onChange={(event) =>
                                handleInputChange('source', event.target.value)
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
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              Plan Type
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              id="demo-simple-select"
                              value={selectedAppointment.planType}
                              label="Plan Type"
                              onChange={(event) =>
                                handleInputChange(
                                  'planType',
                                  event.target.value
                                )
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
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">
                              IV Remarks
                            </InputLabel>
                            <Select
                              labelId="demo-simple-select-label"
                              label="IV Remarks"
                              value={selectedAppointment.ivRemarks}
                              onChange={(event) =>
                                handleInputChange(
                                  'ivRemarks',
                                  event.target.value
                                )
                              }
                              variant="outlined"
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
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Office"
                            name="office"
                            value={selectedAppointment.office}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Appointment Date"
                            name="appointmentDate"
                            value={new Date(selectedAppointment.appointmentDate)
                              .toISOString()
                              .slice(0, 10)}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Appointment Time"
                            name="appointmentTime"
                            value={selectedAppointment.appointmentTime}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Appointment Type"
                            name="appointmentType"
                            value={selectedAppointment.appointmentType}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Patient Id"
                            name="patientId"
                            value={selectedAppointment.patientId}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Patient Name"
                            name="patientName"
                            value={selectedAppointment.patientName}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Patient DOB"
                            name="patientDOB"
                            value={selectedAppointment.patientDOB}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Insurance Name"
                            name="insuranceName"
                            value={selectedAppointment.insuranceName}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Insurance Phone"
                            name="insurancePhone"
                            value={selectedAppointment.insurancePhone}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Policy Holder Name"
                            name="policyHolderName"
                            value={selectedAppointment.policyHolderName}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Policy Holder DOB"
                            name="policyHolderDOB"
                            value={selectedAppointment.policyHolderDOB}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Member Id"
                            name="memberId"
                            value={selectedAppointment.memberId}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="MID/SSN"
                            name="MIDSSN"
                            value={selectedAppointment.MIDSSN}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            label="Completed By"
                            name="completedBy"
                            value={userName}
                            variant="outlined"
                            InputProps={{ readOnly: true }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Note Remarks"
                            name="noteRemarks"
                            value={noteRemarks}
                            variant="outlined"
                            onChange={(event) =>
                              setNoteRemarks(event.target.value)
                            }
                            InputProps={{ readOnly: false }}
                          />
                        </Grid>
                      </Grid>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        sx={{ marginTop: 2 }}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Grid>
        </>
      )}

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
          sx={{ width: '100%', marginTop: '50px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default IVUsers;
