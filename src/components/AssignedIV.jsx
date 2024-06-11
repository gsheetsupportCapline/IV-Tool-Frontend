import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";

const AssignedIV = () => {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await axios.get(
          "http://localhost:3000/api/auth/users"
        );
        setUsers(userResponse.data.data);

        // Placeholder for office names, assuming these are the offices you're interested in
        const officeNames = [
          "Aransas",
          "Azle",
          "Beaumont", // Add all relevant office names here
        ];

        // Initialize counts for each office and user
        const counts = officeNames.reduce((acc, office) => {
          acc[office] = {};
          return acc;
        }, {});

        // Assuming this is part of your useEffect hook where you're setting the appointments state
        await Promise.all(
          users
            .filter((user) => user.role == "user")
            .map(async (user) => {
              const appointmentsResponse = await axios.get(
                `http://localhost:3000/api/appointments/user-appointments/${user._id}`
              );
              appointmentsResponse.data.forEach((appointmentGroup) => {
                appointmentGroup.appointments.forEach((appointment) => {
                  if (appointment.status === "Assigned") {
                    const officeName = appointmentGroup.officeName; // Correctly reference the officeName from the outer object
                    if (
                      Object.prototype.hasOwnProperty.call(
                        counts[officeName],
                        appointment.assignedUser
                      )
                    ) {
                      counts[officeName][appointment.assignedUser]++;
                    } else {
                      counts[officeName][appointment.assignedUser] = 1;
                    }
                  }
                });
              });
            })
        );
        console.log("counts", counts);
        setAppointments(counts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  // Calculate total counts for each office
  const totalCounts = Object.keys(appointments).reduce((acc, office) => {
    acc[office] = Object.values(appointments[office]).reduce(
      (sum, count) => sum + count,
      0
    );
    return acc;
  }, {});

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Office</TableCell>
            {users
              .filter((user) => user.role == "user")
              .map((user, index) => (
                <TableCell key={index}>{user.name}</TableCell>
              ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(appointments).map(
            ([office, userCounts], rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>{office}</TableCell>
                {Object.entries(userCounts).map(([userId, count], colIndex) => (
                  <TableCell key={colIndex}>{count || 0}</TableCell>
                ))}
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssignedIV;
