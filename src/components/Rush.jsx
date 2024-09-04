import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Header from "./Header";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import axios from "axios"; // Import Axios
import moment from "moment";
import { officeNames } from "./DropdownValues";
import { Select, MenuItem, FormControl, InputLabel, Grid } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import BASE_URL from "../config/apiConfig";
import {insuranceNames} from "./DropdownValues";
import { Autocomplete ,InputAdornment, IconButton} from '@mui/material';
import { Upload } from 'lucide-react';
const Rush = () => {
  const [selectedOffice, setSelectedOffice] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [values, setValues] = useState({
    appointmentDate: null,
    appointmentTime: null,
    treatingProvider: "",
    patientId: "",
    patientDOB: null,
    patientName: "",
    policyHolderName: "",
    policyHolderDOB: null,
    MIDSSN: "",
    insuranceName: "",
    insurancePhone: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (value, name) => {
    console.log(value, name);
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleOfficeChange = (newOffice) => {
    setSelectedOffice(newOffice);
  };

  const handleAppointmentDateChange = (date) => {
    console.log("Selected date:", date);
    setValues({
      ...values,
      appointmentDate: date,
    });
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
    return moment(date).format("YYYY-MM-DD");
  }

  function formatTime(time) {
    console.log("time", time);
    return moment(time).format("HH:mm:ss");
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Initialize an error message if any required field is missing
    let errorMessage = "";

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
      errorMessage = "Please fill all the required fields.";
    }

    // If there's an error message, show the snackbar
    if (errorMessage) {
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
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

      ivType: "Rush",
    };
    console.log("Submitting payload:", payload);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/appointments/create-new-appointment/${selectedOffice}`,
        payload
      );
      setSnackbarOpen(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Rush IV created successfully!");
      // Clear the form after successful submission
      setValues({
        appointmentDate: null,
        appointmentTime: null,
        treatingProvider: "",
        patientId: "",
        patientDOB: null,
        patientName: "",
        MIDSSN: "",
        insuranceName: "",
        insurancePhone: "",
        policyHolderName: "",
        policyHolderDOB: null,
      });
      console.log("response", response.data);
    } catch (error) {
      console.error(
        "Error creating new appointment:",
        error.response ? error.response.data : error.message
      );
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to create IV");
    }
  };
  const handleUpload = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    // You can add additional logic here to handle the selected file
  };
  return (
    <>
      <Header />
      <Box
        sx={{
          width: "100vw", // Full viewport width

           backgroundColor: "#eee", // Set the background color
         // backgroundColor : "#dbeafe",
          display: "flex",
          justifyContent: "center", // Center the Card horizontally
          alignItems: "center", // Center the Card vertically
        
        }}
      >
        <Card
          sx={{
            width: "50%",
            height: "90vh",
            borderColor: "primary.main",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "auto", // Center the card horizontally
            marginTop: "10px", // Adjust top margin to avoid sticking to the header
            // backgroundColor: "#334155",
            backgroundColor: "#374e76",
          
           
          }}
        >
          <Typography
            variant="h4"
            sx={{
              marginBottom: 2,
              marginTop: 2,
              color: "white",
            }}
            fontFamily={"Tahoma"}
          >
            Rush IV
          </Typography>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "90%", // Adjust width as needed
              padding: 2,
              backgroundColor: "#f1f5f9",
              borderRadius: 2,
              marginBottom: "10px",
            }}
            noValidate
            autoComplete="off"
          >
            <Grid container spacing={2}>
              {/* First Column */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ marginBottom: 2 }}>
                  <InputLabel id="office-label">Office</InputLabel>
                  <Select
                    labelId="office-label"
                    id="office-select"
                    value={selectedOffice}
                    onChange={(e) => handleOfficeChange(e.target.value)}
                    label="Office"
                  >
                    {officeNames.map((office) => (
                      <MenuItem key={office.id} value={office.officeName}>
                        {office.officeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  required
                  id="outlined-read-only-treating-provider"
                  label="Treating Provider"
                  value={values.treatingProvider}
                  onChange={(e) =>
                    handleChange(e.target.value, "treatingProvider")
                  }
                  sx={{ marginBottom: 2 }}
                  fullWidth
                />
                <TextField
                  required
                  id="outlined-patient-id"
                  label="Patient Id"
                  value={values.patientId}
                  onChange={(e) => handleChange(e.target.value, "patientId")}
                  sx={{ marginBottom: 2 }}
                  fullWidth
                />

                <DatePicker
                  required
                  id="outlined-patient-dob"
                  label="Patient DOB"
                  value={values.patientDOB}
                  onChange={handlePatientDOBChange}
                  sx={{ marginBottom: 2, width: "100%" }}
                  fullWidth
                />

 

<FormControl fullWidth sx={{ marginBottom: 2 }}>
 
  <Autocomplete
            labelId="insurance-name-label"
            id="insurance-name-autocomplete"
            options={insuranceNames}
            getOptionLabel={(option) => option.name}
            value={values.name}
            onChange={(event, newValue) => 
              handleChange(newValue, "insuranceName")
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Insurance Name"
                variant="outlined"
                fullWidth
              />
            )}
          />
</FormControl>
                <TextField
                  id="outlined-policy-holder-name"
                  label="Policy Holder Name"
                  value={values.policyHolderName}
                  onChange={(e) =>
                    handleChange(e.target.value, "policyHolderName")
                  }
                  sx={{ marginBottom: 2 }}
                  fullWidth
                />
              </Grid>

              {/* Second Column */}
              <Grid item xs={12} sm={6}>
                <DatePicker
                  required
                  id="outlined-aptDate"
                  label="Appointment Date"
                  renderInput={(params) => <TextField {...params} />}
                  value={values.appointmentDate}
                  onChange={handleAppointmentDateChange}
                  sx={{ marginBottom: 2, width: "100%" }}
                  fullWidth
                />
                <TimePicker
                  label="Appointment Time"
                  renderInput={(params) => <TextField {...params} />}
                  value={values.appointmentTime}
                  onChange={handleTimeChange}
                  sx={{ marginBottom: 2, width: "100%" }}
                  fullWidth
                />

                <TextField
                  required
                  id="outlined-patient-name"
                  label="Patient Name"
                  value={values.patientName}
                  onChange={(e) => handleChange(e.target.value, "patientName")}
                  sx={{ marginBottom: 2 }}
                  fullWidth
                />
                  <input
      type="file"
      accept=".pdf,.jpg,.png" // Specify allowed file types
      style={{ display: 'none' }}
      id="upload-file-input"
      onChange={handleUpload}
    />
                <TextField
                  required
                  id="outlined-mid-ssn"
                  label="MID/SSN"
                  value={values.MIDSSN}
                  onChange={(e) => handleChange(e.target.value, "MIDSSN")}
                  sx={{ marginBottom: 2 }}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton edge="end" size="small"  onClick={() => document.getElementById('upload-file-input').click()}>
                          <Upload size={20} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
{selectedFile && (
      <p>Selected file: {selectedFile.name}</p>
    )}
                <TextField
                 
                  id="outlined-insurance-contact"
                  label="Insurance Contact"
                  value={values.insurancePhone}
                  onChange={(e) =>
                    handleChange(e.target.value, "insurancePhone")
                  }
                  sx={{ marginBottom: 2 }}
                  fullWidth
                />

                <DatePicker
                  id="outlined-policy-holder-dob"
                  label="Policy Holder DOB"
                  value={values.policyHolderDOB}
                  onChange={handlePolicyHolderDOBChange}
                  sx={{ marginBottom: 2, width: "100%" }}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Stack spacing={2} direction="row">
              <Button variant="contained" onClick={handleSubmit} fullWidth>
                Submit
              </Button>
            </Stack>
          </Box>
        </Card>
      </Box>
      <Snackbar
        open={snackbarOpen}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} // Position at top right
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%", marginTop: "50px" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Rush;
