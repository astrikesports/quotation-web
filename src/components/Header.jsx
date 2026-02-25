import { useEffect, useState } from "react";
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
  onRefreshSku,
  pdfData = {},
  setPdfData,
  setLoading,
  setLoadingText,
  setConfirm
}) {
  const [showLoad, setShowLoad] = useState(false);

  /* ================= PINCODE STATES ================= */
  const [pincode, setPincode] = useState("");
  const [pincodeData, setPincodeData] = useState([]);
  const [pincodeResult, setPincodeResult] = useState(null);

  /* ================= FETCH PINCODE SHEET ================= */
  useEffect(() => {
    const loadPincodeSheet = async () => {
      try {
        const res = await fetch(
          "https://docs.google.com/spreadsheets/d/1Y5VQsIQ33UYPOe1-Ul6VV7vv79lbrHnu8aRoAgYLeho/gviz/tq?gid=813343933"
        );

        const text = await res.text();
        const json = JSON.parse(text.replace(/^[^(]*\(|\);?$/g, ""));

        const rows =
          json?.table?.rows
            ?.filter(r => r?.c?.[2]?.v)
            ?.map(r => ({
              party: String(r.c[1]?.v || "").trim(),
              pincode: String(r.c[2]?.v || "").trim()
            })) || [];

        setPincodeData(rows);
        console.log("PINCODE LOADED:", rows.length);
      } catch (err) {
        console.error("PINCODE SHEET FAILED", err);
      }
    };

    loadPincodeSheet();
  }, []);

  /* ================= PINCODE CHECK ================= */
  const checkPincode = () => {
    const entered = String(pincode).trim();
    if (!entered) return setPincodeResult(null);

    const match = pincodeData.find(
      row => row.pincode.trim() === entered
    );

    setPincodeResult(
      match
        ? { status: "Location Not Available", party: match.party }
        : { status: "Location Available" }
    );
  };

  /* ================= SAVE QUOTATION ================= */
  const handleSave = async () => {
    try {
      if (!pdfData.party?.trim()) {
        setConfirm({
          open: true,
          title: "Missing Party Name",
          message: "Party name is required to save quotation.",
          onConfirm: () => setConfirm({ open: false })
        });
        return;
      }

      if (!Array.isArray(pdfData.items) || pdfData.items.length === 0) {
        setConfirm({
          open: true,
          title: "No Items Added",
          message: "Please add at least one item before saving.",
          onConfirm: () => setConfirm({ open: false })
        });
        return;
      }

      setLoading(true);
      setLoadingText("Saving quotation & generating PDF...");

      const payload = {
        ...pdfData,
        items: pdfData.items.map(it => ({
          ...it,
          size: typeof it.size === "string" ? it.size : ""
        })),
        paymentImages: []
      };

      const saved =
        pdfData.id && String(pdfData.id).length > 0
          ? await updateQuotation(pdfData.id, payload)
          : await createQuotation(payload);

      setPdfData(saved);

      await generateQuotationPDF({
        ...saved,
        paymentImages: pdfData.paymentImages
      });
    } catch (err) {
      console.error("SAVE ERROR:", err);
      setConfirm({
        open: true,
        title: "Save Failed",
        message: err.message || "Something went wrong while saving quotation.",
        onConfirm: () => setConfirm({ open: false })
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= NEW QUOTATION (🔥 FIXED) ================= */
  const handleNewQuotation = () => {
    setLoading(true);
    setLoadingText("Creating New Quotation...");

    setTimeout(() => {
      setPdfData({
        id: null,              // 🔥 THIS FIXES THE ERROR
        party: "",
        phone: "",
        address: "",
        sales_person: "",
        remark: "",
        rate_discount: 0,
        sp_discount: 0,
        bill_discount: 0,
        shipping: 0,
        advance: 0,
        items: [],
        paymentImages: []
      });
      setLoading(false);
    }, 300);
  };

  /* ================= LOAD QUOTATION ================= */
  const handleLoadSelect = async (id) => {
    try {
      setLoading(true);
      setLoadingText("Loading Quotation...");

      const data = await fetchQuotationById(id);
      setPdfData({
        ...data,
        paymentImages: data.paymentImages || []
      });

      setShowLoad(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
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

            const imageUrls = await deleteQuotation(quotation.id);
            await deletePaymentImages(imageUrls);

            resolve();
          } catch (err) {
            reject(err);
          } finally {
            setLoading(false);
          }
        }
      });
    });
  };

  /* ================= UI ================= */
  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center shadow">
        <div>
          <h1 className="text-xl font-bold">ASTRIKE SPORTSWEAR</h1>
          <p className="text-sm text-blue-100">Quotation Management System</p>
        </div>

        <div className="flex gap-2 items-center">
          {/* PINCODE */}
          <div className="relative">
            <input
              value={pincode}
              onChange={e => setPincode(e.target.value)}
              placeholder="Pincode"
              className="w-56 pr-16 px-3 py-2 rounded text-black text-sm"
            />
            <button
              onClick={checkPincode}
              className="absolute right-1 top-1 bottom-1 px-3 rounded bg-green-500 text-white text-sm font-semibold"
            >
              Check
            </button>

            {pincodeResult && (
              <div className="absolute top-full left-2 mt-2 z-50 bg-black text-white text-xs px-3 py-2 rounded shadow">
                {pincodeResult.status === "Location Not Available" ? (
                  <>
                    <div className="text-red-500 font-bold">
                      Location Not Available
                    </div>
                    <div className="text-gray-300">{pincodeResult.party}</div>
                  </>
                ) : (
                  <div className="text-green-400 font-semibold">
                    Location Available
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={handleNewQuotation} className="px-3 py-2 bg-white text-blue-700 rounded font-semibold">
            + New Quotation
          </button>

          <button onClick={() => setShowLoad(true)} className="px-3 py-2 bg-blue-900/40 rounded font-semibold">
            Load Old
          </button>

          <button onClick={onRefreshSku} className="px-3 py-2 bg-yellow-400 text-black rounded font-semibold">
            🔄 Refresh
          </button>

          <button onClick={handleSave} className="px-3 py-2 bg-blue-900/40 rounded font-semibold">
            💾 Save PDF
          </button>
        </div>
      </div>

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
