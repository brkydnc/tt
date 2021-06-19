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

function createTranslationTable({ term, translations, pronunciations }) {
  const tableElement = createElement('table', { className: "table" });
  const tbody = createElement('table', { className: "table" });
  tableElement.appendChild(tbody);

  const flattened = translations.flat();
  flattened.forEach(({ context, phrase, meaning }) => {
    const contextCell = createElement("td", {className: "table-cell"}, context);

    const phraseText = (phrase.class)
      ? `${phrase.content} ${phrase.class}`
      : phrase.content;
    const phraseCell = createElement("td", {className: "table-cell"}, phraseText);

    const meaningText = (meaning.class)
      ? `${meaning.content} ${meaning.class}`
      : meaning.content;
    const meaningCell = createElement("td", {className: "table-cell"}, meaningText);

    const tr = createElement("tr", { className: "table-row" });
    tr.append(contextCell, phraseCell, meaningCell);
    tbody.appendChild(tr);
  });

  return tableElement;
}

function createSuggestions(terms) {
  const handle = term => main(term, 0);
  const ol = createElement('ol', { className: "suggestion-list"});

  terms.forEach(term => {
    const li = createElement('li', {className: "suggestion"}, term);
    li.setAttribute('tabindex', '0')
    li.onclick = () => handle(term);
    li.onkeyup = (e) => { if (e.key === "Enter") handle(term) };

    ol.appendChild(li);
  });

  const feedback = createElement('h4', { className: "suggestion-header" }, "Maybe the correct one is:");
  const container = createElement('div', {className: "suggestion-container" });
  container.append(feedback, ol);

  return container;
}

function display({status, value}) {
  output.innerHTML = '';
  pronunciationContainer.innerHTML = '';

  let result;
  switch(status) {
    case 0:
      result = createTranslationTable(value);
      const flags = createPronunciations(value.pronunciations);
      pronunciationContainer.append(...flags);
      break;
    case 1:
      result = createElement('h4', { className: "not-found" }, "Term not found.");
      break;
    case 2:
      result = createSuggestions(value);
      break;
  }

  output.appendChild(result);

  input.focus();
}

const port = browser.runtime.connect({name: "popup"});

let timeout;
function main(term, delay) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    port.postMessage({
      op: "translate",
      value: { term, dictionary: dictionarySelect.value },
    });
  }, delay);
}

port.onMessage.addListener(({ op, value }) => {
  switch (op) {
    case "translateResult":
      display(value)
      break;
    case "translateInPopup":
      input.value = value;
      main(value, 0);
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
    op: "updatePopupDictionary",
    value: e.target.value,
  });

  const term = input.value.trim();
  if (term) {
    port.postMessage({
      op: "translate",
      value: { term, dictionary: e.target.value },
    });
  }
});

input.focus();
dictionarySelect.value = window.localStorage.getItem("dictionary") || "turkish-english";
