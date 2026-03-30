let districtCache = null;

export async function loadDistricts() {
  if (districtCache) return districtCache;

  const res = await fetch(
    "https://docs.google.com/spreadsheets/d/1Y5VQsIQ33UYPOe1-Ul6VV7vv79lbrHnu8aRoAgYLeho/edit?gid=813343933#gid=813343933pub?output=csv"
  );

  const text = await res.text();

  const rows = text.split("\n").slice(1); // skip header

  const data = rows.map(row => {
    const cols = row.split(",");

    return {
      party: cols[1]?.trim(),
      district: cols[3]?.trim()
    };
  });

  districtCache = data;
  return data;
}
