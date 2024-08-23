import React from "react";
import { createRoot } from "react-dom/client";
import Content from "./components/Content";

export const ROOT_ID = "__tureng-translate-root"

// Create a root to mount the extension interface.
const rootContainer = document.createElement('div');
rootContainer.setAttribute("id", ROOT_ID);

// Inject the root so that we can render the elements.
document.body.appendChild(rootContainer);

// Render it with React.
const root = createRoot(rootContainer);
root.render(<Content />);