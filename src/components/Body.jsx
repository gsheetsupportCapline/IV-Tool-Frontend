import { createBrowserRouter } from "react-router-dom";
import Browse from "./Browse";
import Login from "./Login";
import Dashboard from "./Dashboard";
import { RouterProvider } from "react-router-dom";
import Home from "./Home";

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
      path: "dashboard",
      element: <Dashboard />,
    },
  ]);
  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  );
};

export default Body;
