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
const users = ["user1", "user2", "user3"];
const AssignedIV = () => {
  const headers = [];
  for (let user of users) {
    headers.push(user);
  }

  // Mock data for demonstration purposes
  const data = officeNames.map((office) => {
    const rowData = { office };

    headers.forEach((header) => {
      const randomValue = Math.floor(Math.random() * 100); // Random value for demonstration
      rowData[header] = randomValue;
    });

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
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.office}</TableCell>
              {headers.map((header) => (
                <TableCell key={header}>{row[header]}</TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow>
            <TableCell>Total</TableCell>
            {headers.map((header) => (
              <TableCell key={header}>{totals[header]}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AssignedIV;
