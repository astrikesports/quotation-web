import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { supabase } from "../supabase";
import { parseSizes } from "../utils/sizeHelper";


  pdfMake.vfs = pdfFonts.vfs;

  function safeFileName(str = "") {
  return str
  .trim()
  .replace(/\s+/g, "_")
  .replace(/[^a-zA-Z0-9_]/g, "")
  .toUpperCase();
  }

  /* ================= IMAGE → BASE64 ================= */
  async function imageUrlToBase64(url) {
  // extract path after bucket name
  const path = url.split("/payment-images/")[1];
  if (!path) return null;

  const { data, error } = await supabase
  .storage
  .from("payment-images")
  .download(path);

  if (error || !data) {
  console.error("Image download failed:", error);
  return null;
  }

  return await new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(data);
  });
  }


  /* ================= COMMON GRID ================= */
  const GRID = {
  hLineWidth: () => 1,
  vLineWidth: () => 1,
  hLineColor: () => "#000",
  vLineColor: () => "#000",
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => 4,
  paddingBottom: () => 4,
  };

  export async function generateQuotationPDF(data = {}) {
  const {
  party,
  phone,
  address,
  salesPerson,
  remark,
  rateDiscount = 0,
  spDiscount = 0,
  items = [],
  shipping = 0,
  advance = 0,
  billDiscount = 0,
  paymentImages = [], // ✅ array (max 2)
  createdAt,
  updatedAt
  } = data;

// ================= STEP 2: NORMALIZE PAYMENT IMAGES =================
  const finalPaymentImages = [];

  for (let i = 0; i < paymentImages.length; i++) {
  const img = paymentImages[i];

  // case 1: already base64 (local preview / old quotation)
  if (typeof img === "string" && img.startsWith("data:image")) {
  finalPaymentImages.push(img);
  continue;
  }

  // case 2: Supabase storage object { url }
  if (img?.url) {
  const base64 = await imageUrlToBase64(img.url);
  if (base64) finalPaymentImages.push(base64);
  }
  }


  // 🔹 3. merge data
  const finalData = {
  ...data,
  items,
  paymentImages: finalPaymentImages
  };


  /* ================= DATES ================= */
  const createdDate = createdAt
  ? new Date(createdAt).toLocaleDateString()
  : "-";
  const updatedDate = updatedAt
  ? new Date(updatedAt).toLocaleDateString()
  : createdDate
  ? new Date().toLocaleDateString() // 👈 re-save assumed
  : "-";

  const totalDiscount = Number(rateDiscount) + Number(spDiscount);
  const hasPaymentImages = paymentImages.length > 0;
  /* ================= ITEM TABLE ================= */
  const itemBody = [[
  "DESC","S","M","L","XL","2XL","3XL","4XL",
  "PCS","RATE","AMOUNT","MRP","PACKING"
  ].map(h => ({
  text: h,
  bold: true,
  fontSize: 7.5,
  alignment: "center",
  fillColor: "#f1f5f9"
  }))];

  let totalAmount = 0;

  items.forEach(it => {
  totalAmount += Number(it.amount || 0);

  const sizeMap = parseSizes(it.size);
  // it.size = "S:10,M:5,L:8"

  const size = {
  S: sizeMap.S,
  M: sizeMap.M,
  L: sizeMap.L,
  XL: sizeMap.XL,
  "2XL": sizeMap["2XL"],
  "3XL": sizeMap["3XL"],
  "4XL": sizeMap["4XL"],
  };

  itemBody.push([
  { text: it.desc, alignment: "left" },

  size.S || "",
  size.M || "",
  size.L || "",
  size.XL || "",
  size["2XL"] || "",
  size["3XL"] || "",
  size["4XL"] || "",

  it.pcs ?? "-",
  `₹${it.rate ?? "-"}`,
  `₹${it.amount ?? "-"}`,
  it.MRP ?? it.mrp ?? "-",
  it.pcsPerBox ?? "-"
  ].map(v =>
  typeof v === "object"
  ? { ...v, fontSize: 7.5 }
  : { text: String(v), fontSize: 7.5, alignment: "center" }
  ));
  });


  const net =
  totalAmount +
  Number(shipping || 0) -
  Number(billDiscount || 0) -
  Number(advance || 0);

  /* ================= CANCEL ITEM BLOCK ================= */
  const cancelBlock = {
  table: {
  widths: [90, 90, 120],
  body: [
  [
  {
  text: "CANCEL ITEM FROM BILL",
  colSpan: 3,
  alignment: "center",
  bold: true,
  fillColor: "#000",
  color: "#fff"
  }, {}, {}
  ],
  ["SKU", "SIZE", "REMARK"],
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
  ]
  },
  layout: GRID,
  fontSize: 8
  };

  /* ================= SUMMARY BLOCK ================= */
  const summaryBlock = {
  table: {
  widths: [110, 95],
  body: [
  ["AMOUNT", `₹${totalAmount}`],
  ["SHIPPING", shipping ? `₹${shipping}` : "-"],
  ["BILL DISCOUNT", billDiscount ? `₹${billDiscount}` : "-"],
  ["ADVANCE", advance ? `₹${advance}` : "-"],
  [
  { text: "NET PAYABLE", bold: true },
  { text: `₹${net}`, bold: true }
  ]
  ]
  },
  layout: GRID,
  alignment: "right",
  fontSize: 8
  };

  /* ================= PDF ================= */
  const docDefinition = {
  pageSize: "A4",
  pageMargins: [18, 20, 18, 15],

  content: [
  {
  text: "ASTRIKE SPORTSWEAR PVT LTD",
  alignment: "center",
  fontSize: 15,
  bold: true
  },
  {
  text:
  "Ground Floor B-124 Shop No. 2, Pratap Garden, Uttam Nagar, New Delhi\n" +
  "Phone: 7838000995 | GSTIN: 07ABCCA4620J1ZV",
  alignment: "center",
  fontSize: 8,
  margin: [0, 4, 0, 8]
  },
  {
  text: "QUOTATION",
  alignment: "center",
  fontSize: 13,
  bold: true,
  margin: [0, 6, 0, 8]
  },

  {
  table: {
  widths: ["*", "*", "*", "*"],
  body: [
  [
  `Party Name : ${party || "-"}`,
  `Phone : ${phone || "-"}`,
  `Date : ${createdDate}`,
  `Updated Date : ${updatedDate}`
  ],
  [
  `Sales Person : ${salesPerson || "-"}`,
  `Rate Discount : ${rateDiscount}%`,
  `SP Discount : ${spDiscount}%`,
  `Total Discount : ${totalDiscount}%`
  ],
  [{ text: `Address : ${address || "-"}`, colSpan: 4 }, {}, {}, {}],
  [{ text: `Remark : ${remark || "-"}`, colSpan: 4, fontSize: 10, bold: true }, {}, {}, {}]
  ]
  },
  layout: GRID,
  fontSize: 8
  },

  { text: "\n" },

  {
  table: {
  headerRows: 1,
  widths: [
  78,24,24,24,24,24,24,24,
  36,46,46,32,36
  ],
  body: itemBody,
  dontBreakRows: true,
  keepWithHeaderRows: 1
  },
  layout: GRID
  },

  { text: "\n" },

  {
  table: {
  widths: [300, 20, 210],
  body: [[
  // LEFT: CANCEL TABLE
  hasPaymentImages ? cancelBlock : "",

  "",

  // RIGHT SIDE
  {
  table: {
  widths: [210],
  body: [
  // SUMMARY (always)
  [summaryBlock],

  // 🔥 PACKING DETAILS (HEADER + BODY TOGETHER)
  ...(hasPaymentImages
  ? [[
  {
  table: {
  widths: [100, 105],
  body: [
  [
  {
  text: "PACKING DETAILS",
  colSpan: 2,
  alignment: "center",
  bold: true,
  fillColor: "#000",
  color: "#fff",
  fontSize: 8
  },
  {}
  ],
  ["DATE", ""],
  ["UPDATED DATE", ""],
  ["DIMENSION", ""],
  ["WEIGHT", ""],
  ["SIGN", ""]
  ]
  },
  layout: GRID,
  fontSize: 8
  }
  ]]
  : []),
  ]
  },
  layout: "noBorders"
  }
  ]]
  },
  layout: "noBorders"
  }


  ]
  };

  /* ================= PAYMENT IMAGE PAGE ================= */
  if (finalPaymentImages.length > 0) {
  docDefinition.content.push({ text: "", pageBreak: "before" });

  docDefinition.content.push({
  text: "Payment Proof",
  bold: true,
  margin: [0, 0, 0, 10]
  });

  docDefinition.content.push({
  columnGap: 20,
  columns: finalPaymentImages.map(img => ({
  image: img,     // 👈 DIRECT BASE64
  width: 240
  }))
  });
  }


  const baseName = safeFileName(data.party || "QUOTATION");

  const isUpdated =
  data.updatedAt ||
  data.updated_at;   // supabase key

  const fileName = isUpdated
  ? `${baseName}_UPDATED.pdf`
  : `${baseName}.pdf`;

  pdfMake.createPdf(docDefinition).download(fileName);

  }
