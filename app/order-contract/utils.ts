export function toNum(v: string) {
  const n = Number(String(v).replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export function calcPercent(contractAmount: string, listPrice: string) {
  const c = toNum(contractAmount);
  const p = toNum(listPrice);
  if (!Number.isFinite(c) || !Number.isFinite(p) || p === 0) return "";
  const pct = ((c - p) / p) * 100;
  return pct.toFixed(1);
}

// 全角→半角変換関数
export const toHankaku = (str: string) => str
  .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
  .replace(/　/g, ' ');
