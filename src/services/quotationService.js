import { supabase } from "../supabase";

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

  const { data, error } = await supabase
    .from("quotations")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return mapFromDB(data);
}

/* ================= UPDATE ================= */

export async function updateQuotation(id, pdfData) {
  if (!id) throw new Error("Quotation ID missing");

  const payload = {
    ...mapToDB(pdfData),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("quotations")
    .update(payload)
    .eq("id", id)
    .select(); // 👈 NO .single()

  if (error) throw error;

  if (!data || data.length === 0) {
    throw new Error("Quotation not found or not updated");
  }

  return mapFromDB(data[0]); // 👈 manually first row
}



/* ================= LOAD ONE ================= */
export async function fetchQuotationById(id) {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return mapFromDB(data);
}

/* ================= LOAD LIST ================= */
export async function fetchQuotations() {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .order("created_at", { descending: true });

  if (error) throw error;
  return data;
}

/* ================= DELETE QUOTATION ================= */
export async function deleteQuotation(id) {
  // pehle images nikaal lo
  const { data, error } = await supabase
    .from("quotations")
    .select("payment_images")
    .eq("id", id)
    .single();

  if (error) throw error;

  // ab row delete karo
  const { error: delError } = await supabase
    .from("quotations")
    .delete()
    .eq("id", id);

  if (delError) throw delError;

  // image urls return karo
  return data?.payment_images || [];
}
