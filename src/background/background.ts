const socket = new WebSocket("ws://localhost:8080");
const tasks = [];
let loggedIn = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data = request.data;
  socket.send(JSON.stringify({ action: "sendMessage", payload: data }));
  sendResponse({ status: "ok" });
});

socket.addEventListener("open", (e) => {
  console.log("Connection opened");
});

const sendMessage = (user: string, message: string) => {
  // Create a new tab with the given URL
  chrome.tabs.create({ url: `https://mbasic.facebook.com/${user}` }, (tab) => {
    // Store the tab ID for later use
    const tabId = tab.id;

    // Listen for the tab to finish loading
    chrome.tabs.onUpdated.addListener(function listener(
      tabIdUpdated,
      changeInfo
    ) {
      // Check if the updated tab is the one we're interested in and if it has finished loading
      if (changeInfo.status === "complete" && tabIdUpdated === tabId) {
        // The tab has finished loading, now send a message to the content script
        chrome.tabs.sendMessage(
          tabId,
          {
            action: "searchForLink",
          },
          function (response) {
            // Check for errors
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError.message);
            } else {
              if (response.status === "ok") {
                console.log(response);
              }
            }
          }
        );

        // Remove the listener to avoid multiple executions
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  });
};

socket.addEventListener("message", async (e) => {
  const data = JSON.parse(e.data);
  const message = data.message;

  if (message === "connected") {
    console.log("CONNECTED");
  }

  if (message === "taskAdded") {
    console.log("TASK ADDED");
  }

  if (message === "sendMessageToUser") {
    const { sent_to, message, sent_from, password } = data.task;
    sendMessage(sent_to, message);
  }
});
