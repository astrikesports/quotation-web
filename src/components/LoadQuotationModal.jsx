import { useEffect, useMemo, useState } from "react";
import { fetchQuotations } from "../services/quotationService";

const PAGE_SIZE = 10;

export default function LoadQuotationModal({
  onClose,
  onSelect,
  onDelete
}) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔍 search + pagination state
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  /* 🔹 LOAD DATA */
  const loadList = async () => {
    setLoading(true);
    try {
      const data = await fetchQuotations();
      setList(data || []);
    } catch (e) {
      console.error("Failed to load quotations", e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  /* 🔍 FILTER (SEARCH) */
  const filteredList = useMemo(() => {
    if (!search.trim()) return list;

    const q = search.toLowerCase();
    return list.filter(it =>
      (it.party || "").toLowerCase().includes(q) ||
      (it.quotation_no || "").toLowerCase().includes(q)
    );
  }, [list, search]);

  /* 📄 PAGINATION */
  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE);

  const paginatedList = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, page]);

  /* ⚡ OPTIMISTIC DELETE */
  const handleDeleteClick = async (q) => {
    // instant UI remove
    const backup = list;
    setList(prev => prev.filter(it => it.id !== q.id));

    try {
      await onDelete(q);     // actual delete
    } catch (e) {
      console.error("Delete failed, restoring list", e);
      setList(backup);      // rollback
    }
  };

  // reset page on search
  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-[460px] rounded shadow-lg p-4">

        {/* HEADER */}
        <h2 className="text-lg font-bold mb-3">Load Quotation</h2>

        {/* 🔍 SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search party / quotation no..."
          className="w-full mb-3 px-3 py-2 text-sm border rounded"
        />

        {/* LIST */}
        <div className="max-h-[320px] overflow-y-auto space-y-2">
          {loading && (
            <div className="text-center text-sm text-gray-500 py-6">
              Loading quotations...
            </div>
          )}

          {!loading && paginatedList.map(q => (
            <div
              key={q.id}
              className="p-2 border rounded hover:bg-blue-50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">
                    {q.quotation_no || "—"}
                  </div>
                  <div className="text-sm">{q.party || "-"}</div>
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(q.created_at)}
                    {q.updated_at && (
                      <> | Updated: {formatDate(q.updated_at)}</>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onSelect(q.id)}
                    className="px-2 py-1 text-xs rounded bg-blue-600 text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteClick(q)}
                    className="px-2 py-1 text-xs rounded bg-red-500 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && filteredList.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-8">
              No quotations found
            </div>
          )}
        </div>

        {/* 📄 PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-3 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <div>
              Page {page} / {totalPages}
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* FOOTER */}
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-gray-200 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
