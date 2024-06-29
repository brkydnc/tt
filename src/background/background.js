import { fetchDocument, scrape } from "./scrape";
import browser from 'webextension-polyfill';

const domParser = new DOMParser();
const parseDom = (a, b) => domParser.parseFromString(a, b);

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

      fetchDocument(term, dictionary, parseDom)
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
