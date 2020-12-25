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
          .splice(1, 4)
          .map(td => td.textContent.replace(/\s+/g, ' ').trim())
        )
      )
      .flat();
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

browser.runtime.onConnect.addListener(port => {
  switch (port.name) {
    case "popup":
      port.onMessage.addListener(msg => {
        if (msg.op === "translate")
          fetchDocument(msg.value).then(doc => port.postMessage({
            op: "displayTranslation",
            value: scrape(doc),
          }));
      });
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
  switch (name) {
    case "open-popup":
      browser.browserAction.openPopup();
      break;

    case "translate-in-popup":
      if (!popup.selectionRegister) break;
      browser.browserAction.openPopup();
      break;
  }
});
