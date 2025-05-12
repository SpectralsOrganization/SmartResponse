// src/storage.js
export const STORE_KEY = "gmailUserTemplates";

/**
 * Pick the best available storage layer
 * (sync → local → window.localStorage shim)
 */
function getStorageLayer() {
  if (typeof chrome !== "undefined" && chrome.storage) {
    if (chrome.storage.sync) return chrome.storage.sync;
    if (chrome.storage.local) return chrome.storage.local;
  }
  // Fallback shim that mimics chrome.storage
  return {
    get(keys, cb) {
      const k = Array.isArray(keys) ? keys[0] : keys;
      cb({ [k]: JSON.parse(localStorage.getItem(k) || "null") });
    },
    set(obj, cb) {
      const k = Object.keys(obj)[0];
      localStorage.setItem(k, JSON.stringify(obj[k]));
      cb?.();
    }
  };
}

export const storage = getStorageLayer();
