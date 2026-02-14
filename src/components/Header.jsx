import { useState } from "react";
import {
  createQuotation,
  updateQuotation,
  fetchQuotationById,
  deleteQuotation
} from "../services/quotationService";
import { deletePaymentImages } from "../services/paymentImageService";
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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
          title: "No Items",
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

    } catch (e) {
      console.error(e);
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

  const handleLoadSelect = async (id) => {
    setLoading(true);
    setLoadingText("Loading Quotation...");
    const data = await fetchQuotationById(id);
    setPdfData({ ...data, paymentImages: data.paymentImages || [] });
    setLoading(false);
    setShowLoad(false);
  };

  /* ================= UI ================= */
  return (
    <>
      {/* 🔥 HEADER */}
      <div className="bg-blue-700 text-white px-4 py-3 flex justify-between items-center shadow">

        {/* LEFT */}
        <div>
          <h1 className="text-lg font-bold">ASTRIKE SPORTSWEAR</h1>
          <p className="text-xs text-blue-200 hidden md:block">
            Quotation Management System
          </p>
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={onNewQuotation}
            className="px-3 py-2 rounded bg-white text-blue-700 text-sm font-semibold"
          >
            + New
          </button>

          <button
            onClick={() => setShowLoad(true)}
            className="px-3 py-2 rounded bg-blue-900 text-sm"
          >
            Load
          </button>

          <button
            onClick={handleRefresh}
            className="px-3 py-2 rounded bg-yellow-400 text-black text-sm font-semibold"
          >
            Refresh
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-2 rounded bg-blue-900 text-sm"
          >
            💾 Save PDF
          </button>
        </div>

        {/* MOBILE ACTIONS */}
        <div className="flex md:hidden gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-2 rounded bg-white text-blue-700 text-sm font-semibold"
          >
            💾 PDF
          </button>

          <button
            onClick={() => setDrawerOpen(true)}
            className="px-3 py-2 rounded bg-blue-900 text-sm"
          >
            ☰
          </button>
        </div>
      </div>

      {/* 🔥 MOBILE DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[999] bg-black/40">
          <div className="absolute right-0 top-0 h-full w-[260px] bg-white p-4 space-y-3 shadow-lg">

            <button
              onClick={() => setDrawerOpen(false)}
              className="text-right w-full text-gray-500"
            >
              ✕ Close
            </button>

            <button
              onClick={() => {
                setDrawerOpen(false);
                onNewQuotation();
              }}
              className="w-full px-3 py-2 rounded bg-blue-600 text-white text-sm"
            >
              + New Quotation
            </button>

            <button
              onClick={() => {
                setDrawerOpen(false);
                setShowLoad(true);
              }}
              className="w-full px-3 py-2 rounded bg-gray-100 text-sm"
            >
              Load Old Quotation
            </button>

            <button
              onClick={() => {
                setDrawerOpen(false);
                handleRefresh();
              }}
              className="w-full px-3 py-2 rounded bg-yellow-400 text-black text-sm font-semibold"
            >
              Refresh Sheet
            </button>
          </div>
        </div>
      )}

      {showLoad && (
        <LoadQuotationModal
          onClose={() => setShowLoad(false)}
          onSelect={handleLoadSelect}
          onDelete={async (q) => {
            const urls = await deleteQuotation(q.id);
            await deletePaymentImages(urls);
          }}
        />
      )}
    </>
  );
}
