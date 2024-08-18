const createElement = utils.createElement;

class Element {
  constructor(tag, id) {
    this.element = document.createElement(tag);
    this.element.id = id;
    this._style = {};
    this.margin = 20;
  }

  setStyle(obj) {
    Object.assign(this._style, obj);
    this.element.style = utils.createStyleString(this._style);
  }

  show() {
    this.setStyle({ visibility: "visible" })
  }

  hide() {
    this.setStyle({ visibility: "hidden" })
  }

  setPosition(cx, cy, offsetX = 0, offsetY = 0) {
    const area = {
      x: window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth,
      y: window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight,
    }

    const { x, y } = utils.limitBox(
      cx + offsetX, cy + offsetY,
      this.element.offsetWidth, this.element.offsetHeight,
      this.margin,
      area.x, area.y,
    );

    this.setStyle({
      top: `${y}px`,
      left: `${x}px`,
    });
  }
}

class Button extends Element {
  constructor(tag, id) {
    super(tag, id);

    const backgroundURL = browser.extension.getURL("icons/tt-32.png");
    this.setStyle({
      background: `url(${backgroundURL}) center / 100% 100% no-repeat`,
    });
  }

  show() {
    super.show();
    this.element.animate([
      { transform: 'scale(0.9)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1.0)' },
    ], {
      id: "pop",
      duration: 100,
      easing: "ease-out",
    });
  }
}

class Panel extends Element {
  constructor(tag, id) {
    super(tag, id);
  }

  setTranslation({ term, separator, pronunciations }) {
    const container = createElement("div", {
      className: "tureng-translate-container"
    });
    const title = createElement("div", {
      className: "tureng-translate-title"
    }, term);
    const pronunciationContainer = createElement("div", {
      className: "tureng-translate-pronunciation-container"
    });
    const pronunciationElements = createPronunciations(pronunciations);
    const table = createTranslationTable(separator);

    this.element.innerHTML = "";

    pronunciationContainer.append(...pronunciationElements);
    container.append(title, pronunciationContainer);
    this.element.append(container, table);
  }

  show() {
    super.show();
    this.element.scrollTop = 0;
    this.element.scrollLeft = 0;
    this.element.animate({
      opacity: [0, 1],
    },
      {
        id: "fade-in",
        duration: 100,
        easing: "ease-out",
      });
  }
}

function createCellFromPhrase(phrase) {
  const phraseCell = createElement("td", {
    className: "tureng-translate-table-cell"
  });

  const contentEl = createElement("span", {}, `${phrase.content}`);
  phraseCell.appendChild(contentEl);

  if (phrase.class) {
    const classElement = createElement("i", {}, ` ${phrase.class}`);
    phraseCell.appendChild(classElement);
  }

  if (phrase.badges.length > 0) {
    const badgeEls = phrase.badges
      .map(b => createElement("span", { className: "tureng-translate-badge" }, `${b}`));

    phraseCell.append(...badgeEls);
  }


  return phraseCell;
}

function createTranslationTable(separator) {
  // Since we don't have <thead> or <tfoot>, we can omit <tbody> and append
  // <tr>s directly into <table>
  const table = createElement('div', { className: "tureng-translate-table" });

  const translations = separator.primary;
  translations.forEach(({ context, phrase, meaning }) => {
    const contextCell = createElement("div", { className: "tureng-translate-table-cell" }, context);
    const meaningCell = createCellFromPhrase(meaning);
    const tr = createElement("div", { className: "tureng-translate-table-row" });

    tr.append(contextCell, meaningCell);
    table.appendChild(tr);
  });

  return table;
}

function createPronunciations(pronunciations) {
  return pronunciations
    .map(p => {
      const style = utils.createStyleString({
        "background-image": `url(${p.flag})`
      });
      const audio = createElement("audio", { src: p.audio });
      const audioContainer = createElement("div", {
        className: "tureng-translate-pronunciation",
        style
      });

      audioContainer.onclick = () => {
        audio.load();
        audio.play();
      };
      audioContainer.appendChild(audio);

      return audioContainer;
    });
}

const button = new Button("div", "tureng-translate-button");
const panel = new Panel("div", "tureng-translate-panel");

const port = browser.runtime.connect({ name: "content" });

document.addEventListener('selectionchange', (e) => {
  port.postMessage({
    type: "registerSelection",
    payload: document.getSelection().toString().trim(),
  });
});

port.onMessage.addListener(({ type, payload }) => {
  if (type !== "translateResult" || payload.type !== "translation") return;
  if (payload.data.separator.primary.length === 0) return;

  panel.setTranslation(payload.data);
  button.show();
});

button.element.addEventListener('mousedown', () => {
  button.hide();
  panel.show();
})

const componentDependentDocumentListeners = [
  [
    'keyup',
    (e) => {
      if (e.key === "Escape") {
        button.hide();
        panel.hide();
      }
    }
  ],
  [
    'mouseup',
    (e) => {
      if (e.target !== button.element && !panel.element.contains(e.target)) {
        panel.hide();
        button.hide();
      }
    }
  ],
  [
    'mouseup',
    (e) => {
      const selection = document.getSelection().toString().trim();
      if (!selection) return;
      if (panel.element.contains(e.target)) return;

      const x = e.clientX;
      const y = e.clientY;
      panel.setPosition(x, y, 10, 10);
      button.setPosition(x, y, 10, 10);

      port.postMessage({
        type: "translate",
        payload: { term: selection, dictionary: "" }
      });
    }
  ],
];

let elementsAppended = false;

function addCDDListeners() {
  for (const args of componentDependentDocumentListeners) {
    document.addEventListener(...args);
  }
}

function removeCDDListeners() {
  for (const args of componentDependentDocumentListeners) {
    document.removeEventListener(...args);
  }
}

browser.storage.local.get({ disablePanel: false })
  .then(obj => {
    if (!obj.disablePanel && !elementsAppended) {
      document.body.append(button.element, panel.element);
      addCDDListeners();
      elementsAppended = true;
    }
  })
  .catch(e => console.log(e));

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName != "local" || !changes.hasOwnProperty("disablePanel")) return;

  if (changes.disablePanel.newValue && elementsAppended) {
    removeCDDListeners();
    button.element.remove();
    panel.element.remove();
    elementsAppended = false;
  } else if (!changes.disablePanel.newValue && !elementsAppended) {
    document.body.append(button.element, panel.element);
    addCDDListeners();
    elementsAppended = true;
  }
});
