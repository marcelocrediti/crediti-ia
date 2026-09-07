export function formatPhone(value) {
  const numbers = String(value).replace(/\D/g, "").slice(0, 11);

  if (!numbers) return "";
  if (numbers.length <= 2) return `(${numbers}`;

  const ddd = numbers.slice(0, 2);
  const rest = numbers.slice(2);

  if (rest.length <= 5) return `(${ddd}) ${rest}`;

  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function firstName(name) {
  return String(name).trim().split(/\s+/)[0] || "";
}

export function normalize(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
