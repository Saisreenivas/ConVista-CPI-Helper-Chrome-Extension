//GNU GPL v3
//Please visit our github page: https://github.com/dbeck121/ConVista-CPI-Helper-Chrome-Extension

'use strict';

var host = "";

//List a history of visited iflows
function addLastVisitedIflows() {
    let name = 'visitedIflows_' + host.split("/")[2].split(".")[0];
    chrome.storage.sync.get([name], function (result) {
        var visitedIflows = result[name];
        if (!visitedIflows || visitedIflows.length == 0) {
            return;
        }


        var html = `
        <h3>Last Visited on Tenant ${name.split("_")[1]}</h3>
        <ul style="list-style-type:disc;"> `;

        for (var i = visitedIflows.length - 1; i > -1; i--) {
            html += `<li><a href="${visitedIflows[i].url}" target="_blank">${visitedIflows[i].name}</a></li>`;
        }
        html += `</ul>`;
        var lastVisitedIflows = document.getElementById("lastVisitedIflows");
        lastVisitedIflows.innerHTML = html;
    });
}

function addTenantUrls() {

    var tenantUrls = document.getElementById("tenantUrls");
    tenantUrls.innerHTML = `
        <h3>This Tenant</h3>
        <ul style="list-style-type:disc;">

        <li><a href="${host + '/itspaces/shell/monitoring/Messages/'}" target="_blank">Processed Messages</a></li>
        <li><a href="${host + '/itspaces/shell/monitoring/Messages/%7B%22status%22%3A%22FAILED%22%2C%22time%22%3A%22PASTHOUR%22%2C%22type%22%3A%22INTEGRATION_FLOW%22%7D'}" target="_blank">Failed Messages</a></li>

        <li><a href="${host + '/itspaces/shell/monitoring/Artifacts/'}" target="_blank">Artifacts</a></li>
        
        <li><a href="${host + '/itspaces/shell/design'}" target="_blank">Design</a></li>   
        <li><a href="${host + '/itspaces/shell/monitoring/Overview'}" target="_blank">Monitoring</a></li>        
        </ul> `;

}

async function getHost() {
    return new Promise((resolve, reject) => {

        var query = { active: true, currentWindow: true };

        function callback(tabs) {
            var currentTab = tabs[0]; // there will be only one in this array
            console.log(currentTab); // also has properties like currentTab.id

            var url = currentTab.url;
            var tempHost = "https://" + url.split("/")[2];
            resolve(tempHost);
        };

        chrome.tabs.query(query, callback);

    });
}

var callCache = new Map();
function makeCallPromise(method, url, useCache, accept) {
    return new Promise(function (resolve, reject) {
        var cache;
        if (useCache) {
            cache = callCache.get(method + url);
        }
        if (cache) {
            resolve(cache);
        } else {

            var xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open(method, url);
            if (accept) {
                //Example for accept: 'application/json' 
                xhr.setRequestHeader('Accept', accept);
            }
            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    if (useCache) {
                        callCache.set(method + url, xhr.responseText);
                    }
                    resolve(xhr.responseText);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        }
    }
    );

}

//has to be changed when plugin is in chrome store
function checkUpdate() {
    var manifestVersion = chrome.runtime.getManifest().version;
    var cpihelper_version = document.getElementById("cpihelper_version");
    var html = "<span>You are running version " + manifestVersion + "</span>";
    cpihelper_version.innerHTML = html;

    /*    makeCallPromise("GET", "https://raw.githubusercontent.com/dbeck121/ConVista-CPI-Helper-Chrome-Extension/master/manifest.json").then((response) => {
            var serverVersion = JSON.parse(response).version;
            var manifestVersion = chrome.runtime.getManifest().version;
            var html = "<span>You are running version " + manifestVersion + "</span>";
            if (serverVersion != manifestVersion) {
                html += "<br><span style=\"color: red;\">Please update to version " + serverVersion + "</span>";
            }
            var cpihelper_version = document.getElementById("cpihelper_version");
            cpihelper_version.innerHTML = html;
        }).catch(console.log); */
}

