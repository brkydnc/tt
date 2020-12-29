const port = browser.runtime.connect({name: "content"});
document.addEventListener('selectionchange', (e) => {
  port.postMessage({
    op: "registerSelection",
    value: document.getSelection().toString().trim()
  });
});

function createElement(tag, props={}, text="") {
  const element = document.createElement(tag);
  Object.assign(element, props);
  if (!text) return element;
  const textNode = document.createTextNode(text);
  element.appendChild(textNode);
  return element;
}

function createStyleString(styleObj) {
  let style = "";
  for (key in styleObj) {
    style += `${key}: ${styleObj[key]};`;
  }
  return style;
}

function produceTable(translations) {
  const tableElement = createElement('div', { className: "tureng-translate-table" });
  const tbody = createElement('div', { className: "tureng-translate-table" });
  tableElement.appendChild(tbody);

  const firstBody = translations[0];
  firstBody.forEach(({ context, phrase, meaning }) => {
    const contextCell = createElement("div", { className: "tureng-translate-table-cell" }, context);

    const meaningText = (meaning.class)
      ? `${meaning.content} ${meaning.class}`
      : meaning.content;
    const meaningCell = createElement("div", { className: "tureng-translate-table-cell" }, meaningText);

    const tr = createElement("div", { className: "tureng-translate-table-row" });
    tr.append(contextCell, meaningCell);
    tbody.appendChild(tr);
  });

  return tableElement;
}

function limitBox(x, y, width, height, margin, areaWidth, areaHeight) {
  const x2 = x + width;
  const y2 = y + height;

  const border = {
    x: margin,
    y: margin,
    x2: areaWidth - margin,
    y2: areaHeight - margin,
  }

  const reference = {
    x: (x < border.x)
      ? border.x
      : (x2 > border.x2) ? border.x2 - width : x,
    y: (y < border.y)
      ? border.y
      : (y2 > border.y2) ? border.y2 - height : y,
  };

  return reference; 
}

class Element {
  constructor(tag, id) {
    this.element = document.createElement(tag);
    this.element.id = id;
    this._style = {};
    this.margin = 10;
  }

  setStyle(obj) {
    Object.assign(this._style, obj);
    this.element.style = createStyleString(this._style);
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

    const { x, y } = limitBox(
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

class Panel extends Element {
  constructor(tag, id) {
    super(tag, id);
  }

  setTranslation({term, translations}) {
    const title = createElement("div", { className: "tureng-translate-term" }, term);
    const table = produceTable(translations);

    this.element.innerHTML = "";
    this.element.append(title, table);
  }
}

const button = new Element("div", "tureng-translate-button");
const panel = new Panel("div", "tureng-translate-panel");

document.addEventListener('click', (e) => {
	if (e.target === button.element) {
    button.hide();
    panel.show();
    return;
  }

	if (e.target !== button.element && e.target !== panel.element) panel.hide();

  const selection = document.getSelection().toString().trim();
	if (selection.length === 0) return button.hide();

  browser.runtime.sendMessage({
    op: "translate",
    value: selection,
  }).then(({ status, value }) => {
    if (status !== 0) return;

    const x = e.clientX;
    const y = e.clientY;

		// if panel height is dynamic, don't swap the two lines below
    panel.setTranslation(value);
    panel.setPosition(x, y, 10, 10);

    button.setPosition(x, y, 10, 10);
    button.show();
  }).catch(e => console.log(e));
});

document.body.appendChild(button.element);
document.body.appendChild(panel.element);
