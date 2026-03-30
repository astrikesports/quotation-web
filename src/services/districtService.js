let districtCache = null;

export async function loadDistricts() {
  if (districtCache) return districtCache;

  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?gid=813343933&single=true&output=csv"
  );

  const text = await res.text();

  const rows = text.split("\n").slice(1);

  const data = rows.map(row => {
    const cols = row.split(",");

    return {
      party: cols[0]?.trim(),      // 👉 Column A
      district: cols[1]?.trim()    // 👉 Column B
    };
  });

  districtCache = data;
  return data;
}