async function main() {
    checkUpdate();
    messagesUpdate();
    host = await getHost();
    addLastVisitedIflows();
    addTenantUrls();
}

function messagesUpdate(){
    var devUpdate =  document.getElementById("devUpdate");
    var prodUpdate =  document.getElementById("prodUpdate");
    // var messagebutton = createElementFromHTML(' <button id="__buttonxy" data-sap-ui="__buttonxy" title="Messages" class="sapMBtn sapMBtnBase spcHeaderActionButton" style="display: inline-block;"><span id="__buttonxy-inner" class="sapMBtnHoverable sapMBtnInner sapMBtnText sapMBtnTransparent sapMFocusable"><span class="sapMBtnContent" id="__button13-content"><bdi id="__button13-BDI-content">Messages</bdi></span></span></button>');
    
    // var dev = '<button id="__buttonxy1" data-sap-ui="__buttonxy" title="Dev" class="sapMBtn sapMBtnBase spcHeaderActionButton" style="display: inline-block;"><span id="__buttonxy-inner" class="sapMBtnHoverable sapMBtnInner sapMBtnText sapMBtnTransparent sapMFocusable"><span class="sapMBtnContent" id="__button13-content"><bdi id="__button13-BDI-content">Dev</bdi></span></span></button>';
    // devUpdate.innerHTML = dev;

    // devUpdate.addEventListener("click", (btn) => {
        
        // if (sidebar.active) {
        //   sidebar.deactivate();
        // } else {
            // document.onreadystatechange(function(){
                document.getElementById("main").style.display = "none";
                // alert(document.getElementById("__buttonxy1").text());
                // if(document.getElementsByClassName)
                var URL = "https://l700299-tmn.hci.eu2.hana.ondemand.com";
              sidebar.init(URL);
            // })
            

        // }
        // alert("click");
    //   }
    //   );
    
}

main();


// //the sidebar that shows messages
// var sidebar = {

//     //indicator if active or not
//     active: false,
  
//     //function to deactivate the sidebar
//     deactivate: function () {
//       this.active = false;
//       clearTimeout(getLogsTimer);
//       document.getElementById("cpiHelper_contentone").remove();
//     },
  
//     //function to create and initialise the message sidebar
//     init: function () {
//       this.active = true;
  
//       //create sidebar div
//       var elem = document.createElement('div');
//       elem.innerHTML = `
//       <div id="cpiHelper_contentheaderone">ConVista CPI Helper<span id='sidebar_modal_close' class='cpiHelper_closeButton'>X</span></div> 
//       <div id="outerFrame">
//       <div id="updatedText" class="contentText"></div>
      
//       <div><table id="messageList" class="contentText"></table></div>
      
      
//       </div>
//       `;
//       elem.id = "cpiHelper_content";
//     //   elem.classList.add("cpiHelper");
//       document.body.appendChild(elem);
//       console.log("step1")
//       //add close button
//       var span = document.getElementById("sidebar_modal_close");
//       span.onclick = (element) => {
//           alert("H")
//         sidebar.deactivate();
//       };
  
//       //activate dragging for message bar
//       dragElement(document.getElementById("cpiHelper_contentone"));
  
//       //lastMessageHashList must be empty when message sidebar is created
//       cpiData.lastMessageHashList = [];
      
//       //refresh messages
//       getLogs();
//     }
//   };

//   //refresh the logs in message window
// var getLogsTimer;
// var activeInlineItem;
// function getLogs() {
//     alert("hh");
//   var createRow = function (elements) {
//     var tr = document.createElement("tr");
//     elements.forEach(element => {
//       console.log(element);
//       let td = document.createElement("td");
//       elements.length == 1 ? td.colSpan = 3 : null;
//       typeof (element) == "object" ? td.appendChild(element) : td.innerHTML = element;
//       tr.appendChild(td);
//     });
//     return tr;
//   }
//   alert(test);
//   //check if iflowid exists
// //   iflowId = cpiData.integrationFlowId;
// //   if (!iflowId) {
// //     return;
// //   }

