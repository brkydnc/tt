const input = document.getElementById("input");
const output = document.getElementById("output");

function createElement(tag, props={}, text="") {
  const element = document.createElement(tag);
  Object.assign(element, props);
  if (!text) return element;
  const textNode = document.createTextNode(text);
  element.appendChild(textNode);
  return element;
}

async function display({status, value}) {
  let result;
  switch(status) {
    case 0:
      result = produceTable(value);
      break;
    case 1:
      result = createElement('h4', { className: "not-found" }, "Term not found.");
      break;
    case 2:
      result = produceSuggestion(value);
      break;
  }

  output.innerHTML = '';
  output.appendChild(result);
  input.focus();
}

function produceTable({term, translations}) {
  const tableElement = createElement('table', { className: "table" });
  const tbody = createElement('tbody', { className: "table-body" });
  tableElement.appendChild(tbody);

  const flattened = translations.flat();
  flattened.forEach(({ context, phrase, meaning }) => {
    const contextCell = createElement("td", {}, context);

    const phraseText = (phrase.class)
      ? `${phrase.content} ${phrase.class}`
      : phrase.content;
    const phraseCell = createElement("td", {}, phraseText);

    const meaningText = (meaning.class)
      ? `${meaning.content} ${meaning.class}`
      : meaning.content;
    const meaningCell = createElement("td", {}, meaningText);

    const tr = createElement("tr", { className: "table-row" });
    tr.append(contextCell, phraseCell, meaningCell);
    tbody.appendChild(tr);
  });

  return tableElement;
}

function produceSuggestion(terms) {
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

let timeout;
function main(term, delay) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    browser.runtime.sendMessage({
      op: "translate",
      value: term,
    }).then(display).catch(e => console.log(e));
  }, delay);
}

const port = browser.runtime.connect({name: "popup"});
port.onMessage.addListener((msg) => {
  switch (msg.op) {
    case "translateInPopup":
      input.value = msg.value;
      main(msg.value, 0);
      break;
  }
});

input.addEventListener('input', e => {
  const value = e.target.value.trim();
  if (!value) return;
  main(value, 200);
})

input.focus();
