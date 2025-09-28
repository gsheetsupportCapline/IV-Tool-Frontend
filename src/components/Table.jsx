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
    <Box sx={{ height: 'calc(100vh - 18rem)', width: '100%' }}>
      <DataGrid
        rows={rowsWithIds}
        columns={columns}
        pageSize={50}
        rowsPerPageOptions={[25, 50, 100]}
        sx={{
          '.MuiDataGrid-columnHeader': {
            fontFamily: 'Tahoma',
            backgroundColor: '#1e293b', // slate-800
            color: '#ffffff',
            fontWeight: 600,
          },
          '.MuiDataGrid-columnHeaderTitle': {
            color: '#ffffff',
            fontWeight: 600,
          },
          '.MuiDataGrid-columnSeparator': {
            color: '#475569', // slate-600
          },
          '.MuiDataGrid-root': {
            border: '1px solid #e2e8f0', // slate-200
            borderRadius: '8px',
          },
        }}
      />
    </Box>
  );
};

export default Table;
