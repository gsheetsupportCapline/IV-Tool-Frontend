import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { officeNames } from "./DropdownValues.js";
import BASE_URL from "../config/apiConfig.js";

const columns = [
  { field: "office", headerName: "Office", width: 150 },
  { field: "count", headerName: "Count", type: "number", width: 150 },
];
const columnsOffice = [
  { field: "userName", headerName: "User Name", width: 150 },
  { field: "count", headerName: "Count", width: 100 },
];

const AssignedIV = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState({});
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOffice, setSelectedOffice] = useState("");
  const [assignedCounts, setAssignedCounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(`${BASE_URL}/api/auth/users`);
        const usersData = userResponse.data.data;

        let allAppointments = [];

        for (let userData of usersData) {
          const appointmentsResponse = await axios.get(
            `${BASE_URL}/api/appointments/user-appointments/${userData._id}`
          );

          allAppointments.push(...appointmentsResponse.data);
        }
        console.log("all apt", allAppointments);

        const groupedAppointments = allAppointments.reduce(
          (acc, appointment) => {
            const { assignedUser, office } = appointment;
            if (!acc[assignedUser]) {
              acc[assignedUser] = {};
            }
            if (!acc[assignedUser][office]) {
              acc[assignedUser][office] = 0;
            }
            acc[assignedUser][office]++;
            return acc;
          },
          {}
        );
        console.log("group appt", groupedAppointments);

        const usersWithName = usersData.map((userData) => ({
          ...userData,
          firstName: userData.name,
        }));

        setUsers(usersWithName);
        setAppointments(groupedAppointments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedOffice) {
      axios
        .get(`${BASE_URL}/api/appointments/assigned-counts/${selectedOffice}`)
        .then((response) => {
          const data = response.data;
          const formattedData = Object.entries(data.assignedCounts).map(
            ([userId, count]) => ({
              userName:
                users.find((user) => user._id === userId)?.name || "Unknown", // Find user name by ID
              count,
            })
          );
          console.log(formattedData);
          setAssignedCounts(formattedData);
        })
        .catch((error) => {
          console.error("Error fetching assigned counts", error);
        });
    }
  }, [selectedOffice, users]); // Dependency array ensures effect runs when selectedOffice changes

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const handleUserChange = (event) => {
    setSelectedUserId(event.target.value);
  };

  let rows = [];

  if (selectedUserId) {
    console.log("Selected User Appointments:", appointments[selectedUserId]);
    if (appointments[selectedUserId]) {
      rows = Object.entries(appointments[selectedUserId]).map(
        ([office, count], idx) => ({
          id: String(idx),
          office,
          count,
        })
      );
      console.log("Formatted Rows for DataGrid:", rows);
    } else {
      console.error(`No appointments found for userId: ${selectedUserId}`);
    }
  }
  console.log(selectedUserId);
  return (
    <>
      <Box
        height={700}
        sx={{ display: "flex", justifyContent: "space-between", padding: 2 }}
      >
        <Box sx={{ flex: 1, marginRight: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">User</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedUserId}
              label="User"
              onChange={handleUserChange}
            >
              {users
                .filter((user) => user.role == "user")
                .map((user, index) => (
                  <MenuItem key={index} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          {selectedUserId && (
            <Card
              sx={{
                backgroundColor: "#cbd5e1",
                maxWidth: "600px",
                margin: "auto",
              }}
            >
              <CardContent>
                <Typography variant="h5">Assigned IVs</Typography>

                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  checkboxSelection={false}
                />
              </CardContent>
            </Card>
          )}
        </Box>
        <Box sx={{ flex: 1, marginLeft: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Office</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Office"
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
            >
              {officeNames.map((office) => (
                <MenuItem key={office.id} value={office.officeName}>
                  {office.officeName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedOffice && (
            <Card
              sx={{
                backgroundColor: "#F9F6EE",
                maxWidth: "700px",
                margin: "auto",
              }}
            >
              <CardContent>
                <Typography variant="h5">Assigned IVs</Typography>
                <DataGrid
                  rows={assignedCounts}
                  columns={columnsOffice}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  checkboxSelection={false}
                  disableSelectionOnClick
                  getRowId={(row) => `${row.userName}-${row.count}`}
                />
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </>
  );
};

export default AssignedIV;
