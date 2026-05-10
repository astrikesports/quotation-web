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

    setName("");

    setTarget("");

    fetchSalesPersons();
  };

  // UPDATE TARGET
  const updateTarget = async (id, value) => {

    if (!value) return;

    const { error } = await supabase

      .from("sales_persons")

      .update({
        target_amount: value
      })

      .eq("id", id);

    if (error) {

      alert("Failed to update");

      return;
    }

    fetchSalesPersons();
  };

  // DELETE
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

    fetchSalesPersons();
  };

  return (

    <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8">

      {/* LOADER */}
      {loading && (
        <LoaderOverlay text="Processing..." />
      )}

      {/* TOP BAR */}
      <div className="bg-gradient-to-r from-black to-gray-900 rounded-3xl p-8 text-white shadow-2xl mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>

            <p className="text-green-400 font-semibold tracking-wide uppercase text-sm">
              ASTRIKE SPORTSWEAR
            </p>

            <h1 className="text-4xl md:text-5xl font-black mt-3 leading-tight">
              Admin Dashboard
            </h1>

            <p className="text-gray-300 mt-3 text-lg">
              Manage your sales team, targets & performance
            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/10">

            <p className="text-sm text-gray-300">
              Total Team Members
            </p>

            <h2 className="text-5xl font-black mt-2 text-green-400">
              {salesPersons.length}
            </h2>

          </div>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 font-medium">
                Total Sales
              </p>

              <h2 className="text-4xl font-black mt-3">
                ₹61L
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl">
              💰
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 font-medium">
                Total Profit
              </p>

              <h2 className="text-4xl font-black mt-3 text-green-600">
                ₹6.5L
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center text-2xl">
              📈
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 font-medium">
                Orders
              </p>

              <h2 className="text-4xl font-black mt-3">
                248
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl">
              📦
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 font-medium">
                Team Members
              </p>

              <h2 className="text-4xl font-black mt-3">
                {salesPersons.length}
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl">
              👥
            </div>

          </div>

        </div>

      </div>

      {/* ADD FORM */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-6">

          <div>

            <h2 className="text-3xl font-black">
              Add Sales Person
            </h2>

            <p className="text-gray-500 mt-1">
              Create new sales team member
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* NAME */}
          <input
            type="text"
            placeholder="Sales Person Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-black"
          />

          {/* TARGET */}
          <input
            type="number"
            placeholder="Monthly Target"
            value={target}
            onChange={(e) =>
              setTarget(e.target.value)
            }
            className="h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-black"
          />

          {/* BUTTON */}
          <button
            onClick={addSalesPerson}
            className="h-14 rounded-2xl bg-black text-white font-bold hover:scale-[1.02] transition-all"
          >
            + Add Sales Person
          </button>

        </div>

      </div>

      {/* SALES PERSONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {salesPersons.map((person) => (

          <div
            key={person.id}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
          >

            {/* TOP */}
            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-black">
                  {person.name}
                </h2>

                <p className="text-gray-500 mt-1">
                  Sales Executive
                </p>

              </div>

              <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-black shadow-lg">
                {person.name?.charAt(0)}
              </div>

            </div>

            {/* TARGET */}
            <div className="mt-8">

              <div className="flex items-center justify-between mb-3">

                <p className="text-gray-500 font-medium">
                  Monthly Target
                </p>

                <p className="font-bold text-green-600">
                  Active
                </p>

              </div>

              <input
                type="number"
                defaultValue={person.target_amount}
                onBlur={(e) =>
                  updateTarget(
                    person.id,
                    e.target.value
                  )
                }
                className="w-full h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-black font-bold text-lg"
              />

            </div>

            {/* TARGET BAR */}
            <div className="mt-6">

              <div className="flex items-center justify-between mb-2">

                <span className="text-sm text-gray-500">
                  Progress
                </span>

                <span className="font-bold">
                  0%
                </span>

              </div>

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                <div className="h-full w-[0%] bg-green-500 rounded-full" />

              </div>

            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex gap-3">

              <button
                onClick={() =>
                  deleteSalesPerson(person.id)
                }
                className="flex-1 h-12 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
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
