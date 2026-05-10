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

  // UPDATE TARGET
  const updateTarget = async (id, value) => {

    if (!value) return;

    setLoading(true);

    const { error } = await supabase

      .from("sales_persons")

      .update({
        target_amount: value
      })

      .eq("id", id);

    setLoading(false);

    if (error) {

      alert("Failed to update target");

      return;
    }

    // RELOAD
    fetchSalesPersons();
  };

  // DELETE SALES PERSON
  const deleteSalesPerson = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this sales person?"
      );

    if (!confirmDelete) return;

    setLoading(true);

    const { error } = await supabase

      .from("sales_persons")

      .delete()

      .eq("id", id);

    setLoading(false);

    if (error) {

      alert("Delete failed");

      return;
    }

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
      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Sales Team Management
          </p>

        </div>

      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

        <div className="bg-white p-5 rounded-xl shadow">

          <p className="text-gray-500">
            Total Sales
          </p>

          <h2 className="text-3xl font-bold mt-2">
            ₹61,00,000
          </h2>

        </div>

        <div className="bg-white p-5 rounded-xl shadow">

          <p className="text-gray-500">
            Total Profit
          </p>

          <h2 className="text-3xl font-bold text-green-600 mt-2">
            ₹6,50,000
          </h2>

        </div>

        <div className="bg-white p-5 rounded-xl shadow">

          <p className="text-gray-500">
            Orders
          </p>

          <h2 className="text-3xl font-bold mt-2">
            248
          </h2>

        </div>

        <div className="bg-white p-5 rounded-xl shadow">

          <p className="text-gray-500">
            Sales Team
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {salesPersons.length}
          </h2>

        </div>

      </div>

      {/* ADD SALES PERSON */}
      <div className="bg-white p-5 rounded-xl shadow mb-8">

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
            className="bg-green-600 text-white rounded px-5 py-3 font-bold hover:bg-green-700"
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

              <p className="text-gray-500 text-sm mb-2">
                Monthly Target
              </p>

              <input
                type="number"
                defaultValue={person.target_amount}
                onBlur={(e) =>
                  updateTarget(
                    person.id,
                    e.target.value
                  )
                }
                className="w-full border rounded px-4 py-3 outline-none"
              />

            </div>

            {/* ACTIONS */}
            <div className="mt-5 flex gap-3">

              <button
                onClick={() =>
                  deleteSalesPerson(person.id)
                }
                className="flex-1 bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
