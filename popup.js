// let changeColor = document.getElementById('changeColor')
let page = document.getElementById('colorsDiv')
const buttonColors = [
    '#3aa757',
    '#e8453c',
    '#f9bb2d',
    '#4688f1',
]

function constructOptions(buttonColors) {
    for (let color of buttonColors) {
        let button = document.createElement('button')
        button.style.backgroundColor = color
        button.addEventListener('click', () => {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                chrome.tabs.executeScript(
                    tabs[0].id,
                    {code: 'document.body.style.backgroundColor = "' + color + '";'}
                )
            })
        })
        page.appendChild(button)
    }
}

constructOptions(buttonColors)

// chrome.storage.sync.get('color', (data) => {
//     changeColor.style.backgroundColor = data.color
//     changeColor.setAttribute('value', data.color)
// })

// changeColor.onclick = (element) => {
//     let color = element.target.value
//     chrome.tabs.query({
//         active: true,
//         currentWindow: true
//     }, (tabs) => {
//         chrome.tabs.executeScript(
//             tabs[0].id,
//             {code: 'document.body.style.backgroundColor = "' + color + '";'}
//         )
//     })
// }