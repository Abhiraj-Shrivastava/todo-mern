const KEY = 'todo.onboarded';

export function hasOnboarded() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return true;
  }
}

export function markOnboarded() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {}
}
