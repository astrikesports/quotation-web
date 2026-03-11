import { useEffect, useState } from "react";

export default function StockCheckModal({ onClose }) {

const [sku,setSku] = useState("")
const [data,setData] = useState([])
const [filtered,setFiltered] = useState([])
const [selected,setSelected] = useState(null)
const [loading,setLoading] = useState(false)

useEffect(()=>{

loadStock()

},[])

const loadStock = async () => {

setLoading(true)

try{

const res = await fetch("YOUR_GOOGLE_SCRIPT_URL")
const json = await res.json()

setData(json)

}catch(err){

console.error(err)

}

setLoading(false)

}

const handleSearch = (value) => {

setSku(value)

if(!value){

setFiltered([])
return

}

const result = data.filter(i =>
i.sku.toLowerCase().includes(value.toLowerCase())
)

setFiltered(result.slice(0,5))

}

const selectSku = (item) => {

setSelected(item)
setSku(item.sku)
setFiltered([])

}

return (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white w-[420px] rounded-xl p-6 shadow-xl">

<h2 className="text-xl font-bold mb-4">
Stock Checker
</h2>

<input
type="text"
value={sku}
placeholder="Search SKU..."
onChange={(e)=>handleSearch(e.target.value)}
className="border w-full p-2 rounded"
/>

{filtered.length > 0 && (

<div className="border rounded mt-2 max-h-40 overflow-y-auto">

{filtered.map((item,index)=>(

<div
key={index}
onClick={()=>selectSku(item)}
className="p-2 hover:bg-gray-100 cursor-pointer"
>

{item.sku}

</div>

))}

</div>

)}

{selected && (

<div className="mt-4 p-4 rounded bg-gray-50">

<div className="flex justify-between">

<span className="font-semibold">
SKU
</span>

<span>
{selected.sku}
</span>

</div>

<div className="flex justify-between mt-2">

<span className="font-semibold">
Stock
</span>

<span className={
selected.stock > 0
? "text-green-600 font-bold"
: "text-red-600 font-bold"
}>

{selected.stock}

</span>

</div>

</div>

)}

{loading && (

<div className="mt-4 text-sm">
Loading stock...
</div>

)}

<button
onClick={onClose}
className="mt-5 w-full bg-gray-200 py-2 rounded"
>

Close

</button>

</div>

</div>

)

}
