// src/utils/sizeHelper.js
export const ALL_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

export function parseSizes(sizeStr) {
  const map = {};
  if (!sizeStr || sizeStr === "-") return map;

  sizeStr.split(",").forEach(p => {
    const [s, v] = p.trim().split("-");
    map[s] = Number(v) || 0;
  });

  return map;
}
