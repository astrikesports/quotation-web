import { useEffect, useState } from "react";

import { Navigate } from "react-router-dom";

import { supabase } from "../supabase";

export default function ProtectedRoute({ children }) {

  const [loading, setLoading] = useState(true);

  const [session, setSession] = useState(null);

  useEffect(() => {

    supabase.auth.getSession().then(({ data }) => {

      setSession(data.session);

      setLoading(false);
    });

  }, []);

  if (loading) {

    return <div>Loading...</div>;
  }

  if (!session) {

    return <Navigate to="/login" replace />;
  }

  return children;
}
