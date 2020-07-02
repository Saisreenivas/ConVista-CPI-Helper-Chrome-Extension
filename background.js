//GNU GPL v3
//Please visit our github page: https://github.com/dbeck121/ConVista-CPI-Helper-Chrome-Extension

'use strict';

chrome.browserAction.onClicked.addListener(
  
  // function(tab){
  // chrome.tabs.create({
  //     'url': chrome.runtime.getURL("index.html#window")
  // });
  // function(activeTab){
  // var newURL = "http://www.youtube.com/watch?v=oHg5SJYRHA0";
  // chrome.tabs.create({ url: newURL });
  function(tab) {
    alert("hello");
    chrome.tabs.create({'url': chrome.extension.getURL('f.html')}, function(tab) {
      // Tab opened.
    });
});

//activate on this site
chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: { urlMatches: '.*?hana\.ondemand\.com\/itspaces\/.*?' },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

//scan Headers for X-CSRF Token
chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {

    for (var i = 0; i < details.requestHeaders.length; ++i) {
      if (details.requestHeaders[i].name == "X-CSRF-Token") {
        var xcsrftoken = details.requestHeaders[i].value;
        var tenant = details.url.split("/")[2].split(".")[0];

        //xcsrf token will be saved in a local object with name xcsrf_<tenant>
        var name = 'xcsrf_' + tenant;
        var obj = {};
        obj[name] = xcsrftoken;

        chrome.storage.local.set(obj, function () {
          console.log("xcsrf token saved");
        });
        break;
      }
    }
    return { requestHeaders: details.requestHeaders };

  },
  { urls: ["https://*.hana.ondemand.com/itspaces/api/1.0/workspace*/artifacts/*/iflows/*?lockinfo=true&webdav=LOCK"] },
  ["requestHeaders"]);
