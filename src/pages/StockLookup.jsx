import { useCallback, useEffect, useMemo, useState } from 'react';

const SHEET_ID = '1q2fZWkLrFs9qF3TquXQAN5ByWwSm7YNaMMyaewPDbQI';
const GID = '1565745828';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); if (row.some(v => v.trim())) rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  row.push(cell); if (row.some(v => v.trim())) rows.push(row); return rows;
}

export default function StockLookup() {
  const [csv, setCsv] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [updated, setUpdated] = useState(null); const [search, setSearch] = useState('');
  const fetchStock = useCallback(async () => {
    try { setError(''); const response = await fetch('/api/stock-sheet?t=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) throw new Error('Live sheet fetch failed (' + response.status + ')');
      const data = await response.json(); setCsv(data.csv || ''); setUpdated(data.fetchedAt || new Date().toISOString());
    } catch (e) { setError(e.message || 'Connection error'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchStock(); const timer = setInterval(fetchStock, 30000); return () => clearInterval(timer); }, [fetchStock]);
  const rows = useMemo(() => parseCSV(csv), [csv]);
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); if (!q) return rows; return rows.filter(row => row.some(cell => String(cell).toLowerCase().includes(q))); }, [rows, search]);
  const fmt = updated ? new Date(updated).toLocaleString() : '—';
  return <div className="min-h-screen bg-slate-100 p-3 md:p-7">
    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
      <header className="bg-[#14243d] text-white px-5 py-5 flex flex-wrap items-center justify-between gap-3">
        <div><div className="font-black tracking-wide text-lg">📦 ASTRIKE SPORTS — LIVE STOCK LOOKUP</div><p className="text-slate-300 text-sm mt-1">Google Sheet inventory · Auto refresh every 30 seconds</p></div>
        <button onClick={fetchStock} className="px-4 py-2 rounded-lg bg-white text-[#14243d] font-bold hover:bg-slate-100">↻ Refresh Now</button>
      </header>
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKU, size, bill no., customer…" className="border rounded-lg px-3 py-2 w-full md:max-w-md outline-none focus:ring-2 focus:ring-blue-300"/>
        <div className="text-xs text-slate-500">{loading ? 'Connecting…' : error ? 'Connection issue' : `Last updated: ${fmt}`} · {rows.length} rows</div>
      </div>
      {error && <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">{error} — Showing last successfully loaded data if available. <button onClick={fetchStock} className="underline font-bold ml-1">Retry</button></div>}
      {loading && !csv && <div className="p-10 text-center text-slate-500">Loading live stock data…</div>}
      {!loading && !csv && !error && <div className="p-10 text-center text-slate-500">No stock data returned from sheet.</div>}
      {filtered.length > 0 && <div className="overflow-auto max-h-[75vh]"><table className="min-w-full text-sm"><tbody>{filtered.map((row, ri) => <tr key={ri} className={ri % 2 ? 'bg-slate-50' : 'bg-white'}>{row.map((cell, ci) => <td key={ci} className={`border border-slate-200 px-3 py-2 whitespace-nowrap ${ri === 0 ? 'font-bold bg-slate-100 text-slate-700' : ''}`}>{cell}</td>)}</tr>)}</tbody></table></div>}
      <footer className="px-4 py-3 text-xs text-slate-500 flex justify-between"><span>Live sheet view · Read-only</span><a className="text-blue-700 underline" target="_blank" rel="noreferrer" href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?gid=${GID}`}>Open Google Sheet ↗</a></footer>
    </div></div>;
}
