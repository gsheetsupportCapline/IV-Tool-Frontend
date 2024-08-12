import { useState, useEffect } from "react";
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
} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import {
  ivRemarksDropdownOptions,
  sourceDropdownOptions,
  planTypeDropdownOptions,
} from "./DropdownValues";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TableHead,
} from "@mui/material";

import axios from "axios";

import Header from "./Header";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import BASE_URL from "../config/apiConfig";

const IVUsers = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [noteRemarks, setNoteRemarks] = useState("");
  const userName = localStorage.getItem("loggedinUserName");

  // Function to fetch appointments
  const fetchAppointments = async () => {
    try {
      const userId = localStorage.getItem("loggedinUserId");
      const response = await fetch(
        `${BASE_URL}/api/appointments/user-appointments/${userId}`
      );
      const data = await response.json();

      setAppointments(data);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
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
        setSnackbarSeverity("error");
        setSnackbarMessage("Source, Plan Type and Iv Remarks are mandatory.");
        return;
      }
      console.log("Submitting table data...");
      if (!selectedAppointment) {
        alert("Please select an appointment to update.");
        return;
      }

      console.log("selected appointment ", selectedAppointment);

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

      console.log("Payload ", payload);
      // Make an API call to update the appointment details
      await axios.post(
        `${BASE_URL}/api/appointments/update-individual-appointment-details`,
        payload
      );

      // Optionally, reset the selectedAppointment state
      setSelectedAppointment(null);
      setNoteRemarks("");
      // Refresh the data or show a success message
      setSnackbarOpen(true);
      setSnackbarSeverity("success");
      setSnackbarMessage("Appointment updated successfully!");
    } catch (error) {
      console.error("Error submitting table data:", error);
      setSnackbarOpen(true);
      setSnackbarSeverity("error");
      setSnackbarMessage("An error occurred while updating the appointment.");
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
      <Grid container spacing={2} sx={{ padding: "20px", height: "100vh" }}>
        <Grid
          item
          xs={3}
          sx={{
            backgroundColor: "#334155",
            padding: "10px",
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6" gutterBottom color="white">
            Assigned IVs
          </Typography>

          <div>
            {/* {sortAppointments(appointments).map((appointment) => (
              <ListItem
                key={appointment._id}
                onClick={() => {
                  setSelectedAppointment(appointment);
                }}
                sx={{
                  borderRadius: "8px",
                  padding: "8px",
                  marginBottom: "8px",
                  transition: "background-color 0.3s ease", // Smooth background color transition
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#f0f0f0", // Light grey background on hover
                    cursor: "pointer",
                    color: "black",
                  },
                }}
              >
                <ListItemText
                  primary={`PId (${appointment.patientId})  
                  Date - ${new Date(appointment.appointmentDate)
                    .toISOString()
                    .slice(0, 10)}  Time-${appointment.appointmentTime}
                    `}
                />
              </ListItem>
            ))} */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: "0.8rem", px: 1 }}>
                      Patient ID
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", px: 1 }}>
                      Appointment Date
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", px: 1 }}>
                      Appointment Time
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem", px: 1 }}>
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
                        "&:hover": {
                          backgroundColor: "#f0f0f0", // Light grey background on hover
                        },
                        cursor: "pointer",
                      }}
                    >
                      <TableCell sx={{ fontSize: "0.8rem", px: 1 }}>
                        {appointment.patientId}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", px: 1 }}>
                        {new Date(appointment.appointmentDate)
                          .toISOString()
                          .slice(0, 10)}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", px: 1 }}>
                        {appointment.appointmentTime}
                      </TableCell>

                      <TableCell sx={{ fontSize: "0.8rem", px: 1 }}>
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
            sx={{ backgroundColor: "#94a3b8", padding: "10px" }}
          >
            <Typography variant="h6" gutterBottom>
              Appointment Details
            </Typography>

            <Grid item xs={8}>
              <Card sx={{ padding: 2, backgroundColor: "#f1f5f9" }}>
                <Box
                  component="form"
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
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
                            handleInputChange("source", event.target.value)
                          }
                        >
                          {sourceDropdownOptions.map((source) => (
                            <MenuItem key={source.id} value={source.source}>
                              {source.source}
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
                            handleInputChange("planType", event.target.value)
                          }
                        >
                          {planTypeDropdownOptions.map((plan) => (
                            <MenuItem key={plan.id} value={plan.planType}>
                              {plan.planType}
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
                            handleInputChange("ivRemarks", event.target.value)
                          }
                          variant="outlined"
                        >
                          {ivRemarksDropdownOptions.map((remark) => (
                            <MenuItem key={remark.id} value={remark.ivRemarks}>
                              {remark.ivRemarks}
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
                        // value={selectedAppointment.appointmentDate}
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
                        onChange={(event) => setNoteRemarks(event.target.value)}
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

export default IVUsers;
