const disablePanel = document.getElementById("disable-panel");
const disableContextMenu = document.getElementById("disable-context-menu");

disablePanel.addEventListener("change", e => {
  browser.storage.local.set({ disablePanel: e.target.checked });
});

disableContextMenu.addEventListener("change", e => {
  browser.storage.local.set({ disableContextMenu: e.target.checked });
});

browser.storage.local.get({ disablePanel: false })
  .then(obj => disablePanel.checked = obj.disablePanel)
  .catch(e => {});

browser.storage.local.get({ disableContextMenu: false })
  .then(obj => disableContextMenu.checked = obj.disableContextMenu)
  .catch(e => {});
