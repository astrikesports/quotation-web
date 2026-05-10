import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../supabase";

import LoaderOverlay from "../components/LoaderOverlay";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      // CHECK USER FROM TABLE
      const {

        data,
        error

      } = await supabase

        .from("users")

        .select("*")

        .eq("email", email)

        .eq("password", password)

        .single();

      // INVALID LOGIN
      if (error || !data) {

        alert("Invalid Email or Password");

        return;
      }

      // SAVE USER
      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );

      // REDIRECT
      navigate("/dashboard");

    }

    catch (err) {

      alert("Something went wrong");
    }

    finally {

      setLoading(false);
    }
  };

  return (

    <div className="h-screen flex items-center justify-center bg-gray-100">

      {/* LOADER */}
      {loading && (
        <LoaderOverlay text="Logging in..." />
      )}

      <div className="bg-white w-[420px] rounded shadow p-8">

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-center mb-6">
          Login
        </h1>

        {/* FORM */}
        <form onSubmit={handleLogin}>

          {/* EMAIL */}
          <div className="mb-4">

            <label className="block mb-2 font-semibold">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border rounded px-4 py-3 outline-none focus:border-green-600"
              required
            />

          </div>

          {/* PASSWORD */}
          <div className="mb-5">

            <label className="block mb-2 font-semibold">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border rounded px-4 py-3 outline-none focus:border-green-600"
              required
            />

          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition"
          >
            Login
          </button>

        </form>

        {/* FOOTER */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ASTRIKE SPORTSWEAR PVT LTD
        </p>

      </div>

    </div>
  );
}
