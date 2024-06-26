let webSocket = null;
const SERVER_URL = "https://fbm.expertadblocker.com";
const SOCKET_SERVER_URL = "wss://fbm.expertadblocker.com";
// const SERVER_URL = "http://localhost:3001";
// const SOCKET_SERVER_URL = "ws://localhost:3001";
let reconnectInterval = 1000;
let client_id = "";
let pendingTasks = null;

function generateUniqueId() {
  const randomStr = Math.random().toString(36).substring(2, 12);
  const timestamp = new Date().getTime();
  const uniqueId = randomStr + "-" + timestamp;
  return uniqueId;
}
//
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data = request.data;
  if (request.type === "addTask") {
    if (webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify({ action: "addTask", payload: data }));
    } else {
      console.log(
        "WebSocket is not open. Current state:",
        webSocket.readyState
      );
    }
    sendResponse({ status: "ok", message: "Data sent to server" });
  }
});

//
// Function to send client data
function sendClientData(clientID) {
  chrome.storage.local.get("token", (result) => {
    if (result?.token === undefined) {
      console.log("Token Not found");
      chrome.runtime.reload();
    } else {
      setTimeout(() => {
        if (webSocket && webSocket.readyState === WebSocket.OPEN) {
          webSocket.send(
            JSON.stringify({
              action: "clientID",
              payload: clientID,
              token: result.token,
            })
          );
        }
      }, 1000);
    }
  });
}

//
async function updateTask(messageId, updatedData) {
  try {
    // Construct the URL with the task ID
    const url = `${SERVER_URL}/api/messages/${messageId}`;

    // Send the PUT request and wait for the response
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    // Parse the response body as JSON
    const data = await response.json();
    console.log("Task updated successfully:", data);
  } catch (error) {
    console.error("There was a problem updating the task:", error);
  }
}

//
const searchUser = (user: string): Promise<{ link: string; tabId: any }> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.create(
      { url: `https://mbasic.facebook.com/${user}` },
      (tab) => {
        const tabId = tab.id;
        chrome.tabs.onUpdated.addListener(function listener(
          tabIdUpdated,
          changeInfo
        ) {
          if (changeInfo.status === "complete" && tabIdUpdated === tabId) {
            chrome.tabs.sendMessage(
              tabId,
              {
                action: "searchForLink",
              },
              function (response) {
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message);
                  reject(chrome.runtime.lastError.message);
                } else {
                  if (response.status === "ok") {
                    // chrome.tabs.remove(tabId, () => {
                    console.log("Tab closed");
                    resolve({ link: response.link, tabId: tabId });
                    // });
                  } else {
                    // chrome.tabs.remove(tabId, () => {
                    console.log("Tab closed");
                    resolve({ link: "", tabId: tabId });
                    // });
                  }
                }
              }
            );

            chrome.tabs.onUpdated.removeListener(listener);
          }
        });
      }
    );
  });
};

//
const sendMessage = (
  id: number,
  url: string,
  tabId: any,
  message: string,
  sent_to: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.update(tabId, { url: url }, (tab) => {
      const tabId = tab.id;
      if (!tabId) {
        reject(new Error("Failed to create tab."));
        return;
      }
      chrome.tabs.onUpdated.addListener(function listener(
        tabIdUpdated,
        changeInfo
      ) {
        if (changeInfo.status === "complete" && tabIdUpdated === tabId) {
          chrome.tabs.sendMessage(
            tabId,
            {
              action: "sendMessage",
              payload: {
                id: id,
                message: message,
                user: sent_to,
              },
            },
            (response) => {
              resolve(response);
              setTimeout(() => {
                chrome.tabs.remove(tabId, () => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      `Error removing tab: ${chrome.runtime.lastError.message}`
                    );
                  } else {
                    console.log("Tab closed successfully.");
                  }
                });
              }, 10000);
            }
          );
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  });
};

//
const message = () => {
  webSocket.onmessage = async (e) => {
    const data = JSON.parse(e.data);
    if (data.action === "sendMessageToUser") {
      console.log("TASK:", data);
    }

    if (data.task) {
      const { id, sent_to, message } = data.task;
      const { link: chatURL, tabId } = await searchUser(sent_to);

      if (chatURL.length != 0) {
        const result = await sendMessage(id, chatURL, tabId, message, sent_to);
        await updateTask(id, result.res);
      } else {
        await updateTask(id, {
          status: "failed",
          message,
          id,
          user: sent_to,
        });
      }
    } else {
      console.log("No task found in the data:", data);
    }
    // Handle pending tasks separately
    if (data.action === "pendingTasks") {
      console.log("Your Pending Task : ", data.payload);
      chrome.storage.local.set({ pendingTasks: data.payload }, () => {
        console.log("Pending Task Saved to local Storage");
      });
    }
  };
};

function connect() {
  webSocket = new WebSocket(SOCKET_SERVER_URL);
  webSocket.onopen = () => {
    console.log("WebSocket connected");
    chrome.storage.local.get("clientID", (result) => {
      if (result?.clientID === undefined) {
        const newClientID = generateUniqueId();
        chrome.storage.local.set({ clientID: newClientID }, () => {
          console.log("Client ID generated and stored:", newClientID);
          client_id = newClientID;
          sendClientData(newClientID);
        });
      } else {
        console.log("Client ID already exists:", result.clientID);
        client_id = result.clientID;
        sendClientData(result.clientID);
      }
    });
    message();
    keepAlive();
    clearInterval(reconnectInterval);
  };

  webSocket.onclose = (event) => {
    if (event.code !== 1006) {
      if (webSocket && webSocket.readyState === WebSocket.CLOSED)
        console.log("WebSocket connection closed trying to reconnect");
      reconnect();
    }
  };
  webSocket.onerror = (error) => {
    if (error) {
      console.log(`WebSocket Internal error`);
      webSocket.close();
      chrome.runtime.sendMessage({
        Error: "Internal error please try after some time",
      });
    }
  };
}

function disconnect() {
  if (webSocket) {
    if (webSocket.readyState === WebSocket.OPEN) {
      webSocket.close();
    }
  }
}

function reconnect() {
  disconnect();
  console.log("Attempting to reconnect");
  setTimeout(connect, reconnectInterval);
  reconnectInterval *= 2;
  // const maxReconnectInterval = 30000;
  // if (reconnectInterval > maxReconnectInterval) {
  //   reconnectInterval = maxReconnectInterval;
  // }
}

function keepAlive() {
  const keepAliveIntervalId = setInterval(() => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify({ action: "keepalive" }));
    } else {
      clearInterval(keepAliveIntervalId);
    }
  }, 20000);
}

// Function to initiate connection when extension starts
function init() {
  connect();
}
chrome.runtime.onInstalled.addListener(function () {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});
// Open options page on background script startup
chrome.runtime.onStartup.addListener(function () {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "StartTheSocket") {
    init();
  } else if (message.action === "reloadBackground") {
    chrome.runtime.reload();
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
