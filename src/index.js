// src/index.js
import "./storage.js";          // sets up `storage`
import "./defaults.js";         // makes sure DEFAULT_TEMPLATES is evaluated
import "./templates.js";        // loads user-saved templates
import { startObserver } from "./observer.js";

startObserver();                // that’s it!
