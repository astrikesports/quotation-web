import React, {
  useMemo,
  useState,
} from "react";

export default function OrderStatusPage({
  quotations = [],
}) {

  const [currentPage, setCurrentPage] =
    useState(1);

  const ordersPerPage = 10;

  // FILTERS
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

  const preparingOrders =
    quotations.filter(
      (q) =>
        q.status === "preparing"
    );

  const shippedOrders =
    quotations.filter(
      (q) =>
        q.status === "shipped"
    );

  // PAGINATION
  const totalPages = Math.ceil(
    confirmedOrders.length /
      ordersPerPage
  );

  const paginatedOrders =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        ordersPerPage;

      const end =
        start + ordersPerPage;

      return confirmedOrders.slice(
        start,
        end
      );

    }, [
      confirmedOrders,
      currentPage,
    ]);

  return (

    <div className="space-y-8">

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* CONFIRMED */}
        <div className="bg-green-500 rounded-[32px] p-8 text-black shadow-2xl">

          <p className="text-sm font-black tracking-[2px] uppercase">
            Confirmed
          </p>

          <h2 className="text-5xl font-black mt-4">
            {
              confirmedOrders.length
            }
          </h2>

        </div>

        {/* PENDING */}
        <div className="bg-yellow-400 rounded-[32px] p-8 text-black shadow-2xl">

          <p className="text-sm font-black tracking-[2px] uppercase">
            Pending
          </p>

          <h2 className="text-5xl font-black mt-4">
            {
              pendingOrders.length
            }
          </h2>

        </div>

        {/* PREPARING */}
        <div className="bg-orange-500 rounded-[32px] p-8 text-white shadow-2xl">

          <p className="text-sm font-black tracking-[2px] uppercase">
            Preparing
          </p>

          <h2 className="text-5xl font-black mt-4">
            {
              preparingOrders.length
            }
          </h2>

        </div>

        {/* SHIPPED */}
        <div className="bg-blue-500 rounded-[32px] p-8 text-white shadow-2xl">

          <p className="text-sm font-black tracking-[2px] uppercase">
            Shipped
          </p>

          <h2 className="text-5xl font-black mt-4">
            {
              shippedOrders.length
            }
          </h2>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">

          <div>

            <h2 className="text-3xl font-black">
              Confirmed Orders
            </h2>

            <p className="text-gray-500 mt-2">
              Showing confirmed orders
            </p>

          </div>

          <div className="bg-black text-white px-5 py-3 rounded-2xl font-black">

            Total :
            {" "}
            {
              confirmedOrders.length
            }

          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-black text-white">

              <tr>

                <th className="text-left px-6 py-5 text-sm font-black">
                  Quotation
                </th>

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

              {paginatedOrders.map(
                (q) => (

                  <tr
                    key={q.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                  >

                    {/* QUOTATION */}
                    <td className="px-6 py-5 font-black">
                      {
                        q.quotation_no ||
                        "N/A"
                      }
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-6 py-5 font-bold">
                      {
                        q.party ||
                        "N/A"
                      }
                    </td>

                    {/* SALES PERSON */}
                    <td className="px-6 py-5">
                      {
                        q.sales_person ||
                        "N/A"
                      }
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

        {/* PAGINATION */}
        <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-100">

          {/* PREV */}
          <button
            disabled={
              currentPage === 1
            }
            onClick={() =>
              setCurrentPage(
                currentPage - 1
              )
            }
            className={`h-12 px-5 rounded-2xl font-black ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-black text-white"
            }`}
          >
            Prev
          </button>

          {/* PAGE NUMBER */}
          <div className="h-12 px-6 rounded-2xl bg-green-500 text-black font-black flex items-center justify-center">

            {currentPage}
            {" / "}
            {totalPages || 1}

          </div>

          {/* NEXT */}
          <button
            disabled={
              currentPage ===
              totalPages
            }
            onClick={() =>
              setCurrentPage(
                currentPage + 1
              )
            }
            className={`h-12 px-5 rounded-2xl font-black ${
              currentPage ===
              totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-black text-white"
            }`}
          >
            Next
          </button>

        </div>

      </div>

    </div>

  );
}
