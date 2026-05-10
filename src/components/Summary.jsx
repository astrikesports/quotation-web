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

    <div className="mt-6">

      <div className="bg-gradient-to-r from-black via-gray-900 to-black rounded-[32px] shadow-2xl border border-white/10 relative overflow-hidden">

        {/* BG EFFECT */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />

        <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl" />

        {/* CONTENT */}
        <div className="relative z-10 p-6 md:p-8">

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5 items-end">

            {/* TOTAL PCS */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">

              <p className="text-gray-400 text-sm font-semibold tracking-wide">
                TOTAL PCS
              </p>

              <h2 className="text-4xl font-black text-white mt-3">
                {pcs}
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                Total number of pieces
              </p>

            </div>

            {/* GROSS AMOUNT */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">

              <p className="text-gray-400 text-sm font-semibold tracking-wide">
                GROSS AMOUNT
              </p>

              <h2 className="text-4xl font-black text-white mt-3">
                ₹{amount}
              </h2>

              <p className="text-xs text-gray-500 mt-2">
                After rate & SP discount
              </p>

            </div>

            {/* BILL DISCOUNT */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">

              <p className="text-gray-400 text-sm font-semibold tracking-wide">
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
                className="w-full h-12 mt-3 rounded-2xl bg-white/10 border border-white/10 px-4 text-white text-xl font-black outline-none focus:border-green-400"
              />

              <p className="text-xs text-gray-500 mt-2">
                Extra bill level discount
              </p>

            </div>

            {/* SHIPPING */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">

              <p className="text-gray-400 text-sm font-semibold tracking-wide">
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
                className="w-full h-12 mt-3 rounded-2xl bg-white/10 border border-white/10 px-4 text-white text-xl font-black outline-none focus:border-blue-400"
              />

              <p className="text-xs text-gray-500 mt-2">
                Added to bill
              </p>

            </div>

            {/* ADVANCE */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">

              <p className="text-gray-400 text-sm font-semibold tracking-wide">
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
                className="w-full h-12 mt-3 rounded-2xl bg-white/10 border border-white/10 px-4 text-white text-xl font-black outline-none focus:border-yellow-400"
              />

              <p className="text-xs text-gray-500 mt-2">
                Deducted from bill
              </p>

            </div>

            {/* NET PAYABLE */}
            <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-3xl p-5 shadow-2xl">

              <p className="text-black/70 text-sm font-black tracking-wide">
                NET PAYABLE
              </p>

              <h2 className="text-5xl font-black text-black mt-3 leading-none">
                ₹{net}
              </h2>

              <p className="text-xs text-black/60 mt-2 font-semibold">
                Final payable amount
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
