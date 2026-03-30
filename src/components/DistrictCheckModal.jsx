import { useState } from "react";

const districtDB = [
  { district: "Davangere", party: "Google Collection" },
  { district: "Bhandara", party: "Radhe Collection" },
  { district: "Imphal", party: "Sandeep Kumar" },
  { district: "Munger", party: "Bishnu Enterprises" },
  { district: "Bhojpur", party: "Ayush Enterprises" },
  { district: "Agra", party: "Sunny Sports UP" }
];

export default function DistrictCheckModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  function handleSearch(value) {
    setQuery(value);

    if (!value) {
      setResult(null);
      return;
    }

    const found = districtDB.find(d =>
      d.district.toLowerCase().includes(value.toLowerCase())
    );

    if (found) {
      setResult({
        found: true,
        party: found.party,
        district: found.district
      });
    } else {
      setResult({
        found: false
      });
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[400px] rounded p-4">

        <h2 className="text-lg font-bold mb-3">
          📍 Check District
        </h2>

        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type district..."
          className="w-full border p-2 rounded mb-3"
        />

        {/* 🔥 RESULT SHOW */}
        {result && (
          <div className="mt-3 p-3 rounded border">
            
            {result.found ? (
              <div className="text-red-600 font-semibold">
                ❌ This district is not available <br />
                🏢 Party: {result.party}
              </div>
            ) : (
              <div className="text-green-600 font-semibold">
                ✅ District Available
              </div>
            )}

          </div>
        )}

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
