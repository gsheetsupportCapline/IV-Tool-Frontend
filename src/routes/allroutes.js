import Admin from "../components/Admin";
import AdminDashboard from "../components/AdminDashboard";
import AssignedIV from "../components/AssignedIV";
import AwaitingIV from "../components/AwaitingIV";
import Home from "../components/Home";
import PendingIV from "../components/PendingIV";
import ProductionIV from "../components/ProductionIV";
import Rush from "../components/Rush";
import SignIn from "../components/SignIn";
import IVUSers from "../components/IVUsers";
const dashboardRoutes = [
  { path: "/admin", exact: true, strict: true, component: Admin },
  { path: "/schedule-patient", exact: true, strict: true, component: Home },
  { path: "/request-rush", exact: true, strict: true, component: Rush },
  { path: "/pendingIV", exact: true, strict: true, component: PendingIV },
  { path: "/assignedIV", exact: true, strict: true, component: AssignedIV },
  { path: "/productionIV", exact: true, strict: true, component: ProductionIV },
  { path: "/awaitingIV", exact: true, strict: true, component: AwaitingIV },
  {
    path: "/admin-dashboard",
    exact: true,
    strict: true,
    component: AdminDashboard,
  },
  { path: "/signin", exact: true, strict: true, component: SignIn },
  { path: "/dashboard", exact: true, strict: true, component: IVUSers },
];

const siteRoutes = [
  {
    path: "/",
    exact: true,
    strict: true,
    component: SignIn,
  },
];

export { siteRoutes, dashboardRoutes };
