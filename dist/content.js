(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/storage.js
  function getStorageLayer() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      if (chrome.storage.sync) return chrome.storage.sync;
      if (chrome.storage.local) return chrome.storage.local;
    }
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
  var STORE_KEY, storage;
  var init_storage = __esm({
    "src/storage.js"() {
      STORE_KEY = "gmailUserTemplates";
      storage = getStorageLayer();
    }
  });

  // src/defaults.js
  var DEFAULT_TEMPLATES;
  var init_defaults = __esm({
    "src/defaults.js"() {
      DEFAULT_TEMPLATES = {
        "R\xE9ponse simple": `<p>Bonjour,</p><p>Merci pour votre message $&nom. Je reviens vers vous rapidement.</p><p>Cordialement,<br>$&signature</p>`,
        "Demande d'informations": `<p>Bonjour $&contact,</p><p>Pourriez-vous m'envoyer les informations compl\xE9mentaires concernant&nbsp;\u2026</p><p>Merci d'avance&nbsp;!</p>`,
        Relance: `<p>Bonjour,</p><p>Je me permets de revenir vers vous concernant ma pr\xE9c\xE9dente demande du $&date.</p>`,
        Remerciement: `<p>Bonjour,</p><p>Un grand merci pour votre aide $&nom&nbsp;!</p>`
      };
    }
  });

  // src/templates.js
  function saveMyTemplate(name, html) {
    if (!name) return;
    userTemplates[name] = html;
    saveUserTemplates(
      userTemplates,
      () => console.log("Template sauvegard\xE9 :", name)
    );
  }
  function deleteMyTemplate(name) {
    if (userTemplates[name]) {
      delete userTemplates[name];
      saveUserTemplates(
        userTemplates,
        () => console.log("Template supprim\xE9 :", name)
      );
    }
  }
  function fillTemplateVariables(html) {
    const regex = /\$&(amp;)?([\wÀ-ÿ]+)/g;
    const placeholders = [...new Set([...html.matchAll(regex)].map((m) => m[2]))];
    let filled = html;
    for (const key of placeholders) {
      const val = prompt(`Valeur pour \xAB ${key} \xBB :`);
      if (val === null) return null;
      const raw = new RegExp(`\\$&${key}`, "g");
      const enc = new RegExp(`\\$&amp;${key}`, "g");
      filled = filled.replace(raw, val).replace(enc, val);
    }
    return filled;
  }
  var userTemplates, saveUserTemplates, getAllTemplates, listMyTemplates, getMyTemplate;
  var init_templates = __esm({
    "src/templates.js"() {
      init_storage();
      init_defaults();
      userTemplates = {};
      storage.get([STORE_KEY], (res) => {
        userTemplates = res[STORE_KEY] || {};
      });
      saveUserTemplates = (map, cb) => storage.set({ [STORE_KEY]: map }, cb);
      getAllTemplates = () => ({ ...DEFAULT_TEMPLATES, ...userTemplates });
      listMyTemplates = () => Object.keys(getAllTemplates()).sort();
      getMyTemplate = (name) => getAllTemplates()[name] || null;
    }
  });

  // src/modal.js
  var modal_exports = {};
  __export(modal_exports, {
    generateModal: () => generateModal,
    injectStyles: () => injectStyles
  });
  function injectStyles() {
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
  function renderTemplateList() {
    const listEl = modal?.querySelector("#templateList");
    if (!listEl) return;
    listEl.innerHTML = "";
    listMyTemplates().forEach((name) => {
      const li = Object.assign(document.createElement("li"), { className: "tsm-item" });
      const label = Object.assign(document.createElement("span"), { textContent: name, style: "flex:1" });
      const del = Object.assign(document.createElement("span"), {
        className: "tsm-delete",
        textContent: "\xD7",
        title: "Supprimer ce template"
      });
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Supprimer le template \xAB ${name} \xBB ?`)) {
          deleteMyTemplate(name);
          renderTemplateList();
        }
      });
      li.append(label, del);
      li.addEventListener("click", () => {
        templateSelect(name);
        modal.style.display = "none";
      });
      listEl.appendChild(li);
    });
  }
  function generateModal() {
    injectStyles();
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "templateSelectionModal";
      modal.innerHTML = `
      <div class="tsm-backdrop">
        <div class="tsm-window" role="dialog" aria-modal="true">
          <h2>S\xE9lectionnez un template</h2>
          <ul id="templateList" class="tsm-list"></ul>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
            <button id="saveTemplateButton" class="tsm-save">Sauvegarder le template</button>
            <button id="closeModalButton" class="tsm-close">Fermer</button>
          </div>
        </div>
      </div>`;
      document.body.appendChild(modal);
      modal.querySelector("#closeModalButton").addEventListener("click", () => modal.style.display = "none");
      modal.querySelector(".tsm-backdrop").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) modal.style.display = "none";
      });
      modal.querySelector("#saveTemplateButton").addEventListener("click", () => {
        const body = document.querySelector(".Am.Al.editable");
        if (!body) return alert("Zone d'\xE9dition Gmail non d\xE9tect\xE9e");
        const html = body.innerHTML.trim();
        if (!html) return alert("Le contenu du mail est vide.");
        const name = prompt("Nom du nouveau template :");
        if (!name) return;
        saveMyTemplate(name, html);
        renderTemplateList();
        alert(`Template \xAB ${name} \xBB sauvegard\xE9 !`);
      });
    }
    renderTemplateList();
    modal.style.display = "block";
  }
  var modal;
  var init_modal = __esm({
    "src/modal.js"() {
      init_templates();
      init_gmail();
    }
  });

  // src/gmail.js
  function templateSelect(name) {
    const raw = getMyTemplate(name);
    if (!raw) return alert("Template introuvable : " + name);
    const body = document.querySelector(".Am.Al.editable");
    if (!body) return alert("Zone d'\xE9dition Gmail non d\xE9tect\xE9e");
    const processed = fillTemplateVariables(raw);
    if (processed === null) return;
    body.innerHTML = processed;
    body.focus();
  }
  function injectGmailButton() {
    const sendBtn = document.querySelector("div.T-I.J-J5-Ji.aoO.v7");
    if (!sendBtn) return;
    if (document.getElementById("templateSelectionButton")) return;
    const btn = document.createElement("button");
    btn.id = "templateSelectionButton";
    btn.textContent = "Liste templates";
    btn.className = sendBtn.className;
    const { height, width: sendWidth } = sendBtn.getBoundingClientRect();
    btn.style.height = `${height}px`;
    btn.style.lineHeight = `${height}px`;
    btn.style.marginLeft = "8px";
    btn.style.minWidth = `${sendWidth * 1.4}px`;
    btn.addEventListener("click", async () => {
      const { generateModal: generateModal2 } = await Promise.resolve().then(() => (init_modal(), modal_exports));
      generateModal2();
    });
    sendBtn.parentNode.insertBefore(btn, sendBtn.nextSibling);
  }
  var init_gmail = __esm({
    "src/gmail.js"() {
      init_templates();
    }
  });

  // src/index.js
  init_storage();
  init_defaults();
  init_templates();

  // src/observer.js
  init_gmail();
  function startObserver() {
    new MutationObserver(injectGmailButton).observe(document.body, { childList: true, subtree: true });
    window.addEventListener("load", injectGmailButton);
  }

  // src/index.js
  startObserver();
})();
