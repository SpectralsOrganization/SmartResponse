// src/modal.js
import { listMyTemplates, deleteMyTemplate, saveMyTemplate } from "./templates.js";
import { templateSelect } from "./gmail.js";

let modal;

/* ----------  injected styles (once)  ---------- */
export function injectStyles() {
  if (document.getElementById("templateModalStyles")) return;
  const css = `
#templateSelectionModal .tsm-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);z-index:9999}
#templateSelectionModal .tsm-window{background:#fff;width:90%;max-width:420px;padding:24px 20px;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,.2);font-family:Arial,Helvetica,sans-serif}
#templateSelectionModal h2{margin:0 0 16px;font-size:20px}
#templateSelectionModal .tsm-list{list-style:none;padding:0;margin:0 0 12px;max-height:220px;overflow-y:auto}
#templateSelectionModal .tsm-item{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:4px;cursor:pointer;user-select:none}
#templateSelectionModal .tsm-item:hover{background:#f0f0f0}
#templateSelectionModal .tsm-delete{margin-left:auto;font-weight:bold;cursor:pointer;color:#e53935}
#templateSelectionModal .tsm-delete:hover{color:#b71c1c}
#templateSelectionModal .tsm-close,#templateSelectionModal .tsm-save{padding:8px 16px;border:none;border-radius:4px;cursor:pointer;color:#fff}
#templateSelectionModal .tsm-close{background:#1976d2}
#templateSelectionModal .tsm-save{background:#388e3c;margin-right:8px}`;
  document.head.appendChild(
    Object.assign(document.createElement("style"), {
      id: "templateModalStyles",
      textContent: css
    })
  );
}

/* ----------  list renderer  ---------- */
function renderTemplateList() {
  const listEl = modal?.querySelector("#templateList");
  if (!listEl) return;
  listEl.innerHTML = "";

  listMyTemplates().forEach((name) => {
    const li    = Object.assign(document.createElement("li"), { className: "tsm-item" });
    const label = Object.assign(document.createElement("span"), { textContent: name, style: "flex:1" });
    const del   = Object.assign(document.createElement("span"), {
      className: "tsm-delete",
      textContent: "×",
      title: "Supprimer ce template"
    });

    del.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Supprimer le template « ${name} » ?`)) {
        deleteMyTemplate(name);
        renderTemplateList();
      }
    });

    li.append(label, del);
    li.addEventListener("click", () => {
      templateSelect(name);      // fill Gmail editor
      modal.style.display = "none";
    });

    listEl.appendChild(li);
  });
}

/* ----------  modal creation  ---------- */
export function generateModal() {
  injectStyles();

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "templateSelectionModal";
    modal.innerHTML = `
      <div class="tsm-backdrop">
        <div class="tsm-window" role="dialog" aria-modal="true">
          <h2>Sélectionnez un template</h2>
          <ul id="templateList" class="tsm-list"></ul>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
            <button id="saveTemplateButton" class="tsm-save">Sauvegarder le template</button>
            <button id="closeModalButton" class="tsm-close">Fermer</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(modal);

    modal.querySelector("#closeModalButton")
         .addEventListener("click", () => (modal.style.display = "none"));

    modal.querySelector(".tsm-backdrop")
         .addEventListener("click", (e) => {
           if (e.target === e.currentTarget) modal.style.display = "none";
         });

    modal.querySelector("#saveTemplateButton")
         .addEventListener("click", () => {
           const body = document.querySelector(".Am.Al.editable");
           if (!body) return alert("Zone d'édition Gmail non détectée");

           const html = body.innerHTML.trim();
           if (!html)  return alert("Le contenu du mail est vide.");

           const name = prompt("Nom du nouveau template :");
           if (!name) return;

           saveMyTemplate(name, html);
           renderTemplateList();
           alert(`Template « ${name} » sauvegardé !`);
         });
  }

  renderTemplateList();
  modal.style.display = "block";
}
