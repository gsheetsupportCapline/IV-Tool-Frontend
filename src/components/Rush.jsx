import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Header from "./Header";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import axios from "axios"; // Import Axios
import moment from "moment";

const Rush = () => {
  const loggedInOffice = "Aransas";
  const treatingProvider = "John";

  const [values, setValues] = useState({
    office: loggedInOffice,
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

  const handleChange = (value, name) => {
    console.log(value, name);
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
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
      insuranceName: values.insuranceName,
      insurancePhone: values.insurancePhone,
      ivType: "Rush",
    };
    console.log("Submitting payload:", payload);
    try {
      const response = await axios.post(
        `http://localhost:3000/api/appointments/create-new-appointment/${values.office}`,
        payload
      );
      alert("Appointment created successfully");
      console.log("response", response.data);
    } catch (error) {
      console.error(
        "Error creating new appointment:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to create appointment. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <Card
        sx={{
          width: "60%",
          borderColor: "primary.main",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Form Fields */}
        <Box
          component="form"
          sx={{
            "& > :not(style)": { m: 1, width: "25ch" },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            required
            id="outlined-read-only-office"
            label="Office"
            InputProps={{
              readOnly: true,
            }}
            value={loggedInOffice}
          />

          <DatePicker
            required
            id="outlined-aptDate"
            label="Appointment Date"
            renderInput={(params) => <TextField {...params} />}
            value={values.appointmentDate}
            onChange={handleAppointmentDateChange}
          />
          <TimePicker
            label="Appointment Time"
            renderInput={(params) => <TextField {...params} />}
            value={values.appointmentTime}
            onChange={handleTimeChange}
          />
          <TextField
            required
            id="outlined-read-only-treating-provider"
            label="Treating Provider"
            InputProps={{
              readOnly: true,
            }}
            value={treatingProvider}
          />

          <TextField
            required
            id="outlined-patient-id"
            label="Patient Id"
            onChange={(e) => handleChange(e.target.value, "patientId")}
          />
          <TextField
            required
            id="outlined-patient-name"
            label="Patient Name"
            value={values.patientName}
            onChange={(e) => handleChange(e.target.value, "patientName")}
          />
          <DatePicker
            required
            id="outlined-patient-dob"
            label="Patient DOB"
            value={values.patientDOB}
            onChange={handlePatientDOBChange}
          />
          <TextField
            id="outlined-policy-holder-name"
            label="Policy Holder Name"
            value={values.policyHolderName}
            onChange={(e) => handleChange(e.target.value, "policyHolderName")}
          />
          <DatePicker
            id="outlined-policy-holder-dob"
            label="Policy Holder DOB"
            value={values.policyHolderDOB}
            onChange={handlePolicyHolderDOBChange}
          />
          <TextField
            required
            id="outlined-mid-ssn"
            label="MID/SSN"
            value={values.MIDSSN}
            onChange={(e) => handleChange(e.target.value, "MIDSSN")}
          />

          <TextField
            required
            id="outlined-insurance-name"
            label="Insurance Name"
            value={values.insuranceName}
            onChange={(e) => handleChange(e.target.value, "insuranceName")}
          />
          <TextField
            required
            id="outlined-insurance-contact"
            label="Insurance Contact"
            value={values.insurancePhone}
            onChange={(e) => handleChange(e.target.value, "insurancePhone")}
          />
        </Box>

        <Stack spacing={2} direction="row">
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Stack>
      </Card>
    </>
  );
};

export default Rush;
