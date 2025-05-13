import { getMyTemplate, fillTemplateVariables } from "./templates.js";

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

  // 1) Récupère toutes les classes du bouton "Envoyer"
  btn.className = sendBtn.className;

  // 2) Aligne la hauteur et le line-height
  const { height, width: sendWidth } = sendBtn.getBoundingClientRect();
  btn.style.height = `${height}px`;
  btn.style.lineHeight = `${height}px`;

  // 3) Décalage à gauche
  btn.style.marginLeft = "8px";

  // 4) Largeur plus généreuse : 1.4× celle du bouton “Envoyer”
  btn.style.minWidth = `${sendWidth * 1.4}px`;

  // 5) Chargement dynamique de la modale
  btn.addEventListener("click", async () => {
    const { generateModal } = await import("./modal.js");
    generateModal();
  });

  sendBtn.parentNode.insertBefore(btn, sendBtn.nextSibling);
}
