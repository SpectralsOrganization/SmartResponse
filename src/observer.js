// src/observer.js
import { injectGmailButton } from "./gmail.js";

/* Re-add the button whenever Gmail redraws the compose footer */
export function startObserver() {
  new MutationObserver(injectGmailButton)
    .observe(document.body, { childList: true, subtree: true });

  window.addEventListener("load", injectGmailButton);
}
