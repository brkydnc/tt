const input = document.getElementById("input");
const output = document.getElementById("output");

function display({status, value}) {
  let result;
  switch(status) {
    case 0:
      result = produceTable(value);
      break;
    case 1:
      const element = document.createElement('p');
      const text = document.createTextNode("Term not found.");
      element.appendChild(text);
      result = element;
      break;
    case 2:
      result = produceSuggestion(value);
      break;
  }

  output.innerHTML = '';
  output.appendChild(result);
}

function produceTable(table) {
  const tableElement = document.createElement('table');
  table
    .map(body => {
      const tbody = document.createElement('tbody');
      body
        .map((content) => {
          const tr = document.createElement('tr');
          content.forEach(item => {
            const td = document.createElement('td');
            const text = document.createTextNode(item);
            td.className = ''
            td.appendChild(text);
            tr.appendChild(td);
          })
          return tr;
        })
        .forEach(tr => { tbody.appendChild(tr); })
      return tbody;
    })
    .forEach(tbody => { tableElement.appendChild(tbody); });
  return tableElement;
}

function produceSuggestion(terms) {
  const handle = term => main(term, 0);

  const ol = document.createElement('ol');
  ol.className = "suggestion-list";
  
  terms.forEach(term => {
    const li = document.createElement('li');
    const text = document.createTextNode(term);
    li.appendChild(text);
    li.onclick = () => handle(term);

    ol.appendChild(li);
  });

  const feedback = document.createElement('h4');
  const text = document.createTextNode("Maybe the correct one is:");
  feedback.appendChild(text);

  const container = document.createElement('div');
  container.appendChild(feedback);
  container.appendChild(ol);

  return container;
}

let timeout;
function main(term, delay) {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    browser.runtime.sendMessage(term)
      .then(display, (e) => console.log(e))
  }, delay);
}

input.addEventListener('input', e => {
  const value = e.target.value;
  if (!value) return;
  main(value.trim(), 200);
})

input.focus();
