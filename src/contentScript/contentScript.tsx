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
            sendResponse(res);
            console.log("response:", res);
          })
          .catch((error) => {
            sendResponse(error);
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

  async function findLastMsg() {
    const recentMessage = await document.querySelectorAll(
      "[data-scope='messages_table']"
    );
    const spansWithText = [];

    recentMessage.forEach((message) => {
      const spans = message.querySelectorAll("span");
      spans.forEach((span) => {
        if (span.textContent.trim() !== "") {
          spansWithText.push(span);
        }
      });
    });

    const lastSpanWithText = spansWithText[spansWithText.length - 1];
    return lastSpanWithText.innerText;
  }

  const sendMessage = (
    id,
    user,
    message,
    requestId,
    agentName,
    retries = 25
  ) => {
    return new Promise((resolve, reject) => {
      console.log("ATTEMPTING TO EXECUTE INSERTTEXT COMMAND......");
      const UserNotLoggedIn = document.querySelector("button[name='login']");

      if (UserNotLoggedIn) {
        reject({
          id,
          status: "failed",
          message,
          user,
          requestId,
          agentName,
          reason: "THE USER WAS NOT LOGGEDIN SO WE REJECT THE REQUEST",
        });
        console.log("THE USER WAS NOT LOGGEDIN SO WE REJECT THE REQUEST");
        return;
      }

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
            setTimeout(async () => {
              const recentMsg = await findLastMsg();
              if (recentMsg === "Sent") {
                isMessageSent = true;
                resolve({
                  id,
                  status: "success",
                  message,
                  user,
                  reason:
                    "MSG SENDED TO  USER AND CONFIRM WITH SEND FLAG IN MESSAGE TABLE",
                });
                console.log(
                  "MSG SENDED TO  USER AND CONFIRM WITH SEND FLAG IN MESSAGE TABLE"
                );
                return;
              } else {
                reject({
                  id,
                  status: "failed",
                  message,
                  user,
                  agentName,
                  reason:
                    "SOMETHING WENT WRONG AS USER ID IS SUSPENDED BY FACEBOOK OR INTERNAL ERROR",
                });
                console.log(
                  "SOMETHING WENT WRONG AS USER ID IS SUSPENDED BY FACEBOOK OR INTERNAL ERROR"
                );
                return;
              }
            }, 3000);
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
                agentName,
              });
            }
          }
        } else {
          if (attempts < retries) {
            retrySending();
          } else {
            reject({
              id,
              status: "failed",
              message,
              user,
              agentName,
              reason:
                "USER DON'T HAVE INPUT TO MESSAGE OR FAILED TO FIND MESSAGE INPUT",
            });
            console.log(
              "USER DON'T HAVE INPUT TO MESSAGE OR FAILED TO FIND MESSAGE INPUT"
            );
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
