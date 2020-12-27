const input = document.getElementById("input");
const output = document.getElementById("output");

function display({status, value}) {
  let result;
  switch(status) {
    case 0:
      result = produceTable(value);
      break;
    case 1:
      const element = document.createElement('h4');
      const text = document.createTextNode("Term not found.");
      element.className = "not-found"
      element.appendChild(text);
      result = element;
      break;
    case 2:
      result = produceSuggestion(value);
      break;
  }

  output.innerHTML = '';
  output.appendChild(result);
  input.focus();
}

function produceTable(rows) {
  const tableElement = document.createElement('table');
  tableElement.className = "table";
  const tbody = document.createElement('tbody');
  tbody.className = "table-body"

  tableElement.appendChild(tbody);

  rows
    .map((content) => {
      const tr = document.createElement('tr');
      tr.className = "table-row"
      content.forEach(item => {
        const td = document.createElement('td');
        const text = document.createTextNode(item);
        td.appendChild(text);
        tr.appendChild(td);
      })
      return tr;
    })
    .forEach(tr => { tbody.appendChild(tr); })

  return tableElement;
}

function produceSuggestion(terms) {
  const handle = term => main(term, 0);

  const ol = document.createElement('ol');
  ol.className = "suggestion-list";
  
  terms.forEach(term => {
    const li = document.createElement('li');
    const text = document.createTextNode(term);
    li.setAttribute('tabindex', '0')
    li.className = "suggestion";
    li.appendChild(text);
    li.onclick = () => handle(term);
    li.onkeyup = (e) => { if (e.key === "Enter") handle(term) };

    ol.appendChild(li);
  });

  const feedback = document.createElement('h4');
  const text = document.createTextNode("Maybe the correct one is:");
  feedback.className = "suggestion-header";
  feedback.appendChild(text);

  const container = document.createElement('div');
  container.className = "suggestion-container";
  container.appendChild(feedback);
  container.appendChild(ol);

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
