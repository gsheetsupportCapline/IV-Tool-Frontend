// import { createBrowserRouter } from "react-router-dom";
// import Browse from "./Browse";

// import { RouterProvider } from "react-router-dom";
// import Home from "./Home";

// import Rush from "./Rush";
// import PendingIV from "./PendingIV";
// import AssignedIV from "./AssignedIV";
// import Admin from "./Admin";

// import IVUsers from "./IVUsers";
// import ProductionIV from "./ProductionIV";
// import AwaitingIV from "./AwaitingIV";
// import AdminDashboard from "./AdminDashboard";
// import SignIn from "./SignIn";
import Routes from "../routes";
const Body = ({
  masterDataState,
  setMasterDataState,
  homeState,
  setHomeState,
  statusState,
  setStatusState,
  awaitingIVState,
  setAwaitingIVState,
  rushState,
  setRushState,
  adminState,
  setAdminState,
  ivUsersState,
  setIvUsersState,
  adminDashboardState,
  setAdminDashboardState,
  pendingIVState,
  setPendingIVState,
  assignedIVState,
  setAssignedIVState,
  productionIVState,
  setProductionIVState,
  userDashboardState,
  setUserDashboardState,
  smilepointIVInfoState,
  setSmilepointIVInfoState,
}) => {
  // const appRouter = createBrowserRouter([
  //   {
  //     path: "/",
  //     element: <SignIn />,
  //   },
  //   {
  //     path: "/browse",
  //     element: <Browse />,
  //   },
  //   {
  //     path: "/home",
  //     element: <Home />,
  //   },
  //   {
  //     path: "/dashboard",
  //     element: <IVUsers />,
  //   },

  //   {
  //     path: "/schedule-patient",
  //     element: <Home />,
  //   },

  //   {
  //     path: "/request-rush",
  //     element: <Rush />,
  //   },

  //   {
  //     path: "/pendingIV",
  //     element: <PendingIV />,
  //   },
  //   {
  //     path: "/assignedIV",
  //     element: <AssignedIV />,
  //   },
  //   {
  //     path: "/admin",
  //     element: <Admin />,
  //   },
  //   {
  //     path: "/productionIV",
  //     element: <ProductionIV />,
  //   },
  //   {
  //     path: "/awaitingIV",
  //     element: <AwaitingIV />,
  //   },
  //   {
  //     path: "/admin-dashboard",
  //     element: <AdminDashboard />,
  //   },
  //   {
  //     path: "/signin",
  //     element: <SignIn />,
  //   },
  // ]);
  return (
    <div>
      <Routes
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
    </div>
  );
};

export default Body;
