import { createBrowserRouter } from "react-router-dom";
import Browse from "./Browse";
import Login from "./Login";

import { RouterProvider } from "react-router-dom";
import Home from "./Home";
import IVUser from "./IVUser";
import Rush from "./Rush";
import PendingIV from "./PendingIV";

const Body = () => {
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/browse",
      element: <Browse />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/dashboard",
      element: <IVUser />,
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
  ]);
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
