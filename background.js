function inject(tabId) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      files: ["contentScript.js"],
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error injecting script: " + chrome.runtime.lastError.message
        );
        return;
      }
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: () => {
          if (!document.getElementById("leetcode-local-tester-button")) {
            const button = document.createElement("div");
            button.id = "leetcode-local-tester-button";
            button.className = "leetcode-local-tester-button";
            button.title = "Extract Problem Code";
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" class="clipboard-icon">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" class="tick-icon" style="display: none;">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
              `;

            const style = document.createElement("style");
            style.textContent = `
                .leetcode-local-tester-button {
                  position: fixed;
                  top: 0;
                  right: 10px;
                  z-index: 9999;
                  width: 32px;
                  height: 32px;
                  cursor: pointer;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: transparent;
                  border: 2px solid rgba(212, 175, 55, 0.3);
                  border-radius: 50%;
                  transition: all 0.2s ease;
                  margin: 8px 0;
                  overflow: hidden;
                }
                .leetcode-local-tester-button:hover {
                  transform: rotate(360deg);
                  background: rgba(212, 175, 55, 0.1);
                  border-color: rgba(212, 175, 55, 0.7);
                }
                .leetcode-local-tester-button.clicked {
                  background-color: #ffd700;
                }
                .leetcode-local-tester-button svg {
                  color: #d4af37;
                  transition: all 0.2s ease;
                }
                .leetcode-local-tester-button:hover svg {
                  color: #ffd700;
                }
                .leetcode-local-tester-button.clicked svg {
                  color: #0a0a0a;
                }
              `;

            document.head.appendChild(style);

            let isClickable = true;

            button.addEventListener("click", () => {
              if (isClickable) {
                isClickable = false;
                button.classList.add("clicked");
                document.dispatchEvent(new CustomEvent("generateLocalTester"));
                button.querySelector(".clipboard-icon").style.display = "none";
                button.querySelector(".tick-icon").style.display = "block";

                setTimeout(() => {
                  button.classList.remove("clicked");
                  button.querySelector(".clipboard-icon").style.display =
                    "block";
                  button.querySelector(".tick-icon").style.display = "none";
                  isClickable = true;
                }, 2000);
              }
            });

            document.body.appendChild(button);
          }
        },
      });
    }
  );
}

function isContest(url) {
  return /https:\/\/leetcode\.com\/contest\/.*\/problems\/.*/.test(url);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && isContest(tab.url)) {
    inject(tabId);
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.action.setPopup({ popup: "popup.html" });
});
