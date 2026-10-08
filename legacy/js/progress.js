/**
 * "Learned" progress tracking, persisted per browser in localStorage.
 * Storage can be unavailable (private mode, blocked site data), so every access is guarded.
 */

const STORAGE_KEY = 'ml-hub-learned';
const listeners = new Set();

function load() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

const learned = load();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...learned]));
  } catch {
    // Progress just won't survive a reload.
  }
}

export function isLearned(id) {
  return learned.has(id);
}

export function toggleLearned(id) {
  if (learned.has(id)) learned.delete(id);
  else learned.add(id);
  save();
  listeners.forEach(fn => fn(id));
  return learned.has(id);
}

export function onProgressChange(fn) {
  listeners.add(fn);
}
