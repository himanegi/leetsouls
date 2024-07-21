function isContest(url) {
  return /https:\/\/leetcode\.com\/contest\/.*\/problems\/.*/.test(url);
}

chrome.action.onClicked.addListener(() => {
  chrome.action.setPopup({ popup: "popup.html" });
});
