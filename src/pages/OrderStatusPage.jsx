import React from "react";

export default function OrderStatusPage({
  quotations = [],
}) {

  const confirmedOrders =
    quotations.filter(
      (q) =>
        q.status === "confirmed"
    );

  const pendingOrders =
    quotations.filter(
      (q) =>
        q.status === "pending"
    );

  const shippedOrders =
    quotations.filter(
      (q) =>
        q.status === "shipped"
    );

  return (

    <div className="space-y-8">

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CONFIRMED */}
        <div className="bg-green-500 rounded-[32px] p-8 text-black shadow-2xl">

          <p className="text-sm font-black tracking-[2px] uppercase">
            Confirmed Orders
          </p>

          <h2 className="text-5xl font-black mt-4">
            {confirmedOrders.length}
          </h2>

        </div>

        {/* PENDING */}
        <div className="bg-yellow-400 rounded-[32px] p-8 text-black shadow-2xl">

          <p className="text-sm font-black tracking-[2px] uppercase">
            Pending Orders
          </p>

          <h2 className="text-5xl font-black mt-4">
            {pendingOrders.length}
          </h2>

        </div>

        {/* SHIPPED */}
        <div className="bg-blue-500 rounded-[32px] p-8 text-white shadow-2xl">

          <p className="text-sm font-black tracking-[2px] uppercase">
            Shipped Orders
          </p>

          <h2 className="text-5xl font-black mt-4">
            {shippedOrders.length}
          </h2>

        </div>

      </div>

      {/* CONFIRMED TABLE */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100">

          <h2 className="text-3xl font-black">
            Confirmed Orders
          </h2>

          <p className="text-gray-500 mt-2">
            All confirmed quotation data
          </p>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-black text-white">

              <tr>

                <th className="text-left px-6 py-5 text-sm font-black">
                  Customer
                </th>

                <th className="text-left px-6 py-5 text-sm font-black">
                  Sales Person
                </th>

                <th className="text-left px-6 py-5 text-sm font-black">
                  Amount
                </th>

                <th className="text-left px-6 py-5 text-sm font-black">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {confirmedOrders.map(
                (q) => (

                  <tr
                    key={q.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                  >

                    {/* CUSTOMER */}
                    <td className="px-6 py-5 font-bold">
                      {q.customer_name ||
                        "N/A"}
                    </td>

                    {/* SALES PERSON */}
                    <td className="px-6 py-5">
                      {q.sales_person ||
                        "N/A"}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-6 py-5 font-black">
                      ₹{
                        Number(
                          q.net_amount || 0
                        ).toLocaleString()
                      }
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">

                      <div className="inline-flex items-center px-4 py-2 rounded-2xl bg-green-100 text-green-700 text-sm font-black">

                        Confirmed

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );
}