//   //get the messagelogs for current iflow
//   makeCall("GET", "/itspaces/odata/api/v1/MessageProcessingLogs?$top=10&$format=json&$orderby=LogStart desc", false, "", (xhr) => {
//     alert("hello");
//     if (xhr.readyState == 4 && sidebar.active) {
//         alert(xhr.responseText);
//       var resp = JSON.parse(xhr.responseText);
//       resp = resp.d.results;

//       //    document.getElementById('iflowName').innerText = cpiData.integrationFlowId;

//       let updatedText = document.getElementById('updatedText');

//       updatedText.innerHTML = "<span>Last update:<br>" + new Date().toLocaleString("de-DE") + "</span>";

//       let thisMessageHash = "";
//       if (resp.length != 0) {
//         thisMessageHash = resp[0].MessageGuid + resp[0].LogStart + resp[0].LogEnd + resp[0].Status;

//         if (thisMessageHash != cpiData.lastMessageHashList[0]) {

//           let thisMessageHashList = [];

//           let messageList = document.getElementById('messageList');
//           messageList.innerHTML = "";
//           var lastDay;

//           for (var i = 0; i < resp.length; i++) {
//             thisMessageHashList.push(resp[i].MessageGuid + resp[i].LogStart + resp[i].LogEnd + resp[i].Status);

//             //write date if necessary
//             let date = new Date(parseInt(resp[i].LogEnd.match(/\d+/)[0]));
//             //add offset to utc time. The offset is not correct anymore but isostring can be used to show local time
//             date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
//             date = date.toISOString();
//             console.log(date + " ");
//             if (date.substr(0, 10) != lastDay) {
//               messageList.appendChild(createRow([date.substr(0, 10)]));
//               // console.log(messageList.toString() + " " + date)
//               lastDay = date.substr(0, 10);
//             }

//             //flash animation for new elements
//             let flash = "";
//             if (cpiData.lastMessageHashList.length != 0 && !cpiData.lastMessageHashList.includes(thisMessageHashList[i])) {
//               flash = " flash";
//             }
//             let loglevel = resp[i].LogLevel.toLowerCase();
//             // logLevel[0] = logLevel[0].toUpperCase();

//             let traceButton = createElementFromHTML("<button id='trace--" + i + "' class='" + resp[i].MessageGuid + flash + "'>" + loglevel + "</button>");
//             let infoButton = createElementFromHTML("<button id='info--" + i + "' class='" + resp[i].AlternateWebLink + flash + "'><span data-sap-ui-icon-content='' class='sapUiIcon sapUiIconMirrorInRTL' style='font-family: SAP-icons; font-size: 0.9rem;'></span></button>");

//             //let listItem = document.createElement("div");
//             //listItem.classList.add("cpiHelper_messageListItem")
//             let statusColor = "#008000";
//             let statusIcon = "";
//             if (resp[i].Status == "PROCESSING") {
//               statusColor = "#FFC300";
//               statusIcon = "";
//             }
//             if (resp[i].Status == "FAILED") {
//               statusColor = "#C70039";
//               statusIcon = "";
//             }
//             //listItem.style["color"] = statusColor;
// {/* <span>" +resp[i].IntegrationFlowName + "</span> */}
//             let inlineTraceButton = createElementFromHTML("<button class='" + resp[i].MessageGuid + flash + " cpiHelper_inlineInfo-button' style='cursor: pointer;'>" + date.substr(11, 8) + "</button>");
//             activeInlineItem == inlineTraceButton.classList[0] && inlineTraceButton.classList.add("cpiHelper_inlineInfo-active");


