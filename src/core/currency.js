export function parseCurrencyBR(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const clean = String(value || "")
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .trim();

  if (!clean) return null;

  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean;

  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function formatCurrencyBR(value) {
  const number = parseCurrencyBR(value);
  if (number === null) return "";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
}

export function maskCurrencyBR(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";
  return formatCurrencyBR(Number(digits) / 100);
}
