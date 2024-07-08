import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const PendingIVs = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/appointments/pending-iv-counts")
      .then((response) => response.json())
      .then((fetchedData) => {
        // Aggregate data
        const aggregatedData = fetchedData.reduce((acc, curr) => {
          Object.entries(curr.PendingCount).forEach(([date, count]) => {
            acc.push({ office: curr.OfficeName, date, count });
          });
          return acc;
        }, []);
        setData(aggregatedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Generate headers for the next five weekdays from today
  const today = new Date();
  const headers = [];
  let daysRemaining = 5;

  // Initialize the nextDay variable outside the loop to avoid re-initializing it every time
  let nextDay = new Date(today);

  while (daysRemaining > 0) {
    // Increment the date by one day
    nextDay.setDate(nextDay.getDate() + 1);

    // Check if the next day is a weekday
    const dayOfWeek = nextDay.getDay(); // getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // If it's a weekend, continue to the next iteration without decrementing daysRemaining
      continue;
    }

    // Push the date string to the headers array
    headers.push(
      nextDay.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    );

    // Decrement daysRemaining regardless of whether we found a weekday or skipped due to it being a weekend
    daysRemaining--;
  }

  // Ensure we have exactly five weekdays, filling in empty strings if necessary
  if (headers.length < 5) {
    while (headers.length < 5) {
      headers.push("");
    }
  }
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Office</TableCell>
            {headers.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={`${row.office}-${row.date}`}>
              <TableCell>{row.office}</TableCell>
              {headers.map(
                (header) =>
                  header === row.date && (
                    <TableCell key={header}>{row.count}</TableCell>
                  )
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PendingIVs;
