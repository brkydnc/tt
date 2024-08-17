import React from "react";
import { createRoot } from "react-dom/client";

import Popup from "./Popup";
import { isDevelopmentBuild } from "../utils";

// Listen for esbuild changes in development.
// if (isDevelopmentBuild()) {
//   const esbuild = new EventSource('/esbuild');
//   esbuild.addEventListener('change', () => location.reload());
// }

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find the root element");
  const root = createRoot(rootContainer);
  root.render(<Popup />);
}

init();