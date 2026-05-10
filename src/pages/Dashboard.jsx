import { useEffect, useState } from "react";

import { supabase } from "../supabase";

import AdminDashboard from "./AdminDashboard";

import SalesTeamDashboard from "./SalesTeamDashboard";

export default function Dashboard() {

  const [role, setRole] = useState(null);

  useEffect(() => {

    getUserRole();

  }, []);

  const getUserRole = async () => {

    // GET LOGGED USER
    const {

      data: { user }

    } = await supabase.auth.getUser();

    if (!user) return;

    // FETCH ROLE
    const { data } = await supabase

      .from("users")

      .select("role")

      .eq("id", user.id)

      .single();

    setRole(data?.role);
  };

  if (!role) {

    return <div>Loading...</div>;
  }

  if (role === "admin") {

    return <AdminDashboard />;
  }

  return <SalesTeamDashboard />;
}
