// const SOCKET_SERVER_URL = "ws://localhost:3001";
// const SERVER_URL = "http://localhost:3001";
const SERVER_URL = "https://fbm.expertadblocker.com";
const webSocket = new WebSocket("wss://fbm.expertadblocker.com");
let reconnectInterval = 5000;
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
function sendClientData(clientID) {
  chrome.storage.local.get("token", (result) => {
    if (result?.token === undefined) {
      console.log("Token Not found");
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
const searchUser = (user: string): Promise<string> => {
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
                    // console.log("Tab closed");
                    resolve(response.link);
                    // });
                  } else {
                    // chrome.tabs.remove(tabId, () => {
                    // console.log("Tab closed");
                    resolve("");
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
  message: string,
  sent_to: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.update({ url: url }, (tab) => {
      const tabId = tab.id;
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
            }
          );
          chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
              if (request.messageData === "CLOSETHISTAB") {
                if (request.messageData === "CLOSETHISTAB") {
                  // Check if the sender.tab.id is available to ensure the message comes from a tab
                  if (sender.tab?.id) {
                    chrome.tabs.remove(sender.tab.id, () => {
                      if (chrome.runtime.lastError) {
                        console.error(
                          `Error removing tab: ${chrome.runtime.lastError.message}`
                        );
                      } else {
                        console.log("Tab removed successfully");
                      }
                    });
                  }
                }
              }
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

    if (data.action === "sendMessageToUser") console.log("TASK:", data);
    const { id, sent_to, message } = data.task;
    const chatURL = await searchUser(sent_to);
    if (chatURL.length != 0) {
      const result = await sendMessage(id, chatURL, message, sent_to);
      await updateTask(id, result.res);
    } else {
      await updateTask(id, {
        status: "failed",
        message,
        id,
        user: sent_to,
      });
    }
    if (data.action === "pendingTasks") {
      console.log("Your Pending Task : ", data.payload);
      chrome.storage.local.set({ pendingTasks: data.payload }, () => {
        console.log("Pending Task Saved to local Storage");
      });
    }
  };
};

function connects() {
  webSocket.onopen = () => {
    console.log("WebSocket connected");
    chrome.storage.local.get("clientID", (result) => {
      if (result?.clientID === undefined) {
        const newClientID = generateUniqueId();
        chrome.storage.local.set({ clientID: newClientID }, () => {
          console.log("Client ID generated and stored:", newClientID);
          client_id = newClientID;
          sendClientData(result.clientID);
        });
      } else {
        console.log("Client ID already exists:", result.clientID);
        client_id = result.clientID;
        sendClientData(result.clientID);
      }
    });

    keepAlive();
    clearInterval(reconnectInterval);
    /////////////////////////////////////////
  };

  //when webSocket get disconnect by any reason
  webSocket.onclose = () => {
    console.log("WebSocket connection closed");
    reconnect();
  };

  webSocket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

function keepAlive() {
  const keepAliveIntervalId = setInterval(() => {
    if (webSocket) {
      webSocket.send("keepalive");
    } else {
      clearInterval(keepAliveIntervalId);
    }
  }, 20000);
}

function reconnect() {
  if (webSocket) {
    webSocket.close();
  }
  console.log("Attempting to reconnect");
  setTimeout(connects, reconnectInterval);

  const maxReconnectInterval = 30000;
  if (reconnectInterval > maxReconnectInterval) {
    reconnectInterval = maxReconnectInterval;
  }
}

connects();
