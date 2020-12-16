const domParser = new DOMParser();
const input = document.getElementById("input");
const output = document.getElementById("output");

async function fetchDocument(term) {
  const res = await fetch('https://tureng.com/en/turkish-english/' + term);
  const text = await res.text();
  const doc = domParser.parseFromString(text, 'text/html');
  return doc;
}

function crawl(doc) {
  const [searchResults] = doc.getElementsByClassName("tureng-searchresults-content");
  const termFound = !searchResults.classList.contains("tureng-page-suggest");

  let status = 0, value = [];
  if (termFound) {
    const [...tableBodies] = searchResults.getElementsByTagName("tbody");
    value = tableBodies
      .map(body =>
        [...body.children]
          .slice(1)
          .filter(tr => tr.attributes.length === 0)
          .map(tr => 
            [...tr.children]
              .splice(0, 4)
              .map(td => td.textContent.replace(/\s+/g, ' ').trim())
          )
      );
  }
  
  const [feedback] = searchResults.getElementsByTagName("h1");
  switch (feedback.textContent) {
    case "Maybe the correct one is":
      status = 2;
      const [suggestions] = searchResults.getElementsByClassName('suggestion-list');
      const [...listElements] = suggestions.getElementsByTagName('li');
      const terms = listElements.map(li => li.firstElementChild.textContent);
      value = terms;
      break;
    case "Term not found":
      status = 1; break;
  }

  return { status, value }
}

function display(status, value) {
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
  clearTimeout(timeout)
  timeout = setTimeout(async () => {
    const doc = await fetchDocument(term);
    const { status, value } = crawl(doc);
    display(status, value);
  }, delay);
}

input.addEventListener('input', e => {
  const value = e.target.value;
  if (!value) return;
  main(value, 200);
})
