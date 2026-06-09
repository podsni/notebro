/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

// Polyfill: ensure structuredClone and localStorage methods keep their
// native `this` context after Bun bundler strips globalThis references.
// tldraw's value.mjs assigns globalThis.structuredClone to a variable,
// which breaks when Bun inlines/tree-shakes the call site.
if (typeof globalThis.structuredClone === "function") {
  const _sc = globalThis.structuredClone.bind(globalThis);
  Object.defineProperty(globalThis, "structuredClone", {
    value: _sc,
    writable: true,
    configurable: true,
  });
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// https://bun.com/docs/bundler/hot-reloading#import-meta-hot-data
(import.meta.hot.data.root ??= createRoot(elem)).render(app);
