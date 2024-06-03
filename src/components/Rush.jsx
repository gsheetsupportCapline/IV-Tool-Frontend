import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Header from "./Header";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";

const Rush = () => {
  const loggedInOffice = localStorage.getItem("loggedInOffice");

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
          <TextField required id="outlined-aptDate" label="Appointment Date" />
          <TextField required id="outlined-aptTime" label="Appointment Time" />
        </Box>
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
            id="outlined-read-only-treating-provider"
            label="Treating Provider"
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField required id="outlined-patient-id" label="Patient Id" />
          <TextField required id="outlined-patient-dob" label="Patient DOB" />
          <TextField required id="outlined-patient-name" label="Patient Name" />
          <TextField
            id="outlined-policy-holder-name"
            label="Policy Holder Name"
          />
          <TextField
            id="outlined-policy-holder-dob"
            label="Policy Holder DOB"
          />
          <TextField required id="outlined-mid-ssn" label="MID/SSN" />

          <TextField
            required
            id="outlined-insurance-name"
            label="Insurance Name"
          />
          <TextField
            required
            id="outlined-insurance-contact"
            label="Insurance Contact"
          />
        </Box>
        <Stack spacing={2} direction="row">
          <Button variant="contained">Submit</Button>
        </Stack>
      </Card>
    </>
  );
};

export default Rush;
