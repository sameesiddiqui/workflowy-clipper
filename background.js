chrome.runtime.onInstalled.addListener(setupStorage)

function setupStorage() {
    chrome.storage.sync.set(
        {
            usedLists: {}
        }
    )
}