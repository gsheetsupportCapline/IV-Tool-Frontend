import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Header from "./Header";

const Rush = () => {
  return (
    <>
      <Header />
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
        />
        <TextField required id="outlined-aptDate" label="Appointment Date" />
        <TextField required id="outlined-aptTime" label="Appointment Time" />
        <TextField
          required
          id="outlined-read-only-treating-provider"
          label="Treating Provider"
          InputProps={{
            readOnly: true,
          }}
        />
        <TextField required id="outlined-patient-id" label="Patient Id" />
        <TextField
          id="outlined-policy-holder-name"
          label="Policy Holder Name"
        />
        <TextField id="outlined-policy-holder-dob" label="Policy Holder DOB" />
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
    </>
  );
};

export default Rush;
