import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";

import Quotation from "./pages/Quotation";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        {/* PROTECTED */}
        <Route
          path="/dashboard"
          element={

            <ProtectedRoute>

              <Dashboard />

            </ProtectedRoute>

          }
        />

        <Route
          path="/quotation"
          element={

            <ProtectedRoute>

              <Quotation />

            </ProtectedRoute>

          }
        />

      </Routes>

    </BrowserRouter>

  );
}
