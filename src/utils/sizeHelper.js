// Shared size order used by desktop, mobile and PDF quotation views.
export const ALL_SIZES = ["26", "28", "30", "32", "34", "36", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

export function parseSizes(sizeStr) {
  const map = {};
  if (!sizeStr || sizeStr === "-") return map;

  String(sizeStr).split(",").forEach(part => {
    const entry = part.trim();
    if (!entry) return;

    // Supports the app's "S-10,M-5" format and older "S:10,M:5" records.
    const match = entry.match(/^(26|28|30|32|34|36|S|M|L|XL|2XL|3XL|4XL)\\s*[-:]\\s*(\\d+(?:\\.\\d+)?)$/i);
    if (match) {
      const key = match[1].toUpperCase();
      map[key] = Number(match[2]) || 0;
    }
  });

  return map;
}
