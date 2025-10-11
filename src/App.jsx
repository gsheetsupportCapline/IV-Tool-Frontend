import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Body from './components/Body';
import './App.css';

const App = () => {
  // Lifted state for MasterData to preserve across route changes
  const [masterDataState, setMasterDataState] = useState({
    dateRange: {
      startDate: null,
      endDate: null,
    },
    selectedDateType: '',
    data: [],
    loading: false,
    error: '',
  });

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Body
        masterDataState={masterDataState}
        setMasterDataState={setMasterDataState}
      />
    </LocalizationProvider>
  );
};

export default App;
