chrome.runtime.onInstalled.addListener( () => {
    // set bg color to green
    chrome.storage.sync.set({color : '#3aa757'}, () => {
        console.log("The color is green.")
    })

    // launch popup when on developer.chrome.com
    chrome.declarativeContent.onPageChanged.removeRules(
        undefined, () => {
            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {hostEquals: 'developer.chrome.com'}
                })],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }])
        }
    )
})