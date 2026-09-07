export function readLocalList(key) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function readLocalObject(key, fallback) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "null");
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocalList(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function saveLocalObject(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
