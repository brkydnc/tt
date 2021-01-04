const domParser = new DOMParser();
const URL = 'https://tureng.com/en/turkish-english/';

async function fetchDocument(term) {
  const res = await fetch(URL + term);
  const text = await res.text();
  const doc = domParser.parseFromString(text, 'text/html');
  return [term, doc];
}

// Translation {
//   context: string,
//   phrase: Phrase {
//     content: string,
//     class: string | null,
//   }
//   meaning: Phrase {
//     content: string,
//     class: string | null,
//   }
// }
function createTranslation(tr) {
  const [ctxEl, phraseEl, meaningEl] = [...tr.children].slice(1,4);
  const ctx = ctxEl.textContent;
  const phraseContent = phraseEl.firstElementChild.textContent;
  const phraseClass = (phraseEl.children.length > 1)
    ? phraseEl.lastElementChild.textContent.trim()
    : null;
  const meaningContent = meaningEl.firstElementChild.textContent;
  const meaningClass = (meaningEl.children.length > 1)
    ? meaningEl.lastElementChild.textContent.trim()
    : null;

  return {
    context: ctx,
    phrase: {
      content: phraseContent,
      class: phraseClass,
    },
    meaning: {
      content: meaningContent,
      class: meaningClass,
    }
  }
}

function createTranslationArray(tbodyArray) {
  return tbodyArray
    .map(tbody =>
      [...tbody.children] // tr array
        .slice(1) // remove column headers
        .filter(tr => tr.attributes.length === 0) // remove hidden rows
        .map(createTranslation)
    )
}

// {
//    term: string
//    translations: Translation[][]
// }
//
// status
//  0 FOUND 
//  1 NOT FOUND
//  2 SUGGESTION
function scrape([term, doc]) {
  const [searchResults] = doc.getElementsByClassName("tureng-searchresults-content");
  if (!searchResults) return {status: 1, value: []};
  const termFound = !searchResults.classList.contains("tureng-page-suggest");

  if (termFound) {
    const [...tableBodies] = searchResults.getElementsByTagName("tbody");
    const translations = createTranslationArray(tableBodies);
    const result = { term, translations }
    return { status: 0, value: result };
  }

  const [feedback] = searchResults.getElementsByTagName("h1");
  if (feedback.textContent === "Maybe the correct one is") {
    const [suggestions] = searchResults.getElementsByClassName('suggestion-list');
    const [...listElements] = suggestions.getElementsByTagName('li');
    const terms = listElements.map(li => li.firstElementChild.textContent);
    return { status: 2, value: terms };
  }

  return { status: 1, value: [] };
}

const popup = {
  port: null,
  openedWith: "",
  selectionRegister: "",
  setPort: function(port) {
    this.port = port;
    port.onDisconnect.addListener(this.onDisconnect.bind(this));
    this.onConnect();
  },
  onConnect: function translateInPopup() {
    if (this.openedWith !== "translate-in-popup") return;
    this.port.postMessage({
      op: "translateInPopup",
      value: this.selectionRegister,
    });
  },
  onDisconnect: function clearOpenedWith() {
    this.openedWith = "";
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

browser.commands.onCommand.addListener(name => {
  const tip = name === "translate-in-popup" && popup.selectionRegister;
  if (!tip) return; 
  popup.openedWith = name;
  browser.browserAction.openPopup();
});

browser.browserAction.onClicked.addListener(() => {
  popup.openedWith = "click";
});
