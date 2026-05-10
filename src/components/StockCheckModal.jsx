// =========================
// STOCK CHECK MODAL START
// =========================

import React from "react";

function parseSizeString(sizeStr = "") {

  const result = {};

  sizeStr.split(",").forEach((item) => {

    const [size, qty] =
      item.trim().split("-");

    if (size && qty) {

      result[size.trim()] =
        Number(qty.trim());

    }
  });

  return result;
}

export default function StockCheckModal({
  open,
  onClose,
  quotationItems = [],
  products = [],
  quotations = [],
  currentQuotationId = null,
}) {

  if (!open) return null;

  return (

    <div style={overlayStyle}>

      <div style={modalStyle}>

        {/* HEADER */}
        <div style={headerStyle}>

          <div>

            <h2 style={titleStyle}>
              📦 Inventory Check
            </h2>

            <p style={subTitleStyle}>
              Live stock + reserved stock
            </p>

          </div>

          <button
            onClick={onClose}
            style={closeBtn}
          >
            ✕
          </button>

        </div>

        {/* EMPTY */}
        {quotationItems.length === 0 && (

          <div style={emptyBox}>
            No quotation items found
          </div>

        )}

        {/* TABLE */}
        {quotationItems.length > 0 && (

          <div style={tableWrapper}>

            <table style={tableStyle}>

              <thead>

                <tr>

                  <th style={th}>
                    Product
                  </th>

                  <th style={th}>
                    Size
                  </th>

                  <th style={th}>
                    Stock
                  </th>

                  <th style={th}>
                    Reserved
                  </th>

                  <th style={th}>
                    Your Qty
                  </th>

                  <th style={th}>
                    Free
                  </th>

                  <th style={th}>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {quotationItems.flatMap(
                  (item, index) => {

                    const sizeMap =
                      parseSizeString(
                        item.size
                      );

                    const product =
                      products.find(
                        (p) =>
                          p.product_name ===
                          item.desc
                      );

                    let variants = {};

                    try {

                      if (
                        typeof product?.variants ===
                        "string"
                      ) {

                        variants =
                          JSON.parse(
                            product.variants ||
                              "{}"
                          );

                      } else {

                        variants =
                          product?.variants ||
                          {};

                      }

                    } catch {

                      variants = {};

                    }

                    return Object.entries(
                      sizeMap
                    ).map(
                      ([
                        size,
                        qty,
                      ]) => {

                        // CURRENT STOCK
                        const currentQty =
                          Number(
                            variants?.[
                              size
                            ]?.qty || 0
                          );

                        // RESERVED
                        let reservedQty = 0;

                        const reservedBy =
                          [];

                        quotations.forEach(
                          (q) => {

                            // SKIP CURRENT
                            if (
                              q.id ===
                              currentQuotationId
                            )
                              return;

                            // ONLY PENDING
                            if (
                              q.status !==
                              "pending"
                            )
                              return;

                            (
                              q.items || []
                            ).forEach(
                              (
                                qItem
                              ) => {

                                if (
                                  qItem.desc !==
                                  item.desc
                                )
                                  return;

                                const qSizes =
                                  parseSizeString(
                                    qItem.size
                                  );

                                const reserved =
                                  Number(
                                    qSizes[
                                      size
                                    ] || 0
                                  );

                                if (
                                  reserved >
                                  0
                                ) {

                                  reservedQty +=
                                    reserved;

                                  reservedBy.push(
                                    {
                                      salesPerson:
                                        q.sales_person,

                                      party:
                                        q.party,

                                      qty:
                                        reserved,
                                    }
                                  );
                                }
                              }
                            );
                          }
                        );

                        // FREE STOCK
                        const freeQty =
                          currentQty -
                          reservedQty;

                        // STATUS
                        const canProceed =
                          freeQty >= qty;

                        return (

                          <React.Fragment
                            key={`${index}-${size}`}
                          >

                            {/* MAIN ROW */}
                            <tr>

                              <td style={td}>
                                {item.desc}
                              </td>

                              <td style={td}>
                                {size}
                              </td>

                              <td style={td}>
                                {
                                  currentQty
                                }
                              </td>

                              <td style={td}>
                                {
                                  reservedQty
                                }
                              </td>

                              <td style={td}>
                                {qty}
                              </td>

                              <td
                                style={{
                                  ...td,
                                  color:
                                    freeQty >=
                                    qty
                                      ? "#16a34a"
                                      : "#dc2626",

                                  fontWeight:
                                    "700",
                                }}
                              >
                                {
                                  freeQty
                                }
                              </td>

                              <td style={td}>

                                <span
                                  style={{
                                    background:
                                      canProceed
                                        ? "#dcfce7"
                                        : "#fee2e2",

                                    color:
                                      canProceed
                                        ? "#166534"
                                        : "#991b1b",

                                    padding:
                                      "6px 12px",

                                    borderRadius:
                                      "999px",

                                    fontSize:
                                      "12px",

                                    fontWeight:
                                      "800",
                                  }}
                                >

                                  {canProceed
                                    ? "OK"
                                    : "LOW"}

                                </span>

                              </td>

                            </tr>

                            {/* RESERVED INFO */}
                            {reservedBy.length >
                              0 && (

                              <tr>

                                <td
                                  colSpan="7"
                                  style={{
                                    ...td,
                                    background:
                                      "#fff7ed",
                                  }}
                                >

                                  <div
                                    style={{
                                      fontWeight:
                                        "800",

                                      color:
                                        "#c2410c",

                                      marginBottom:
                                        "10px",
                                    }}
                                  >
                                    ⚠ Already Reserved
                                  </div>

                                  <div
                                    style={{
                                      display:
                                        "flex",

                                      flexDirection:
                                        "column",

                                      gap: "8px",
                                    }}
                                  >

                                    {reservedBy.map(
                                      (
                                        r,
                                        i
                                      ) => (

                                        <div
                                          key={
                                            i
                                          }
                                          style={{
                                            background:
                                              "#fff",

                                            border:
                                              "1px solid #fed7aa",

                                            padding:
                                              "10px 14px",

                                            borderRadius:
                                              "12px",

                                            fontSize:
                                              "14px",

                                            fontWeight:
                                              "600",
                                          }}
                                        >

                                          👨‍💼{" "}
                                          {
                                            r.salesPerson
                                          }

                                          {" "}
                                          • 🏢{" "}
                                          {
                                            r.party
                                          }

                                          {" "}
                                          • 📦{" "}
                                          {
                                            r.qty
                                          }{" "}
                                          PCS

                                        </div>
                                      )
                                    )}

                                  </div>

                                </td>

                              </tr>

                            )}

                          </React.Fragment>
                        );
                      }
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

// =========================
// STYLES START
// =========================

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(0,0,0,0.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999999,
  padding: "20px",
};

const modalStyle = {
  width: "100%",
  maxWidth: "1300px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "24px",
  padding: "25px",
  boxShadow:
    "0 20px 60px rgba(0,0,0,0.25)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: "900",
};

const subTitleStyle = {
  margin: "6px 0 0",
  color: "#666",
  fontSize: "14px",
};

const closeBtn = {
  width: "45px",
  height: "45px",
  borderRadius: "12px",
  border: "none",
  background: "#f3f4f6",
  cursor: "pointer",
  fontSize: "18px",
  fontWeight: "700",
};

const tableWrapper = {
  overflowX: "auto",
  marginTop: "25px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "14px",
  borderBottom:
    "1px solid #e5e7eb",
  background: "#f9fafb",
  fontSize: "14px",
  fontWeight: "800",
};

const td = {
  padding: "14px",
  borderBottom:
    "1px solid #f3f4f6",
  fontSize: "14px",
  fontWeight: "600",
};

const emptyBox = {
  marginTop: "25px",
  background: "#fee2e2",
  color: "#991b1b",
  padding: "18px",
  borderRadius: "18px",
  fontWeight: "700",
  textAlign: "center",
};

// =========================
// STYLES END
// =========================


// =========================
// STOCK CHECK MODAL END
// =========================
