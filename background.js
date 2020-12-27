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
  if (!searchResults) return {status: 1, value: []};
  const termFound = !searchResults.classList.contains("tureng-page-suggest");

  if (termFound) {
    const [...tableBodies] = searchResults.getElementsByTagName("tbody");
    const meanings = tableBodies
      .map(body =>
        [...body.children]
        .slice(1)
        .filter(tr => tr.attributes.length === 0)
        .map(tr => 
          [...tr.children]
          .splice(1, 4)
          .map(td => td.textContent.replace(/\s+/g, ' ').trim())
        )
      )
      .flat();
    return { status: 0, value: meanings };
  }

  const [feedback] = searchResults.getElementsByTagName("h1");
  switch (feedback.textContent) {
    case "Term not found":
      return { status: 1, value: [] };
    case "Maybe the correct one is":
      const [suggestions] = searchResults.getElementsByClassName('suggestion-list');
      const [...listElements] = suggestions.getElementsByTagName('li');
      const terms = listElements.map(li => li.firstElementChild.textContent);
      return { status: 2, value: terms };
  }
}

const popup = {
  port: null,
  openedWith: "",
  selectionRegister: "",
  setPort: function(port) {
    this.port = port;
    this.onConnect();
  },
  onConnect: function translateInPopup() {
    if (this.openedWith !== "translate-in-popup") return;
    this.port.postMessage({
      op: "translateInPopup",
      value: this.selectionRegister,
    });
  }
};

browser.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.op === "translate")
    fetchDocument(msg.value).then(doc => sendResponse(scrape(doc)));
  return true;
});

browser.runtime.onConnect.addListener(port => {
  switch (port.name) {
    case "popup":
      popup.setPort(port);
      break;

    case "content":
      port.onMessage.addListener(msg => {
        if (msg.op === "registerSelection")
          popup.selectionRegister = msg.value;
      });
      break;
  }
});

browser.commands.onCommand.addListener((name) => {
  popup.openedWith = name;
  if (name === "translate-in-popup" && !popup.selectionRegister) return;
  browser.browserAction.openPopup();
});
