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
                    chrome.tabs.remove(tabId, () => {
                      console.log("Tab closed");
                      resolve(response.link);
                    });
                  } else {
                    chrome.tabs.remove(tabId, () => {
                      console.log("Tab closed");
                      resolve("");
                    });
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
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError.message);
              } else {
                resolve(response); // Resolve the promise with the result
              }
            }
          );

          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
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
    const { id, sent_to, message } = data.task;
    const chatURL = await searchUser(sent_to);
    const result = await sendMessage(id, chatURL, message, sent_to);

    console.log("RESULT : ", result);
  }
});
