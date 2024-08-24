import React from "react";
import { createRoot } from "react-dom/client";
import Content from "./components/Content";

import styles from './index.scss';

export const CONTAINER_ID = "__tureng-translate-root"

const host = document.createElement('div');
document.body.appendChild(host);

// Create a style sheet from the inline css string.
const sheet = new CSSStyleSheet();
sheet.replaceSync(styles);

// Use a shadow dom to isolate the components and their styles 
// from the page that they are going to be injected into.
const shadow = host.attachShadow({ mode: "open" });
shadow.adoptedStyleSheets = [sheet];

const container = document.createElement('div');
container.setAttribute("id", CONTAINER_ID);

shadow.appendChild(container)

const root = createRoot(container);
root.render(<Content />);