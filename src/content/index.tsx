import React from "react";
import { createRoot } from "react-dom/client";
import browser from 'webextension-polyfill';

import "scss-reset/total-reset.scss";

import Content from "./components/Content";
import { Showcase } from "./components/Showcase";

export const HOST_ID = "__tureng-translate-host__"
export const CONTAINER_ID = "__tureng-translate-container__"

async function init() {
  const host = document.createElement('div');
  host.setAttribute("id", HOST_ID);
  document.body.appendChild(host);

  // Create a style sheet from the inline css string.
  const sheet = new CSSStyleSheet();

  // TODO: Replace this with css bundle text (somehow).
  // https://parceljs.org/features/bundle-inlining/
  if (__SANDBOX__) {
    const cssFile = await fetch('/content/index.css');
    const css = await cssFile.text();
    sheet.replaceSync(css);
  } else {
    const url = browser.runtime.getURL('content/index.css');
    const cssFile = await fetch(url);
    const css = await cssFile.text();
    sheet.replaceSync(css);
  }

  // Use a shadow dom to isolate the components and their styles 
  // from the page that they are going to be injected into.
  const shadow = host.attachShadow({ mode: "open" });
  shadow.adoptedStyleSheets = [sheet];

  const container = document.createElement('div');
  container.setAttribute("id", CONTAINER_ID);

  shadow.appendChild(container)

  const root = createRoot(container);

  if (__SANDBOX__) {
    root.render(
      <>
        <Showcase />
        <Content />
      </>
    )
  } else {
    root.render(<Content />);
  }
}

init();