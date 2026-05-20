import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import OrderStatusPage from "./OrderStatusPage";
import ConfirmDialog from "../components/ConfirmDialog";
import LoaderOverlay from "../components/LoaderOverlay";

export default function AdminDashboard() {

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");

  const [target, setTarget] = useState("");

  const [salesPersons, setSalesPersons] = useState([]);

  const [quotations, setQuotations] = useState([]);

  const [products, setProducts] =
  useState([]);

  const [uploadingCsv, setUploadingCsv] =
    useState(false);

  const [activePage, setActivePage] =
    useState("dashboard");
  
  const [dialogOpen, setDialogOpen] =
  useState(false);

  const [dialogConfig, setDialogConfig] =
    useState({});

  // LOAD
  useEffect(() => {
    fetchProducts();
    fetchSalesPersons();

  }, []);

  // FETCH

  // =========================
  // FETCH PRODUCTS
  // =========================
  
  const fetchProducts = async () => {
  
    const { data, error } =
      await supabase
        .from("products")
        .select("*")
        .order("id", {
          ascending: false,
        });
  
    if (!error) {
  
      setProducts(data || []);
  
    }
  };

  // SALES PERSONS
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

      // ONLY CONFIRMED
      if (
        q.status !==
        "confirmed"
      ) return;
    
      total += Number(
        q.net_amount || 0
      );
    
    });

    return total;
  };

  // PROFIT
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

        q.sales_person === name &&
      
        q.status === "confirmed"
      
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

  // =========================
  // SAMPLE CSV DOWNLOAD START
  // =========================
  
  const downloadSampleCSV = () => {
    const sampleData = [
      ["product_name", "M", "L", "XL", "2XL"],
      ["QR25", "20", "15", "10", "5"],
      ["TRACK01", "50", "40", "25", "10"],
    ];
  
    const csvContent = sampleData
      .map((row) => row.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
  
    const url =
      window.URL.createObjectURL(blob);
  
    const link =
      document.createElement("a");
  
    link.href = url;
  
    link.setAttribute(
      "download",
      "inventory_sample.csv"
    );
  
    document.body.appendChild(link);
  
    link.click();
  
    document.body.removeChild(link);
  };
  
  // =========================
  // SAMPLE CSV DOWNLOAD END
  // =========================
  
  
  // =========================
  // CSV UPLOAD START
  // =========================
  
  const handleCSVUpload = async (e) => {
  
    const file = e.target.files[0];
  
    if (!file) return;
  
    setUploadingCsv(true);
  
    try {
  
      const text = await file.text();
  
      const rows = text.split("\n");
  
      const headers = rows[0]
        .split(",")
        .map((h) => h.trim());
  
      for (let i = 1; i < rows.length; i++) {
  
        if (!rows[i].trim())
          continue;
  
        const cols = rows[i]
          .split(",")
          .map((c) => c.trim());
  
        const productName = cols[0];
  
        const variants = {};
  
        for (let j = 1; j < headers.length; j++) {
  
          const size = headers[j];
  
          const qty = Number(
            cols[j] || 0
          );
  
          variants[size] = {
            qty,
          };
        }
  
        // CHECK EXISTING PRODUCT
        const {
          data: existingProduct
        } = await supabase
          .from("products")
          .select("*")
          .eq(
            "product_name",
            productName
          )
          .single();
  
        // UPDATE IF EXISTS
        if (existingProduct) {
  
          await supabase
            .from("products")
            .update({
              variants,
            })
            .eq(
              "id",
              existingProduct.id
            );
  
        } else {
  
          // INSERT NEW
          await supabase
            .from("products")
            .insert([
              {
                product_name:
                  productName,
  
                variants,
              },
            ]);
        }
      }
  
      setDialogConfig({
        title: "Success",
        message:
          "Inventory Uploaded Successfully",
        confirmText: "OK",
        onConfirm: () =>
          setDialogOpen(false),
      });
  
      setDialogOpen(true);
  
      fetchProducts();
  
    } catch (err) {
  
      console.log(err);
  
      setDialogConfig({
        title: "CSV Error",
        message:
          "CSV parsing failed",
        confirmText: "OK",
        onConfirm: () =>
          setDialogOpen(false),
      });
  
      setDialogOpen(true);
  
    } finally {
  
      setUploadingCsv(false);
  
    }
  };
  
  // =========================
  // CSV UPLOAD END
  // =========================
  
  return (

    <div className="min-h-screen bg-[#f4f6f8] p-4 md:p-8">

      {/* LOADER */}
      {loading && (
        <LoaderOverlay text="Processing..." />
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-r from-black to-gray-900 rounded-[32px] p-8 md:p-10 text-white shadow-2xl mb-8 overflow-hidden relative">

        {/* BG */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* LEFT */}
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

            {/* NAV BUTTONS */}
            <div className="flex flex-wrap gap-3 mt-8">

              <button
                onClick={() =>
                  setActivePage("dashboard")
                }
                className={`h-12 px-6 rounded-2xl font-bold transition-all duration-200 ${
                  activePage === "dashboard"
                    ? "bg-green-500 text-black shadow-2xl"
                    : "bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20"
                }`}
              >
                📊 Dashboard
              </button>

              <button
                onClick={() =>
                  setActivePage("sales")
                }
                className={`h-12 px-6 rounded-2xl font-bold transition-all duration-200 ${
                  activePage === "sales"
                    ? "bg-green-500 text-black shadow-2xl"
                    : "bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20"
                }`}
              >
                👥 Sales Persons
              </button>

              <button
                onClick={() =>
                  setActivePage("inventory")
                }
                className={`h-12 px-6 rounded-2xl font-bold transition-all duration-200 ${
                  activePage === "inventory"
                    ? "bg-green-500 text-black shadow-2xl"
                    : "bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20"
                }`}
              >
                📦 Inventory
              </button>

              <button
                onClick={() =>
                  setActivePage("items")
                }
                className={`h-12 px-6 rounded-2xl font-bold transition-all duration-200 ${
                  activePage === "items"
                    ? "bg-green-500 text-black shadow-2xl"
                    : "bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20"
                }`}
              >
                ➕ Add Items
              </button>

              <button
                onClick={() =>
                  setActivePage("order-status")
                }
                className={`h-12 px-6 rounded-2xl font-bold transition-all duration-200 ${
                  activePage === "order-status"
                    ? "bg-green-500 text-black shadow-2xl"
                    : "bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20"
                }`}
              >
                🚚 Order Status
              </button>

            </div>

          </div>

          {/* RIGHT STATS */}
          <div className="grid grid-cols-1 gap-4 min-w-[320px]">
          
            {/* TOTAL TARGET */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
          
              <div className="flex items-center justify-between">
          
                <div>
          
                  <p className="text-gray-400 text-xs font-bold tracking-[2px]">
                    TOTAL TARGET
                  </p>
          
                  <h2 className="text-4xl font-black mt-2 text-white">
          
                    ₹{
          
                      salesPersons
          
                        .reduce(
                          (acc, person) =>
          
                            acc +
                            Number(
                              person.target_amount || 0
                            ),
          
                          0
                        )
          
                        .toLocaleString()
          
                    }
          
                  </h2>
          
                </div>
          
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-2xl">
                  🎯
                </div>
          
              </div>
          
            </div>
          
            {/* REMAINING */}
            <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-3xl p-5 shadow-2xl">
            
              <div className="flex items-center justify-between">
            
                <div>
            
                  <p className="text-black/70 text-xs font-black tracking-[2px]">
                    REMAINING TARGET
                  </p>
            
                  <h2 className="text-4xl font-black mt-2 text-black">
            
                    ₹{
            
                      (
                        salesPersons.reduce(
                          (acc, person) =>
            
                            acc +
                            Number(
                              person.target_amount || 0
                            ),
            
                          0
                        ) -
            
                        getTotalSales()
            
                      ).toLocaleString()
            
                    }
            
                  </h2>
            
                </div>
            
                <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center text-2xl">
                  🔥
                </div>
            
              </div>
            
            </div>
          
          </div>

        </div>

      </div>

      {/* DASHBOARD PAGE */}
      {activePage === "dashboard" && (
      
        <div className="space-y-8">
      
          {/* TOP STATS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      
            {/* TOTAL SALES */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
      
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
      
            {/* PROFIT */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
      
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
      
            {/* ORDERS */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
      
              <p className="text-gray-500 font-semibold">
                Confirmed Orders
              </p>
      
              <h2 className="text-4xl font-black mt-3">
      
                {
                  quotations.filter(
                    q =>
                      q.status ===
                      "confirmed"
                  ).length
                }
      
              </h2>
      
            </div>
      
            {/* TEAM */}
            <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
      
              <p className="text-gray-500 font-semibold">
                Active Team
              </p>
      
              <h2 className="text-4xl font-black mt-3">
                {
                  salesPersons.length
                }
              </h2>
      
            </div>
      
          </div>
      
          {/* ORDER ANALYTICS */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          
            {/* HEADER */}
            <div className="px-8 py-6 border-b border-gray-100">
          
              <h2 className="text-3xl font-black">
                Order Analytics
              </h2>
          
              <p className="text-gray-500 mt-2">
                Live order status summary
              </p>
          
            </div>
          
            {/* GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          
              {/* TODAY CONFIRMED */}
              <div className="p-8 border-b xl:border-b-0 xl:border-r border-gray-100">
          
                <div className="flex items-start justify-between">
          
                  <div>
          
                    <p className="text-gray-500 text-sm font-semibold">
                      Today Confirmed
                    </p>
          
                    <h2 className="text-5xl font-black mt-3 text-green-500">
          
                      {
                        orders.filter(
                          (o) =>
                            o.status ===
                              "confirmed" &&
                            o.created_at
                              ?.split(" ")[0] ===
                              new Date()
                                .toISOString()
                                .split("T")[0]
                        ).length
                      }
          
                    </h2>
          
                    {/* AMOUNT */}
                    <div className="mt-6">
          
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        Amount
                      </p>
          
                      <h3 className="text-2xl font-black text-green-600 mt-1">
          
                        ₹{
          
                          orders
          
                            .filter(
                              (o) =>
                                o.status ===
                                  "confirmed" &&
                                o.created_at
                                  ?.split(" ")[0] ===
                                  new Date()
                                    .toISOString()
                                    .split("T")[0]
                            )
          
                            .reduce(
                              (acc, o) =>
                                acc +
                                Number(
                                  o.total_amount || 0
                                ),
                              0
                            )
          
                            .toLocaleString()
          
                        }
          
                      </h3>
          
                    </div>
          
                  </div>
          
                  <div className="w-16 h-16 rounded-3xl bg-green-500 text-black flex items-center justify-center text-3xl">
                    ✅
                  </div>
          
                </div>
          
              </div>
          
              {/* TOTAL SHIPPED */}
              <div className="p-8 border-b xl:border-b-0 xl:border-r border-gray-100">
          
                <div className="flex items-start justify-between">
          
                  <div>
          
                    <p className="text-gray-500 text-sm font-semibold">
                      Total Shipped
                    </p>
          
                    <h2 className="text-5xl font-black mt-3 text-blue-600">
          
                      {
                        orders.filter(
                          (o) =>
                            o.status ===
                            "shipped"
                        ).length
                      }
          
                    </h2>
          
                    {/* AMOUNT */}
                    <div className="mt-6">
          
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        Amount
                      </p>
          
                      <h3 className="text-2xl font-black text-blue-600 mt-1">
          
                        ₹{
          
                          orders
          
                            .filter(
                              (o) =>
                                o.status ===
                                "shipped"
                            )
          
                            .reduce(
                              (acc, o) =>
                                acc +
                                Number(
                                  o.total_amount || 0
                                ),
                              0
                            )
          
                            .toLocaleString()
          
                        }
          
                      </h3>
          
                    </div>
          
                  </div>
          
                  <div className="w-16 h-16 rounded-3xl bg-blue-500 text-white flex items-center justify-center text-3xl">
                    🚚
                  </div>
          
                </div>
          
              </div>
          
              {/* TOTAL PENDING */}
              <div className="p-8 border-b md:border-b-0 xl:border-r border-gray-100">
          
                <div className="flex items-start justify-between">
          
                  <div>
          
                    <p className="text-gray-500 text-sm font-semibold">
                      Total Pending
                    </p>
          
                    <h2 className="text-5xl font-black mt-3 text-yellow-500">
          
                      {
                        orders.filter(
                          (o) =>
                            o.status ===
                            "pending"
                        ).length
                      }
          
                    </h2>
          
                    {/* AMOUNT */}
                    <div className="mt-6">
          
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        Amount
                      </p>
          
                      <h3 className="text-2xl font-black text-yellow-500 mt-1">
          
                        ₹{
          
                          orders
          
                            .filter(
                              (o) =>
                                o.status ===
                                "pending"
                            )
          
                            .reduce(
                              (acc, o) =>
                                acc +
                                Number(
                                  o.total_amount || 0
                                ),
                              0
                            )
          
                            .toLocaleString()
          
                        }
          
                      </h3>
          
                    </div>
          
                  </div>
          
                  <div className="w-16 h-16 rounded-3xl bg-yellow-400 text-black flex items-center justify-center text-3xl">
                    ⏳
                  </div>
          
                </div>
          
              </div>
          
              {/* TOTAL PREPARING */}
              <div className="p-8">
          
                <div className="flex items-start justify-between">
          
                  <div>
          
                    <p className="text-gray-500 text-sm font-semibold">
                      Total Preparing
                    </p>
          
                    <h2 className="text-5xl font-black mt-3 text-orange-500">
          
                      {
                        orders.filter(
                          (o) =>
                            o.status ===
                            "preparing"
                        ).length
                      }
          
                    </h2>
          
                    {/* AMOUNT */}
                    <div className="mt-6">
          
                      <p className="text-xs text-gray-400 font-semibold uppercase">
                        Amount
                      </p>
          
                      <h3 className="text-2xl font-black text-orange-500 mt-1">
          
                        ₹{
          
                          orders
          
                            .filter(
                              (o) =>
                                o.status ===
                                "preparing"
                            )
          
                            .reduce(
                              (acc, o) =>
                                acc +
                                Number(
                                  o.total_amount || 0
                                ),
                              0
                            )
          
                            .toLocaleString()
          
                        }
          
                      </h3>
          
                    </div>
          
                  </div>
          
                  <div className="w-16 h-16 rounded-3xl bg-orange-500 text-white flex items-center justify-center text-3xl">
                    📋
                  </div>
          
                </div>
          
              </div>
          
            </div>
          
          </div>
          
        </div>

        )}

      {/* SALES PAGE */}
      {activePage === "sales" && (

        <>

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

                      {/* EDIT */}
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

        </>

      )}

      {/* INVENTORY PAGE */}
      {activePage === "inventory" && (
      
        <div className="space-y-6">
      
          {/* TOP */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          
              {/* LEFT */}
              <div>
          
                <h2 className="text-4xl font-black">
                  Inventory
                </h2>
          
                <p className="text-gray-500 mt-3 text-lg">
                  Current live inventory stock
                </p>
          
                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-4 mt-6">
          
                  {/* DOWNLOAD */}
                  <button
                    onClick={
                      downloadSampleCSV
                    }
                    className="h-14 px-6 rounded-2xl bg-black text-white font-black hover:scale-[1.02] transition-all duration-200"
                  >
                    ⬇ Download Sample CSV
                  </button>
          
                  {/* UPLOAD */}
                  <label className="h-14 px-6 rounded-2xl bg-green-500 text-black font-black flex items-center justify-center cursor-pointer hover:scale-[1.02] transition-all duration-200">
          
                    {uploadingCsv
                      ? "Uploading..."
                      : "⬆ Bulk Upload CSV"}
          
                    <input
                      type="file"
                      accept=".csv"
                      onChange={
                        handleCSVUpload
                      }
                      hidden
                    />
          
                  </label>
          
                </div>
          
              </div>
          
              {/* RIGHT */}
              <div className="bg-black text-white rounded-3xl px-6 py-5 min-w-[220px]">
          
                <p className="text-xs tracking-[3px] uppercase text-gray-400 font-bold">
                  Total Products
                </p>
          
                <h2 className="text-5xl font-black mt-2">
                  {products.length}
                </h2>
          
              </div>
          
            </div>
          
          </div>
      
          {/* TABLE */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      
            <div className="overflow-x-auto">
      
              <table className="w-full">
      
                {/* HEAD */}
                <thead className="bg-black text-white">
      
                  <tr>
      
                    <th className="text-left px-6 py-5 text-sm font-black">
                      Product
                    </th>
      
                    <th className="text-left px-6 py-5 text-sm font-black">
                      Total Stock
                    </th>
      
                    <th className="text-left px-6 py-5 text-sm font-black">
                      Sizes Inventory
                    </th>
      
                    <th className="text-left px-6 py-5 text-sm font-black">
                      Status
                    </th>
      
                  </tr>
      
                </thead>
      
                {/* BODY */}
                <tbody>
      
                  {products.map((product) => {
      
                    // SAFE VARIANTS
                    let variants = {};
      
                    try {
      
                      if (
                        typeof product.variants === "string"
                      ) {
      
                        variants = JSON.parse(
                          product.variants || "{}"
                        );
      
                      } else if (
                        typeof product.variants === "object" &&
                        product.variants !== null
                      ) {
      
                        variants = product.variants;
      
                      }
      
                    } catch (err) {
      
                      variants = {};
      
                    }
      
                    // TOTAL STOCK
                    let totalStock = 0;
      
                    Object.values(variants).forEach(
                      (v) => {
      
                        totalStock += Number(
                          v?.qty || 0
                        );
      
                      }
                    );
      
                    return (
      
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                      >
      
                        {/* PRODUCT */}
                        <td className="px-6 py-5 min-w-[250px]">
      
                          <div>
      
                            <h2 className="text-lg font-black break-words">
                              {product.product_name ||
                                "No Name"}
                            </h2>
      
                            <p className="text-gray-500 text-sm mt-1">
                              Product ID :
                              {" "}
                              {product.id}
                            </p>
      
                          </div>
      
                        </td>
      
                        {/* TOTAL */}
                        <td className="px-6 py-5">
      
                          <div className="text-3xl font-black">
                            {totalStock}
                          </div>
      
                        </td>
      
                        {/* SIZES */}
                        <td className="px-6 py-5 min-w-[400px]">
      
                          {Object.keys(variants).length === 0 ? (
      
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-2xl text-sm font-bold inline-block">
                              No Inventory
                            </div>
      
                          ) : (
      
                            <div className="flex flex-wrap gap-2">
      
                              {Object.entries(
                                variants
                              ).map(
                                ([size, data]) => {
      
                                  const qty =
                                    Number(
                                      data?.qty || 0
                                    );
      
                                  return (
      
                                    <div
                                      key={size}
                                      className={`px-4 py-2 rounded-2xl text-sm font-black border ${
                                        qty <= 5
                                          ? "bg-red-50 border-red-200 text-red-600"
                                          : qty <= 20
                                          ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                                          : "bg-gray-50 border-gray-200 text-black"
                                      }`}
                                    >
      
                                      {size} :
                                      {" "}
                                      {qty}
      
                                    </div>
                                  );
                                }
                              )}
      
                            </div>
      
                          )}
      
                        </td>
      
                        {/* STATUS */}
                        <td className="px-6 py-5">
      
                          <div
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-black ${
                              totalStock <= 5
                                ? "bg-red-100 text-red-600"
                                : totalStock <= 20
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
      
                            {totalStock <= 5
                              ? "Low"
                              : totalStock <= 20
                              ? "Medium"
                              : "Good"}
      
                          </div>
      
                        </td>
      
                      </tr>
                    );
                  })}
      
                </tbody>
      
              </table>
      
            </div>
      
          </div>
      
        </div>
      
      )}

      {/* ITEMS PAGE */}
      {activePage === "items" && (

        <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">

          <h2 className="text-4xl font-black">
            Add Items
          </h2>

          <p className="text-gray-500 mt-3 text-lg">
            Item management coming soon...
          </p>

        </div>

      )}

      {/* ORDER STATUS PAGE */}
      {activePage === "order-status" && (
        <OrderStatusPage
          quotations={quotations}
        />
      )}

    </div>
  );
}
