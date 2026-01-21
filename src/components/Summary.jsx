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
    <div className="bg-blue-600 text-white px-6 py-4">
      <div className="max-w-6xl mx-auto grid grid-cols-6 gap-4 text-sm items-end">

        {/* TOTAL PCS */}
        <div>
          <p className="text-blue-200">Total PCS</p>
          <p className="font-semibold">{pcs}</p>
          <p className="text-xs text-blue-200">
            (Total  No of  PCS.)
          </p>
        </div>

        {/* GROSS AMOUNT */}
        <div>
          <p className="text-blue-200">Gross Amount</p>
          <p className="font-semibold">₹{amount}</p>
          <p className="text-xs text-blue-200">
            (After rate & SP discount)
          </p>
        </div>

        {/* BILL DISCOUNT */}
        <div>
          <p className="text-blue-200">Bill Discount</p>
          <input
            type="number"
            min={0}
            className="w-full mt-1 px-2 py-1 rounded text-black"
            value={billDiscount}
            onChange={e => setBillDiscount(Number(e.target.value))}
          />
          <p className="text-xs text-blue-200">
            − Extra bill level discount
          </p>
        </div>

        {/* SHIPPING */}
        <div>
          <p className="text-blue-200">Shipping Charges</p>
          <input
            type="number"
            min={0}
            className="w-full mt-1 px-2 py-1 rounded text-black"
            value={shipping}
            onChange={e => setShipping(Number(e.target.value))}
          />
          <p className="text-xs text-blue-200">
            + Added to bill
          </p>
        </div>

        {/* ADVANCE */}
        <div>
          <p className="text-blue-200">Advance Received</p>
          <input
            type="number"
            min={0}
            className="w-full mt-1 px-2 py-1 rounded text-black"
            value={advance}
            onChange={e => setAdvance(Number(e.target.value))}
          />
          <p className="text-xs text-blue-200">
            − Deducted from bill
          </p>
        </div>

        {/* NET PAYABLE */}
        <div className="bg-white text-blue-700 rounded-lg p-3 text-center">
          <p className="font-semibold">Net Payable</p>
          <p className="text-xl font-bold">
            ₹{net}
          </p>
        </div>

      </div>
    </div>
  );
}
