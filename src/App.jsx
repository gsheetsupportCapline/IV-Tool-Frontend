import { useState } from "react";
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

  // State for Status component within Home page
  const [statusState, setStatusState] = useState({
    selectedOption: "yes",
    columnFilters: {},
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
    columnFilters: {},
    sortConfig: { key: null, direction: "desc" },
    noteRemarks: "",
  });

  // State for AdminDashboard page
  const [adminDashboardState, setAdminDashboardState] = useState({
    data: [],
    loading: false,
  });

  // State for AdminDashboard tabs - Pending IV
  const [pendingIVState, setPendingIVState] = useState({
    dateRange: {
      startDate: null,
      endDate: null,
    },
    data: [],
    loading: false,
    officeNames: [],
  });

  // State for AdminDashboard tabs - Assigned IV
  const [assignedIVState, setAssignedIVState] = useState({
    users: [],
    appointments: {},
    selectedUserId: "",
    selectedOffice: "",
    assignedCounts: [],
    dateRange: {
      startDate: null,
      endDate: null,
    },
    loading: false,
    officeNames: [],
  });

  // State for AdminDashboard tabs - Production IV
  const [productionIVState, setProductionIVState] = useState({
    users: [],
    dateRange: {
      startDate: null,
      endDate: null,
    },
    data: [],
    userIdToUserMap: {},
    dateType: "appointmentDate",
    officeNames: [],
    loading: false,
  });

  // State for User Dashboard (ProductionIV for regular users)
  const [userDashboardState, setUserDashboardState] = useState({
    users: [],
    dateRange: {
      startDate: null,
      endDate: null,
    },
    data: [],
    userIdToUserMap: {},
    dateType: "appointmentDate",
    officeNames: [],
    loading: false,
  });

  // State for AdminDashboard tabs - Smilepoint IV Info
  const [smilepointIVInfoState, setSmilepointIVInfoState] = useState({
    dateRange: {
      startDate: null,
      endDate: null,
    },
    data: [],
    loading: false,
    error: null,
    dateType: "appointmentDate",
    ivType: "Normal",
    detailView: {
      isOpen: false,
      title: "",
      detailData: [],
      officeName: "",
      category: "",
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Body
        masterDataState={masterDataState}
        setMasterDataState={setMasterDataState}
        homeState={homeState}
        setHomeState={setHomeState}
        statusState={statusState}
        setStatusState={setStatusState}
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
        pendingIVState={pendingIVState}
        setPendingIVState={setPendingIVState}
        assignedIVState={assignedIVState}
        setAssignedIVState={setAssignedIVState}
        productionIVState={productionIVState}
        setProductionIVState={setProductionIVState}
        userDashboardState={userDashboardState}
        setUserDashboardState={setUserDashboardState}
        smilepointIVInfoState={smilepointIVInfoState}
        setSmilepointIVInfoState={setSmilepointIVInfoState}
      />
    </LocalizationProvider>
  );
};

export default App;
