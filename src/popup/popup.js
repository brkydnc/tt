import { browser } from 'webextension-polyfill';

const createElement = utils.createElement

const input = document.getElementById("input");
const output = document.getElementById("output");
const pronunciationContainer = document.getElementById("pronunciation-container");
const dictionarySelect = document.getElementById("dictionary");

function createPronunciations(pronunciations) {
  return pronunciations
    .map(p => {
      const style = utils.createStyleString({ "background-image": `url(${p.flag})` });
      const audio = createElement("audio", { src: p.audio });
      const audioContainer = createElement("div", {
        className: "pronunciation",
        style
      });

      audioContainer.onclick = () => {
        audio.load();
        audio.play();
      };
      audioContainer.appendChild(audio);

      return audioContainer;
    });
}

function createCellFromPhrase(phrase) {
  const phraseCell = createElement("td", { className: "table-cell" });

  const contentEl = createElement("span", {}, `${phrase.content}`);
  phraseCell.appendChild(contentEl);

  if (phrase.class) {
    const classElement = createElement("i", {}, `${phrase.class}`);
    phraseCell.appendChild(classElement);
  }

  if (phrase.badges.length > 0) {
    const badgeEls = phrase.badges
      .map(b => createElement("span", { className: "badge" }, `${b}`));

    phraseCell.append(...badgeEls);
  }

  return phraseCell;
}

function createTranslationTable({ term, separator, pronunciations }) {
  // Since we don't have <thead> or <tfoot>, we can omit <tbody> and append
  // <tr>s directly into <table>
  const table = createElement('table', { className: "table" });

  const translations = Object.values(separator).flat();
  translations.forEach(({ context, phrase, meaning }) => {
    const contextCell = createElement("td", { className: "table-cell" }, context);
    const phraseCell = createCellFromPhrase(phrase);
    const meaningCell = createCellFromPhrase(meaning);
    const tr = createElement("tr", { className: "table-row" });

    tr.append(contextCell, phraseCell, meaningCell);
    table.appendChild(tr);
  });

  return table;
}

function createSuggestions(terms) {
  const handle = term => main(term, 0);
  const ol = createElement('ol', { className: "suggestion-list" });

  terms.forEach(term => {
    const li = createElement('li', { className: "suggestion" }, term);
    li.setAttribute('tabindex', '0')
    li.onclick = () => handle(term);
    li.onkeyup = (e) => { if (e.key === "Enter") handle(term) };

    ol.appendChild(li);
  });

  const feedback = createElement('h4', { className: "suggestion-header" }, "Maybe the correct one is:");
  const container = createElement('div', { className: "suggestion-container" });
  container.append(feedback, ol);

  return container;
}

function display({ type, data }) {
  output.innerHTML = '';
  pronunciationContainer.innerHTML = '';

  let result;
  switch (type) {
    case "translation":
      result = createTranslationTable(data);
      const flags = createPronunciations(data.pronunciations);
      pronunciationContainer.append(...flags);
      break;
    case "suggestion":
      result = createSuggestions(data);
      break;
    case "notFound":
      result = createElement('h4', { className: "not-found" }, "Term not found.");
      break;
  }

  output.appendChild(result);

  input.focus();
}

const port = browser.runtime.connect({ name: "popup" });

let timeout;
function main(term, delay) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    port.postMessage({
      type: "translate",
      payload: { term, dictionary: dictionarySelect.value },
    });
  }, delay);
}

port.onMessage.addListener(({ type, payload }) => {
  switch (type) {
    case "translateResult":
      display(payload)
      break;
    case "translateInPopup":
      input.value = payload;
      main(payload, 0);
      break;
  }
});

input.addEventListener('input', e => {
  const value = e.target.value.trim();
  if (!value) return;
  main(value, 200);
});

dictionarySelect.addEventListener('change', e => {
  window.localStorage.setItem("dictionary", e.target.value);

  port.postMessage({
    type: "updatePopupDictionary",
    payload: e.target.value,
  });

  const term = input.value.trim();
  if (term) {
    port.postMessage({
      type: "translate",
      payload: { term, dictionary: e.target.value },
    });
  }
});

input.focus();
dictionarySelect.value = window.localStorage.getItem("dictionary") || "turkish-english";
