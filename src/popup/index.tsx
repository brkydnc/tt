import React from "react";
import { createRoot } from "react-dom/client";

import "scss-reset/total-reset.scss";
import Popup from "./components/Popup";

// Listen for esbuild changes in development.
if (__SANDBOX__) {
  const esbuild = new EventSource('/esbuild');
  esbuild.addEventListener('change', () => location.reload());
}

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find the root element");
  const root = createRoot(rootContainer);
  root.render(<Popup />);
}

init();