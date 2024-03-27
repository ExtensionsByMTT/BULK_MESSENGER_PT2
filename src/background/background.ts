let socket = new WebSocket("wss://bm-test-server.onrender.com");
let reconnectAttempt = 0;
const maxReconnectAttempts = 5;
const maxReconnectDelay = 30000;

const connect = () => {
  socket = new WebSocket("wss://bm-test-server.onrender.com");
  console.log("Reconnect Attempt : ", reconnectAttempt);

  socket.addEventListener("open", (e) => {
    console.log("Connection opened");

    chrome.storage.local.get("token", (token) => {
      if (token.token) {
        socket.send(
          JSON.stringify({ action: "checkPendingTask", token: token.token })
        );
      }
    });
    chrome.power.requestKeepAwake("system");
    reconnectAttempt = 0;
  });

  socket.addEventListener("close", () => {
    console.log("Connection closed, attempting to reconnect...");
    if (reconnectAttempt < maxReconnectAttempts) {
      const delay = Math.min(1000 * 2 ** reconnectAttempt, maxReconnectDelay);
      console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
      chrome.alarms.create("reconnect", { delayInMinutes: delay / 60000 });
      reconnectAttempt++;
    } else {
      console.log("Maximum reconnection attempts reached.");
      chrome.power.releaseKeepAwake();
    }
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
        await updateTask(id, { status: "failed", message, id, user: sent_to });
      }
    }

    if (data.action === "timeLeft") {
      console.log(`Time left: ${data.seconds} seconds`);
    }
  });
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "reconnect") {
    connect();
  }
});

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
                    console.log("Tab closed");
                    resolve(response.link);
                    // });
                  } else {
                    // chrome.tabs.remove(tabId, () => {
                    console.log("Tab closed");
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
    const url = `https://bm-test-server.onrender.com/api/messages/${messageId}`;

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

connect();
