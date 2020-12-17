const domParser = new DOMParser();
const URL = 'https://tureng.com/en/turkish-english/';

async function fetchDocument(term) {
  const res = await fetch(URL + term);
  const text = await res.text();
  const doc = domParser.parseFromString(text, 'text/html');
  return doc;
}

function scrape(doc) {
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

  return { status, value };
}

browser.runtime.onMessage.addListener((term, _, sendResponse) => {
  fetchDocument(term) .then(doc => sendResponse(scrape(doc)));
  return true;
});
