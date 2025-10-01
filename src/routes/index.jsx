import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { siteRoutes, dashboardRoutes } from './allroutes';

function ParamsExample() {
  let userId = localStorage.getItem('loggedinUserId');
  let userRole = localStorage.getItem('role');

  console.log('Router check - userId:', userId, 'userRole:', userRole);

  // Check if user is authenticated
  const isAuthenticated =
    userId && userId !== 'null' && userId !== '' && userId.trim() !== '';

  return (
    <Router>
      <Switch>
        {/* Public Routes */}
        <Route exact path="/" component={siteRoutes[0].component} />

        {/* Protected Routes */}
        {dashboardRoutes.map((route, index) => (
          <Route
            key={index}
            exact={route.exact}
            strict={route.strict}
            path={route.path}
            render={(props) => {
              console.log(
                `Rendering route: ${route.path}, isAuthenticated: ${isAuthenticated}`
              );

              if (!isAuthenticated) {
                console.log('Not authenticated, redirecting to /');
                return <Redirect to="/" />;
              }

              const Component = route.component;
              return <Component {...props} />;
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
