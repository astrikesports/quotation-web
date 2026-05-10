import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../supabase";

import LoaderOverlay from "../components/LoaderOverlay";

export default function Dashboard() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [salesPersons, setSalesPersons] = useState([]);

  const [quotations, setQuotations] = useState([]);

  const [selectedPerson, setSelectedPerson] =
    useState(null);

  // LOAD DATA
  useEffect(() => {

    fetchData();

  }, []);

  // FETCH DATA
  const fetchData = async () => {

    setLoading(true);

    // SALES PERSONS
    const {
      data: salesData
    } = await supabase

      .from("sales_persons")

      .select("*")

      .order("id", {
        ascending: false
      });

    // QUOTATIONS
    const {
      data: quotationData
    } = await supabase

      .from("quotations")

      .select("*")

      .order("id", {
        ascending: false
      });

    setSalesPersons(salesData || []);

    setQuotations(quotationData || []);

    setLoading(false);
  };

  // GET PERSON QUOTATIONS
  const getPersonQuotations = (name) => {

    return quotations.filter(
      (q) => q.sales_person === name
    );
  };

  // CALCULATE SALES
  const calculateSales = (name) => {
  
    const personQuotations =
      getPersonQuotations(name);
  
    let total = 0;
  
    personQuotations.forEach((q) => {
  
      total += Number(
        q.net_amount || 0
      );
  
    });
  
    return total;
  };  

  return (

    <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8">

      {/* LOADER */}
      {loading && (
        <LoaderOverlay text="Loading Dashboard..." />
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
              Sales Dashboard
            </h1>

            <p className="text-gray-300 mt-4 text-lg">
              Team Performance Overview
            </p>

          </div>

        </div>

      </div>

      {/* SALES PERSON CARDS */}
      {!selectedPerson && (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          {salesPersons.map((person) => {

            const personQuotations =
              getPersonQuotations(person.name);

            const totalSales =
              calculateSales(person.name);

            const target =
              Number(person.target_amount || 0);

            const percent =
              target > 0
                ? Math.min(
                    (
                      (totalSales / target) *
                      100
                    ).toFixed(0),
                    100
                  )
                : 0;

            return (

              <div
                key={person.id}
                onClick={() =>
                  setSelectedPerson(person)
                }
                className="bg-white rounded-[32px] p-6 shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-gray-100"
              >

                {/* TOP */}
                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-3xl font-black">
                      {person.name}
                    </h2>

                    <p className="text-gray-500 mt-2 font-medium">
                      Sales Executive
                    </p>

                  </div>

                  <div className="w-16 h-16 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-black shadow-xl">
                    {person.name?.charAt(0)}
                  </div>

                </div>

                {/* SALES */}
                <div className="mt-8">

                  <p className="text-gray-500 font-semibold text-sm">
                    TOTAL SALES
                  </p>

                  <h3 className="text-4xl font-black mt-2">
                    ₹{totalSales.toLocaleString()}
                  </h3>

                </div>

                {/* TARGET */}
                <div className="mt-6">

                  <div className="flex items-center justify-between mb-2">

                    <span className="text-gray-500 text-sm font-semibold">
                      Target
                    </span>

                    <span className="font-black">
                      ₹{target.toLocaleString()}
                    </span>

                  </div>

                  {/* BAR */}
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${percent}%`
                      }}
                    />

                  </div>

                  <div className="flex justify-between mt-2">

                    <span className="text-sm text-gray-500">
                      Completion
                    </span>

                    <span className="font-black text-green-600">
                      {percent}%
                    </span>

                  </div>

                </div>

                {/* QUOTATIONS */}
                <div className="mt-6 flex items-center justify-between bg-gray-50 rounded-2xl p-4">

                  <div>

                    <p className="text-sm text-gray-500 font-semibold">
                      Quotations
                    </p>

                    <h4 className="text-2xl font-black mt-1">
                      {personQuotations.length}
                    </h4>

                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl shadow-lg">
                    📄
                  </div>

                </div>

              </div>
            );
          })}

        </div>

      )}

      {/* DETAIL PAGE */}
      {selectedPerson && (

        <div className="mt-2">

          {/* TOP */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

            {/* LEFT */}
            <div className="flex items-center gap-4">

              {/* BACK */}
              <button
                onClick={() =>
                  setSelectedPerson(null)
                }
                className="w-14 h-14 rounded-2xl bg-black text-white text-2xl font-black shadow-xl hover:scale-[1.02] transition-all"
              >
                ←
              </button>

              <div>

                <h2 className="text-5xl font-black">
                  {selectedPerson.name}
                </h2>

                <p className="text-gray-500 mt-2 text-lg">
                  Sales Performance & Quotations
                </p>

              </div>

            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-4">

              {/* TOTAL QUOTATIONS */}
              <div className="bg-black text-white px-8 py-5 rounded-3xl shadow-2xl">

                <p className="text-gray-300 text-sm font-semibold">
                  TOTAL QUOTATIONS
                </p>

                <h3 className="text-5xl font-black mt-2">
                  {
                    getPersonQuotations(
                      selectedPerson.name
                    ).length
                  }
                </h3>

              </div>

              {/* NEW QUOTATION BUTTON */}
              <button
                onClick={() => {

                  // SAVE SALES PERSON
                  localStorage.setItem(
                    "selectedSalesPerson",
                    selectedPerson.name
                  );

                  // REDIRECT
                  navigate("/quotation");
                }}
                className="h-14 px-8 rounded-2xl bg-green-500 text-white font-black text-lg hover:scale-[1.02] transition-all duration-200 shadow-xl"
              >
                + New Quotation
              </button>

            </div>

          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* SALES */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">

              <p className="text-gray-500 font-semibold">
                Total Sales
              </p>

              <h2 className="text-5xl font-black mt-3">
                ₹{calculateSales(
                  selectedPerson.name
                ).toLocaleString()}
              </h2>

            </div>

            {/* TARGET */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">

              <p className="text-gray-500 font-semibold">
                Monthly Target
              </p>

              <h2 className="text-5xl font-black mt-3">
                ₹{Number(
                  selectedPerson.target_amount || 0
                ).toLocaleString()}
              </h2>

            </div>

            {/* COMPLETION */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">

              <p className="text-gray-500 font-semibold">
                Completion
              </p>

              <h2 className="text-5xl font-black mt-3 text-green-600">

                {Number(
                  selectedPerson.target_amount
                ) > 0

                  ? Math.min(
                      (
                        (calculateSales(
                          selectedPerson.name
                        ) /

                          Number(
                            selectedPerson.target_amount
                          )) *

                        100
                      ).toFixed(0),
                      100
                    )

                  : 0}%

              </h2>

            </div>

          </div>

          {/* TABLE */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-black text-white">

                  <tr>

                    <th className="text-left p-5 font-bold">
                      Party
                    </th>

                    <th className="text-left p-5 font-bold">
                      Phone
                    </th>

                    <th className="text-left p-5 font-bold">
                      Address
                    </th>

                    <th className="text-left p-5 font-bold">
                      Items
                    </th>

                    <th className="text-left p-5 font-bold">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {getPersonQuotations(
                    selectedPerson.name
                  ).map((quote) => (

                    <tr
                      key={quote.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >

                      <td className="p-5 font-bold">
                        {quote.party}
                      </td>

                      <td className="p-5">
                        {quote.phone}
                      </td>

                      <td className="p-5">
                        {quote.address}
                      </td>

                      <td className="p-5 font-semibold">
                        {quote.items?.length || 0}
                      </td>

                      <td className="p-5 text-gray-500">
                        {new Date(
                          quote.created_at
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
