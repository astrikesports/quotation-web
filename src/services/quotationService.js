/* ================= MAPPERS ================= */

// frontend → DB
function mapToDB(data) {
  return {
    party: data.party,
    phone: data.phone,
    address: data.address,
    sales_person: data.salesPerson,
    remark: data.remark,

    rate_discount: data.rateDiscount,
    sp_discount: data.spDiscount,
    payment_images: data.paymentImages ?? [],
    bill_discount: data.billDiscount,
    shipping: data.shipping,
    advance: data.advance,

    items: data.items
  };
}

// DB → frontend
function mapFromDB(row) {
  return {
    id: row.id,

    party: row.party ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    salesPerson: row.sales_person ?? "",
    remark: row.remark ?? "",

    rateDiscount: Number(row.rate_discount ?? 0),
    spDiscount: Number(row.sp_discount ?? 0),
    billDiscount: Number(row.bill_discount ?? 0),
    shipping: Number(row.shipping ?? 0),
    advance: Number(row.advance ?? 0),
    
    
    createdAt: row.created_at,   // ✅ FIX
    updatedAt: row.updated_at,   // ✅ FIX
    items: Array.isArray(row.items) ? row.items : [],

    // 🔥 MOST IMPORTANT LINE
    // 🔥 THIS IS CRITICAL
    paymentImages: Array.isArray(row.payment_images)
      ? row.payment_images
      : []
  };
}
/* ================= CREATE ================= */
export async function createQuotation(pdfData) {
  const payload = mapToDB(pdfData);

  const res = await fetch("/api/quotations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Failed to create quotation");

  const data = await res.json();
  return mapFromDB(data[0]);
}

/* ================= UPDATE ================= */
export async function updateQuotation(id, pdfData) {
  if (!id || id === "null" || id === "undefined") return null;

  const payload = {
    ...mapToDB(pdfData),
    updated_at: new Date().toISOString()
  };

  const res = await fetch(`/api/quotations?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data[0] ? mapFromDB(data[0]) : null;
}

/* ================= LOAD ONE ================= */
export async function fetchQuotationById(id) {
  const res = await fetch(`/api/quotations?id=eq.${id}`);

  if (!res.ok) throw new Error("Failed to load quotation");

  const data = await res.json();
  return mapFromDB(data[0]);
}

/* ================= LOAD LIST ================= */
export async function fetchQuotations() {
  const res = await fetch("/api/quotations");

  if (!res.ok) throw new Error("Failed to load quotations");

  const data = await res.json();
  return data.map(mapFromDB);
}

/* ================= DELETE ================= */
export async function deleteQuotation(id) {
  // get images first
  const res = await fetch(`/api/quotations?id=eq.${id}`);
  const data = await res.json();
  const images = data[0]?.payment_images || [];

  // delete row
  await fetch(`/api/quotations?id=eq.${id}`, {
    method: "DELETE"
  });

  return images;
}
