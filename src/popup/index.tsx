import React from "react";
import { createRoot } from "react-dom/client";

// Put this import before all component imports. Otherwise, it won't work.
import "scss-reset/total-reset.scss";

import Popup from "./components/Popup";

// import { isDevelopmentBuild } from "../utils";
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