
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { supabase } from "../supabase";
import { parseSizes } from "../utils/sizeHelper";

pdfMake.vfs = pdfFonts.vfs;

function safeFileName(str = "") {
  return str.trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toUpperCase();
}

async function imageUrlToBase64(url) {
  const path = url.split("/payment-images/")[1];
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from("payment-images")
    .download(path);

  if (error || !data) {
    console.error("Image download failed:", error);
    return null;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(data);
  });
}

const GRID = {
  hLineWidth: () => 0.5,
  vLineWidth: () => 0.5,
  hLineColor: () => "#d8e1ec",
  vLineColor: () => "#d8e1ec",
  paddingLeft: () => 4,
  paddingRight: () => 4,
  paddingTop: () => 4,
  paddingBottom: () => 4
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
    paymentImages = [],
    createdAt,
    updatedAt
  } = data;

  // Payment images
  const finalPaymentImages = [];

  for (const img of paymentImages) {
    if (typeof img === "string" && img.startsWith("data:image")) {
      finalPaymentImages.push(img);
    } else if (img?.url) {
      const base64 = await imageUrlToBase64(img.url);
      if (base64) finalPaymentImages.push(base64);
    }
  }

  const createdDate = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : "-";

  const updatedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString()
    : createdDate;

  const ALL_SIZES = [
    "26", "28", "30", "32", "34", "36",
    "S", "M", "L", "XL", "2XL", "3XL", "4XL"
  ];

  let totalAmount = 0;

  // Items table
  const itemBody = [[
    { text: "SKU / DESCRIPTION", bold: true, fontSize: 6.5, alignment: "center", fillColor: "#10213a", color: "#ffffff" },
    { text: "SIZE ENTRIES", bold: true, fontSize: 6.5, alignment: "center", fillColor: "#10213a", color: "#ffffff" },
    { text: "PCS", bold: true, fontSize: 6.5, alignment: "center", fillColor: "#10213a", color: "#ffffff" },
    { text: "MRP (₹)", bold: true, fontSize: 6.5, alignment: "center", fillColor: "#10213a", color: "#ffffff" },
    { text: "RATE (₹)", bold: true, fontSize: 6.5, alignment: "center", fillColor: "#10213a", color: "#ffffff" },
    { text: "AMOUNT (₹)", bold: true, fontSize: 6.5, alignment: "center", fillColor: "#10213a", color: "#ffffff" },
    { text: "PCS / BOX", bold: true, fontSize: 6.5, alignment: "center", fillColor: "#10213a", color: "#ffffff" }
  ]];

  items.forEach((it) => {
    totalAmount += Number(it.amount || 0);

    const sizeMap = parseSizes(it.size) || {};

    const enteredSizes = ALL_SIZES
      .filter(size => Number(sizeMap[size] || 0) > 0)
      .map(size => `${size} × ${Number(sizeMap[size])}`)
      .join(", ") ||
      (typeof it.size === "string" && it.size.trim()
        ? it.size
        : "-");

    itemBody.push([
      { text: it.desc || "-", fontSize: 7 },
      { text: enteredSizes, fontSize: 7 },
      { text: String(it.pcs ?? "-"), fontSize: 7, alignment: "center" },
      { text: String(it.MRP ?? it.mrp ?? "-"), fontSize: 7, alignment: "right" },
      { text: `₹${it.rate ?? "-"}`, fontSize: 7, alignment: "right" },
      { text: `₹${it.amount ?? "-"}`, fontSize: 7, alignment: "right" },
      { text: String(it.pcsPerBox ?? "-"), fontSize: 7, alignment: "center" }
    ]);
  });

  const itemWidths = ["*", 150, 32, 50, 50, 65, 50];

  const net =
    totalAmount +
    Number(shipping || 0) -
    Number(billDiscount || 0) -
    Number(advance || 0);

  // Packing options
  const packingRows = [];

  if (gymBagSelected) {
    packingRows.push([
      { text: "GYM BAG", bold: true },
      gymBagRemark || "-"
    ]);
  }

  if (carryBagSelected) {
    packingRows.push([
      { text: "CARRY BAG", bold: true },
      carryBagRemark || "-"
    ]);
  }

  const packingOptionsBlock = packingRows.length
    ? {
        table: {
          widths: [100, "*"],
          body: [
            [
              {
                text: "PACKING OPTIONS",
                colSpan: 2,
                bold: true,
                fillColor: "#10213a",
                color: "#ffffff"
              },
              {}
            ],
            ...packingRows
          ]
        },
        layout: GRID,
        fontSize: 8,
        margin: [0, 8, 0, 0]
      }
    : null;

  // Cancel item and summary side-by-side
  const cancelAndSummaryBlock = {
    columns: [
      {
        width: "58%",
        stack: [
          {
            text: "CANCEL ITEM FROM BILL",
            bold: true,
            fontSize: 9,
            color: "#10213a",
            margin: [0, 0, 0, 5]
          },
          {
            table: {
              headerRows: 1,
              widths: ["*", 48, "*"],
              body: [
                [
                  { text: "SKU", bold: true, fontSize: 7, color: "#ffffff", fillColor: "#10213a" },
                  { text: "SIZE", bold: true, fontSize: 7, color: "#ffffff", fillColor: "#10213a" },
                  { text: "REMARK", bold: true, fontSize: 7, color: "#ffffff", fillColor: "#10213a" }
                ],
                ["", "", ""],
                ["", "", ""],
                ["", "", ""],
                ["", "", ""],
                ["", "", ""]
              ],
              dontBreakRows: true
            },
            layout: GRID,
            fontSize: 8
          }
        ]
      },
      {
        width: "42%",
        stack: [
          {
            text: "BILL SUMMARY",
            bold: true,
            fontSize: 9,
            color: "#10213a",
            margin: [0, 0, 0, 5]
          },
          {
            table: {
              widths: ["*", 62],
              body: [
                [
                  { text: "Gross / Bill Amount", fontSize: 7 },
                  { text: `₹${totalAmount}`, fontSize: 7, alignment: "right" }
                ],
                [
                  { text: `Rate Discount (${rateDiscount}%)`, fontSize: 7 },
                  { text: "-", fontSize: 7, alignment: "right" }
                ],
                [
                  { text: `SP Discount (${spDiscount}%)`, fontSize: 7 },
                  { text: "-", fontSize: 7, alignment: "right" }
                ],
                [
                  { text: "Bill Discount", fontSize: 7 },
                  { text: `₹${Number(billDiscount || 0)}`, fontSize: 7, alignment: "right" }
                ],
                [
                  { text: "Shipping", fontSize: 7 },
                  { text: `₹${Number(shipping || 0)}`, fontSize: 7, alignment: "right" }
                ],
                [
                  { text: "Advance Paid", fontSize: 7 },
                  { text: `₹${Number(advance || 0)}`, fontSize: 7, alignment: "right" }
                ],
                [
                  { text: "NET PAYABLE", bold: true, color: "#ffffff", fillColor: "#16a765", fontSize: 7 },
                  { text: `₹${net}`, bold: true, color: "#ffffff", fillColor: "#16a765", fontSize: 7, alignment: "right" }
                ]
              ],
              dontBreakRows: true
            },
            layout: GRID
          }
        ]
      }
    ],
    columnGap: 10,
    margin: [0, 0, 0, 8]
  };

  const content = [
    {
      text: "ASTRIKE SPORTSWEAR PVT LTD",
      fontSize: 18,
      bold: true,
      color: "#10213a",
      margin: [0, 0, 0, 3]
    },
    {
      text:
        "Ground Floor B-124 Shop No. 2, Pratap Garden, Uttam Nagar, New Delhi\n" +
        "Phone: 7838000995 | GSTIN: 07ABCCA4620J1ZV",
      fontSize: 7,
      color: "#64748b",
      margin: [0, 0, 0, 8]
    },
    {
      canvas: [{
        type: "line",
        x1: 0,
        y1: 0,
        x2: 539,
        y2: 0,
        lineWidth: 1.5,
        lineColor: "#f05a28"
      }],
      margin: [0, 0, 0, 8]
    },
    {
      text: `QUOTATION ${quotationNo ? `- ${quotationNo}` : ""}`,
      fontSize: 12,
      bold: true,
      color: "#10213a",
      margin: [0, 0, 0, 8]
    },

    // Customer details
    {
      table: {
        widths: ["*", "*"],
        body: [
          [
            {
              text: [
                { text: "Party Name\n", bold: true },
                { text: party || "-" }
              ],
              fillColor: "#f4f7fb"
            },
            {
              text: [
                { text: "Phone\n", bold: true },
                { text: phone || "-" }
              ],
              fillColor: "#f4f7fb"
            }
          ],
          [
            {
              text: [
                { text: "Address\n", bold: true },
                { text: address || "-" }
              ],
              fillColor: "#f4f7fb",
              colSpan: 2
            },
            {}
          ],
          [
            {
              text: [
                { text: "Sales Person\n", bold: true },
                { text: salesPerson || "-" }
              ],
              fillColor: "#f4f7fb"
            },
            {
              text: [
                { text: "Date / Updated\n", bold: true },
                { text: `${createdDate} / ${updatedDate}` }
              ],
              fillColor: "#f4f7fb"
            }
          ],
          [
            {
              text: [
                { text: "Rate Discount\n", bold: true },
                { text: `${rateDiscount}%` }
              ],
              fillColor: "#f4f7fb"
            },
            {
              text: [
                { text: "SP Discount\n", bold: true },
                { text: `${spDiscount}%` }
              ],
              fillColor: "#f4f7fb"
            }
          ],
          [
            {
              text: [
                { text: "Remarks\n", bold: true },
                { text: remark || "-" }
              ],
              fillColor: "#f4f7fb",
              colSpan: 2
            },
            {}
          ]
        ]
      },
      layout: GRID,
      fontSize: 8,
      margin: [0, 0, 0, 10]
    },

    {
      text: "ITEM DETAILS — ONLY ENTERED SIZES SHOWN",
      bold: true,
      fontSize: 9,
      color: "#10213a",
      margin: [0, 0, 0, 5]
    },

    // Full-width items table
    {
      table: {
        headerRows: 1,
        widths: itemWidths,
        body: itemBody,
        dontBreakRows: true,
        keepWithHeaderRows: 1
      },
      layout: GRID,
      margin: [0, 0, 0, 10]
    },

    cancelAndSummaryBlock,

    ...(packingOptionsBlock ? [packingOptionsBlock] : []),

    {
      text: "REMARKS / PAYMENT NOTES",
      bold: true,
      fontSize: 8,
      margin: [0, 8, 0, 3]
    },
    {
      text: remark || "-",
      fontSize: 8,
      color: "#334155"
    },
    {
      text: "Please verify sizes, quantities, rates and totals before confirming.",
      fontSize: 7,
      color: "#64748b",
      margin: [0, 12, 0, 0]
    }
  ];

  const docDefinition = {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [28, 24, 28, 24],
    content
  };

  // Payment proof page
  if (finalPaymentImages.length > 0) {
    docDefinition.content.push({
      text: "Payment Proof",
      bold: true,
      fontSize: 12,
      pageBreak: "before",
      margin: [0, 0, 0, 10]
    });

    docDefinition.content.push({
      columnGap: 20,
      columns: finalPaymentImages.map(img => ({
        image: img,
        width: 240
      }))
    });
  }

  const baseName = safeFileName(data.party || "QUOTATION");
  const isUpdated = data.updatedAt || data.updated_at;

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
