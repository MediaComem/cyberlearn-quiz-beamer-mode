const TITLE_APPLY = "Démarrer le mode Beamer";
const TITLE_REMOVE = "Stopper le mode Beamer";
const APPLICABLE_PROTOCOLS = ["http:", "https:"];
console.log('started');
/* Default option */
saveQuizMode(false);
var browserDetected = 'Firefox';

function saveQuizMode(value) {
  browser.storage.local.set({
    quizMode: value
  });
}

function getQuizMode() {
  var gettingItem = browser.storage.local.get('quizMode');
  
  return gettingItem.then((res) => res.quizMode );
}

/*
Detection of browser
*/

try{
  var gettingInfo = browser.runtime.getBrowserInfo();

  gettingInfo.then((info) =>{
      if(info.name != 'Firefox'){
        throw error;
      }
  });
}
catch(error){
  browserDetected = 'Other';
}


/*
Toggle Mode: based on the current title, insert or remove the CSS.
Update the page action's title and icon to reflect its state.
*/
function toggleMode(tab) {

  function gotTitle(title) {
    if (title === TITLE_APPLY) {
      browser.pageAction.setIcon({tabId: tab.id, path: "icons/on.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_REMOVE});
      saveQuizMode(true);
      browser.tabs.insertCSS({file: "quizStyle.css"});
    } else {
      browser.pageAction.setIcon({tabId: tab.id, path: "icons/off.svg"});
      browser.pageAction.setTitle({tabId: tab.id, title: TITLE_APPLY});
      if(browserDetected == 'Firefox'){
        browser.tabs.removeCSS({file: "quizStyle.css"});
      } else{
        browser.tabs.reload();
      }

      saveQuizMode(false);
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
  if (protocolIsApplicable(tab.url) && urlIsApplicable(tab.url)) {

    getQuizMode().then((isOn) => {

      if(isOn){
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
    });
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
