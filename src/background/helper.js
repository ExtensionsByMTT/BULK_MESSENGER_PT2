// const SOCKET_SERVER_URL = "ws://localhost:3001";
// const SERVER_URL = "http://localhost:3001";

// // const SOCKET_SERVER_URL = "wss://fbm.expertadblocker.com";
// // const SERVER_URL = "https://fbm.expertadblocker.com";

// let socket: WebSocket | undefined;
// let reconnectAttempt = 0;
// const maxReconnectAttempts = 10;
// const maxReconnectDelay = 30000;
// let client_id = "";
// let pendingTasks = null;

// function generateUniqueId() {
//   const randomStr = Math.random().toString(36).substring(2, 12);
//   const timestamp = new Date().getTime();
//   const uniqueId = randomStr + "-" + timestamp;
//   return uniqueId;
// }

// const searchUser = (user: string): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     chrome.tabs.create(
//       { url: `https://mbasic.facebook.com/${user}` },
//       (tab) => {
//         const tabId = tab.id;
//         chrome.tabs.onUpdated.addListener(function listener(
//           tabIdUpdated,
//           changeInfo
//         ) {
//           if (changeInfo.status === "complete" && tabIdUpdated === tabId) {
//             chrome.tabs.sendMessage(
//               tabId,
//               {
//                 action: "searchForLink",
//               },
//               function (response) {
//                 if (chrome.runtime.lastError) {
//                   console.error(chrome.runtime.lastError.message);
//                   reject(chrome.runtime.lastError.message);
//                 } else {
//                   if (response.status === "ok") {
//                     // chrome.tabs.remove(tabId, () => {
//                     console.log("Tab closed");
//                     resolve(response.link);
//                     // });
//                   } else {
//                     // chrome.tabs.remove(tabId, () => {
//                     console.log("Tab closed");
//                     resolve("");
//                     // });
//                   }
//                 }
//               }
//             );

//             chrome.tabs.onUpdated.removeListener(listener);
//           }
//         });
//       }
//     );
//   });
// };

// const sendMessage = (
//   id: number,
//   url: string,
//   message: string,
//   sent_to: string
// ): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     chrome.tabs.create({ url: url }, (tab) => {
//       const tabId = tab.id;

//       chrome.tabs.onUpdated.addListener(function listener(
//         tabIdUpdated,
//         changeInfo
//       ) {
//         if (changeInfo.status === "complete" && tabIdUpdated === tabId) {
//           chrome.tabs.sendMessage(
//             tabId,
//             {
//               action: "sendMessage",
//               payload: {
//                 id: id,
//                 message: message,
//                 user: sent_to,
//               },
//             },
//             (response) => {
//               resolve(response);
//             }
//           );
//           updateTask
//           chrome.tabs.onUpdated.removeListener(listener);
//         }
//       });
//     });
//   });
// };

// async function updateTask(messageId, updatedData) {
//   try {
//     // Construct the URL with the task ID
//     const url = `${SERVER_URL}/api/messages/${messageId}`;

//     // Send the PUT request and wait for the response
//     const response = await fetch(url, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(updatedData),
//     });

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     // Parse the response body as JSON
//     const data = await response.json();
//     console.log("Task updated successfully:", data);
//   } catch (error) {
//     console.error("There was a problem updating the task:", error);
//   }
// }

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   const data = request.data;
//   if (request.type === "addTask") {
//     if (socket.readyState === WebSocket.OPEN) {
//       socket.send(JSON.stringify({ action: "addTask", payload: data }));
//     } else {
//       console.log("WebSocket is not open. Current state:", socket.readyState);
//     }
//     sendResponse({ status: "ok", message: "Data sent to server" });
//   }
// });

// function sendClientData(clientID) {
//   chrome.storage.local.get("token", (result) => {
//     if (result?.token === undefined) {
//       console.log("Token Not found");
//     } else {
//       setTimeout(() => {
//         if (socket && socket.readyState === WebSocket.OPEN) {
//           socket.send(
//             JSON.stringify({
//               action: "clientID",
//               payload: clientID,
//               token: result.token,
//             })
//           );
//         }
//       }, 1000);
//     }
//   });
// }
// const connect = (clientID) => {
//   socket = new WebSocket(SOCKET_SERVER_URL);
//   console.log("Reconnect Attempt : ", reconnectAttempt);
//   console.log("Connected : ", clientID);

//   socket.addEventListener("close", () => {
//     console.log("Connection closed, attempting to reconnect...");
//     const delay = Math.min(1000 * 2 ** reconnectAttempt, maxReconnectDelay);
//     console.log(`Attempting to reconnect in ${delay / 1000} seconds...`);
//     chrome.alarms.create("reconnect", { delayInMinutes: delay / 60000 });
//     reconnectAttempt++;
//   });

//   socket.addEventListener("message", async (e) => {
//     const data = JSON.parse(e.data);

//     if (data.action === "sendMessageToUser") {
//       console.log("TASK  : ", data);

//       const { id, sent_to, message } = data.task;
//       const chatURL = await searchUser(sent_to);

//       if (chatURL.length != 0) {
//         const result = await sendMessage(id, chatURL, message, sent_to);
//         await updateTask(id, result.res);
//       } else {
//         await updateTask(id, {
//           status: "failed",
//           message,
//           id,
//           user: sent_to,
//         });
//       }
//     }

