import { useEffect, useState } from "react";
import { fetchStockData } from "../services/stockService";

export default function StockCheckModal({ onClose }) {

const [sku,setSku] = useState("")
const [data,setData] = useState([])
const [filtered,setFiltered] = useState([])

useEffect(()=>{

loadStock()

},[])

const loadStock = async () => {

const stock = await fetchStockData()

setData(stock)
setFiltered(stock)

}

const handleSearch = (value) => {

setSku(value)

const search = value.toLowerCase().replace(/[^a-z0-9]/g,"")

const result = data.filter(item => {

const sku = item.sku
.toLowerCase()
.replace(/[^a-z0-9]/g,"")

return sku.includes(search)

})

setFiltered(result)

}

return (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white p-6 rounded w-[400px]">

<h2 className="font-bold mb-3">Stock Checker</h2>

<input
value={sku}
onChange={(e)=>handleSearch(e.target.value)}
className="border w-full p-2 rounded"
/>

<div className="max-h-48 overflow-y-auto mt-3 border rounded">

{filtered.map((item,i)=>(

<div key={i} className="flex justify-between px-3 py-2 border-b">

<span>{item.sku}</span>
<span>{item.stock}</span>

</div>

))}

</div>

<button
onClick={onClose}
className="mt-4 w-full bg-gray-200 p-2 rounded"
>

Close

</button>

</div>

</div>

)

}
