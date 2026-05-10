// src/components/StockCheckModal.jsx

import React from "react";

function parseSizeString(sizeStr = "") {
  const result = {};

  sizeStr.split(",").forEach((item) => {
    const [size, qty] = item.trim().split("-");

    if (size && qty) {
      result[size.trim()] = Number(qty.trim());
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

        {/* ITEMS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginTop: "25px",
          }}
        >
          {quotationItems.map((item, index) => {
            const sizeMap =
              parseSizeString(item.size);

            const product = products.find(
              (p) =>
                p.desc === item.desc ||
                p.name === item.desc ||
                p.product_code === item.desc ||
                p.sku === item.desc
            );

            const variants =
              product?.variants || {};

            let totalCurrent = 0;
            let totalRequired = 0;

            Object.entries(sizeMap).forEach(
              ([size, qty]) => {
                totalRequired += qty;

                totalCurrent += Number(
                  variants?.[size]?.qty || 0
                );
              }
            );

            return (
              <div
                key={index}
                style={cardStyle}
              >
                {/* TOP */}
                <div style={topStyle}>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "24px",
                        fontWeight: "800",
                      }}
                    >
                      {item.desc}
                    </h3>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#777",
                        fontWeight: "600",
                      }}
                    >
                      Quotation PCS :
                      {" "}
                      {item.pcs}
                    </p>
                  </div>

                  <div
                    style={{
                      background:
                        totalCurrent >=
                        totalRequired
                          ? "#dcfce7"
                          : "#fee2e2",

                      color:
                        totalCurrent >=
                        totalRequired
                          ? "#166534"
                          : "#991b1b",

                      padding:
                        "10px 18px",

                      borderRadius:
                        "999px",

                      fontWeight: "800",
                    }}
                  >
                    {totalCurrent >=
                    totalRequired
                      ? "Stock Available"
                      : "Low Stock"}
                  </div>
                </div>

                {/* TABLE */}
                <div
                  style={{
                    overflowX: "auto",
                    marginTop: "18px",
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
                          Size
                        </th>

                        <th style={th}>
                          Required
                        </th>

                        <th style={th}>
                          Current Inventory
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
                      {Object.entries(
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
                              key={size}
                            >
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
                                  color: isOk
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
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

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
  maxWidth: "1100px",
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

const cardStyle = {
  border: "1px solid #eee",
  borderRadius: "20px",
  padding: "18px",
};

const topStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
};

const th = {
  textAlign: "left",
  padding: "14px",
  borderBottom: "1px solid #e5e7eb",
  background: "#f9fafb",
  fontSize: "14px",
  fontWeight: "800",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #f3f4f6",
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
