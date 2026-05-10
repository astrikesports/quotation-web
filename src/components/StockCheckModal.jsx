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

                        const currentQty =
                          Number(
                            variants?.[
                              size
                            ]?.qty || 0
                          );

                        let reservedQty = 0;

                        const reservedBy =
                          [];

                        quotations.forEach(
                          (q) => {

                            if (
                              q.id ===
                              currentQuotationId
                            )
                              return;

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

                        const freeQty =
                          currentQty -
                          reservedQty;

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
                                    canProceed
                                      ? "#16a34a"
                                      : "#dc2626",

                                  fontWeight:
                                    "800",
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
                                      "8px 14px",

                                    borderRadius:
                                      "999px",

                                    fontSize:
                                      "12px",

                                    fontWeight:
                                      "900",
                                  }}
                                >

                                  {canProceed
                                    ? "AVAILABLE"
                                    : "LOW STOCK"}

                                </span>

                              </td>

                            </tr>

                            {/* RESERVED UI */}
                            {reservedBy.length >
                              0 && (

                              <tr>

                                <td
                                  colSpan="7"
                                  style={{
                                    padding:
                                      "0px 0px 20px",

                                    background:
                                      "#fff",

                                    borderBottom:
                                      "1px solid #f3f4f6",
                                  }}
                                >

                                  <div
                                    style={{
                                      margin:
                                        "14px 18px 0",

                                      background:
                                        "#fff7ed",

                                      border:
                                        "1px solid #fdba74",

                                      borderRadius:
                                        "20px",

                                      overflow:
                                        "hidden",
                                    }}
                                  >

                                    {/* TOP */}
                                    <div
                                      style={{
                                        padding:
                                          "14px 18px",

                                        background:
                                          "#fed7aa",

                                        borderBottom:
                                          "1px solid #fdba74",

                                        display:
                                          "flex",

                                        alignItems:
                                          "center",

                                        justifyContent:
                                          "space-between",

                                        flexWrap:
                                          "wrap",

                                        gap: "10px",
                                      }}
                                    >

                                      <div
                                        style={{
                                          display:
                                            "flex",

                                          alignItems:
                                            "center",

                                          gap: "10px",
                                        }}
                                      >

                                        <div
                                          style={{
                                            width:
                                              "40px",

                                            height:
                                              "40px",

                                            borderRadius:
                                              "12px",

                                            background:
                                              "#fff",

                                            display:
                                              "flex",

                                            alignItems:
                                              "center",

                                            justifyContent:
                                              "center",

                                            fontSize:
                                              "20px",
                                          }}
                                        >
                                          ⚠️
                                        </div>

                                        <div>

                                          <div
                                            style={{
                                              fontWeight:
                                                "900",

                                              fontSize:
                                                "16px",

                                              color:
                                                "#9a3412",
                                            }}
                                          >
                                            Reserved
                                            Stock
                                          </div>

                                          <div
                                            style={{
                                              fontSize:
                                                "13px",

                                              color:
                                                "#c2410c",

                                              marginTop:
                                                "2px",
                                            }}
                                          >
                                            Already booked
                                            by other
                                            quotations
                                          </div>

                                        </div>

                                      </div>

                                      <div
                                        style={{
                                          background:
                                            "#fff",

                                          padding:
                                            "10px 16px",

                                          borderRadius:
                                            "14px",

                                          fontWeight:
                                            "900",

                                          color:
                                            "#9a3412",

                                          fontSize:
                                            "14px",
                                        }}
                                      >

                                        Reserved :
                                        {" "}
                                        {
                                          reservedQty
                                        }
                                        {" "}
                                        PCS

                                      </div>

                                    </div>

                                    {/* LIST */}
                                    <div
                                      style={{
                                        padding:
                                          "16px",

                                        display:
                                          "grid",

                                        gap: "12px",
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

                                              borderRadius:
                                                "18px",

                                              padding:
                                                "16px 18px",

                                              display:
                                                "flex",

                                              alignItems:
                                                "center",

                                              justifyContent:
                                                "space-between",

                                              gap: "15px",

                                              flexWrap:
                                                "wrap",
                                            }}
                                          >

                                            {/* LEFT */}
                                            <div
                                              style={{
                                                display:
                                                  "flex",

                                                alignItems:
                                                  "center",

                                                gap: "14px",
                                              }}
                                            >

                                              <div
                                                style={{
                                                  width:
                                                    "50px",

                                                  height:
                                                    "50px",

                                                  borderRadius:
                                                    "16px",

                                                  background:
                                                    "#fff7ed",

                                                  display:
                                                    "flex",

                                                  alignItems:
                                                    "center",

                                                  justifyContent:
                                                    "center",

                                                  fontSize:
                                                    "22px",

                                                  border:
                                                    "1px solid #fdba74",
                                                }}
                                              >
                                                👨‍💼
                                              </div>

                                              <div>

                                                <div
                                                  style={{
                                                    fontSize:
                                                      "16px",

                                                    fontWeight:
                                                      "900",

                                                    color:
                                                      "#111827",
                                                  }}
                                                >
                                                  {
                                                    r.salesPerson
                                                  }
                                                </div>

                                                <div
                                                  style={{
                                                    marginTop:
                                                      "4px",

                                                    fontSize:
                                                      "14px",

                                                    color:
                                                      "#6b7280",

                                                    fontWeight:
                                                      "600",
                                                  }}
                                                >
                                                  🏢{" "}
                                                  {
                                                    r.party
                                                  }
                                                </div>

                                              </div>

                                            </div>

                                            {/* RIGHT */}
                                            <div
                                              style={{
                                                background:
                                                  "#f97316",

                                                color:
                                                  "#fff",

                                                padding:
                                                  "12px 18px",

                                                borderRadius:
                                                  "16px",

                                                fontWeight:
                                                  "900",

                                                fontSize:
                                                  "15px",

                                                minWidth:
                                                  "110px",

                                                textAlign:
                                                  "center",
                                              }}
                                            >

                                              📦{" "}
                                              {
                                                r.qty
                                              }
                                              {" "}
                                              PCS

                                            </div>

                                          </div>
                                        )
                                      )}

                                    </div>

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
  maxWidth: "1350px",
  maxHeight: "92vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "28px",
  padding: "25px",
  boxShadow:
    "0 20px 60px rgba(0,0,0,0.25)",
};

const headerStyle = {
  display: "flex",
  justifyContent:
    "space-between",
  alignItems: "center",
};

const titleStyle = {
  margin: 0,
  fontSize: "34px",
  fontWeight: "900",
};

const subTitleStyle = {
  margin: "8px 0 0",
  color: "#6b7280",
  fontSize: "15px",
  fontWeight: "500",
};

const closeBtn = {
  width: "50px",
  height: "50px",
  borderRadius: "14px",
  border: "none",
  background: "#f3f4f6",
  cursor: "pointer",
  fontSize: "22px",
  fontWeight: "700",
};

const tableWrapper = {
  overflowX: "auto",
  marginTop: "25px",
};

const tableStyle = {
  width: "100%",
  borderCollapse:
    "collapse",
};

const th = {
  textAlign: "left",
  padding: "16px",
  borderBottom:
    "1px solid #e5e7eb",
  background: "#f9fafb",
  fontSize: "14px",
  fontWeight: "900",
  color: "#111827",
};

const td = {
  padding: "18px 16px",
  borderBottom:
    "1px solid #f3f4f6",
  fontSize: "15px",
  fontWeight: "700",
  color: "#111827",
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
