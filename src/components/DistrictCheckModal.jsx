import { useState } from "react";

const districtDB = [
  { district: "Davangere", party: "Google Collection" },
  { district: "Bhandara", party: "Radhe Collection" },
  { district: "Imphal", party: "Sandeep Kumar" },
  { district: "Munger", party: "Bishnu Enterprises" },
  { district: "Bhojpur", party: "Ayush Enterprises" },
  { district: "Agra", party: "Sunny Sports UP" },
  { district: "Guntur", party: "Sri Venkateshwar Fashion Hub" },
  { district: "Ahmednagar", party: "Shaurya Sports" },
  { district: "Varanasi", party: "Kanha Ji Sports" },
  { district: "Bharatpur", party: "Shree Laxmi Collection" }
];

export default function DistrictCheckModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  function handleSearch(value) {
    setQuery(value);

    if (!value) {
      setResults([]);
      return;
    }

    const filtered = districtDB.filter(d =>
      d.district.toLowerCase().includes(value.toLowerCase())
    );

    setResults(filtered);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[400px] rounded p-4">

        <h2 className="text-lg font-bold mb-3">
          🔍 Check District Availability
        </h2>

        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type district..."
          className="w-full border p-2 rounded mb-3"
        />

        <div className="max-h-60 overflow-y-auto">
          {results.map((item, i) => (
            <div
              key={i}
              className="p-2 border-b hover:bg-gray-100"
            >
              <b>{item.district}</b>
              <div className="text-sm text-gray-500">
                {item.party}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-600 text-white p-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
