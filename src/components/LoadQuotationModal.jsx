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
              className="bg-gradient-to-r from-[#0b1220] to-[#111827] rounded-[28px] p-5 border border-white/10 shadow-xl hover:scale-[1.01] transition-all duration-200"
            >
          
              {/* TOP */}
              <div className="flex justify-between items-start gap-4">
          
                {/* LEFT */}
                <div className="flex-1">
          
                  {/* QUOTATION NO */}
                  <div className="flex items-center gap-3">
          
                    <div className="w-11 h-11 rounded-2xl bg-green-500 flex items-center justify-center text-black font-black shadow-lg">
                      #
                    </div>
          
                    <div>
          
                      <p className="text-gray-400 text-[10px] font-bold tracking-[2px]">
                        QUOTATION NO
                      </p>
          
                      <h3 className="text-white text-xl font-black mt-1">
                        {q.quotation_no || "N/A"}
                      </h3>
          
                    </div>
          
                  </div>
          
                  {/* PARTY */}
                  <div className="mt-5">
          
                    <p className="text-gray-400 text-[10px] font-bold tracking-[2px]">
                      PARTY NAME
                    </p>
          
                    <h2 className="text-2xl font-black text-white mt-1">
                      {q.party || "-"}
                    </h2>
          
                  </div>
          
                  {/* DETAILS */}
                  <div className="grid grid-cols-2 gap-4 mt-5">
          
                    {/* SALES PERSON */}
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
          
                      <p className="text-gray-400 text-[10px] font-bold tracking-[2px]">
                        SALES PERSON
                      </p>
          
                      <h4 className="text-white font-black text-lg mt-1">
                        {q.salesPerson || q.sales_person || "-"}
                      </h4>
          
                    </div>
          
                    {/* SALE AMOUNT */}
                    <div className="bg-green-500 rounded-2xl p-3 shadow-lg">
          
                      <p className="text-black/70 text-[10px] font-black tracking-[2px]">
                        SALE AMOUNT
                      </p>
          
                      <h4 className="text-black font-black text-2xl mt-1">
                        ₹{
                          Number(
                            q.netAmount ||
                            q.net_amount ||
                            0
                          ).toLocaleString()
                        }
                      </h4>
          
                    </div>
          
                  </div>
          
                  {/* DATES */}
                  <div className="flex flex-wrap gap-3 mt-5">
          
                    {/* CREATED */}
                    <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
          
                      <p className="text-gray-400 text-[10px] font-bold tracking-[2px]">
                        CREATED
                      </p>
          
                      <p className="text-white font-bold mt-1">
                        {formatDate(q.created_at)}
                      </p>
          
                    </div>
          
                    {/* UPDATED */}
                    <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
          
                      <p className="text-gray-400 text-[10px] font-bold tracking-[2px]">
                        UPDATED
                      </p>
          
                      <p className="text-white font-bold mt-1">
          
                        {q.updated_at
                          ? formatDate(q.updated_at)
                          : "-"}
          
                      </p>
          
                    </div>
          
                  </div>
          
                </div>
          
                {/* ACTIONS */}
                <div className="flex flex-col gap-3">
          
                  {/* EDIT */}
                  <button
                    onClick={() => onSelect(q.id)}
                    className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-lg shadow-lg hover:scale-105 transition-all"
                  >
                    ✏️
                  </button>
          
                  {/* DELETE */}
                  <button
                    onClick={() => handleDeleteClick(q)}
                    className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center text-lg shadow-lg hover:scale-105 transition-all"
                  >
                    🗑
                  </button>
          
                  {/* SAVE */}
                  <button
                    className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center text-lg shadow-lg hover:scale-105 transition-all"
                  >
                    💾
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
