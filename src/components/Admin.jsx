import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import axios from "axios";
import Header from "./Header";

const Admin = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [value, setValue] = useState(0);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);

  const officeName = localStorage.getItem("loggedInOffice");

  const columns = [
    { field: "status", headerName: "Status", width: 150 },
    { field: "office", headerName: "Office", width: 150 },
    { field: "ivType", headerName: "IV Type", width: 150 },
    { field: "appointmentType", headerName: "Appointment Type", width: 150 },
    { field: "appointmentDate", headerName: "Appointment Date", width: 150 },
    { field: "appointmentTime", headerName: "Appointment Time", width: 150 },
    { field: "patientId", headerName: "Patient Id", width: 100 },
    { field: "insuranceName", headerName: "Insurance Name", width: 150 },
    { field: "insurancePhone", headerName: "Insurance Phone No", width: 150 },
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
  };

  const handleSelectionChange = (newSelection) => {
    const selectedRows = newSelection.map((id) =>
      rows.find((row) => `${row.patientId}-${row.appointmentTime}` === id)
    );
    setSelectedRows(selectedRows);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    fetchAndFilterAppointments(newValue);
  };

  const fetchAndFilterAppointments = async (tabValue) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/appointments/fetch-appointments/${officeName}`
      );
      const responseData = await response.json();
      if (responseData && responseData.appointments) {
        let filteredAppointments;
        switch (tabValue) {
          case 0: // All appointments
            filteredAppointments = responseData.appointments;
            break;
          case 1: // Assigned appointments
            filteredAppointments = responseData.appointments.filter(
              (appointment) => appointment.status === "Assigned"
            );
            break;
          case 2: // Unassigned appointments
            filteredAppointments = responseData.appointments.filter(
              (appointment) => appointment.status === "Unassigned"
            );
            break;
          default:
            filteredAppointments = [];
        }
        setRows(filteredAppointments);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Failed to fetch appointments", error);
      setRows([]);
    }
  };

  useEffect(() => {
    fetchAndFilterAppointments(value); // Initially load data based on the selected tab
  }, [value, officeName]); // Reload data if the selected tab or officeName changes

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
          {users.map((user) => (
            <MenuItem key={user._id} onClick={() => handleMenuItemClick(user)}>
              {user.name}
            </MenuItem>
          ))}
        </Menu>
      </Box>
      <div className="flex justify-center">
        <div className="bg-white shadow-lg rounded-lg p-4 w-full ">
          <div style={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => `${row.patientId}-${row.appointmentTime}`}
              pageSizeOptions={[5, 10, 20, 25, 50, 100]}
              checkboxSelection
              onSelectionModelChange={handleSelectionChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
