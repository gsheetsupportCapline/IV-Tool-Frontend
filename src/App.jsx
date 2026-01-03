import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import Body from "./components/Body";
import "./App.css";

const App = () => {
  // Lifted state for MasterData to preserve across route changes
  const [masterDataState, setMasterDataState] = useState({
    dateRange: {
      startDate: null,
      endDate: null,
    },
    selectedDateType: "",
    data: [],
    loading: false,
    error: "",
  });

  // State for Home page (Check IV Status)
  const [homeState, setHomeState] = useState({
    selectedOffice: "",
    data: [],
    dateRange: {
      startDate: null,
      endDate: null,
    },
    patientIdInput: "",
    loading: false,
    error: false,
  });

  // State for AwaitingIV page (Information Needed from the Office)
  const [awaitingIVState, setAwaitingIVState] = useState({
    selectedOffice: "",
    data: [],
    dateRange: {
      startDate: null,
      endDate: null,
    },
    loading: false,
    error: false,
  });

  // State for Rush page (Request a Rush IV)
  const [rushState, setRushState] = useState({
    selectedOffice: "",
    dateRange: {
      startDate: null,
      endDate: null,
    },
    loading: false,
  });

  // State for Admin page (Assign IVs)
  const [adminState, setAdminState] = useState({
    selectedOffice: "",
    dateRange: {
      startDate: null,
      endDate: null,
    },
    data: [],
    loading: false,
  });

  // State for IVUsers page (Dashboard for users)
  const [ivUsersState, setIvUsersState] = useState({
    appointments: [],
    selectedAppointment: null,
    dateRange: {
      startDate: null,
      endDate: null,
    },
    loading: false,
  });

  // State for AdminDashboard page
  const [adminDashboardState, setAdminDashboardState] = useState({
    data: [],
    loading: false,
  });

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Body
        masterDataState={masterDataState}
        setMasterDataState={setMasterDataState}
        homeState={homeState}
        setHomeState={setHomeState}
        awaitingIVState={awaitingIVState}
        setAwaitingIVState={setAwaitingIVState}
        rushState={rushState}
        setRushState={setRushState}
        adminState={adminState}
        setAdminState={setAdminState}
        ivUsersState={ivUsersState}
        setIvUsersState={setIvUsersState}
        adminDashboardState={adminDashboardState}
        setAdminDashboardState={setAdminDashboardState}
      />
    </LocalizationProvider>
  );
};

export default App;
