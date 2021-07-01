const domParser = new DOMParser();

async function fetchDocument(term, dictionary) {
  const res = await fetch(`https://tureng.com/en/${dictionary}/${term}`);
  const text = await res.text();
  const doc = domParser.parseFromString(text, 'text/html');
  return doc;
}

// Translation {
//   context: string,
//   phrase: Phrase {
//     content: string,
//     class: string | null,
//     badges: string[],
//   }
//   meaning: Phrase {
//     content: string,
//     class: string | null,
//     badges: string[],
//   }
// }
function createTranslation(tr) {
  const [ctxEl, phraseEl, meaningEl] = [...tr.children].slice(1,4);

  const ctx = ctxEl.textContent;

  const phraseContent = phraseEl.firstElementChild.textContent;
  const phraseClassEl = phraseEl.getElementsByTagName("i")[0];
  const phraseClass = (phraseClassEl) ? phraseClassEl.textContent.trim() : null;
  const phraseBadges = [...phraseEl.getElementsByClassName("badge")]
    .map(e => e.textContent);

  const meaningContent = meaningEl.firstElementChild.textContent;
  const meaningClassEl = meaningEl.getElementsByTagName("i")[0];
  const meaningClass = (meaningClassEl) ? meaningClassEl.textContent.trim() : null;
  const meaningBadges = [...meaningEl.getElementsByClassName("badge")]
    .map(e => e.textContent);

  return {
    context: ctx,
    phrase: {
      content: phraseContent,
      class: phraseClass,
      badges: phraseBadges,
    },
    meaning: {
      content: meaningContent,
      class: meaningClass,
      badges: meaningBadges,
    }
  }
}

function createTranslationArray(tbodyArray) {
  return tbodyArray
    .map(tbody =>
      [...tbody.children] // <tr> array
        .slice(1) // Remove column headers
        .filter(tr => tr.attributes.length === 0) // Remove hidden rows
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

// A flag element has the attribute "data-accent".
// A data accent has the format FROM_TO_FROM_accent (without underscores).
// Examples: ENTRENus, ENTRENuk, ENFRFRfr, ENFRFRca.
function getFlagURLByFlagElement(flagElement) {
  const dataAccent = flagElement.getAttribute("data-accent");
  const accent = dataAccent.substr(6, 2);
  return `https://asset.tureng.co/images/flag-${accent}.png`
}

// An audio element has a <source> in it, which is the first element child.
//
// If an element has a `src` attribute without a protocol at the beginning,
// access to that attribute gives a URL which has "moz-extension" as the
// protocol at the beginning. To prevent this we use `getAttribute("src")` to
// get the URL without a protocol and then we append "https:" manually.
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

// Popup

const popup = {
  port: null,
  openedWith: "",
  selectionRegister: "",
  dictionary: "",

  setPort: function(port) {
    this.port = port;
    port.onDisconnect.addListener(this.onDisconnect.bind(this));
    this.onConnect();
  },
  onConnect: function translateInPopup() {
    if (this.openedWith !== "translate_in_popup") return;
    this.port.postMessage({
      op: "translateInPopup",
      value: this.selectionRegister,
    });
  },
  onDisconnect: function clearOpenedWith() {
    this.openedWith = "";
  }
};

browser.storage.local.get({ dictionary: "turkish-english" })
  .then(obj => { popup.dictionary = obj.dictionary })
  .catch(e => console.log(e));

browser.commands.onCommand.addListener(name => {
  const tip = name === "translate_in_popup" && popup.selectionRegister;
  if (!tip) return;
  popup.openedWith = name;
  browser.browserAction.openPopup();
});

browser.browserAction.onClicked.addListener(() => {
  popup.openedWith = "click";
});

// Context menu

let contextMenuExists = false;

function createContextMenuIfNotExists() {
  if (contextMenuExists) return;

  browser.menus.create({
    title: "Open Tureng page in new tab",
    id: "open-tureng-page",
    type: "normal",
    contexts: ["selection"],
    icons: {
      "32": "../icons/tt-32.png",
    },
  });

  browser.menus.onClicked.addListener((info, tab) => {
    const url = `https://tureng.com/en/${popup.dictionary}/${info.selectionText}`;
    browser.tabs.create({ url });
  });

  contextMenuExists = true;
}

function removeContextMenuIfNotExists() {
  if (!contextMenuExists) return;

  browser.menus.remove("open-tureng-page");

  contextMenuExists = false;
}

browser.storage.local.get({ disableContextMenu: false })
  .then(obj => { if (!obj.disableContextMenu) createContextMenuIfNotExists(); })
  .catch(e => console.log(e));

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName != "local" || !changes.hasOwnProperty("disableContextMenu")) return;

  if (changes.disableContextMenu.newValue)
    removeContextMenuIfNotExists();
  else
    createContextMenuIfNotExists();
});

// Port handling

browser.runtime.onConnect.addListener(port => {
  // TODO:
  //   Handle errors that occur when a promise tries to post a message to a
  //   closed port.
  //
  port.onMessage.addListener(msg => {
    if (msg.op === "translate") {
      const term = msg.value.term;
      const dictionary = msg.value.dictionary || popup.dictionary;

      fetchDocument(term, dictionary)
        .then(doc => {
          const value = scrape([term, doc]);

          if (popup.dictionary != dictionary) {
            popup.dictionary = dictionary;
            browser.storage.local.set({ dictionary });
          }

          port.postMessage({
            op: "translateResult",
            value
          });
        });
    } else if (msg.op === "updatePopupDictionary") {
      popup.dictionary = msg.value;
      browser.storage.local.set({ dictionary: msg.value });
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