//     if (data.action === "pendingTasks") {
//       console.log("Your Pending Task : ", data.payload);
//       chrome.storage.local.set({ pendingTasks: data.payload }, () => {
//         console.log("Pending Task Saved to local Storage");
//       });
//     }

//     if (data.action === "timeLeft") {
//       console.log(`Time left: ${data.seconds} seconds`);
//     }
//   });

//   socket.addEventListener("open", async (event) => {
//     sendClientData(clientID);
//   });
// };

// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === "reconnect") {
//     connect(client_id);
//   }
// });

// chrome.storage.local.get("clientID", (result) => {
//   if (result?.clientID === undefined) {
//     const newClientID = generateUniqueId();
//     chrome.storage.local.set({ clientID: newClientID }, () => {
//       console.log("Client ID generated and stored:", newClientID);
//       client_id = newClientID;
//       connect(newClientID);
//     });
//   } else {
//     console.log("Client ID already exists:", result.clientID);
//     client_id = result.clientID;
//     connect(result.clientID);
//   }
// });





///////////app.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const healthCheckRoute = require("./src/routes/healthRoute");
const messengerRoute = require("./src/routes/messengerRoute");
const extensionRoute = require("./src/routes/extensionRoute");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const cors = require("cors");
const {
  addTask,
  getPendingTask,
  updateTaskStatus,
  generateUniqueId,
  checkTableExists,
  getAgentsPendingTask,
} = require("./src/utlis/actions");
const { pool } = require("./src/utlis/db");
const queries = require("./src/utlis/queries");

const app = express();
const server = http.createServer(app); // Create an HTTP server
const wss = new WebSocket.Server({ server }); // Create a WebSocket server
const PORT = process.env.PORT || 3001;
const taskSchedulerIntervalIds = new Map();
const clients = new Map();
app.use(cors());
app.use(express.json());
app.use("/api/", messengerRoute);
app.use("/", healthCheckRoute);
app.use("/extension", extensionRoute);
wss.on("connection", async (ws) => {
  let clientId = null;
  let token = null;
  // console.log(`Connected: ${clientId}`);
  // clients.set(clientId, ws);

  const isMessageTable = await checkTableExists("messages");

  if (!isMessageTable) {
    await pool.query(queries.createMessageTable);
  }

  ws.onmessage = async (message) => {
    try {
      const data = JSON.parse(message.data);

      if (data.action === "keepalive") {
        console.log(`WEBSOCKET IS ALIVE FOR :${clientId}`);
      }

      if (data.action === "clientID") {
        clientId = data.payload;
        token = data.token;

        console.log(`Client ID received: ${clientId}`);
        console.log(`Client Token: ${token}`);

        // Update the WebSocket connection for this clientId in the clients map
        clients.set(clientId, ws);
        console.log(`WebSocket connection updated for client ID: ${clientId}`);

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const agent = decodedToken.username;

        const pendingTasks = await getAgentsPendingTask(agent);
        ws.send(
          JSON.stringify({ action: "pendingTasks", payload: pendingTasks })
        );
      }
      if (data.action === "addTask") {
        await processAddTasks(clientId, data.payload);
      }

      if (data.action === "checkPendingTask") {
        console.log("Checking pending task");
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  ws.on("close", () => {
    console.log(`Disconnedted :  ${clientId}`);
    // clients.delete(clientId);
    // console.log("Cancelled Scheduled Tasks");
    // clearTaskSchedulerInterval(clientId);
  });
});

const processAddTasks = async (clientId, payload) => {
  const { message, ids: users, time: interval, count, token } = payload;
  console.log(payload);
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const role = decodedToken.role;
  const username = decodedToken.username;

  console.log("role : ", role, username);

  const ws = clients.get(clientId);
  if (!ws) {
    console.error(`WebSocket connection not found for client ${clientId}`);
    return;
  }

  for (let i = 0; i < users.length; i++) {
    await addTask(users[i], message, username);
  }

  scheduleTasks(clientId, ws, interval, count, username);
};

const scheduleTasks = (clientId, ws, interval = 2, count = 2, username) => {
  if (taskSchedulerIntervalIds.has(clientId)) {
    console.log("Task already scheduled for this client");
    return;
  }

  console.log("Tasks Scheduled sucessfully");
  executeTasks(clientId, count, username);

  const intervalId = setInterval(async () => {
    executeTasks(clientId, count, username);
  }, interval * 60000);

  taskSchedulerIntervalIds.set(clientId, intervalId);
};

// When a task is no longer needed, clear its interval
const clearTaskSchedulerInterval = (clientId) => {
  const intervalId = taskSchedulerIntervalIds.get(clientId);
  if (intervalId) {
    clearInterval(intervalId);
    taskSchedulerIntervalIds.delete(clientId);
  }
};

const executeTasks = async (clientId, count, username) => {
  const tasks = await getPendingTask(count, username);
  console.log("TASK : ", tasks);

  if (tasks.length > 0) {
    tasks.forEach((task) => {
      const requestId = generateUniqueId();
      const payload = {
        action: "sendMessageToUser",
        task: task,
        requestId: requestId,
      };

      const ws = clients.get(clientId);
      ws.send(JSON.stringify(payload));
    });
  } else {
    clearTaskSchedulerInterval(clientId);
    console.log("No pending tasks : ", username);
  }
};

server.listen(PORT, () => {
  console.log(`Server running on port ${server.address().port}`);
});

// Log WebSocket server's port after it starts listening
wss.on("listening", () => {
  console.log(`WebSocket server running on port ${server.address().port}`);
});
