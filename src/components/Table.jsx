import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const Table = ({ data, headers }) => {
  // Ensure each row has a unique id
  const rowsWithIds = data.map((row, index) => ({
    ...row,
    id: index.toString(), // Use a string id for simplicity
  }));

  const columns = headers.map((header, index) => ({
    field: header,
    headerName: header,
    flex: 1,
  }));

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rowsWithIds}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[ 50,100]}
        sx={{
          '.MuiDataGrid-columnHeader': {
            fontFamily: 'Tahoma',
          },
        }}
      />
    </Box>
  );
};

export default Table; 