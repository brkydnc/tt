const port = browser.runtime.connect({name: "content"});
document.addEventListener('selectionchange', (e) => {
  port.postMessage({
    op: "registerSelection",
    value: document.getSelection().toString().trim()
  });
});

function createStyleString(styleObj) {
  let style = "";
  for (key in styleObj) {
    style += `${key}: ${styleObj[key]};`;
  }
  return style;
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

  setMeanings(meanings) {
    const string = meanings
      .slice(0, 10)
      .map(a => a[2])
      .join(", ");

    const textNode = document.createTextNode(string);
    this.element.innerHTML = "";
    this.element.appendChild(textNode);
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

    panel.setMeanings(value);
    panel.setPosition(x, y, 10, 10);
    button.setPosition(x, y, 10, 10);
    button.show();
  }).catch(e => console.log(e));
});

document.body.appendChild(button.element);
document.body.appendChild(panel.element);
