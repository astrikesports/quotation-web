// src/components/StockCheckModal.jsx

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
  onConfirm,
}) {

  if (!open) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>

        {/* HEADER */}
        <div style={headerStyle}>

          <div>

            <h2
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "900",
              }}
            >
              📦 Inventory Check
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Current stock vs quotation quantity
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

          <div
            style={{
              overflowX: "auto",
              marginTop: "25px",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >

              <thead>

                <tr>

                  <th style={th}>
                    Product
                  </th>

                  <th style={th}>
                    Size
                  </th>

                  <th style={th}>
                    Required
                  </th>

                  <th style={th}>
                    Current Stock
                  </th>

                  <th style={th}>
                    Remaining
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

                        const currentQty =
                          Number(
                            variants?.[
                              size
                            ]?.qty || 0
                          );

                        const remaining =
                          currentQty -
                          qty;

                        const isOk =
                          remaining >= 0;

                        return (

                          <tr
                            key={`${index}-${size}`}
                          >

                            <td style={td}>
                              {item.desc}
                            </td>

                            <td style={td}>
                              {size}
                            </td>

                            <td style={td}>
                              {qty}
                            </td>

                            <td style={td}>
                              {
                                currentQty
                              }
                            </td>

                            <td
                              style={{
                                ...td,
                                color:
                                  isOk
                                    ? "#16a34a"
                                    : "#dc2626",

                                fontWeight:
                                  "700",
                              }}
                            >
                              {
                                remaining
                              }
                            </td>

                            <td style={td}>

                              <span
                                style={{
                                  background:
                                    isOk
                                      ? "#dcfce7"
                                      : "#fee2e2",

                                  color:
                                    isOk
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

                                {isOk
                                  ? "OK"
                                  : "LOW"}

                              </span>

                            </td>

                          </tr>
                        );
                      }
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",

            gap: "12px",

            marginTop: "25px",
          }}
        >

          <button
            onClick={onClose}
            style={cancelBtn}
          >
            Close
          </button>

          {onConfirm && (

            <button
              onClick={onConfirm}
              style={confirmBtn}
            >
              Confirm & Minus Stock
            </button>

          )}

        </div>

      </div>
    </div>
  );
}

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
  maxWidth: "1200px",
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

const cancelBtn = {
  border: "none",
  background: "#f3f4f6",
  padding: "14px 22px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "700",
};

const confirmBtn = {
  border: "none",
  background: "#111827",
  color: "#fff",
  padding: "14px 22px",
  borderRadius: "14px",
  cursor: "pointer",
  fontWeight: "800",
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
