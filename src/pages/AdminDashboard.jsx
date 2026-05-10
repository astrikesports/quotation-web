import { useEffect, useState } from "react";

import { supabase } from "../supabase";

import LoaderOverlay from "../components/LoaderOverlay";

export default function AdminDashboard() {

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");

  const [target, setTarget] = useState("");

  const [salesPersons, setSalesPersons] = useState([]);

  // LOAD DATA
  useEffect(() => {

    fetchSalesPersons();

  }, []);

  // FETCH SALES PERSONS
  const fetchSalesPersons = async () => {

    setLoading(true);

    const { data } = await supabase

      .from("sales_persons")

      .select("*")

      .order("id", { ascending: false });

    setSalesPersons(data || []);

    setLoading(false);
  };

  // ADD SALES PERSON
  const addSalesPerson = async () => {

    if (!name || !target) {

      alert("Enter name and target");

      return;
    }

    setLoading(true);

    const { error } = await supabase

      .from("sales_persons")

      .insert([
        {
          name,
          target_amount: target
        }
      ]);

    setLoading(false);

    if (error) {

      alert("Failed to add");

      return;
    }

    // RESET
    setName("");

    setTarget("");

    // RELOAD
    fetchSalesPersons();
  };

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      {/* LOADER */}
      {loading && (
        <LoaderOverlay text="Processing..." />
      )}

      {/* TITLE */}
      <h1 className="text-4xl font-bold mb-6">
        Admin Dashboard
      </h1>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

        <div className="bg-white p-5 rounded shadow">

          <p>Total Sales</p>

          <h2 className="text-3xl font-bold mt-2">
            ₹61,00,000
          </h2>

        </div>

        <div className="bg-white p-5 rounded shadow">

          <p>Total Profit</p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            ₹6,50,000
          </h2>

        </div>

        <div className="bg-white p-5 rounded shadow">

          <p>Orders</p>

          <h2 className="text-3xl font-bold mt-2">
            248
          </h2>

        </div>

        <div className="bg-white p-5 rounded shadow">

          <p>Sales Team</p>

          <h2 className="text-3xl font-bold mt-2">
            {salesPersons.length}
          </h2>

        </div>

      </div>

      {/* ADD SALES PERSON */}
      <div className="bg-white p-5 rounded shadow mb-8">

        <h2 className="text-2xl font-bold mb-5">
          Add Sales Person
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* NAME */}
          <input
            type="text"
            placeholder="Sales Person Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="border rounded px-4 py-3 outline-none"
          />

          {/* TARGET */}
          <input
            type="number"
            placeholder="Target Amount"
            value={target}
            onChange={(e) =>
              setTarget(e.target.value)
            }
            className="border rounded px-4 py-3 outline-none"
          />

          {/* BUTTON */}
          <button
            onClick={addSalesPerson}
            className="bg-green-600 text-white rounded px-5 py-3 font-bold"
          >
            Add Sales Person
          </button>

        </div>

      </div>

      {/* SALES PERSON LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">

        {salesPersons.map((person) => (

          <div
            key={person.id}
            className="bg-white rounded-xl p-5 shadow"
          >

            {/* TOP */}
            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold">
                {person.name}
              </h2>

              <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold">
                {person.name?.charAt(0)}
              </div>

            </div>

            {/* TARGET */}
            <div className="mt-5">

              <p className="text-gray-500 text-sm">
                Monthly Target
              </p>

              <h3 className="text-2xl font-bold mt-2">
                ₹{Number(person.target_amount).toLocaleString()}
              </h3>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
