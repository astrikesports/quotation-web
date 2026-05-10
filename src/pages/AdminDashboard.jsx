import { useEffect, useState } from "react";

import { supabase } from "../supabase";

import LoaderOverlay from "../components/LoaderOverlay";

export default function AdminDashboard() {

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");

  const [target, setTarget] = useState("");

  const [salesPersons, setSalesPersons] = useState([]);

  const [quotations, setQuotations] = useState([]);

  // LOAD DATA
  useEffect(() => {

    fetchSalesPersons();

  }, []);

  // FETCH DATA
  const fetchSalesPersons = async () => {

    setLoading(true);

    // SALES PERSONS
    const { data } = await supabase

      .from("sales_persons")

      .select("*")

      .order("id", {
        ascending: false
      });

    setSalesPersons(data || []);

    // QUOTATIONS
    const {
      data: quotationData
    } = await supabase

      .from("quotations")

      .select("*");

    setQuotations(
      quotationData || []
    );

    setLoading(false);
  };

  // TOTAL SALES
  const getTotalSales = () => {

    let total = 0;

    quotations.forEach((q) => {

      total += Number(
        q.net_amount || 0
      );

    });

    return total;
  };

  // TOTAL PROFIT
  const getProfit = () => {

    return (
      getTotalSales() * 0.095
    );
  };

  // PERSON SALES
  const getPersonSales = (name) => {

    let total = 0;

    quotations.forEach((q) => {

      if (
        q.sales_person === name
      ) {

        total += Number(
          q.net_amount || 0
        );
      }

    });

    return total;
  };

  // PROGRESS
  const getProgress = (
    sales,
    target
  ) => {

    if (!target) return 0;

    return Math.min(
      (
        (sales / target) *
        100
      ).toFixed(0),
      100
    );
  };

  // ADD SALES PERSON
  const addSalesPerson = async () => {

    if (!name || !target) {

      alert(
        "Enter name and target"
      );

      return;
    }

    setLoading(true);

    const { error } =
      await supabase

        .from("sales_persons")

        .insert([
          {
            name,
            target_amount: target
          }
        ]);

    setLoading(false);

    if (error) {

      alert(
        "Failed to add"
      );

      return;
    }

    setName("");

    setTarget("");

    fetchSalesPersons();
  };

  // UPDATE TARGET
  const updateTarget = async (
    id,
    value
  ) => {

    if (!value) return;

    setLoading(true);

    const { error } =
      await supabase

        .from("sales_persons")

        .update({
          target_amount: value
        })

        .eq("id", id);

    setLoading(false);

    if (error) {

      alert(
        "Failed to update target"
      );

      return;
    }

    fetchSalesPersons();
  };

  // DELETE
  const deleteSalesPerson =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this sales person?"
        );

      if (!confirmDelete)
        return;

      setLoading(true);

      const { error } =
        await supabase

          .from("sales_persons")

          .delete()

          .eq("id", id);

      setLoading(false);

      if (error) {

        alert(
          "Delete failed"
        );

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
      <div className="bg-gradient-to-r from-black to-gray-900 rounded-[32px] p-8 md:p-10 text-white shadow-2xl mb-8 overflow-hidden relative">

        <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>

            <p className="text-green-400 font-bold tracking-[4px] uppercase text-xs">
              ASTRIKE SPORTSWEAR
            </p>

            <h1 className="text-4xl md:text-6xl font-black mt-4 leading-tight">
              Admin Dashboard
            </h1>

            <p className="text-gray-300 mt-4 text-lg">
              Manage sales team & targets
            </p>

          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-w-[220px]">

            <p className="text-gray-300 text-sm font-semibold">
              TEAM MEMBERS
            </p>

            <h2 className="text-6xl font-black mt-2 text-green-400">
              {salesPersons.length}
            </h2>

          </div>

        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

        {/* SALES */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 font-semibold">
                Total Sales
              </p>

              <h2 className="text-4xl font-black mt-3">
                ₹{
                  getTotalSales()
                    .toLocaleString()
                }
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>

          </div>

        </div>

        {/* PROFIT */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 font-semibold">
                Profit
              </p>

              <h2 className="text-4xl font-black mt-3 text-green-600">
                ₹{
                  getProfit()
                    .toFixed(0)
                    .toLocaleString()
                }
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center text-2xl shadow-lg">
              📈
            </div>

          </div>

        </div>

        {/* ORDERS */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 font-semibold">
                Orders
              </p>

              <h2 className="text-4xl font-black mt-3">
                {
                  quotations.length
                }
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg">
              📦
            </div>

          </div>

        </div>

        {/* TEAM */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 font-semibold">
                Active Team
              </p>

              <h2 className="text-4xl font-black mt-3">
                {
                  salesPersons.length
                }
              </h2>

            </div>

            <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl shadow-lg">
              👥
            </div>

          </div>

        </div>

      </div>

      {/* ADD FORM */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 mb-8">

        <div className="mb-7">

          <h2 className="text-3xl font-black">
            Add Sales Person
          </h2>

          <p className="text-gray-500 mt-2">
            Create new sales executive
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* NAME */}
          <input
            type="text"
            placeholder="Sales Person Name"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-black text-lg font-semibold"
          />

          {/* TARGET */}
          <input
            type="number"
            placeholder="Monthly Target"
            value={target}
            onChange={(e) =>
              setTarget(
                e.target.value
              )
            }
            className="h-14 rounded-2xl border border-gray-200 px-5 outline-none focus:border-black text-lg font-semibold"
          />

          {/* BUTTON */}
          <button
            onClick={
              addSalesPerson
            }
            className="h-14 rounded-2xl bg-black text-white font-bold text-lg hover:scale-[1.02] transition-all duration-200 shadow-xl"
          >
            + Add Sales Person
          </button>

        </div>

      </div>

      {/* SALES PERSONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {salesPersons.map(
          (person) => {

            const sales =
              getPersonSales(
                person.name
              );

            const progress =
              getProgress(
                sales,
                person.target_amount
              );

            const profit =
              sales * 0.095;

            return (

              <div
                key={person.id}
                className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >

                {/* TOP */}
                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-3xl font-black leading-tight">
                      {person.name}
                    </h2>

                    <p className="text-gray-500 mt-2 font-medium">
                      Sales Executive
                    </p>

                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-black shadow-xl">
                    {
                      person.name?.charAt(
                        0
                      )
                    }
                  </div>

                </div>

                {/* SALES */}
                <div className="mt-8">

                  <p className="text-gray-500 font-semibold text-sm">
                    CURRENT SALES
                  </p>

                  <h3 className="text-4xl font-black mt-2">
                    ₹{
                      sales.toLocaleString()
                    }
                  </h3>

                  <p className="text-sm text-green-600 font-bold mt-2">
                    Profit ₹{
                      profit
                        .toFixed(0)
                        .toLocaleString()
                    }
                  </p>

                </div>

                {/* TARGET */}
                <div className="mt-8">

                  <div className="flex items-center justify-between mb-4">

                    <div>

                      <p className="text-gray-500 font-semibold text-sm">
                        MONTHLY TARGET
                      </p>

                      <h3 className="text-4xl font-black mt-2">
                        ₹{
                          Number(
                            person.target_amount || 0
                          ).toLocaleString()
                        }
                      </h3>

                    </div>

                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-2xl text-sm font-black">
                      ACTIVE
                    </div>

                  </div>

                  {/* EDIT BOX */}
                  <div className="bg-gray-50 border border-gray-200 rounded-3xl p-4">

                    <label className="text-xs font-black text-gray-400 tracking-[2px] uppercase">
                      Update Target
                    </label>

                    <input
                      type="number"
                      defaultValue={
                        person.target_amount
                      }
                      id={
                        "target-" +
                        person.id
                      }
                      className="w-full bg-transparent mt-3 text-3xl font-black outline-none"
                      placeholder="Enter Target"
                    />

                  </div>

                </div>

                {/* PROGRESS */}
                <div className="mt-7">

                  <div className="flex items-center justify-between mb-2">

                    <span className="text-sm text-gray-500 font-semibold">
                      Progress
                    </span>

                    <span className="font-black">
                      {progress}%
                    </span>

                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${progress}%`
                      }}
                    />

                  </div>

                </div>

                {/* BUTTONS */}
                <div className="mt-8 grid grid-cols-2 gap-4">

                  {/* SAVE */}
                  <button
                    onClick={() => {

                      const value =
                        document.getElementById(
                          "target-" +
                          person.id
                        ).value;

                      updateTarget(
                        person.id,
                        value
                      );
                    }}
                    className="h-14 rounded-2xl bg-black text-white font-black text-lg hover:scale-[1.02] transition-all duration-200 shadow-xl"
                  >
                    Save
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() =>
                      deleteSalesPerson(
                        person.id
                      )
                    }
                    className="h-14 rounded-2xl bg-red-500 text-white font-black text-lg hover:bg-red-600 transition-all duration-200 shadow-lg"
                  >
                    Delete
                  </button>

                </div>

              </div>
            );
          }
        )}

      </div>

    </div>
  );
}
