import AdminDashboard from "./AdminDashboard";
import SalesTeamDashboard from "./SalesTeamDashboard";

export default function Dashboard() {

  const role = localStorage.getItem("role");

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return <SalesTeamDashboard />;
}
