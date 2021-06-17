const utils = (function() {
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


  return {
    createElement,
    createStyleString,
    limitBox,
  }
})();
