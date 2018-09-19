const TITLE_APPLY = "Apply Quiz mode";
const TITLE_REMOVE = "Remove Quiz mode";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];
var quizMode = false;

/*
Toggle Mode: based on the current title, insert or remove the CSS.
Update the page action's title and icon to reflect its state.
*/
function toggleMode(tab) {

  function gotTitle(title) {
    if (title === TITLE_APPLY) {
      browser.pageAction.setIcon({tabId: tab.id, path: "icons/on.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_REMOVE});
      quizMode = true;

      if (protocolIsApplicable(tab.url) && urlIsApplicable(tab.url)) {
        browser.tabs.insertCSS({file: "quizStyle.css"});
      }
    } else {
      browser.pageAction.setIcon({tabId: tab.id, path: "icons/off.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
      browser.tabs.removeCSS({file: "quizStyle.css"});
      quizMode = false;
    }
  }

  var gettingTitle = browser.pageAction.getTitle({tabId: tab.id});
  gettingTitle.then(gotTitle);
}

/*
Returns true only if the URL's protocol is in APPLICABLE_PROTOCOLS.
*/
function protocolIsApplicable(url) {
  var anchor =  document.createElement('a');
  anchor.href = url;
  return APPLICABLE_PROTOCOLS.includes(anchor.protocol);
}

/*
Returns true only if the URL contain cyberlearn...e-voting.
*/
function urlIsApplicable(url) {
  return RegExp(':\/\/cyberlearn.hes-so.ch\/mod\/evoting\/','g').test(url);
}

/*
Initialize the page action: set icon and title, then show.
Only operates on tabs whose URL's protocol is applicable.
*/
function initializePageAction(tab) {
  
    if(quizMode){
      browser.pageAction.setIcon({tabId: tab.id, path: "icons/on.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
      browser.pageAction.show(tab.id);
      toggleMode(tab);
    }
    else{
      browser.pageAction.setIcon({tabId: tab.id, path: "icons/off.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
      browser.pageAction.show(tab.id);
    }
}

/*
When first loaded, initialize the page action for all tabs.
*/
var gettingAllTabs = browser.tabs.query({});
gettingAllTabs.then((tabs) => {
  for (let tab of tabs) {
    initializePageAction(tab);
  }
});

/*
Each time a tab is updated, reset the page action for that tab.
*/
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
  initializePageAction(tab);
});

/*
Toggle CSS when the page action is clicked.
*/
browser.pageAction.onClicked.addListener(toggleMode);
