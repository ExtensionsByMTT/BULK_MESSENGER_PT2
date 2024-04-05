// const SOCKET_SERVER_URL = "ws://localhost:3001";
// const SERVER_URL = "http://localhost:3001";

const SOCKET_SERVER_URL = "wss://fbm.expertadblocker.com";
const SERVER_URL = "https://fbm.expertadblocker.com";

let socket: WebSocket | undefined;
let reconnectAttempt = 0;
const maxReconnectAttempts = 10;
const maxReconnectDelay = 30000;
let client_id = "";
let pendingTasks = null;

function generateUniqueId() {
  const randomStr = Math.random().toString(36).substring(2, 12);
  const timestamp = new Date().getTime();
  const uniqueId = randomStr + "-" + timestamp;
  return uniqueId;
}

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
                    console.log("Tab closed");
                    resolve(response.link);
                    chrome.tabs.remove(tabId);
                  } else {
                    console.log("Tab closed");
                    resolve("");
                    chrome.tabs.remove(tabId);
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

const sendMessage = (
  id: number,
  url: string,
  message: string,
  sent_to: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url: url }, (tab) => {
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

          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  });
};

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data = request.data;
  if (request.type === "addTask") {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: "addTask", payload: data }));
    } else {
      console.log("WebSocket is not open. Current state:", socket.readyState);
    }
    sendResponse({ status: "ok", message: "Data sent to server" });
  }
});

function sendClientData(clientID) {
  chrome.storage.local.get("token", (result) => {
    if (result?.token === undefined) {
      console.log("Token Not found");
    } else {
      setTimeout(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
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
const connect = (clientID) => {
  socket = new WebSocket(SOCKET_SERVER_URL);
  console.log("Reconnect Attempt : ", reconnectAttempt);
  console.log("Connected : ", clientID);

  socket.addEventListener("close", () => {
    console.log("Connection closed, attempting to reconnect...");
    const delay = Math.min(1000 * 2 ** reconnectAttempt, maxReconnectDelay);
    console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
    chrome.alarms.create("reconnect", { delayInMinutes: delay / 60000 });
    reconnectAttempt++;
  });

  socket.addEventListener("message", async (e) => {
    const data = JSON.parse(e.data);

    if (data.action === "sendMessageToUser") {
      console.log("TASK  : ", data);

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
    }

    if (data.action === "pendingTasks") {
      console.log("Your Pending Task : ", data.payload);
      chrome.storage.local.set({ pendingTasks: data.payload }, () => {
        console.log("Pending Task Saved to local Storage");
      });
    }

    if (data.action === "timeLeft") {
      console.log(`Time left: ${data.seconds} seconds`);
    }
  });

  socket.addEventListener("open", async (event) => {
    sendClientData(clientID);
  });
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "reconnect") {
    connect(client_id);
  }
});

chrome.storage.local.get("clientID", (result) => {
  if (result?.clientID === undefined) {
    const newClientID = generateUniqueId();
    chrome.storage.local.set({ clientID: newClientID }, () => {
      console.log("Client ID generated and stored:", newClientID);
      client_id = newClientID;
      connect(newClientID);
    });
  } else {
    console.log("Client ID already exists:", result.clientID);
    client_id = result.clientID;
    connect(result.clientID);
  }
});
