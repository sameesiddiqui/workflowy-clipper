let workflowyTab = null;
let usedLists = null;

const searchBox = document.getElementById("searchForLists");
const matchedLists = document.getElementById("matchedLists");
const mostFrequentLists = document.getElementById("mostFrequentLists");

searchBox.addEventListener("keyup", event => {
    searchTerm(event.target.value);
});

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        switch (request.type) {
            case "popupSearchResults":
                showWfLists(request.matches);
                break;
            default:
                break;
        }
    }
);

// Determine if there is an open Workflowy tab
chrome.tabs.query({url: "*://workflowy.com/*"}, (tabs) => {
    if (tabs.length == 0) {
        chrome.tabs.create({url: "https://workflowy.com", active: false}, onCreateWorkflowyTab)
    } else {
        createUIelems()
    }
})

// Callback to run when a workflowy tab is created
function onCreateWorkflowyTab(tab) {
    createUIelems()
}

// Populate the popup with UI elements (must first have a fully loaded workflowy tab)
function createUIelems() {
    chrome.tabs.query({url: "*://workflowy.com/*"}, (tabs) => {
        workflowyTab = tabs[0]
        getMostUsedLists(3)
    })
}

// Do something with the list
function getMostUsedLists(numToReturn) {
    chrome.storage.sync.get("usedLists", (items) => {
        usedLists = items.usedLists

        let topLists = []
        for (let listId in usedLists) {
            console.log(listId);
            topLists.push({
                id: listId,
                name: usedLists[listId].name,
                useTimes: usedLists[listId].useTimes
            })
        }

        topLists.sort((a, b) => b.useTimes - a.useTimes);
        console.log(topLists);
        
        genListButtons(topLists.slice(0, numToReturn));
    })
}

// Generate the ui elements for most used Workflowy lists
function genListButtons(wfListArr) {
    for (let list of wfListArr) {
        let newListButton = document.createElement("button");
        newListButton.innerHTML = list.name;
        newListButton.onclick = () => {
            addToList(list.id, list.name)
        }
        mostFrequentLists.appendChild(newListButton);
    }
}

// Fire message to add current URL to the given list in Workflowy
function addToList(listId, name) {
    if (usedLists[listId]) {
        usedLists[listId].useTimes += 1
    } else {
        usedLists[listId] = {
            name,
            useTimes: 1
        }
    }

    chrome.storage.sync.set({usedLists});

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let currTab = tabs[0]
        chrome.tabs.sendMessage(workflowyTab.id, {
            type: "addToList",
            listId,
            url: currTab.url,
            title: currTab.title
        })
    })

    window.close();
}

// Fire message to search for Workflowy lists matching a term
function searchTerm(term) {
    console.log("search term: ", term);
    chrome.tabs.sendMessage(workflowyTab.id, {type: "searchTerm", term});
}

// Show the Workflowy lists generated in a search
function showWfLists(lists) {
    matchedLists.innerHTML = "";
    let maxListsLeft = 5;

    for (let list of lists) {
        if (maxListsLeft <= 0) {
            break;
        }

        let newListButton = document.createElement("button");
        newListButton.innerHTML = list.name;
        newListButton.onclick = () => {
            addToList(list.id, list.name)
        }
        matchedLists.appendChild(newListButton);

        maxListsLeft--;
    }
}