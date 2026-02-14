import { useState } from "react";
import { deletePaymentImages } from "../services/paymentImageService";
import {
  deleteQuotation,
  fetchQuotationById,
  createQuotation,
  updateQuotation
} from "../services/quotationService";
import { generateQuotationPDF } from "../utils/pdfService";
import LoadQuotationModal from "./LoadQuotationModal";

export default function Header({
  onNewQuotation,
  onRefreshSku,
  pdfData = {},
  setPdfData,
  setLoading,
  setLoadingText,
  setConfirm,
}) {
  const [showLoad, setShowLoad] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      if (!pdfData.party?.trim()) {
        setConfirm({
          open: true,
          title: "Missing Party Name",
          message: "Party name is required.",
          onConfirm: () => setConfirm({ open: false })
        });
        return;
      }

      if (!pdfData.items?.length) {
        setConfirm({
          open: true,
          title: "No Items Added",
          message: "Please add at least one item.",
          onConfirm: () => setConfirm({ open: false })
        });
        return;
      }

      setLoading(true);
      setLoadingText("Saving & generating PDF...");

      const payload = {
        ...pdfData,
        items: pdfData.items.map(it => ({
          ...it,
          size: typeof it.size === "string" ? it.size : ""
        })),
        paymentImages: []
      };

      const saved = pdfData.id
        ? await updateQuotation(pdfData.id, payload)
        : await createQuotation(payload);

      setPdfData(saved);

      await generateQuotationPDF({
        ...saved,
        paymentImages: pdfData.paymentImages
      });

    } catch (err) {
      console.error(err);
      setConfirm({
        open: true,
        title: "Save Failed",
        message: "Something went wrong.",
        onConfirm: () => setConfirm({ open: false })
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTHER ACTIONS ================= */
  const handleRefresh = () => {
    setConfirm({
      open: true,
      title: "Refresh Sheet",
      message: "Refresh Google Sheet data?",
      onConfirm: async () => {
        setConfirm({ open: false });
        setLoading(true);
        setLoadingText("Refreshing...");
        await onRefreshSku();
        setLoading(false);
      }
    });
  };

  const handleNewQuotation = () => {
    setOpenDrawer(false);
    onNewQuotation();
  };

  /* ================= UI ================= */
  return (
    <>
      {/* 🔥 HEADER BAR */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex justify-between items-center shadow">

        {/* LEFT */}
        <div>
          <h1 className="text-lg md:text-xl font-bold">ASTRIKE SPORTSWEAR</h1>
          <p className="text-xs md:text-sm text-blue-100 hidden md:block">
            Quotation Management System
          </p>
        </div>

        {/* RIGHT DESKTOP */}
        <div className="hidden md:flex gap-2 items-center">
          <button onClick={handleNewQuotation} className="btn-white">
            + New Quotation
          </button>
          <button onClick={() => setShowLoad(true)} className="btn-dark">
            Load Old
          </button>
          <button onClick={handleRefresh} className="btn-yellow">
            🔄 Refresh
          </button>
          <button onClick={handleSave} className="btn-dark">
            💾 Save & PDF
          </button>
        </div>

        {/* RIGHT MOBILE */}
        <div className="flex md:hidden gap-2 items-center">
          <button
            onClick={handleSave}
            className="px-3 py-2 rounded bg-white text-blue-700 font-semibold text-sm"
          >
            💾 PDF
          </button>

          <button
            onClick={() => setOpenDrawer(true)}
            className="px-3 py-2 rounded bg-blue-900/40 text-white text-lg"
          >
            ☰
          </button>
        </div>
      </div>

      {/* 🔥 MOBILE DRAWER */}
      {openDrawer && (
        <div className="fixed inset-0 z-[200] bg-black/40">
          <div className="absolute right-0 top-0 h-full w-[260px] bg-white shadow-lg p-4 space-y-3">

            <button
              onClick={() => setOpenDrawer(false)}
              className="text-right w-full text-gray-500"
            >
              ✕ Close
            </button>

            <button onClick={handleNewQuotation} className="drawer-btn">
              ➕ New Quotation
            </button>

            <button
              onClick={() => {
                setShowLoad(true);
                setOpenDrawer(false);
              }}
              className="drawer-btn"
            >
              📂 Load Old Quotation
            </button>

            <button onClick={handleRefresh} className="drawer-btn">
              🔄 Refresh Sheet
            </button>
          </div>
        </div>
      )}

      {/* LOAD MODAL */}
      {showLoad && (
        <LoadQuotationModal
          onClose={() => setShowLoad(false)}
          onSelect={async (id) => {
            setLoading(true);
            setLoadingText("Loading...");
            const data = await fetchQuotationById(id);
            setPdfData({ ...data, paymentImages: data.paymentImages || [] });
            setLoading(false);
            setShowLoad(false);
          }}
          onDelete={async (q) => {
            const urls = await deleteQuotation(q.id);
            await deletePaymentImages(urls);
          }}
        />
      )}
    </>
  );
}

/* 🔥 BUTTON STYLES */
const btn = "px-3 py-2 text-sm rounded font-semibold";
