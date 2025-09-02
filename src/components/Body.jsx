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
const Body = () => {
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
      <Routes />
    </div>
  );
};

export default Body;