//             let statusicon = createElementFromHTML("<button class='" + resp[i].MessageGuid + " cpiHelper_sidebar_iconbutton'><span data-sap-ui-icon-content='" + statusIcon + "' class='" + resp[i].MessageGuid + " sapUiIcon sapUiIconMirrorInRTL' style='font-family: SAP-icons; font-size: 0.9rem; color:" + statusColor + ";'> </span></button>");

//             statusicon.onmouseover = (e) => {

//               infoPopupOpen(e.currentTarget.classList[0]);
//               infoPopupSetTimeout(null);
//             };
//             statusicon.onmouseout = (e) => {
//               infoPopupSetTimeout(2000);
//             };

//             inlineTraceButton.onmouseup = async (e) => {
//               if (activeInlineItem == e.target.classList[0]) {

//                 hideInlineTrace();
//                 showSnackbar("Inline Debugging Deactivated");

//               } else {
//                 hideInlineTrace();
//                 var inlineTrace = await showInlineTrace(e.currentTarget.classList[0]);
//                 if (inlineTrace) {
//                   showSnackbar("Inline Debugging Activated");
//                   e.target.classList.add("cpiHelper_inlineInfo-active");

//                   activeInlineItem = e.target.classList[0];
//                 } else {
//                   activeInlineItem = null;
//                   showSnackbar("Inline debugging not possible. No data found.");
//                 }

//               }


//               //   e.target.style.backgroundColor = 'red';

//             };
//             let iFlowName = createElementFromHTML("<button id='name--" + i + "' class='" + resp[i].MessageGuid + flash + "'>" + resp[i].IntegrationFlowName + "</button>");
//             // let iFlowName = createElementFromHTML("<button class='" + resp[i].MessageGuid + " cpiHelper_sidebar_iconbutton'><span data-sap-ui-icon-content='" + statusIcon + "' class='" + resp[i].MessageGuid + " sapUiIcon sapUiIconMirrorInRTL' style='font-family: SAP-icons; font-size: 0.9rem; color:" + statusColor + ";'> </span></button>");
//             //      listItem.appendChild(statusicon);
//             //      listItem.appendChild(inlineTraceButton);
//             //      listItem.appendChild(infoButton);
//             //      listItem.appendChild(traceButton);

//             messageList.appendChild(createRow([statusicon, inlineTraceButton, infoButton, traceButton, iFlowName]));

//             infoButton.addEventListener("click", (a) => {
//               openInfo(a.currentTarget.classList[0]);
//             });


//             traceButton.addEventListener("click", (a) => {

//               openTrace(a.currentTarget.classList[0]);

//             });

//           }
//           cpiData.lastMessageHashList = thisMessageHashList;
//         }

//       }
//       //new update in 3 seconds
//       if (sidebar.active) {
//         var getLogsTimer = setTimeout(getLogs, 3000);
//       }
//     }
//   });
// }
  
  
// //function that handles the dragging 
// function dragElement(elmnt) {
//     var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
//     if (document.getElementById(elmnt.id + "header")) {
//       /* if present, the header is where you move the DIV from:*/
//       document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
//     } else {
//       /* otherwise, move the DIV from anywhere inside the DIV:*/
//       elmnt.onmousedown = dragMouseDown;
//     }
  
//     function dragMouseDown(e) {
//       e = e || window.event;
//       e.preventDefault();
//       // get the mouse cursor position at startup:
//       pos3 = e.clientX;
//       pos4 = e.clientY;
//       document.onmouseup = closeDragElement;
//       // call a function whenever the cursor moves:
//       document.onmousemove = elementDrag;
//     }
  
//     function elementDrag(e) {
//       e = e || window.event;
//       e.preventDefault();
//       // calculate the new cursor position:
//       pos1 = pos3 - e.clientX;
//       pos2 = pos4 - e.clientY;
//       pos3 = e.clientX;
//       pos4 = e.clientY;
//       // set the element's new position:
//       elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
//       elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
//     }
  
//     function closeDragElement() {
//       /* stop moving when mouse button is released:*/
//       document.onmouseup = null;
//       document.onmousemove = null;
//     }
//   }
  