const socket = new WebSocket("ws://localhost:8080");
const tasks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data = request.data;
  socket.send(JSON.stringify({ action: "sendMessage", payload: data }));
  sendResponse({ status: "ok" });
});

socket.addEventListener("open", (e) => {
  console.log("Connection opened");
});

socket.addEventListener("message", (e) => {
  const data = JSON.parse(e.data);
  const message = data.message;

  if (message === "connected") {
    console.log("CONNECTED");
  }

  if (message === "taskAdded") {
    console.log("TASK ADDED");
  }

  if (message === "sendMessageToUser") {
    const task = data.task;
    tasks.push(task);

    console.log("Pending Tasks : ", tasks);
  }
});
