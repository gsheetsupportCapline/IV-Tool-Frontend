import { createBrowserRouter } from "react-router-dom";
import Browse from "./Browse";
import Login from "./Login";

import { RouterProvider } from "react-router-dom";
import Home from "./Home";

import Rush from "./Rush";
import PendingIV from "./PendingIV";
import AssignedIV from "./AssignedIV";
import Admin from "./Admin";
import PriorityIV from "./PriorityIV";
import IVUsers from "./IVUsers";

const Body = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/browse",
      element: <Browse />,
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/dashboard",
      element: <IVUsers />,
    },

    {
      path: "/schedule-patient",
      element: <Home />,
    },

    {
      path: "/request-rush",
      element: <Rush />,
    },

    {
      path: "/pendingIV",
      element: <PendingIV />,
    },
    {
      path: "/assignedIV",
      element: <AssignedIV />,
    },
    {
      path: "/admin",
      element: <Admin />,
    },
    {
      path: "/priorityIV",
      element: <PriorityIV />,
    },
  ]);
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
