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

const IVUsers = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Function to fetch appointments
  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/appointments/user-appointments/66579cdeb9606e7391e09afb"
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

  return (
    <>
      <Header />
      <Grid container spacing={2} sx={{ padding: "20px" }}>
        <Grid item xs={3}>
          <Typography variant="h6" gutterBottom>
            Assigned IVs
          </Typography>
          {appointments.map((appointment) => (
            <Button
              key={appointment._id}
              onClick={() => setSelectedAppointment(appointment)}
              variant="outlined"
            >
              {appointment.office} ({appointment.appointmentDate})
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
                        >
                          {sourceDropdownOptions.map((source) => (
                            <MenuItem key={source.id} value={source.id}>
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
                        >
                          {planTypeDropdownOptions.map((plan) => (
                            <MenuItem key={plan.id} value={plan.id}>
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
                          // onChange={handleChange}
                          variant="outlined"
                        >
                          {ivRemarks.map((remark) => (
                            <MenuItem key={remark.id} value={remark.id}>
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
                        value={selectedAppointment.appointmentDate}
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
                  </Grid>
                  <Button
                    variant="contained"
                    color="primary"
                    //   onClick={handleSubmit}
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
