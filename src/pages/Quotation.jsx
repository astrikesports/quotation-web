import { useEffect, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Header from "../components/Header";
import ItemsTable from "../components/ItemsTable";
import LoaderOverlay from "../components/LoaderOverlay";
import Sidebar from "../components/Sidebar";
import Summary from "../components/Summary";
import { clearSkuCache, loadSkuDB } from "../utils/skuService";

export default function Quotation() {

  /* ================= LOADER ================= */
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null
  });

  /* ================= SINGLE SOURCE OF TRUTH ================= */
  const [pdfData, setPdfData] = useState({
    party: "",
    phone: "",
    address: "",
    salesPerson: "",
    remark: "",
    items: [],
    rateDiscount: 57,
    spDiscount: 0,
    billDiscount: 0,
    shipping: 0,
    advance: 0,
    paymentImages: [],
  });

  const {
    items,
    rateDiscount,
    spDiscount,
    billDiscount,
    shipping,
    advance
  } = pdfData;

  /* ================= EDIT FLOW ================= */
  const [editIndex, setEditIndex] = useState(null);
  const [editItem, setEditItem] = useState(null);

  /* ================= CORE RATE LOGIC ================= */
  function applyAutoRates(list) {
    return list.map(item => {
      if (item.isSample || item.isManual || !item.mrp) return item;

      const mrp = Number(item.mrp);
      let rate = (mrp * (100 - rateDiscount)) / 100;

      if (spDiscount > 0) {
        rate = (rate * (100 - Math.min(spDiscount, 10))) / 100;
      }

      rate = Math.round(rate);

      return {
        ...item,
        rate,
        amount: rate * item.pcs,
      };
    });
  }

  useEffect(() => {
    setPdfData(prev => ({
      ...prev,
      items: applyAutoRates(prev.items)
    }));
  }, [rateDiscount, spDiscount]);

  /* ================= ITEM ACTIONS ================= */
  function addItem(item) {
    setPdfData(prev => ({
      ...prev,
      items: applyAutoRates([...prev.items, item])
    }));
  }

  function startEdit(index) {
    setEditIndex(index);
    setEditItem(items[index]);
  }

  function updateItem(index, item) {
    setPdfData(prev => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? item : it))
    }));
    cancelEdit();
  }

  function cancelEdit() {
    setEditIndex(null);
    setEditItem(null);
  }

  function deleteItem(index) {
    setPdfData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }

  /* ================= PAYMENT IMAGES ================= */
  function handlePaymentImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (pdfData.paymentImages.length >= 2) {
      alert("Maximum 2 payment images allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPdfData(prev => ({
        ...prev,
        paymentImages: [...prev.paymentImages, reader.result]
      }));
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removePaymentImage(index) {
    setPdfData(prev => ({
      ...prev,
      paymentImages: prev.paymentImages.filter((_, i) => i !== index)
    }));
  }

  /* ================= TOTALS ================= */
  const totalPCS = items.reduce((s, i) => s + i.pcs, 0);
  const totalAmount = items.reduce((s, i) => s + i.amount, 0);
  const net =
    totalAmount -
    Number(billDiscount) +
    Number(shipping) -
    Number(advance);

  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex flex-col bg-blue-50">

      <Header
        onNewQuotation={newQuotation}
        onRefreshSku={refreshSkuData}
        pdfData={pdfData}
        setPdfData={setPdfData}
        setLoading={setLoading}
        setLoadingText={setLoadingText}
        setConfirm={setConfirm}
      />

      {/* 🔥 MAIN CONTENT */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">

        {/* 🔥 SIDEBAR */}
        <div className="w-full md:w-[320px] flex-shrink-0 overflow-auto">
          <Sidebar
            pdfData={pdfData}
            setPdfData={setPdfData}
            onAddItem={addItem}
            editIndex={editIndex}
            editItem={editItem}
            onUpdateItem={updateItem}
            onCancelEdit={cancelEdit}
            handlePaymentImage={handlePaymentImage}
            paymentImages={pdfData.paymentImages}
            removePaymentImage={removePaymentImage}
          />
        </div>

        {/* 🔥 ITEMS TABLE */}
        <div className="flex-1 overflow-auto">
          <ItemsTable
            items={items}
            onDelete={deleteItem}
            onEdit={startEdit}
          />
        </div>
      </div>

      {/* 🔥 SUMMARY (STICKY ON MOBILE) */}
      <div className="sticky bottom-0 bg-white shadow-md md:static">
        <Summary
          pcs={totalPCS}
          amount={totalAmount}
          billDiscount={billDiscount}
          setBillDiscount={(v) =>
            setPdfData(prev => ({ ...prev, billDiscount: v }))
          }
          shipping={shipping}
          setShipping={(v) =>
            setPdfData(prev => ({ ...prev, shipping: v }))
          }
          advance={advance}
          setAdvance={(v) =>
            setPdfData(prev => ({ ...prev, advance: v }))
          }
          net={net}
        />
      </div>

      {loading && <LoaderOverlay text={loadingText} />}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm({ open: false })}
      />

    </div>
  );
}
