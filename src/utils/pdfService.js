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

  export async function generateQuotationPDF(data = {}, action = "download") {
  const {
  party,
  phone,
  address,
  salesPerson,
  remark,
  quotationNo,
  rateDiscount = 0,
  spDiscount = 0,
  items = [],
  shipping = 0,
  advance = 0,
  billDiscount = 0,
  gymBagSelected = false,
  gymBagRemark = "",
  carryBagSelected = false,
  carryBagRemark = "",
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
  /* ================= PORTRAIT COMPACT ITEM TABLE ================= */
  const ALL_SIZES = ["26", "28", "30", "32", "34", "36", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  const parsedItemSizes = items.map(it => parseSizes(it.size));
  const itemBody = [["SKU / DESCRIPTION", "SIZE ENTRIES", "PCS", "MRP (₹)", "RATE (₹)", "AMOUNT (₹)", "PCS / BOX"].map(h => ({ text: h, bold: true, fontSize: 6.5, alignment: "center", fillColor: "#10213a", color: "#ffffff" }))];
  let totalAmount = 0;
  items.forEach((it, index) => {
    totalAmount += Number(it.amount || 0);
    const sizeMap = parsedItemSizes[index] || {};
    const enteredSizes = ALL_SIZES.filter(size => Number(sizeMap[size] || 0) > 0).map(size => `${size} × ${Number(sizeMap[size])}`).join(", ") || (typeof it.size === "string" && it.size.trim() ? it.size : "-");
    itemBody.push([
      { text: it.desc || "-", fontSize: 7, alignment: "left" },
      { text: enteredSizes, fontSize: 7, alignment: "left" },
      { text: String(it.pcs ?? "-"), fontSize: 7, alignment: "center" },
      { text: String(it.MRP ?? it.mrp ?? "-"), fontSize: 7, alignment: "right" },
      { text: `₹${it.rate ?? "-"}`, fontSize: 7, alignment: "right" },
      { text: `₹${it.amount ?? "-"}`, fontSize: 7, alignment: "right" },
      { text: String(it.pcsPerBox ?? "-"), fontSize: 7, alignment: "center" }
    ]);
  });
  const itemWidths = [92, 100, 27, 48, 48, 55, 42];

  const net = totalAmount + Number(shipping || 0) - Number(billDiscount || 0) - Number(advance || 0);

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

  /* ================= PACKING OPTIONS BLOCK ================= */
  const packingRows = [];

  if (gymBagSelected) {
    packingRows.push([
      { text: "GYM BAG", bold: true },
      { text: gymBagRemark || "-" }
    ]);
  }

  if (carryBagSelected) {
    packingRows.push([
      { text: "CARRY BAG", bold: true },
      { text: carryBagRemark || "-" }
    ]);
  }

  const packingOptionsBlock = packingRows.length > 0
    ? {
        table: {
          widths: [110, 95],
          body: [
            [
              {
                text: "PACKING OPTIONS",
                colSpan: 2,
                alignment: "center",
                bold: true,
                fillColor: "#000",
                color: "#fff"
              },
              {}
            ],
            ...packingRows
          ]
        },
        layout: GRID,
        fontSize: 8,
        margin: [0, 6, 0, 0]
      }
    : null;

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
  // Compact landscape layout; size columns are generated only when used.
  pageSize: "A4",
  pageOrientation: "portrait",
  pageMargins: [28, 24, 28, 24],

  content: [
  { text: "ASTRIKE SPORTSWEAR PVT LTD", alignment: "left", fontSize: 18, bold: true, color: "#10213a", margin: [0, 0, 0, 2] },
  { text: "Ground Floor B-124 Shop No. 2, Pratap Garden, Uttam Nagar, New Delhi\nPhone: 7838000995 | GSTIN: 07ABCCA4620J1ZV", alignment: "left", fontSize: 7, color: "#64748b", margin: [0, 0, 0, 8] },
  { canvas: [{ type: "line", x1: 0, y1: 0, x2: 539, y2: 0, lineWidth: 1.5, lineColor: "#f05a28" }], margin: [0, 0, 0, 8] },
  { text: `QUOTATION ${quotationNo ? `- ${quotationNo}` : ""}`, alignment: "left", fontSize: 12, bold: true, color: "#10213a", margin: [0, 0, 0, 8] },
  { table: { widths: ["*", "*"], body: [
    [{ text: [{ text: "Party Name\n", bold: true }, { text: party || "-" }], fillColor: "#f4f7fb" }, { text: [{ text: "Phone\n", bold: true }, { text: phone || "-" }], fillColor: "#f4f7fb" }],
    [{ text: [{ text: "Address\n", bold: true }, { text: address || "-" }], fillColor: "#f4f7fb", colSpan: 2 }, {}],
    [{ text: [{ text: "Sales Person\n", bold: true }, { text: salesPerson || "-" }], fillColor: "#f4f7fb" }, { text: [{ text: "Date / Updated\n", bold: true }, { text: `${createdDate} / ${updatedDate}` }], fillColor: "#f4f7fb" }],
    [{ text: [{ text: "Rate Discount\n", bold: true }, { text: `${rateDiscount}%` }], fillColor: "#f4f7fb" }, { text: [{ text: "SP Discount\n", bold: true }, { text: `${spDiscount}%` }], fillColor: "#f4f7fb" }],
    [{ text: [{ text: "Remarks\n", bold: true }, { text: remark || "-" }], fillColor: "#f4f7fb", colSpan: 2 }, {}]
  ] }, layout: GRID, fontSize: 8, margin: [0, 0, 0, 10] },
  { text: "ITEM DETAILS — ONLY ENTERED SIZES SHOWN", bold: true, fontSize: 9, color: "#10213a", margin: [0, 0, 0, 5] },
  { table: { headerRows: 1, widths: itemWidths, body: itemBody, dontBreakRows: true, keepWithHeaderRows: 1 }, layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => "#d8e1ec", vLineColor: () => "#d8e1ec", paddingLeft: () => 3, paddingRight: () => 3, paddingTop: () => 5, paddingBottom: () => 5 }, margin: [0, 0, 0, 10] },
  { columns: [
    { width: "*", stack: [ ...(packingOptionsBlock ? [packingOptionsBlock] : []), { text: "REMARKS / PAYMENT NOTES", bold: true, fontSize: 8, margin: [0, 8, 0, 3] }, { text: remark || "-", fontSize: 8, color: "#334155" } ] },
    { width: 190, stack: [{ table: { widths: ["*", 65], body: [ ["Gross / Bill Amount", `₹${totalAmount}`], [`Rate Discount (${rateDiscount}%)`, "-"], [`SP Discount (${spDiscount}%)`, "-"], ["Bill Discount", billDiscount ? `₹${billDiscount}` : "₹0"], ["Shipping", shipping ? `₹${shipping}` : "₹0"], ["Advance Paid", advance ? `₹${advance}` : "₹0"], [{ text: "NET PAYABLE", bold: true, color: "#ffffff", fillColor: "#16a765" }, { text: `₹${net}`, bold: true, color: "#ffffff", fillColor: "#16a765" }] ] }, layout: GRID, fontSize: 7.5 }] }
  ], columnGap: 8 },
  { text: "Please verify sizes, quantities, rates and totals before confirming.", fontSize: 7, color: "#64748b", margin: [0, 12, 0, 0] }
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

  const pdf = pdfMake.createPdf(docDefinition);
  if (action === "open") {
    pdf.open();
  } else {
    pdf.download(fileName);
  }

  }
