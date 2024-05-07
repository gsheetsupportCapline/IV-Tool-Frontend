import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Header from "./Header";

const Admin = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const userNames = ["User 1", "User 2", "User 3", "User 4"]; // Your array of user names
  const columns = [
    { field: "office", headerName: "Office", width: 150 },
    { field: "appointmentType", headerName: "Appointment Type", width: 150 },
    { field: "appointmentDate", headerName: "Appointment Date", width: 150 },
    { field: "appointmentTime", headerName: "Appointment Time", width: 150 },
    { field: "patientId", headerName: "Patient Id", width: 100 },
    { field: "insuranceName", headerName: "Insurance Name", width: 150 },
    { field: "insurancePhoneNo", headerName: "Insurance Phone No", width: 150 },
    { field: "policyHolderName", headerName: "Policy Holder Name", width: 150 },
    { field: "policyHolderDOB", headerName: "Policy Holder DOB", width: 150 },
    { field: "memberId", headerName: "Member Id", width: 100 },
    { field: "employerName", headerName: "Employer Name", width: 150 },
  ];

  const rows = [
    {
      id: "1-2023-04-01-10:00 AM",
      appointmentType: "Initial Consultation",
      appointmentDate: "2023-04-01",
      appointmentTime: "10:00 AM",
      patientId: 1,
      insuranceName: "Health Insurance Co.",
      insurancePhoneNo: "555-1234",
      policyHolderName: "John Doe",
      policyHolderDOB: "1980-01-01",
      memberId: "A123456",
      employerName: "Tech Corp.",
    },
    {
      id: "2-2023-04-02-11:00 AM",
      appointmentType: "Follow-up",
      appointmentDate: "2023-04-02",
      appointmentTime: "11:00 AM",
      patientId: 2,
      insuranceName: "Life Insurance Co.",
      insurancePhoneNo: "555-5678",
      policyHolderName: "Jane Smith",
      policyHolderDOB: "1985-02-15",
      memberId: "B234567",
      employerName: "Finance Corp.",
    },
    {
      id: "3-2023-04-03-12:00 PM",
      appointmentType: "Annual Checkup",
      appointmentDate: "2023-04-03",
      appointmentTime: "12:00 PM",
      patientId: 3,
      insuranceName: "Health Insurance Co.",
      insurancePhoneNo: "555-8765",
      policyHolderName: "Alice Johnson",
      policyHolderDOB: "1990-03-20",
      memberId: "C345678",
      employerName: "Tech Corp.",
    },
    // Add more rows as needed
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (user) => {
    setSelectedUser(user);
    handleClose();
    // Here you would handle the assignment logic, e.g., updating the backend
    console.log(`Assigned ${selectedRows.length} IVs to ${user}`);
  };
  const handleSelectionChange = (newSelection) => {
    console.log("New Selection:", newSelection); // Debugging line
    const selectedRows = newSelection.map((id) =>
      rows.find((row) => `${row.patientId}-${row.appointmentTime}` === id)
    );
    console.log("Selected Rows:", selectedRows); // Debugging line
    setSelectedRows(selectedRows);
  };
  return (
    <>
      <Header />
      <Button variant="contained" onClick={handleClick}>
        Assign to User
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {userNames.map((user) => (
          <MenuItem key={user} onClick={() => handleMenuItemClick(user)}>
            {user}
          </MenuItem>
        ))}
      </Menu>
      <div className="flex justify-center">
        <div className="bg-white shadow-lg rounded-lg p-4 w-full  ">
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => `${row.patientId}-${row.appointmentTime}`}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 5 },
                },
              }}
              pageSizeOptions={[5, 10]}
              checkboxSelection
              onSelectionModelChange={(newSelection) =>
                console.log("Selection changed:", newSelection)
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
