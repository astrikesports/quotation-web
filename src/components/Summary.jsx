import { useEffect } from "react";
export default function Summary({
  pcs,
  amount,
  billDiscount,
  setBillDiscount,
  shipping,
  setShipping,
  advance,
  setAdvance,
  net,
}) {

  return (

    <div className="px-4 pb-5 mt-4">

      <div className="bg-gradient-to-r from-[#050816] via-[#0b1020] to-[#050816] rounded-[38px] border border-white/10 shadow-[0_10px_60px_rgba(0,0,0,0.45)] overflow-hidden relative">

        {/* GLOW */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 blur-3xl rounded-full" />

        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 p-5 md:p-7">

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

            {/* TOTAL PCS */}
            <div className="rounded-[28px] bg-white/[0.04] border border-white/10 p-5 backdrop-blur-xl min-h-[170px] flex flex-col justify-between">

              <div>

                <p className="text-gray-400 text-xs tracking-[2px] font-bold">
                  TOTAL PCS
                </p>

                <h2 className="text-white text-5xl font-black mt-4">
                  {pcs}
                </h2>

              </div>

              <p className="text-gray-500 text-sm">
                Total number of pieces
              </p>

            </div>

            {/* GROSS */}
            <div className="rounded-[28px] bg-white/[0.04] border border-white/10 p-5 backdrop-blur-xl min-h-[170px] flex flex-col justify-between">

              <div>

                <p className="text-gray-400 text-xs tracking-[2px] font-bold">
                  GROSS AMOUNT
                </p>

                <h2 className="text-white text-5xl font-black mt-4">
                  ₹{amount}
                </h2>

              </div>

              <p className="text-gray-500 text-sm">
                After rate & SP discount
              </p>

            </div>

            {/* BILL DISCOUNT */}
            <div className="rounded-[28px] bg-white/[0.04] border border-white/10 p-5 backdrop-blur-xl min-h-[170px] flex flex-col justify-between">

              <div>

                <p className="text-gray-400 text-xs tracking-[2px] font-bold">
                  BILL DISCOUNT
                </p>

                <input
                  type="number"
                  min={0}
                  value={billDiscount}
                  onChange={(e) =>
                    setBillDiscount(
                      Number(e.target.value)
                    )
                  }
                  className="w-full h-14 rounded-2xl mt-4 bg-white/10 border border-white/10 px-5 text-white text-3xl font-black outline-none focus:border-green-400"
                />

              </div>

              <p className="text-gray-500 text-sm">
                Extra bill discount
              </p>

            </div>

            {/* SHIPPING */}
            <div className="rounded-[28px] bg-white/[0.04] border border-white/10 p-5 backdrop-blur-xl min-h-[170px] flex flex-col justify-between">

              <div>

                <p className="text-gray-400 text-xs tracking-[2px] font-bold">
                  SHIPPING
                </p>

                <input
                  type="number"
                  min={0}
                  value={shipping}
                  onChange={(e) =>
                    setShipping(
                      Number(e.target.value)
                    )
                  }
                  className="w-full h-14 rounded-2xl mt-4 bg-white/10 border border-white/10 px-5 text-white text-3xl font-black outline-none focus:border-blue-400"
                />

              </div>

              <p className="text-gray-500 text-sm">
                Added to bill
              </p>

            </div>

            {/* ADVANCE */}
            <div className="rounded-[28px] bg-white/[0.04] border border-white/10 p-5 backdrop-blur-xl min-h-[170px] flex flex-col justify-between">

              <div>

                <p className="text-gray-400 text-xs tracking-[2px] font-bold">
                  ADVANCE
                </p>

                <input
                  type="number"
                  min={0}
                  value={advance}
                  onChange={(e) =>
                    setAdvance(
                      Number(e.target.value)
                    )
                  }
                  className="w-full h-14 rounded-2xl mt-4 bg-white/10 border border-white/10 px-5 text-white text-3xl font-black outline-none focus:border-yellow-400"
                />

              </div>

              <p className="text-gray-500 text-sm">
                Deducted from bill
              </p>

            </div>

            {/* NET */}
            <div className="rounded-[28px] bg-gradient-to-br from-green-400 to-green-500 p-5 min-h-[170px] flex flex-col justify-between shadow-[0_10px_40px_rgba(34,197,94,0.45)]">

              <div>

                <p className="text-black/70 text-xs tracking-[2px] font-black">
                  NET PAYABLE
                </p>

                <h2 className="text-black text-6xl font-black mt-4">
                  ₹{net}
                </h2>

              </div>

              <p className="text-black/60 text-sm font-semibold">
                Final payable amount
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
