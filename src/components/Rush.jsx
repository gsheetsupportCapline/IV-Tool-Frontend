import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Header from "./Header";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";

const Rush = () => {
  const loggedInOffice = localStorage.getItem("loggedInOffice");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  //  const [provider, setProvider] = useState("");

  const provider = "Jack";
  const [patientId, setPatientId] = useState("");
  const [patientDOB, setPatientDOB] = useState("");
  const [patientName, setPatientName] = useState("");
  const [policyHolderName, setPolicyHolderName] = useState("");
  const [policyHolderDOB, setPolicyHolderDOB] = useState("");
  const [MIDSSN, setMIDSSN] = useState("");
  const [insuranceName, setInsuranceName] = useState("");
  const [insurancePhone, setInsurancePhone] = useState("");

  const handleSubmit = async (event) => {
    console.log("Submitting form...");
    console.log("event", event);
    try {
      const response = await fetch(
        `http://localhost:3000/api/appointments/create-new-appointment/${loggedInOffice}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentDate,
            appointmentTime,
            provider,
            patientId,
            patientDOB,
            patientName,
            policyHolderName,
            policyHolderDOB,
            MIDSSN,
            insuranceName,
            insurancePhone,
          }),
        }
      );
      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      console.log("Appointment created successfully");
    } catch (error) {
      console.error("Error creating appointment:", error);
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
        <Box
          component="form"
          onSubmit={handleSubmit}
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
          <TextField
            id="outlined-aptDate"
            label="Appointment Date"
            onChange={(e) => setAppointmentDate(e.target.value)}
          />
          <TextField
            id="outlined-aptTime"
            label="Appointment Time"
            onChange={(e) => setAppointmentTime(e.target.value)}
          />
        </Box>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            "& > :not(style)": { m: 1, width: "25ch" },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            required
            id="outlined-read-only-treating-provider"
            label="Treating Provider"
            InputProps={{
              readOnly: true,
            }}
            value={provider}
          />
          <TextField
            required
            id="outlined-patient-id"
            label="Patient Id"
            onChange={(e) => setPatientId(e.target.value)}
          />
          <TextField
            id="outlined-patient-dob"
            label="Patient DOB"
            onChange={(e) => setPatientDOB(e.target.value)}
          />
          <TextField
            required
            id="outlined-patient-name"
            label="Patient Name"
            onChange={(e) => setPatientName(e.target.value)}
          />
          <TextField
            id="outlined-policy-holder-name"
            label="Policy Holder Name"
            onChange={(e) => setPolicyHolderName(e.target.value)}
          />
          <TextField
            id="outlined-policy-holder-dob"
            label="Policy Holder DOB"
            onChange={(e) => setPolicyHolderDOB(e.target.value)}
          />
          <TextField
            required
            id="outlined-mid-ssn"
            label="MID/SSN"
            onChange={(e) => setMIDSSN(e.target.value)}
          />

          <TextField
            required
            id="outlined-insurance-name"
            label="Insurance Name"
            onChange={(e) => setInsuranceName(e.target.value)}
          />
          <TextField
            required
            id="outlined-insurance-contact"
            label="Insurance Contact"
            onChange={(e) => setInsurancePhone(e.target.value)}
          />
        </Box>
        <Stack spacing={2} direction="row">
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </Stack>
      </Card>
    </>
  );
};

export default Rush;
