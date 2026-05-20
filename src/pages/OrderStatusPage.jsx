import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../supabase";

export default function OrderStatusPage({
  quotations = [],
  orders = [],
}) {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const ordersPerPage = 10;

  // =========================
  // FETCH ORDERS
  // =========================

  const fetchOrders = async () => {

    setLoading(true);

    const { data, error } =
      await supabase

        .from("order_status")

        .select("*")

        .order("created_at", {
          ascending: false,
        });

    if (!error) {

      setOrders(data || []);

    }

    setLoading(false);

  };

  useEffect(() => {

    fetchOrders();

  }, []);

  // =========================
  // STATUS COLORS
  // =========================

  const getStatusColor = (
    status
  ) => {

    switch (status) {

      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";

      case "preparing":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";

    }

  };

  // =========================
  // COUNTS
  // =========================

  const confirmedOrders =
    orders.filter(
      (o) =>
        o.status === "confirmed"
    );

  const pendingOrders =
    orders.filter(
      (o) =>
        o.status === "pending"
    );

  const preparingOrders =
    orders.filter(
      (o) =>
        o.status === "preparing"
    );

  const shippedOrders =
    orders.filter(
      (o) =>
        o.status === "shipped"
    );

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    orders.length / ordersPerPage
  );

  const paginatedOrders =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        ordersPerPage;

      const end =
        start + ordersPerPage;

      return orders.slice(
        start,
        end
      );

    }, [orders, currentPage]);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (
    id,
    status
  ) => {

    const { error } =
      await supabase

        .from("order_status")

        .update({
          status,
        })

        .eq("id", id);

    if (!error) {

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status,
              }
            : o
        )
      );

    }

  };

  // =========================
  // UPDATE COD
  // =========================

  const updateCOD = async (
    id,
    cod_amount
  ) => {

    await supabase

      .from("order_status")

      .update({
        cod_amount,
      })

      .eq("id", id);

  };

  // =========================
  // UPDATE AWB
  // =========================

  const updateAWB = async (
    id,
    awb_link
  ) => {

    await supabase

      .from("order_status")

      .update({
        awb_link,
      })

      .eq("id", id);

  };

  // =========================
  // BILL UPLOAD
  // =========================

  const uploadBill = async (
    e,
    order
  ) => {

    const file =
      e.target.files[0];

    if (!file) return;

    const fileName =
      `bill-${Date.now()}-${file.name}`;

    const { error } =
      await supabase.storage

        .from("bills")

        .upload(
          fileName,
          file
        );

    if (error) {

      alert(
        "Bill Upload Failed"
      );

      return;

    }

    const {
      data: publicUrlData,
    } = supabase.storage

      .from("bills")

      .getPublicUrl(
        fileName
      );

    await supabase

      .from("order_status")

      .update({
        bill_image:
          publicUrlData.publicUrl,
      })

      .eq("id", order.id);

    fetchOrders();

  };

  // =========================
  // QUOTATION IMAGE
  // =========================

  const uploadQuotationImage =
    async (
      e,
      order
    ) => {

      const file =
        e.target.files[0];

      if (!file) return;

      const fileName =
        `quotation-${Date.now()}-${file.name}`;

      const { error } =
        await supabase.storage

          .from("quotations")

          .upload(
            fileName,
            file
          );

      if (error) {

        alert(
          "Quotation Upload Failed"
        );

        return;

      }

      const {
        data: publicUrlData,
      } = supabase.storage

        .from("quotations")

        .getPublicUrl(
          fileName
        );

      await supabase

        .from("order_status")

        .update({
          quotation_image:
            publicUrlData.publicUrl,
        })

        .eq("id", order.id);

      fetchOrders();

    };

  return (

    <div className="space-y-8">

      {/* LOADING */}
      {loading && (

        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">

          <div className="bg-white px-8 py-5 rounded-3xl font-black text-xl">

            Loading...

          </div>

        </div>

      )}

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
              Order Status
            </h2>

            <p className="text-gray-500 mt-2">
              Manage all orders
            </p>

          </div>

          <div className="bg-black text-white px-5 py-3 rounded-2xl font-black">

            Total :
            {" "}
            {orders.length}

          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[1800px]">

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
                  COD
                </th>

                <th className="text-left px-6 py-5 text-sm font-black">
                  Status
                </th>

                <th className="text-left px-6 py-5 text-sm font-black">
                  AWB Link
                </th>

                <th className="text-left px-6 py-5 text-sm font-black">
                  Bill
                </th>

                <th className="text-left px-6 py-5 text-sm font-black">
                  Quotation Image
                </th>

                <th className="text-left px-6 py-5 text-sm font-black">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {paginatedOrders.map(
                (order) => (

                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                  >

                    {/* QUOTATION */}
                    <td className="px-6 py-5 font-black">
                      {
                        order.quotation_no ||
                        "N/A"
                      }
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-6 py-5 font-bold">
                      {
                        order.customer_name ||
                        "N/A"
                      }
                    </td>

                    {/* SALES PERSON */}
                    <td className="px-6 py-5">
                      {
                        order.sales_person ||
                        "N/A"
                      }
                    </td>

                    {/* AMOUNT */}
                    <td className="px-6 py-5 font-black">
                      ₹{
                        Number(
                          order.total_amount || 0
                        ).toLocaleString()
                      }
                    </td>

                    {/* COD */}
                    <td className="px-6 py-5">

                      <input
                        type="number"
                        defaultValue={
                          order.cod_amount || ""
                        }
                        onBlur={(e) =>
                          updateCOD(
                            order.id,
                            e.target.value
                          )
                        }
                        placeholder="COD"
                        className="w-28 h-11 rounded-2xl border border-gray-200 px-4 outline-none"
                      />

                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">

                      <select
                        value={
                          order.status
                        }
                        onChange={(e) =>
                          updateStatus(
                            order.id,
                            e.target.value
                          )
                        }
                        className={`h-11 rounded-2xl border px-4 font-bold outline-none ${getStatusColor(
                          order.status
                        )}`}
                      >

                        <option value="pending">
                          Pending
                        </option>

                        <option value="confirmed">
                          Confirmed
                        </option>

                        <option value="preparing">
                          Preparing
                        </option>

                        <option value="shipped">
                          Shipped
                        </option>

                      </select>

                    </td>

                    {/* AWB */}
                    <td className="px-6 py-5">

                      <input
                        type="text"
                        defaultValue={
                          order.awb_link || ""
                        }
                        onBlur={(e) =>
                          updateAWB(
                            order.id,
                            e.target.value
                          )
                        }
                        placeholder="Paste AWB Link"
                        className="w-64 h-11 rounded-2xl border border-gray-200 px-4 outline-none"
                      />

                    </td>

                    {/* BILL */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <label className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200">

                          📄

                          <input
                            type="file"
                            accept="image/*,.pdf"
                            hidden
                            onChange={(e) =>
                              uploadBill(
                                e,
                                order
                              )
                            }
                          />

                        </label>

                        {order.bill_image && (

                          <a
                            href={
                              order.bill_image
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="h-11 px-4 rounded-2xl bg-blue-500 text-white font-black flex items-center justify-center"
                          >
                            View
                          </a>

                        )}

                      </div>

                    </td>

                    {/* QUOTATION IMAGE */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <label className="w-12 h-12 rounded-2xl bg-green-500 text-black flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200">

                          🖼️

                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) =>
                              uploadQuotationImage(
                                e,
                                order
                              )
                            }
                          />

                        </label>

                        {order.quotation_image && (

                          <img
                            src={
                              order.quotation_image
                            }
                            alt="quotation"
                            className="w-14 h-14 rounded-2xl object-cover border"
                          />

                        )}

                      </div>

                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5">

                      <button
                        onClick={() =>
                          alert(
                            "Order Updated Successfully"
                          )
                        }
                        className="h-11 px-5 rounded-2xl bg-black text-white font-black hover:scale-[1.02] transition-all duration-200"
                      >
                        Save
                      </button>

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

          {/* PAGE */}
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
