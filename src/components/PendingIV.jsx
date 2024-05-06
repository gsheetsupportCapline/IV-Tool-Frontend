import React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const officeNames = [
  "Aransas",
  "Azle",
  "Beaumont",
  "Benbrook",
  "Brodie",
  "Calallen",
  "Crosby",
  "Devine",
  "Elgin",
  "Huffman",
  "Jasper",
  "Lavaca",
  "Liberty",
  "Lucas",
  "Lytle",
  "Mathis",
  "Potranco",
  "Rio Bravo",
  "Riverwalk",
  "Rockdale",
  "Rockwall",
  "San Mateo",
  "Sinton",
  "Splendora",
  "Springtown",
  "Tidwell",
  "Victoria",
  "Westgreen",
  "Winnie",
];

const PendingIV = () => {
  // Generate headers for the next three days from today
  const today = new Date();
  const headers = [];
  for (let i = 0; i < 3; i++) {
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

  // Mock data for demonstration purposes
  const data = officeNames.map((office) => {
    const rowData = { office };
    let totalPendency = 0;
    headers.forEach((header) => {
      const randomValue = Math.floor(Math.random() * 100); // Random value for demonstration
      rowData[header] = randomValue;
      totalPendency += randomValue;
    });
    rowData["Total Pendency"] = totalPendency;
    return rowData;
  });

  // Calculate totals for each column
  const totals = {
    ...headers.reduce(
      (acc, header) => ({
        ...acc,
        [header]: data.reduce((sum, row) => sum + row[header], 0),
      }),
      {}
    ),
    "Total Pendency": data.reduce((sum, row) => sum + row["Total Pendency"], 0),
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Office</TableCell>
            {headers.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
            <TableCell>Total Pendency</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.office}</TableCell>
              {headers.map((header) => (
                <TableCell key={header}>{row[header]}</TableCell>
              ))}
              <TableCell>{row["Total Pendency"]}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>Total</TableCell>
            {headers.map((header) => (
              <TableCell key={header}>{totals[header]}</TableCell>
            ))}
            <TableCell>{totals["Total Pendency"]}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PendingIV;
