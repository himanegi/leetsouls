chrome.action.onClicked.addListener(() => {
  chrome.action.setPopup({ popup: "popup.html" });
});
