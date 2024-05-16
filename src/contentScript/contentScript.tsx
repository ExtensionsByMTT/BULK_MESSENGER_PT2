// Import React and other necessary libraries
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./contentScript.css";
interface username {
  username: string;
}
const App: React.FC<{}> = () => {
  const [agentName, setagentName] = useState("");
  chrome.storage.local.get("username", (username: username) => {
    setagentName(username.username);
  });

  useEffect(() => {
    // Set up a message listener
    const messageListener = (request, sender, sendResponse) => {
      if (request.action === "sendMessage") {
        const id = request.payload.id;
        const user = request.payload.user;
        const message = request.payload.message;
        const requestId = request.payload.requestId;
        const agentname = agentName;
        sendMessage(id, user, message, requestId, agentname)
          .then((res) => {
            console.log("We are in from where we called");
            console.log("Here is what is got : ", res);
            sendResponse(res);
            console.log("Sended the response");
          })
          .catch((error) => {
            sendResponse({
              status: "failed",
              id: id,
              user: user,
              message: message,
            });
          });
      }

      return true;
    };

    // Add the listener
    chrome.runtime.onMessage.addListener(messageListener);

    // Clean up the listener when the component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const sendMessage = (
    id,
    user,
    message,
    requestId,
    agentName,
    retries = 25
  ) => {
    return new Promise((resolve, reject) => {
      console.log("Attempting to execute InsertText command");
      let attempts = 0;
      let isMessageSent = false;

      function attemptSend() {
        if (isMessageSent) {
          return;
        }

        const isTextEntered = document.execCommand(
          "insertText",
          false,
          message
        );
        if (isTextEntered) {
          const threadComposer = Array.from(
            document.querySelectorAll(
              '[aria-label*="Press enter to send"], [aria-label*="Press Enter to send"]'
            )
          ).find(
            (element) =>
              element
                .getAttribute("aria-label")
                .includes("Press enter to send") ||
              element.getAttribute("aria-label").includes("Press Enter to send")
          );

          if (threadComposer) {
            console.log("Text entered, found the Send button");
            const enterKeyEvent = new KeyboardEvent("keydown", {
              key: "Enter",
              code: "Enter",
              keyCode: 13,
              which: 13,
              bubbles: true,
              cancelable: true,
            });

            threadComposer.dispatchEvent(enterKeyEvent);
            console.log("Enter Key Event Dispatched Successfully.");

            isMessageSent = true;
            setTimeout(() => {
              resolve({
                id,
                status: "success",
                message,
                user,
                requestId,
              });
            }, 500);
          } else {
            console.log("Send button not found");
            if (attempts < retries) {
              retrySending();
            } else {
              reject({
                id,
                status: "failed",
                message,
                user,
                requestId,
                agentName,
              });
            }
          }
        } else {
          console.log("Text not entered");
          if (attempts < retries) {
            retrySending();
          } else {
            reject({
              id,
              status: "failed",
              message,
              user,
              requestId,
              agentName,
            });
          }
        }
      }
      function retrySending() {
        attempts++;
        console.log(`Retry attempt ${attempts}`);
        setTimeout(attemptSend, 1000);
      }
      attemptSend();
    });
  };

  return <div></div>;
};

// Render the component
const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
