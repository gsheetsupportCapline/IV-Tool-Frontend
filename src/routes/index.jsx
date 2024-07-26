import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { siteRoutes, dashboardRoutes } from "./allroutes";

function ParamsExample() {
  let userId = localStorage.getItem("loggedinUserId");
  console.log("check paramexample");

  function PrivateRoute({ children, ...rest }) {
    return (
      <Route
        {...rest}
        render={({ location }) =>
          userId !== 0 ? (
            children
          ) : (
            <Redirect to={{ pathname: "/", state: { from: location } }} />
          )
        }
      />
    );
  }

  return (
    <Router>
      <Switch>
        {siteRoutes.map((routes, i) => {
          return (
            <Route
              key={i}
              path={routes.path}
              exact={routes.exact}
              strict={routes.strict}
              children={<routes.component />}
            />
          );
        })}
        <PrivateRoute path="/">
          <Switch>
            {dashboardRoutes.map((routes, i) => {
              return (
                <Route
                  key={i}
                  path={routes.path}
                  exact={routes.exact}
                  strict={routes.strict}
                  // eslint-disable-next-line react/no-children-prop
                  children={<routes.component />}
                />
              );
            })}
          </Switch>
        </PrivateRoute>
      </Switch>
    </Router>
  );
}

export default ParamsExample;
