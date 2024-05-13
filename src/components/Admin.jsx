import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Header from "./Header";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

const Admin = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [value, setValue] = useState(0); // State for managing tab selection

  const [rows, setRows] = useState([]); // State to hold the fetched data
  const officeName = "Aransas";
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://localhost:3000/api/appointments/fetch-appointments/${officeName}`
      );
      const responseData = await response.json();
      if (responseData && responseData.appointments) {
        console.log(responseData);
        setRows(responseData.appointments); // Update the rows state with the fetched data
      } else {
        console.log("API did not return data ", responseData);
        setRows([]);
      }
    };
    fetchData();
  }, [officeName]);

  const userNames = ["User 1", "User 2", "User 3", "User 4"]; // Your array of user names
  const columns = [
    { field: "status", headerName: "Status", width: 150 },
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="All IVs" />
          <Tab label="Assigned" />
          <Tab label="Unassigned" />
        </Tabs>
        <Button variant="contained" onClick={handleClick}>
          Assign to User
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {userNames.map((user) => (
            <MenuItem key={user} onClick={() => handleMenuItemClick(user)}>
              {user}
            </MenuItem>
          ))}
        </Menu>
      </Box>
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
