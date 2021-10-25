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
  const [ctxEl, phraseEl, meaningEl] = [...tr.children].slice(1, 4);

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

// Separator {
//   primary: Translation[]
//   other: Translation[]
// }
function separateTranslations(tbodyArray) {
  return tbodyArray.reduce((separator, tbody) => {
    const header = tbody.parentElement.previousElementSibling;
    // Remove <b> (term) tag insde <h2> for no confusion.
    header.firstElementChild.remove();
    // Determine if the table contains "other" translations
    const isOther = header.textContent.search("other") > -1

    const translations = [...tbody.children]      // <tr> array
      .slice(1)                                 // Remove column headers
      .filter(tr => tr.attributes.length === 0) // Remove hidden rows
      .map(createTranslation)

    if (isOther)
      separator.other.push(...translations)
    else
      separator.primary.push(...translations);

    return separator
  }, { primary: [], other: [] });
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

// TranslationContext {
//    term: string
//    separator: Separator
//    pronunciations: Pronunciation[]
// }
//
// ScrapeResult {
//   type: "translation"       | "suggestion" | "notFound"
//   data: TranslationContext  | string[]     | null
// }
function scrape([term, doc]) {
  const [searchResults] = doc.getElementsByClassName("tureng-searchresults-content");
  // TODO: Consider if the line below is necessary.
  if (!searchResults) return { type: "notFound", data: null };

  const termFound = !searchResults.classList.contains("tureng-page-suggest");

  if (termFound) {
    const [...tableBodies] = searchResults.getElementsByTagName("tbody");
    const [...audioContainers] = searchResults.getElementsByClassName("tureng-voice");

    const separator = separateTranslations(tableBodies);
    const pronunciations = createPronunciationArray(audioContainers)
    const translationContext = { term, separator, pronunciations }

    return { type: "translation", data: translationContext };
  }

  const [feedback] = searchResults.getElementsByTagName("h1");
  if (feedback.textContent === "Maybe the correct one is") {
    const [list] = searchResults.getElementsByClassName('suggestion-list');
    const [...listElements] = list.getElementsByTagName('li');
    const suggestions = listElements.map(li => li.firstElementChild.textContent);

    return { type: "suggestion", data: suggestions };
  }

  return { type: "notFound", data: null };
}

// Popup

const popup = {
  port: null,
  openedWith: "",
  selectionRegister: "",
  dictionary: "",

  setPort: function (port) {
    this.port = port;
    port.onDisconnect.addListener(this.onDisconnect.bind(this));
    this.onConnect();
  },
  onConnect: function translateInPopup() {
    if (this.openedWith !== "translate_in_popup") return;
    this.port.postMessage({
      type: "translateInPopup",
      payload: this.selectionRegister,
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
  const tip = (name === "translate_in_popup") && popup.selectionRegister;
  if (!tip) return;
  popup.openedWith = name;
  browser.browserAction.openPopup();
});

browser.browserAction.onClicked.addListener(() => {
  popup.openedWith = "click";
});

// Context menu

let contextMenuExists = false;

function openInNewTab(info, tab) {
  const url = `https://tureng.com/en/${popup.dictionary}/${info.selectionText}`;
  browser.tabs.create({ url });
}

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

  browser.menus.onClicked.addListener(openInNewTab);

  contextMenuExists = true;
}

function removeContextMenuIfNotExists() {
  if (!contextMenuExists) return;

  browser.menus.onClicked.removeListener(openInNewTab);
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

// Message {
//   type: string
//   payload: any
// }

browser.runtime.onConnect.addListener(port => {
  // TODO:
  //   Handle errors that occur when a promise tries to post a message to a
  //   closed port.
  //
  port.onMessage.addListener(({ type, payload }) => {
    if (type === "translate") {
      const term = payload.term;
      const dictionary = payload.dictionary || popup.dictionary;

      fetchDocument(term, dictionary)
        .then(doc => {
          const postPayload = scrape([term, doc]);

          if (popup.dictionary != dictionary) {
            popup.dictionary = dictionary;
            browser.storage.local.set({ dictionary });
          }

          port.postMessage({
            type: "translateResult",
            payload: postPayload
          });
        });

    } else if (type === "updatePopupDictionary") {
      popup.dictionary = payload;
      browser.storage.local.set({ dictionary: payload });
    }
  })

  switch (port.name) {
    case "popup":
      popup.setPort(port);
      break;

    case "content":
      port.onMessage.addListener(({ type, payload }) => {
        if (type === "registerSelection")
          popup.selectionRegister = payload;
      });
      break;
  }
});
