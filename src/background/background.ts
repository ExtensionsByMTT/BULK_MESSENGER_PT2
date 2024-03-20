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

const loginUser = async (username, password) => {
  console.log("cread : ", username, password);

  chrome.tabs.create({ url: "https://mbasic.facebook.com/" }, (tab) => {
    // Store the tab ID for later use
    const tabId = tab.id;

    // Listen for the tab to finish loading
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (changeInfo.status === "complete" && tabId === tab.id) {
        // The tab has finished loading, now send a message to the content script
        chrome.tabs.sendMessage(tabId, {
          action: "loginUser",
          payload: {
            username,
            password,
          },
        });

        // Remove the listener to avoid multiple executions
        chrome.tabs.onUpdated.removeListener(listener);
      }
    });
  });

  loggedIn = true;
};

const sendMessage = async (user, message) => {
  chrome.tabs.create({ url: `https://mbasic.facebook.com/${user}` }, (tab) => {
    // Store the tab ID for later use
    const tabId = tab.id;

    // Listen for the tab to finish loading
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (changeInfo.status === "complete" && tabId === tab.id) {
        // The tab has finished loading, now send a message to the content script
        chrome.tabs.sendMessage(tabId, {
          action: "sendMessage",
          payload: {
            message,
          },
        });

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

    console.log("DATA : ", data.task);

    // if (loggedIn) {
    //   await loginUser(sent_from, password);
    // }

    await sendMessage(sent_to, message);
  }
});
