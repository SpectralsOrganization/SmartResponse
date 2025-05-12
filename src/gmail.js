// src/gmail.js
import { getMyTemplate, fillTemplateVariables } from "./templates.js";
import { generateModal } from "./modal.js";

/* ----------  replace the editor’s HTML  ---------- */
export function templateSelect(name) {
  const raw = getMyTemplate(name);
  if (!raw)  return alert("Template introuvable : " + name);

  const body = document.querySelector(".Am.Al.editable");
  if (!body)  return alert("Zone d'édition Gmail non détectée");

  const processed = fillTemplateVariables(raw);
  if (processed === null) return;              // user cancelled

  body.innerHTML = processed;
  body.focus();
}

/* ----------  add “Liste templates” button  ---------- */
export function injectGmailButton() {
  const sendBtn = document.querySelector("div.T-I.J-J5-Ji.aoO.v7");
  if (!sendBtn) return;

  if (document.getElementById("templateSelectionButton")) return;
  const btn = document.createElement("button");
  btn.id = "templateSelectionButton";
  btn.textContent = "Liste templates";
  btn.style.marginLeft = "8px";
  btn.addEventListener("click", generateModal);

  sendBtn.parentNode.insertBefore(btn, sendBtn.nextSibling);
}
