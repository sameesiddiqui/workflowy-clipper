chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        switch (request.type) {
            case "addToList":
                handleAddLink(request);
                break;
            case "searchTerm":
                handleSearchTerm(request);
            default:
                break;
        }
    }
)

window.addEventListener("message", readSearchTermResults, false);

function handleAddLink(request) {
    let actualCode = function(listId, url, title) {
        let listNode = WF.getItemById(listId)
        let newItem = WF.createItem(listNode, 0)
        WF.setItemName(newItem, title)
        WF.setItemNote(newItem, url)
    }

    let script = document.createElement('script');

    script.textContent = "(" +
        actualCode.toString() +
        ")(" + JSON.stringify(request.listId) + "," + JSON.stringify(request.url) + "," + JSON.stringify(request.title) + ");";

    (document.head||document.documentElement).appendChild(script);

    script.remove();
}

function handleSearchTerm(request) {
    let actualCode = function(term) {
        let optimizedTerm = term.toLowerCase();
        let matches = [];
        WF.search(term);
        let layer = [WF.rootItem()];

        while (layer.length > 0) {
            let newLayer = [];

            for (let item of layer) {
                let plainText = item.getNameInPlainText().toLowerCase()
                if (plainText.includes(optimizedTerm)) {
                    matches.push({
                        name: item.getName(),
                        id: item.getId(),
                    });
                }
                
                let itemChildren = item.getVisibleChildren();
                for (let childItem of itemChildren) {
                    newLayer.push(childItem);
                }
            }

            layer = newLayer;
        }

        window.postMessage({
            type: "searchResults",
            matches
        }, "*");
    }

    let script = document.createElement('script');

    script.textContent = "(" +
        actualCode.toString() +
        ")(" + JSON.stringify(request.term) + ");";

    (document.head||document.documentElement).appendChild(script);

    script.remove();
}

function readSearchTermResults(event) {
    if (event.source !== window) {
        return;
    }

    if (event.data.type && (event.data.type === "searchResults")) {
        chrome.runtime.sendMessage({
            type: "popupSearchResults",
            matches: event.data.matches
        })
    }
}