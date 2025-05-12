// src/templates.js
import { storage, STORE_KEY } from "./storage.js";
import { DEFAULT_TEMPLATES } from "./defaults.js";

let userTemplates = {};
storage.get([STORE_KEY], (res) => {
  userTemplates = res[STORE_KEY] || {};
});

const saveUserTemplates = (map, cb) =>
  storage.set({ [STORE_KEY]: map }, cb);

export const getAllTemplates = () => ({ ...DEFAULT_TEMPLATES, ...userTemplates });
export const listMyTemplates = () => Object.keys(getAllTemplates()).sort();
export const getMyTemplate   = (name) => getAllTemplates()[name] || null;

export function saveMyTemplate(name, html) {
  if (!name) return;
  userTemplates[name] = html;
  saveUserTemplates(userTemplates, () =>
    console.log("Template sauvegardé :", name)
  );
}

export function deleteMyTemplate(name) {
  if (userTemplates[name]) {
    delete userTemplates[name];
    saveUserTemplates(userTemplates, () =>
      console.log("Template supprimé :", name)
    );
  }
}

/**
 * Replace every $&nom or $&amp;nom placeholder with a value
 * Prompts once per distinct placeholder.
 */
export function fillTemplateVariables(html) {
  const regex = /\$&(amp;)?([\wÀ-ÿ]+)/g;
  const placeholders = [...new Set([...html.matchAll(regex)].map(m => m[2]))];
  let filled = html;

  for (const key of placeholders) {
    const val = prompt(`Valeur pour « ${key} » :`);
    if (val === null) return null; // user cancelled
    const raw = new RegExp(`\\$&${key}`, "g");
    const enc = new RegExp(`\\$&amp;${key}`, "g");
    filled = filled.replace(raw, val).replace(enc, val);
  }
  return filled;
}
