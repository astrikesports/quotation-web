import { useEffect, useState } from "react";
import { fetchQuotations } from "../services/quotationService";

export default function LoadQuotationModal({
  onClose,
  onSelect,     // edit / load
  onDelete      // delete
}) {
  const [list, setList] = useState([]);
  const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const loadList = async () => {
  const data = await fetchQuotations();
  setList(data || []);
  };

  const handleDeleteClick = async (q) => {
  await onDelete(q);   // waits for confirm + delete
  await loadList();    // 🔥 AUTO REFRESH LIST
  };

  useEffect(() => {
  loadList();
  }, []);


  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[420px] rounded shadow-lg p-4">

        <h2 className="text-lg font-bold mb-3">Load Quotation</h2>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {list.map(q => (
            <div
              key={q.id}
              className="p-2 border rounded hover:bg-blue-50"
            >
              {/* TOP INFO */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">
                    {q.quotation_no || "—"}
                  </div>
                  <div className="text-sm">{q.party}</div>
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(q.created_at)}
                      {q.updated_at && (
                        <> | Updated: {formatDate(q.updated_at)}</>
                      )}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelect(q.id)}
                    className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteClick(q)}
                    className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {list.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-8">
              No quotations found
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-3 px-4 py-2 bg-gray-200 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
