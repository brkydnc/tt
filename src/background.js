const domParser = new DOMParser();
const URL = "https://tureng.com/en/turkish-english/";

async function fetchDocument(term) {
  const res = await fetch(URL + term);
  const text = await res.text();
  const doc = domParser.parseFromString(text, 'text/html');
  return doc;
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

// Pronunciation {
//   audio: URL,
//   flag: URL,
// }
function createPronunciationArray(audioContainers) {
  return audioContainers
    .map(container => {
      const [audioElement, flagElement] = container.children;
      const flag = getFlagURLByFlagElement(flagElement);
      const audio = getAudioURLFromAudioElement(audioElement);
      return { audio, flag }
    });
}

// A flag element has attribute "data-accent".
// A data accent has the format FROM_TO_FROM_accent (without underscores).
// Examples: ENTRENus, ENTRENuk, ENFRFRfr, ENFRFRca.
function getFlagURLByFlagElement(flagElement) {
  const dataAccent = flagElement.getAttribute("data-accent");
  const accent = dataAccent.substr(6, 2);
  return `https://asset.tureng.co/images/flag-${accent}.png`
}

// An audio element has a <source> in it, which is firstElementChild.
//
// If an element has src attribute without a protocol at the beginning,
// accesses to this attribute gives us an URL that beings with "moz-extension".
// to prevent this we use getAttribute("src") to get URL without a protocol and
// then append "https:" manually.
function getAudioURLFromAudioElement(audioElement) {
  const URL = audioElement.firstElementChild.getAttribute("src");
  return "https:" + URL;
}

// {
//    term: string
//    translations: Translation[][]
//    pronunciations: Pronunciation[]
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
    const [...audioContainers] = searchResults.getElementsByClassName("tureng-voice");

    const translations = createTranslationArray(tableBodies);
    const pronunciations = createPronunciationArray(audioContainers)

    const result = { term, translations, pronunciations }
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

browser.runtime.onConnect.addListener(port => {
  // TODO:
  //   Handle erors that occur when a promise tries to post message to a closed
  //   port.
  //
  port.onMessage.addListener(msg => {
    if (msg.op === "translate") {
      const term = msg.value;
      fetchDocument(term)
        .then(doc => {
          const value = scrape([term, doc]);

          port.postMessage({
            op: "translateResult",
            value
          })
        });
    }
  })

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
