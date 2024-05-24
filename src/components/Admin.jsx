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

  const [selectedRows, setSelectedRows] = useState([]);
  const [value, setValue] = useState(0);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);

  const officeName = localStorage.getItem("loggedInOffice");
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/users"
        );
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    { field: "status", headerName: "Status", width: 150 },
    { field: "office", headerName: "Office", width: 150 },
    { field: "ivType", headerName: "IV Type", width: 150 },
    { field: "assignedUser", headerName: "Assigned To", width: 150 },
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

  const handleMenuItemClick = async (user) => {
    // Assuming selectedRows contains the appointments to be updated
    const selectedAppointmentIds = selectedRows.map((row) => row._id); // Adjust 'id' as per your data structure
    console.log("Selected Appointment Ids", selectedAppointmentIds);
    // Loop through each selected appointment and update it
    for (let id of selectedAppointmentIds) {
      try {
        const response = await axios.put(
          `http://localhost:3000/api/appointments/update-appointments/${officeName}/${id}`,
          {
            userId: user._id,
            status: "Assigned",
          }
        );
        console.log("Response api", response);
        const updatedAppointment = response.data;
        console.log("updatedAppointment", updatedAppointment);
        // Find the index of the updated appointment in the rows array
        const index = rows.findIndex(
          (row) => row._id.toString() === updatedAppointment._id.toString()
        );
        console.log("Index", index);

        // Update the appointment in the local state
        if (index !== -1) {
          const newRows = [...rows];
          newRows[index] = updatedAppointment;
          setRows(newRows);
        }
      } catch (error) {
        console.error("Failed to update appointment", error);
      }
    }

    handleClose();
    console.log(`Assigned ${selectedRows.length} IVs to ${user.name}`);
  };

  const handleSelectionChange = (newSelection) => {
    const selectedRows = newSelection.map((id) =>
      rows.find((row) => row._id === id)
    );
    console.log("Selected Rows ", selectedRows);
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
        console.log("Appointment data", responseData.appointments);
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
              pageSizeOptions={[5, 10, 20, 25, 50, 100]}
              checkboxSelection
              onRowSelectionModelChange={handleSelectionChange}
              getRowId={(row) => row._id.toString()}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
