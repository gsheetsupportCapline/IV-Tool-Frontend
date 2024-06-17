import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const PendingIV = () => {
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

  // Generate headers for the next five days from today
  const today = new Date();
  const headers = [];
  for (let i = 0; i < 5; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i + 1);
    headers.push(
      nextDay.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
    );
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

export default PendingIV;
