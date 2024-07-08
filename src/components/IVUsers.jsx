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
} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import {
  ivRemarks,
  sourceDropdownOptions,
  planTypeDropdownOptions,
} from "./DropdownValues";
import Header from "./Header";
import axios from "axios";

const IVUsers = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const userName = localStorage.getItem("loggedinUserName");
  // Function to fetch appointments
  const fetchAppointments = async () => {
    try {
      const userId = localStorage.getItem("loggedinUserId");
      const response = await fetch(
        `http://localhost:3000/api/appointments/user-appointments/${userId}`
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
      console.log("Submitting table data...");
      if (!selectedAppointment) {
        alert("Please select an appointment to update.");
        return;
      }

      console.log(selectedAppointment);
      // Construct the payload for the API call
      const payload = {
        userAppointmentId: selectedAppointment.assignedUser,
        appointmentId: selectedAppointment._id,
        ivRemarks: selectedAppointment.ivRemarks,
        source: selectedAppointment.source,
        planType: selectedAppointment.planType,
        completedBy: userName,
      };

      console.log("Payload ", payload);
      // Make an API call to update the appointment details
      await axios.post(
        `http://localhost:3000/api/appointments/update-individual-appointment-details`,
        payload
      );

      // Refresh the data or show a success message
      alert("Appointment updated successfully!");
      // Optionally, refresh the appointments data here
    } catch (error) {
      console.error("Error submitting table data:", error);
      alert("An error occurred while updating the appointment.");
    }
  };

  const handleInputChange = (field, value) => {
    setSelectedAppointment((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };
  return (
    <>
      <Header />
      <Grid container spacing={2} sx={{ padding: "20px" }}>
        <Grid item xs={3}>
          <Typography variant="h6" gutterBottom>
            Assigned IVs
          </Typography>
          {appointments
            .filter(
              (appointment) => appointment.completionStatus != "Completed"
            )
            .map((appointment) => (
              <Button
                key={appointment._id}
                onClick={() => setSelectedAppointment(appointment)}
                variant="outlined"
              >
                {appointment.office}{" "}
                {new Date(appointment.appointmentDate)
                  .toISOString()
                  .slice(0, 10)}
              </Button>
            ))}
        </Grid>
        {selectedAppointment && (
          <Grid item xs={9}>
            <Typography variant="h6" gutterBottom>
              Appointment Details
            </Typography>

            <Grid item xs={8}>
              <Card sx={{ padding: 2 }}>
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
                          value={selectedAppointment.remark}
                          onChange={(event) =>
                            handleInputChange("ivRemarks", event.target.value)
                          }
                          variant="outlined"
                        >
                          {ivRemarks.map((remark) => (
                            <MenuItem key={remark.id} value={remark.remark}>
                              {remark.remark}
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
  );
};

export default IVUsers;
