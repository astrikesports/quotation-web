import { useEffect, useState } from "react";
import { fetchStockData } from "../services/stockService";

export default function StockCheckModal({ onClose }) {

const [sku,setSku] = useState("")
const [data,setData] = useState([])
const [filtered,setFiltered] = useState([])
const [loading,setLoading] = useState(false)

useEffect(()=>{

loadStock()

},[])

const loadStock = async () => {

setLoading(true)

const stock = await fetchStockData()

setData(stock)

setFiltered(stock)

setLoading(false)

}

const handleSearch = (value) => {

setSku(value)

const result = data.filter(i =>
i.sku.toLowerCase().includes(value.toLowerCase())
)

setFiltered(result)

}

return (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white w-[420px] rounded-xl p-5 shadow-xl">

<h2 className="text-lg font-bold mb-3">
Stock Checker
</h2>

<input
type="text"
value={sku}
placeholder="Search SKU..."
onChange={(e)=>handleSearch(e.target.value)}
className="border w-full p-2 rounded"
/>

<div className="border rounded mt-3 max-h-60 overflow-y-auto">

{loading && (
<div className="p-3 text-sm">
Loading stock...
</div>
)}

{filtered.map((item,index)=>(

<div
key={index}
className="flex justify-between items-center px-3 py-2 border-b hover:bg-gray-50"
>

<span className="font-medium">
{item.sku}
</span>

<span
className={
item.stock > 0
? "text-green-600 font-semibold"
: "text-red-600 font-semibold"
}
>
{item.stock} pcs
</span>

</div>

))}

</div>

<button
onClick={onClose}
className="mt-4 w-full bg-gray-200 py-2 rounded"
>
Close
</button>

</div>

</div>

)

}
