import React from "react";

import Box from "@mui/material/Box";
import { TextField } from "@mui/material";

const PriorityIV = () => {
  return (
    <Box sx={{ minWidth: 120 }}>
      <TextField id="outlined-aptDate" label="Appointment Date" />
      <TextField id="outlined-aptTime" label="Appointment Time" />
      <TextField id="outlined-patientId" label="Patient ID" />
      <TextField id="outlined-insuranceName" label="Insurance Name" />
      <TextField id="outlined-insurnacePhone" label="Insurance Phone" />
      <TextField id="outlined-policyHolderName" label="Policy Holder Name" />
      <TextField id="outlined-policyHolderDOB" label="Policy Holder DOB" />
      <TextField id="outlined-memberId" label="Member ID" />
      <TextField id="outlined-groupName" label="Group Name" />
      <TextField id="outlined-groupNumber" label="Group Number" />
      <TextField id="outlined-patientName" label="Patient Name" />
      <TextField id="outlined-patientDOB" label="Patient DOB" />
      <TextField id="outlined-doctor" label="Doctor" />
    </Box>
  );
};

export default PriorityIV;
