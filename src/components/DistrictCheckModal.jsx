import { useEffect, useState } from "react";
import { loadDistricts } from "../services/districtService";


export default function DistrictCheckModal({ onClose }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [db, setDb] = useState([]);

  useEffect(() => {
    loadDistricts().then(setDb);
  }, []);

  function handleSearch(value) {
    setQuery(value);

    if (!value) {
      setResult(null);
      return;
    }

    const found = db.find(d =>
      d.district?.toLowerCase().includes(value.toLowerCase())
    );

    if (found) {
      setResult({
        found: true,
        party: found.party
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
          📍 Check District (Live)
        </h2>

        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Type district..."
          className="w-full border p-2 rounded mb-3"
        />

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
