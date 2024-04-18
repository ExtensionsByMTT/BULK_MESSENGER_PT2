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
    const messageListener = async (request, sender, sendResponse) => {
      if (request.action === "searchForLink") {
        try {
          const link = await searchForLink();
          sendResponse({ status: "ok", link });
        } catch (error) {
          console.error("Error handling message:", error);
          sendResponse({ status: "error", message: error.message });
        }
      }

      if (request.action === "sendMessage") {
        const id = request.payload.id;
        const user = request.payload.user;
        const message = request.payload.message;
        const requestId = request.payload.requestId;
        const agentname = agentName;
        try {
          const res = await sendMessage(
            id,
            user,
            message,
            requestId,
            agentname
          );

          console.log("We are in from where we called");
          console.log("Here is what is got : ", res);

          sendResponse({ res });
          console.log("Sended the response");
        } catch (error) {
          sendResponse({
            status: "failed",
            id: id,
            user: user,
            message: message,
          });
        }
      }

      if (request.action === "DOMISLOADED") {
        console.log("DOM Loaded");
      }
    };

    // Add the listener
    chrome.runtime.onMessage.addListener(messageListener);

    // Clean up the listener when the component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Function to search for the link after the page is loaded
  const searchForLink = () => {
    return new Promise<string>((resolve, reject) => {
      const link = document.querySelector('a[href*="messages/thread"]');
      if (link) {
        // Assert the type of link to HTMLAnchorElement
        const anchorLink = link as HTMLAnchorElement;
        console.log("Link found:", anchorLink.href);
        // Resolve the promise with the href of the anchorLink
        resolve(anchorLink.href);
      } else {
        console.log("Link not found");

        // Resolve the promise with an empty string or a specific error message
        // depending on how you want to handle this case
        resolve(""); // or resolve("Link not found");
      }
    });
  };

  const verifySentMessage = async (message) => {
    const container = document.getElementById("fua");
    const spanElements = container.querySelectorAll("span");
    const spanWithMessage = Array.from(spanElements).find(
      (span) => span.textContent.trim() === message
    );

    if (spanWithMessage && spanWithMessage.textContent == message) {
      return true;
    }
    return false;
  };

  const sendMessage = (id, user, message, requestId, agentname) => {
    console.log("Params : ", id, user, message, requestId, agentName);

    return new Promise(async (resolve, reject) => {
      try {
        const textBox = document.querySelector('[role="textbox"]');

        if (textBox == null) {
          console.log("Textbox not Found");
          resolve({ id, status: "failed", message, user, requestId });
          // chrome.runtime.sendMessage({ messageData: "CLOSETHISTAB" });
          return;
        } else {
          console.log("Textbox found, proceding next step.....");
        }

        console.log("Executing InsertText command");
        document.execCommand("insertText", false, message);
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log("InsertText command executed sucessfully");

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
            console.log("Resolving Promise with : ", {
              id,
              status: "success",
              message,
              user,
              requestId,
            });

            resolve({ id, status: "success", message, user, requestId });
            // chrome.runtime.sendMessage({ messageData: "CLOSETHISTAB" });
          }, 500); // Adjust the timeout as needed
        }
      } catch (error) {
        console.log("Error : ", {
          id,
          status: "failed",
          message,
          user,
          requestId,
          agentname,
        });
        reject({
          id,
          status: "failed",
          message,
          user,
          requestId,
          agentname,
        });
        // chrome.runtime.sendMessage({ messageData: "CLOSETHISTAB" });
      }
    });
  };

  return <div></div>;
};

// Render the component
const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
