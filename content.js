const port = browser.runtime.connect({name: "content"});
document.addEventListener("selectionchange", () => {
  port.postMessage({
    op: "registerSelection",
    value: document.getSelection().toString().trim()
  });
});
