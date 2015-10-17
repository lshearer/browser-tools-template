// Dev tools background page. This is run once per instance of dev tools (one per tab, does not reload with page)

var tabNameKey = 'devtools_tab_name';
var tabName = chrome.i18n.getMessage(tabNameKey);
if (!tabName) {
  throw new Error('Missing configuration key "' + tabNameKey + '" in messages.json.');
} else {
  chrome.devtools.panels.create(tabName,
    'icon.png',
    'devtools-panel.htm',
    function devToolsPanelCreatedCallback(panel) {});
}
