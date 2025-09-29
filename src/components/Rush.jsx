import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Header from './Header';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import axios from 'axios'; // Import Axios
import moment from 'moment';
// import { officeNames } from "./DropdownValues";
import { Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import BASE_URL from '../config/apiConfig';
// import {insuranceNames} from "./DropdownValues";
import { Autocomplete, InputAdornment, IconButton } from '@mui/material';
import { Upload } from 'lucide-react';
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

const Rush = () => {
  const [selectedOffice, setSelectedOffice] = useState('');

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [values, setValues] = useState({
    appointmentDate: null,
    appointmentTime: null,
    treatingProvider: '',
    patientId: '',
    patientDOB: null,
    patientName: '',
    policyHolderName: '',
    policyHolderDOB: null,
    MIDSSN: '',
    insuranceName: null,
    insurancePhone: '',
    imageUrl: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [insuranceOptions, setInsuranceOptions] = useState([]);
  const [officeOptions, setOfficeOptions] = useState([]);

  useEffect(() => {
    const loadOptions = async () => {
      let officeOptions = [];
      let insuranceOptions = [];
      if (localStorage.getItem('role') === 'officeuser') {
        // For office users, get only assigned offices
        const assignedOffice = localStorage.getItem('assignedOffice');
        officeOptions = [{ name: assignedOffice }];
        setSelectedOffice(assignedOffice);
        insuranceOptions = await fetchDropdownOptions('Insurance Name');
      } else {
        // For other roles, fetch all available options
        officeOptions = await fetchDropdownOptions('Office');
        insuranceOptions = await fetchDropdownOptions('Insurance Name');
      }

      setOfficeOptions(officeOptions);
      setInsuranceOptions(insuranceOptions);
    };

    loadOptions();
  }, []);

  const handleChange = (value, name) => {
    console.log(value, name);
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleOfficeChange = (newOffice) => {
    setSelectedOffice(newOffice);
    fetchProviderIfApplicable(newOffice, values.appointmentDate);
  };

  const handleAppointmentDateChange = (date) => {
    console.log('Selected date:', date);
    setValues({
      ...values,
      appointmentDate: date,
    });
    fetchProviderIfApplicable(selectedOffice, date);
  };
  const fetchProviderIfApplicable = async (office, appointmentDate) => {
    if (office && appointmentDate) {
      try {
        const formattedDate = moment(appointmentDate).format('MM/DD/YYYY');
        // Update Google Sheet (similar to updategsheet API call)
        const sheetId = '1MO8i6_2paAEHku-YdKlwOikXItTPo88P00Hg3iyXR5Y'; // replace with actual ID
        const updateRange = 'Dashboard!A2:B2'; // range to update office and date
        const updateUrl = `${BASE_URL}/api/spreadsheet/gsheet/updategsheet`;

        const updateOptions = {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sheetId: sheetId,
            range: updateRange,
            values: [[office, formattedDate]],
          }),
        };

        const updateResponse = await fetch(updateUrl, updateOptions);
        const updateData = await updateResponse.json();

        if (updateData.status === 200) {
          // If the update is successful, read the updated data (similar to readgsheet API call)
          const readRange = 'Dashboard!C5:D';
          const readUrl = `${BASE_URL}/api/spreadsheet/gsheet/readgsheet/${sheetId}/${readRange}`;

          const readOptions = {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json',
            },
            // body: JSON.stringify({
            //   sheetId: sheetId,
            //   range: readRange,
            // }),
          };

          const readResponse = await fetch(readUrl, readOptions);
          // console.log("readresponse",readResponse);
          const readData = await readResponse.json();

          // if (readData.length === 1) {
          //   setValues((prevValues) => ({
          //     ...prevValues,
          //     treatingProvider: readData[0][1],

          //   }));
          // } else if (readData.length === 2) {
          //   // Show primary provider as treating provider
          //   setValues((prevValues) => ({
          //     ...prevValues,
          //     treatingProvider: readData.find(([id]) => id === "Doc - 1")[1] || "",

          //   }));
          // }
          if (readData.length > 0) {
            setValues((prevValues) => ({
              ...prevValues,
              treatingProvider: readData[0][1],
            }));
          } else {
            setValues((prevValues) => ({
              ...prevValues,
              treatingProvider: '',
            }));
            setSnackbarOpen(true);
            setSnackbarSeverity('error');
            setSnackbarMessage(
              'No doctor found for selected office and appointment date.'
            );
          }
        } else {
          setValues((prevValues) => ({
            ...prevValues,
            treatingProvider: '',
          }));
          setSnackbarOpen(true);
          setSnackbarSeverity('error');
          setSnackbarMessage(
            'Failed to update Google Sheet. Please try again.'
          );
        }
      } catch (error) {
        console.error('Error fetching provider:', error);
        setValues((prevValues) => ({
          ...prevValues,
          treatingProvider: '',
        }));
        setSnackbarOpen(true);
        setSnackbarSeverity('error');
        // setSnackbarMessage("An error occurred while fetching provider. Please try again.");
        setSnackbarMessage(
          'No provider found for selected office and appointment date.'
        );
      }
    }
  };

  // Handler for patient DOB change
  const handlePatientDOBChange = (date) => {
    setValues({
      ...values,
      patientDOB: date,
    });
  };

  // Handler for policy holder DOB change
  const handlePolicyHolderDOBChange = (date) => {
    setValues({
      ...values,
      policyHolderDOB: date,
    });
  };
  const handleTimeChange = (time) => {
    console.log(time);
    setValues({
      ...values,
      appointmentTime: time,
    });
  };

  function formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  function formatTime(time) {
    console.log('time', time);
    return moment(time).format('HH:mm:ss');
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const currentTime = new Date().toISOString();

    // Initialize an error message if any required field is missing
    let errorMessage = '';

    // Check for missing fields
    if (
      !values.appointmentDate ||
      !values.appointmentTime ||
      !values.patientId ||
      !values.patientName ||
      !values.patientDOB ||
      !values.MIDSSN ||
      !values.insuranceName
    ) {
      errorMessage = 'Please fill all the required fields.';
    }

    // If there's an error message, show the snackbar
    if (errorMessage) {
      setSnackbarOpen(true);
      setSnackbarSeverity('error');
      setSnackbarMessage(errorMessage);
      return;
    }
    // Constructing the payload
    const payload = {
      appointmentDate: values.appointmentDate
        ? formatDate(values.appointmentDate)
        : undefined,
      appointmentTime: values.appointmentTime
        ? formatTime(values.appointmentTime)
        : undefined,
      provider: values.treatingProvider,
      patientId: values.patientId,
      patientDOB: values.patientDOB ? formatDate(values.patientDOB) : undefined,
      patientName: values.patientName,
      policyHolderName: values.policyHolderName,
      policyHolderDOB: values.policyHolderDOB
        ? formatDate(values.policyHolderDOB)
        : undefined,
      MIDSSN: values.MIDSSN,
      insuranceName: values.insuranceName.name,
      insurancePhone: values.insurancePhone,
      imageUrl: values.imageUrl,
      ivRequestedDate: currentTime,
      ivType: 'Rush',
    };
    console.log('Submitting payload:', payload);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/appointments/create-new-appointment/${selectedOffice}`,
        payload
      );
      setSnackbarOpen(true);
      setSnackbarSeverity('success');
      setSnackbarMessage('Rush IV created successfully!');
      // Clear the form after successful submission
      setValues({
        appointmentDate: null,
        appointmentTime: null,
        treatingProvider: '',
        patientId: '',
        patientDOB: null,
        patientName: '',
        MIDSSN: '',
        insuranceName: '',
        insurancePhone: '',
        policyHolderName: '',
        policyHolderDOB: null,
      });
      console.log('response', response.data);
    } catch (error) {
      console.error(
        'Error creating new appointment:',
        error.response ? error.response.data : error.message
      );
      setSnackbarOpen(true);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to create IV');
    }
  };
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setSnackbarOpen(true);
    setSnackbarSeverity('info');
    setSnackbarMessage(`File selected: ${file.name}`);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/image-upload/upload`,
        formData
      );
      console.log(response);
      const imageUrl = response.data.fileInfo.url;
      console.log('image', imageUrl);
      setValues((prevValues) => ({
        ...prevValues,
        imageUrl: imageUrl,
      }));
      console.log('Image uploaded successfully:', imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-20 pb-8">
        {/* Added pt-20 for sticky header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Request Rush IV
            </h1>
            <p className="text-gray-600">
              Submit your urgent IV request with all required details
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-slate-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Rush IV Request Form
              </h2>
            </div>

            {/* Form Body */}
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Office <span className="text-red-500">*</span>
                      </label>
                      <FormControl fullWidth size="small">
                        <Select
                          value={selectedOffice}
                          onChange={(e) => handleOfficeChange(e.target.value)}
                          displayEmpty
                          className="bg-white"
                          sx={{
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#d1d5db' },
                              '&:hover fieldset': { borderColor: '#6366f1' },
                              '&.Mui-focused fieldset': {
                                borderColor: '#6366f1',
                              },
                            },
                          }}
                        >
                          <MenuItem value="" disabled>
                            Select Office
                          </MenuItem>
                          {officeOptions.map((office) => (
                            <MenuItem key={office.id} value={office.name}>
                              {office.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Treating Provider{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        value={values.treatingProvider}
                        onChange={(e) =>
                          handleChange(e.target.value, 'treatingProvider')
                        }
                        placeholder="Enter treating provider name"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: '#d1d5db' },
                            '&:hover fieldset': { borderColor: '#6366f1' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient ID <span className="text-red-500">*</span>
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        value={values.patientId}
                        onChange={(e) =>
                          handleChange(e.target.value, 'patientId')
                        }
                        placeholder="Enter patient ID"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: '#d1d5db' },
                            '&:hover fieldset': { borderColor: '#6366f1' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Date of Birth{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        value={values.patientDOB}
                        onChange={handlePatientDOBChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            placeholder: 'Select date',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': { borderColor: '#d1d5db' },
                                '&:hover fieldset': { borderColor: '#6366f1' },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#6366f1',
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Name
                      </label>
                      <Autocomplete
                        options={insuranceOptions}
                        getOptionLabel={(option) => option.name || ''}
                        value={values.insuranceName || null}
                        onChange={(event, newValue) =>
                          handleChange(newValue, 'insuranceName')
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.name === value?.name
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            size="small"
                            placeholder="Search insurance name"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': { borderColor: '#d1d5db' },
                                '&:hover fieldset': { borderColor: '#6366f1' },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#6366f1',
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Policy Holder Name
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        value={values.policyHolderName}
                        onChange={(e) =>
                          handleChange(e.target.value, 'policyHolderName')
                        }
                        placeholder="Enter policy holder name"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: '#d1d5db' },
                            '&:hover fieldset': { borderColor: '#6366f1' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Date <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        value={values.appointmentDate}
                        onChange={handleAppointmentDateChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            placeholder: 'Select appointment date',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': { borderColor: '#d1d5db' },
                                '&:hover fieldset': { borderColor: '#6366f1' },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#6366f1',
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Appointment Time
                      </label>
                      <TimePicker
                        value={values.appointmentTime}
                        onChange={handleTimeChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            placeholder: 'Select appointment time',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': { borderColor: '#d1d5db' },
                                '&:hover fieldset': { borderColor: '#6366f1' },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#6366f1',
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Name <span className="text-red-500">*</span>
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        value={values.patientName}
                        onChange={(e) =>
                          handleChange(e.target.value, 'patientName')
                        }
                        placeholder="Enter patient name"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: '#d1d5db' },
                            '&:hover fieldset': { borderColor: '#6366f1' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        MID/SSN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        style={{ display: 'none' }}
                        id="upload-file-input"
                        onChange={handleUpload}
                        encType="multipart/form-data"
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={values.MIDSSN}
                        onChange={(e) => handleChange(e.target.value, 'MIDSSN')}
                        placeholder="Enter MID/SSN"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() =>
                                  document
                                    .getElementById('upload-file-input')
                                    .click()
                                }
                                className="text-gray-500 hover:text-indigo-600 transition-colors"
                              >
                                <Upload size={20} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: '#d1d5db' },
                            '&:hover fieldset': { borderColor: '#6366f1' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Insurance Contact
                      </label>
                      <TextField
                        fullWidth
                        size="small"
                        value={values.insurancePhone}
                        onChange={(e) =>
                          handleChange(e.target.value, 'insurancePhone')
                        }
                        placeholder="Enter insurance contact number"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '& fieldset': { borderColor: '#d1d5db' },
                            '&:hover fieldset': { borderColor: '#6366f1' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                            },
                          },
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Policy Holder Date of Birth
                      </label>
                      <DatePicker
                        value={values.policyHolderDOB}
                        onChange={handlePolicyHolderDOBChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            placeholder: 'Select date',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                '& fieldset': { borderColor: '#d1d5db' },
                                '&:hover fieldset': { borderColor: '#6366f1' },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#6366f1',
                                },
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8 flex justify-center">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Submit Rush IV Request
                  </button>
                </div>
              </form>
            </div>
          </div>
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
          sx={{ width: '100%', marginTop: '50px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Rush;
