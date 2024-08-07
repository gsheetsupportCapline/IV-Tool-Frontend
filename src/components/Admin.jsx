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
import Select from "@mui/material/Select";
import Datepicker from "react-tailwindcss-datepicker";
import "./Table.css";
import ShimmerTableComponent from "./ShimmerTableComponent";
import BASE_URL from "../config/apiConfig";
const Admin = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [value, setValue] = useState(0);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [valueDate, setValueDate] = useState({
    startDate: null,
    endDate: null,
  });
  const officeName = [
    "AllOffices",
    "Aransas",
    "Azle",
    "Beaumont",
    "Benbrook",
    "Calallen",
    "Crosby",
    "Devine",
    "Elgin",
    "Grangerland",
    "Huffman",
    "Jasper",
    "Lavaca",
    "Liberty",
    "Lytle",
    "Mathis",
    "Potranco",
    "Rio Bravo",
    "Riverwalk",
    "Rockdale",
    "Sinton",
    "Splendora",
    "Springtown",
    "Tidwell",
    "Victoria",
    "Westgreen",
    "Winnie",
    "OS",
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/auth/users`);
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };
    fetchUsers();
  }, []);
  // Custom cell renderer function
  const renderUserName = (params) => {
    // Find the user object from the users array based on the userId
    const user = users.find((user) => user._id === params.row.assignedUser);

    // Return the user's name if found, otherwise return the userId
    return user ? user.name : params.row.assignedUser;
  };

  const columns = [
    {
      field: "status",
      headerName: "Status",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "completionStatus",
      headerName: "Completion Status",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "office",
      headerName: "Office",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "ivType",
      headerName: "IV Type",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "assignedUser",
      headerName: "Assigned To",
      width: 150,
      renderCell: renderUserName,
      headerClassName: "header-row",
    },
    {
      field: "appointmentType",
      headerName: "Appointment Type",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "appointmentDate",
      headerName: "Appointment Date",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "appointmentTime",
      headerName: "Appointment Time",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "patientId",
      headerName: "Patient Id",
      headerClassName: "header-row",
      width: 100,
    },
    {
      field: "insuranceName",
      headerName: "Insurance Name",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "insurancePhone",
      headerName: "Insurance Phone No",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "policyHolderName",
      headerName: "Policy Holder Name",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "policyHolderDOB",
      headerName: "Policy Holder DOB",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "memberId",
      headerName: "Member Id",
      headerClassName: "header-row",
      width: 100,
    },
    {
      field: "employerName",
      headerName: "Employer Name",
      headerClassName: "header-row",
      width: 150,
    },
    {
      field: "patientName",
      headerName: "Patient Name",
      headerClassName: "header-row",
      width: 150,
    },
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
        // Extract the office name for the current appointment ID
        const officeNameForCurrentId = selectedRows.find(
          (row) => row._id === id
        )?.office;

        if (!officeNameForCurrentId) {
          console.error("Office name not found for appointment ID:", id);
          continue;
        }
        const loggedInUserName = localStorage.getItem("loggedinUserName");
        const response = await axios.put(
          `${BASE_URL}/api/appointments/update-appointments/${officeNameForCurrentId}/${id}`,
          {
            userId: user._id,
            status: "Assigned",
            completionStatus: "In Process",
            ivAssignedDate: new Date().toISOString(),
            ivAssignedByUserName: loggedInUserName,
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

  // onChange={(e) => {
  //   setSelectedOffice(e.target.value);
  //   fetchAndFilterAppointments(value); // Also consider passing the tabValue here if needed
  // }}

  const handleUnassignClick = async () => {
    const selectedAppointmentIds = selectedRows.map((row) => row._id);
    console.log("Selected Appointment Ids", selectedAppointmentIds);

    for (let id of selectedAppointmentIds) {
      try {
        // Construct the URL with the office name extracted from the selectedRows
        const officeNameForCurrentId = selectedRows.find(
          (row) => row._id === id
        )?.office;
        const response = await axios.put(
          `${BASE_URL}/api/appointments/update-appointments/${officeNameForCurrentId}/${id}`,
          {
            userId: null, // Set userId to null or appropriate value to indicate unassignment
            status: "Unassigned",
            completionStatus: "IV Not Done", // Reset completionStatus or set as needed
            ivAssignedDate: null,
            ivAssignedByUserName: null,
          }
        );

        console.log("Response api", response);
        const updatedAppointment = response.data;
        console.log("Updated Appointment", updatedAppointment);

        // Find the index of the updated appointment in the rows array
        const index = rows.findIndex(
          (row) => row._id === updatedAppointment._id
        );

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

    // Optionally, refresh the list of appointments after unassignment
    fetchAndFilterAppointments(value); // Call your existing function to refetch and filter appointments
  };

  const fetchAndFilterAppointments = async (tabValue) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/appointments/fetch-appointments/${
          selectedOffice || ""
        }`
      );
      const responseData = await response.json();
      if (responseData && responseData.appointments) {
        console.log("Appointment data", responseData.appointments);

        // Check if a date range is selected
        const startDate = valueDate.startDate;
        const endDate = valueDate.endDate;

        let filteredAppointments = responseData.appointments;

        // If a date range is selected, filter appointments
        if (startDate && endDate) {
          filteredAppointments = responseData.appointments.filter(
            (appointment) =>
              startDate <= appointment.appointmentDate &&
              appointment.appointmentDate <= endDate
          );
        }
        switch (tabValue) {
          case 0: // All appointments
            break;
          case 1: // Assigned appointments
            filteredAppointments = filteredAppointments.filter(
              (appointment) => appointment.status === "Assigned"
            );
            break;
          case 2: // Unassigned appointments
            filteredAppointments = filteredAppointments.filter(
              (appointment) => appointment.status === "Unassigned"
            );
            break;
          default:
            filteredAppointments = [];
        }
        // Sort the appointments by appointmentDate in descending order
        filteredAppointments.sort((a, b) => {
          //  or  new Date(b.appointmentDate) - new Date(a.appointmentDate)
          const dateCompare =
            new Date(b.appointmentDate) - new Date(a.appointmentDate);

          // If dates are the same, compare times
          if (dateCompare === 0) {
            // Extract hours and minutes from the time strings
            const [hourA, minuteA] = a.appointmentTime.split(":").map(Number);
            const [hourB, minuteB] = b.appointmentTime.split(":").map(Number);

            // Compare hours first, then minutes if hours are equal
            return hourB - hourA || minuteB - minuteA;
          }

          // Dates are not the same, sort by date
          return dateCompare;
        });
        setRows(filteredAppointments);
      } else {
        setRows([]);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
      setRows([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndFilterAppointments(value); // Initially load data based on the selected tab
  }, [value, valueDate, selectedOffice]); // Reload data if the selected tab or Date or  officeName changes

  const handleValueChange = (newValue) => {
    console.log("newValue:", newValue);
    setValueDate(newValue);
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
          backgroundColor: "#94a3b8",
          px: 2,
        }}
      >
        <div className="flex items-center my-1 bg-slate-400">
          <Select
            value={selectedOffice}
            onChange={(e) => setSelectedOffice(e.target.value)}
            displayEmpty
            inputProps={{ "aria-label": "Select Office" }}
          >
            <MenuItem value="">
              <em>Select Office</em>
            </MenuItem>
            {officeName.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>

          <p className="mr-6 ml-10 whitespace-nowrap text-sm font-tahoma">
            Appointment
          </p>
          <div className="w-full">
            <Datepicker value={valueDate} onChange={handleValueChange} />
          </div>
        </div>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="simple tabs example"
          sx={{
            "& .Mui-selected": {
              backgroundColor: "#334155",
              color: "white",
            },
            "& .MuiTab-root": {
              color: "white", // Change the text color to white for all tabs
            },
          }}
        >
          <Tab label="All IVs" sx={{ fontFamily: "'Tahoma', sans-serif" }} />
          <Tab label="Assigned" sx={{ fontFamily: "'Tahoma', sans-serif" }} />
          <Tab label="Unassigned" sx={{ fontFamily: "'Tahoma', sans-serif" }} />
        </Tabs>
        <Box sx={{ display: "flex", gap: 1, p: 2 }}>
          {" "}
          {/* Add this Box around the buttons */}
          <Button variant="contained" onClick={handleUnassignClick}>
            Unassign
          </Button>
          <Button variant="contained" onClick={handleClick}>
            Assign to User
          </Button>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {users
            .filter((user) => user.role == "user") //  only role user is present
            .map((user) => (
              <MenuItem
                key={user._id}
                onClick={() => handleMenuItemClick(user)}
              >
                {user.name}
              </MenuItem>
            ))}
        </Menu>
      </Box>
      <div className="flex justify-center">
        <div className="bg-slate-50 shadow-lg rounded-lg p-4 w-full ">
          {isLoading ? (
            <ShimmerTableComponent />
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
};

export default Admin;
