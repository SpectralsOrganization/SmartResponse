/**
 * Gmail template selection modal script
 * Persistance prioritaire via **chrome.storage.sync** ; fallback automatique sur
 * `chrome.storage.local`, puis sur `localStorage` si l'API Chrome n'est pas dispo
 * (ex. exécution Tampermonkey ou page sans extension).
 *
 * -> Plus d'erreur « Cannot read properties of undefined (reading 'sync') »
 *
 * API console :
 *   saveMyTemplate(name, html)
 *   deleteMyTemplate(name)
 *   listMyTemplates()
 */

(function () {
    /* -------------------------------------------------- */
    /* Sélection dynamique de la couche de stockage       */
    /* -------------------------------------------------- */
    const STORE_KEY = "gmailUserTemplates"; // { [name]: html }
  
    /**
     * Retourne un objet { get(key, cb), set(obj, cb) } abstraitant chrome/localStorage.
     */
    function getStorageLayer() {
      if (typeof chrome !== "undefined" && chrome.storage) {
        if (chrome.storage.sync) return chrome.storage.sync;      // priorité sync
        if (chrome.storage.local) return chrome.storage.local;    // fallback local
      }
      // Fallback : interface minimale sur localStorage (sync)
      return {
        get(keys, cb) {
          const k = Array.isArray(keys) ? keys[0] : keys;
          const out = {};
          out[k] = JSON.parse(localStorage.getItem(k) || "null");
          cb(out);
        },
        set(obj, cb) {
          const k = Object.keys(obj)[0];
          localStorage.setItem(k, JSON.stringify(obj[k]));
          cb && cb();
        }
      };
    }
    const storage = getStorageLayer();
  
    /* -------------------------------------------------- */
    /* Modèles par défaut                                 */
    /* -------------------------------------------------- */
    const DEFAULT_TEMPLATES = {
      "Réponse simple": `<p>Bonjour,</p><p>Merci pour votre message. Je reviens vers vous rapidement.</p><p>Cordialement, <br>Votre nom</p>`,
      "Demande d'informations": `<p>Bonjour,</p><p>Pourriez‑vous m'envoyer les informations complémentaires concernant&nbsp;…</p><p>Merci d'avance&nbsp;!</p>`,
      Relance: `<p>Bonjour,</p><p>Je me permets de revenir vers vous concernant ma précédente demande.</p>`,
      Remerciement: `<p>Bonjour,</p><p>Un grand merci pour votre aide&nbsp;!</p>`
    };
  
    /* -------------------------------------------------- */
    /* Chargement / persistance                           */
    /* -------------------------------------------------- */
    let userTemplates = {};
    storage.get([STORE_KEY], (res) => {
      userTemplates = res[STORE_KEY] || {};
    });
  
    const saveUserTemplates = (map, cb) => {
      storage.set({ [STORE_KEY]: map }, cb);
    };
  
    const getAllTemplates = () => ({ ...DEFAULT_TEMPLATES, ...userTemplates });
    const listMyTemplates = () => Object.keys(getAllTemplates()).sort();
    const getMyTemplate = (name) => getAllTemplates()[name] || null;
  
    /* -------------------------------------------------- */
    /* Opérations CRUD exposées                           */
    /* -------------------------------------------------- */
    function saveMyTemplate(name, html) {
      if (!name) return;
      userTemplates[name] = html;
      saveUserTemplates(userTemplates, () => console.log("Template sauvegardé :", name));
    }
    function deleteMyTemplate(name) {
      if (userTemplates[name]) {
        delete userTemplates[name];
        saveUserTemplates(userTemplates, () => console.log("Template supprimé :", name));
      }
    }
  
    /* -------------------------------------------------- */
    /* Insertion dans Gmail                               */
    /* -------------------------------------------------- */
    function templateSelect(name) {
      const html = getMyTemplate(name);
      if (!html) return alert("Template introuvable : " + name);
      const body = document.querySelector(".Am.Al.editable");
      if (!body) return alert("Zone d'édition Gmail non détectée");
      body.innerHTML = html;
      body.focus();
    }
  
    /* -------------------------------------------------- */
    /* Styles                                             */
    /* -------------------------------------------------- */
    function injectStyles() {
      if (document.getElementById("templateModalStyles")) return;
      const s = document.createElement("style");
      s.id = "templateModalStyles";
      s.textContent = `
  #templateSelectionModal .tsm-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);z-index:9999}
  #templateSelectionModal .tsm-window{background:#fff;width:90%;max-width:420px;padding:24px 20px;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,.2);font-family:Arial,Helvetica,sans-serif}
  #templateSelectionModal h2{margin:0 0 16px;font-size:20px}
  #templateSelectionModal .tsm-list{list-style:none;padding:0;margin:0 0 12px;max-height:220px;overflow-y:auto}
  #templateSelectionModal .tsm-item{padding:10px 12px;border-radius:4px;cursor:pointer;user-select:none}
  #templateSelectionModal .tsm-item:hover{background:#f0f0f0}
  #templateSelectionModal .tsm-close,#templateSelectionModal .tsm-save{padding:8px 16px;border:none;border-radius:4px;cursor:pointer;color:#fff}
  #templateSelectionModal .tsm-close{background:#1976d2}
  #templateSelectionModal .tsm-save{background:#388e3c;margin-right:8px}`;
      document.head.appendChild(s);
    }
  
    /* -------------------------------------------------- */
    /* Modale                                             */
    /* -------------------------------------------------- */
    let modal;
    const renderTemplateList = () => {
      const listEl = modal?.querySelector("#templateList");
      if (!listEl) return;
      listEl.innerHTML = "";
      listMyTemplates().forEach((name) => {
        const li = document.createElement("li");
        li.textContent = name;
        li.className = "tsm-item";
        li.addEventListener("click", () => {
          templateSelect(name);
          modal.style.display = "none";
        });
        listEl.appendChild(li);
      });
    };
  
    function generateModal() {
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
  
        modal.querySelector("#closeModalButton").addEventListener("click", () => (modal.style.display = "none"));
        modal.querySelector(".tsm-backdrop").addEventListener("click", (e) => {
          if (e.target === e.currentTarget) modal.style.display = "none";
        });
        modal.querySelector("#saveTemplateButton").addEventListener("click", () => {
          const body = document.querySelector(".Am.Al.editable");
          if (!body) return alert("Zone d'édition Gmail non détectée");
          const html = body.innerHTML.trim();
          if (!html) return alert("Le contenu du mail est vide.");
          const name = prompt("Nom du nouveau template :");
          if (!name) return;
          saveMyTemplate(name, html);
          renderTemplateList();
          alert(`Template « ${name} » sauvegardé !`);
        });
      }
      renderTemplateList();
      modal.style.display = "block";
    }
  
    /* -------------------------------------------------- */
    /* Bouton Gmail                                       */
    /* -------------------------------------------------- */
    function injectGmailButton() {
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
  
    new MutationObserver(injectGmailButton).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("load", injectGmailButton);
  
    /* -------------------------------------------------- */
    /* Exposition console                                 */
    /* -------------------------------------------------- */
    Object.assign(window, { saveMyTemplate, deleteMyTemplate, listMyTemplates });
  })();
  