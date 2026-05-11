import { useEffect, useState } from "react";

import {
  Navigate,
  useLocation
} from "react-router-dom";

import { supabase } from "../supabase";

import LoaderOverlay from "../components/LoaderOverlay";

export default function ProtectedRoute({
  children
}) {

  const location = useLocation();

  const [loading, setLoading] =
    useState(true);

  const [isAuthenticated,
    setIsAuthenticated] =
    useState(false);

  useEffect(() => {

    checkUser();

  }, []);

  // CHECK LOGIN
  const checkUser = async () => {

    try {

      // LOCAL USER
      const localUser =
        localStorage.getItem(
          "user"
        );

      // NO USER
      if (!localUser) {

        setIsAuthenticated(false);

        setLoading(false);

        return;
      }

      // CHECK SESSION
      const {
        data,
        error
      } = await supabase.auth.getSession();

      // SESSION INVALID
      if (
        error ||
        !data?.session
      ) {

        localStorage.removeItem(
          "user"
        );

        setIsAuthenticated(false);

        setLoading(false);

        return;
      }

      // VALID
      setIsAuthenticated(true);

      setLoading(false);

    } catch (err) {

      console.log(err);

      setIsAuthenticated(false);

      setLoading(false);
    }

  };

  // LOADING
  if (loading) {

    return (
      <LoaderOverlay text="Checking Access..." />
    );
  }

  // BLOCK ACCESS
  if (!isAuthenticated) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location
        }}
      />
    );
  }

  // ACCESS GRANTED
  return children;
}
