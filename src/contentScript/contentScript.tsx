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

  const sendMessage = (id, user, message, requestId, agentname) => {
    console.log("Params : ", id, user, message, requestId, agentname);

    return new Promise((resolve, reject) => {
      const findTextbox = (attempts = 5, interval = 500) => {
        const textbox = document.querySelector('[role="textbox"]');
        console.log("Textbox : ", textbox);

        if (textbox) {
          console.log("Executing InsertText command");
          const isTextEntered = document.execCommand(
            "insertText",
            false,
            message
          );
          setTimeout(() => {
            console.log("InsertText command executed successfully");

            if (isTextEntered) {
              const threadComposer = document.querySelector(
                '[aria-label="Press Enter to send"]'
              );

              if (threadComposer) {
                console.log("We Found the Send Button");
                const enterKeyEvent = new KeyboardEvent("keydown", {
                  key: "Enter",
                  code: "Enter",
                  keyCode: 13,
                  which: 13,
                  bubbles: true,
                  cancelable: true,
                });

                console.log("Dispatching the Event........");
                threadComposer.dispatchEvent(enterKeyEvent);
                console.log("Enter Key Event Dispatched Successfully.");

                // Wait for a short period to allow the event to process
                setTimeout(() => {
                  console.log("Resolving Promise with: ", {
                    id,
                    status: "success",
                    message,
                    user,
                    requestId,
                  });
                  resolve({ id, status: "success", message, user, requestId });
                }, 500);
              } else {
                console.log("Enter Button not found");
                reject({
                  id,
                  status: "failed",
                  message,
                  user,
                  requestId,
                  agentname,
                });
              }
            } else {
              console.log("Text not Entered");
              reject({
                id,
                status: "failed",
                message,
                user,
                requestId,
                agentname,
              });
            }
          }, 100);
        } else if (attempts > 0) {
          console.log(`Textbox not found, retrying in ${interval}ms...`);
          setTimeout(() => findTextbox(attempts - 1, interval), interval);
        } else {
          console.log("Failed to find textbox after multiple attempts.");
          reject({ id, status: "failed", message, user, requestId, agentname });
        }
      };

      findTextbox();
    });
  };

  return <div></div>;
};

// Render the component
const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
