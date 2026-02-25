import { useEffect, useState } from "react";
import { deletePaymentImages } from "../services/paymentImageService";
import {
  deleteQuotation,
  fetchQuotationById
} from "../services/quotationService";
import { generateQuotationPDF } from "../utils/pdfService";
import LoadQuotationModal from "./LoadQuotationModal";

import {
  createQuotation,
  updateQuotation
} from "../services/quotationService";

  export default function Header({
  onNewQuotation,
  onRefreshSku,
  pdfData = {},          // ✅ default
  setPdfData,
  setLoading,
  setLoadingText,
  setConfirm,
  }) {

  const [showLoad, setShowLoad] = useState(false);
    
  /* ================= EXISTING FUNCTIONS (UNCHANGED) ================= */
  const handleSave = async () => {
  try {
  /* ================= VALIDATION (DIALOG BASED) ================= */

  if (!pdfData.party || pdfData.party.trim() === "") {
  setConfirm({
  open: true,
  title: "Missing Party Name",
  message: "Party name is required to save quotation.",
  onConfirm: () => setConfirm({ open: false }) // 👈 ONLY OK
  });
  return;
  }

  if (!Array.isArray(pdfData.items) || pdfData.items.length === 0) {
  setConfirm({
  open: true,
  title: "No Items Added",
  message: "Please add at least one item before saving.",
  onConfirm: () => setConfirm({ open: false }) // 👈 ONLY OK
  });
  return;
  }

  const hasValidItem = pdfData.items.some(it =>
  it &&
  it.desc &&
  String(it.desc).trim() !== "" &&
  Number(it.pcs || 0) > 0 &&
  Number(it.rate || 0) > 0
  );

  if (!hasValidItem) {
  setConfirm({
  open: true,
  title: "Invalid Items",
  message: "Each item must have description, PCS and rate.",
  onConfirm: () => setConfirm({ open: false }) // 👈 ONLY OK
  });
  return;
  }

  /* ================= ORIGINAL CODE (UNCHANGED) ================= */

  setLoading(true);
  setLoadingText("Saving quotation & generating PDF...");

  // ✅ 1️⃣ CLEAN DATA
  const cleanItems = pdfData.items.map(it => ({
  ...it,
  size: typeof it.size === "string" ? it.size : ""
  }));

  const payload = {
  ...pdfData,
  items: cleanItems,
  paymentImages: []
  };

  // ✅ 2️⃣ SAVE
  const saved = pdfData.id
  ? await updateQuotation(pdfData.id, payload)
  : await createQuotation(payload);

  // ✅ 3️⃣ SYNC STATE
  setPdfData(saved);

  // ✅ 4️⃣ GENERATE PDF (with images)
  await generateQuotationPDF({
  ...saved,
  paymentImages: pdfData.paymentImages
  });

  } catch (err) {
  console.error("SAVE ERROR:", err);
  setConfirm({
  open: true,
  title: "Save Failed",
  message: "Something went wrong while saving quotation.",
  onConfirm: () => setConfirm({ open: false }) // 👈 ONLY OK
  });
  } finally {
  setLoading(false);
  }
  };


  const handleRefresh = () => {
  setConfirm({
  open: true,
  title: "Refresh Sheet",
  message: "Refresh Google Sheet data? This may update item rates.",
  onConfirm: async () => {
  try {
  setConfirm({ open: false });
  setLoading(true);
  setLoadingText("Refreshing Sheet...");

  await onRefreshSku();

  setLoading(false);

  // ✅ SUCCESS DIALOG (NO ALERT)
  setConfirm({
  open: true,
  title: "Refresh Complete",
  message: "Google Sheet data refreshed successfully.",
  onConfirm: () => setConfirm({ open: false })
  });

  } catch (err) {
  setLoading(false);

  // ❌ ERROR DIALOG (NO ALERT)
  setConfirm({
  open: true,
  title: "Refresh Failed",
  message: "Failed to refresh Google Sheet data.",
  onConfirm: () => setConfirm({ open: false })
  });

  console.error("REFRESH ERROR:", err);
  }
  }
  });
  };

  /* LOAD SELECT */
  const handleLoadSelect = async (id) => {
  try {
  setLoading(true);
  setLoadingText("Loading Quotation...");

  const data = await fetchQuotationById(id);
  setPdfData(prev => ({
  ...prev,
  ...data,
  paymentImages: data.paymentImages || [] // 🔥 URLs only
  }));


  setTimeout(() => {
  setLoading(false);
  setShowLoad(false);
  }, 300);
  } catch {
  setLoading(false);
  }
  };


  const handleNewQuotation = () => {
  setLoading(true);
  setLoadingText("Creating New Quotation...");

  setTimeout(() => {
  onNewQuotation();
  setLoading(false);
  }, 300);
  };



  /* HANDLE DELETE */
  const handleDelete = async (quotation) => {
  return new Promise((resolve, reject) => {
  setConfirm({
  open: true,
  title: "Delete Quotation",
  message: "This quotation will be permanently deleted.",
  onConfirm: async () => {
  try {
  setConfirm({ open: false });
  setLoading(true);
  setLoadingText("Deleting quotation...");
  
  // delete quotation
  const imageUrls = await deleteQuotation(quotation.id);
  
  // delete images
  await deletePaymentImages(imageUrls);
  
  setLoading(false);
  resolve();   // 🔥 IMPORTANT
  } catch (err) {
  setLoading(false);
  console.error(err);
  reject(err);
  }
  }
  });
  });
  };





  return (
  <>
  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center shadow">

  {/* LEFT */}
  <div>
  <h1 className="text-xl font-bold">ASTRIKE SPORTSWEAR</h1>
  <p className="text-sm text-blue-100">
  Quotation Management System
  </p>
  </div>

  {/* RIGHT */}
  <div className="flex gap-2 items-center">

  
  {/* PINCODE SEARCH */}
  <div className="relative">
    <input
      type="text"
      placeholder="Pincode"
      value={pincode}
      onChange={(e) => setPincode(e.target.value)}
      className="w-56 pr-16 px-3 py-2 rounded text-black text-sm"
    />
  
    {/* CHECK BUTTON INSIDE INPUT */}
    <button
      onClick={checkPincode}
      className="absolute right-1 top-1 bottom-1 px-3 rounded bg-green-500 text-white text-sm font-semibold"
    >
      Check
    </button>
  
    {/* RESULT TOOLTIP */}
    {pincodeResult && (
      <div className="absolute top-full left-2 mt-2 z-50">
        <div className="relative bg-black text-white text-xs px-3 py-2 rounded shadow-lg">
          
          {/* Arrow */}
          <div className="absolute -top-2 left-4 w-0 h-0 
            border-l-8 border-r-8 border-b-8 
            border-l-transparent border-r-transparent border-b-black" />
  
          {pincodeResult.status === "Location Not Available" ? (
            <>
              <div className="font-bold text-red-500">
                Location Not Available
              </div>
              <div className="text-gray-300">
                {pincodeResult.party}
              </div>
            </>
          ) : (
            <div className="text-green-400 font-semibold">
              Location Available
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  <button
  onClick={handleNewQuotation}
  className="px-3 py-2 text-sm rounded bg-white text-blue-700 font-semibold"
  >
  + New Quotation
  </button>

  <button
  onClick={() => setShowLoad(true)}
  className="px-3 py-2 text-sm rounded bg-blue-900/40 font-semibold"
  >
  Load Old Quotation
  </button>

  <button
  onClick={handleRefresh}
  className="px-4 py-2 text-sm rounded bg-yellow-400 text-black font-semibold"
  >
  🔄 Refresh Sheet
  </button>

  <button
  onClick={handleSave}
  className="px-4 py-2 text-sm rounded bg-blue-900/40 font-semibold"
  >
  💾 Save & Download PDF
  </button>

  </div>
  </div>

  {/* LOAD POPUP */}
  {showLoad && (
  <LoadQuotationModal
  onClose={() => setShowLoad(false)}
  onSelect={handleLoadSelect}
  onDelete={handleDelete}
  />

  )}
  </>
  );
  }
