import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { siteRoutes, dashboardRoutes } from "./allroutes";

function ParamsExample({
  masterDataState,
  setMasterDataState,
  homeState,
  setHomeState,
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
}) {
  let token = localStorage.getItem("token");
  let userId = localStorage.getItem("loggedinUserId");
  let userRole = localStorage.getItem("role");

  console.log(
    "Router check - token:",
    !!token,
    "userId:",
    userId,
    "userRole:",
    userRole
  );

  // Check if user is authenticated - must have both token and userId
  const isAuthenticated =
    token &&
    token !== "null" &&
    token !== "" &&
    token.trim() !== "" &&
    userId &&
    userId !== "null" &&
    userId !== "" &&
    userId.trim() !== "";

  const SignInComponent = siteRoutes[0].component;

  return (
    <Router>
      <Switch>
        {/* Public Routes - redirect to /schedule-patient if already authenticated */}
        <Route exact path="/">
          {isAuthenticated ? (
            <Redirect to="/schedule-patient" />
          ) : (
            <SignInComponent />
          )}
        </Route>

        {/* Protected Routes */}
        {dashboardRoutes.map((route, index) => (
          <Route
            key={index}
            exact={route.exact}
            strict={route.strict}
            path={route.path}
            render={(props) => {
              console.log(
                `Rendering route: ${route.path}, isAuthenticated: ${isAuthenticated}, userRole: ${userRole}`
              );

              if (!isAuthenticated) {
                console.log("Not authenticated, redirecting to /");
                return <Redirect to="/" />;
              }

              // Check if route requires specific role
              if (route.requireRole && route.requireRole !== userRole) {
                console.log(
                  `Access denied. Required role: ${route.requireRole}, User role: ${userRole}`
                );
                // Redirect based on user role
                if (userRole === "admin") {
                  return <Redirect to="/schedule-patient" />;
                } else if (userRole === "user") {
                  return <Redirect to="/dashboard" />;
                } else {
                  return <Redirect to="/schedule-patient" />;
                }
              }

              const Component = route.component;

              // Determine which state to pass based on the route
              let componentProps = { ...props };

              if (route.path === "/schedule-patient") {
                componentProps = {
                  ...props,
                  pageState: homeState,
                  setPageState: setHomeState,
                };
              } else if (route.path === "/awaitingIV") {
                componentProps = {
                  ...props,
                  pageState: awaitingIVState,
                  setPageState: setAwaitingIVState,
                };
              } else if (route.path === "/request-rush") {
                componentProps = {
                  ...props,
                  pageState: rushState,
                  setPageState: setRushState,
                };
              } else if (route.path === "/admin") {
                componentProps = {
                  ...props,
                  pageState: adminState,
                  setPageState: setAdminState,
                };
              } else if (route.path === "/dashboard") {
                componentProps = {
                  ...props,
                  pageState: ivUsersState,
                  setPageState: setIvUsersState,
                };
              } else if (route.path === "/admin-dashboard") {
                componentProps = {
                  ...props,
                  pageState: adminDashboardState,
                  setPageState: setAdminDashboardState,
                };
              }

              return (
                <Component
                  {...componentProps}
                  masterDataState={masterDataState}
                  setMasterDataState={setMasterDataState}
                />
              );
            }}
          />
        ))}

        {/* Fallback redirect */}
        <Route path="*">
          {isAuthenticated ? (
            <Redirect to="/schedule-patient" />
          ) : (
            <Redirect to="/" />
          )}
        </Route>
      </Switch>
    </Router>
  );
}

export default ParamsExample;
