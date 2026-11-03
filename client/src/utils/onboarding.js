const KEY = 'todo.onboarded';

// localStorage can be unavailable (private mode, blocked storage), so never let it throw.
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
  } catch {
    /* ignore */
  }
}
