// Import React and other necessary libraries
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./contentScript.css";

const App: React.FC<{}> = () => {
  console.log("JEELLL");

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

        try {
          const res = await sendMessage(id, user, message, requestId);
          sendResponse({ res });
        } catch (error) {
          sendResponse({
            status: "failed",
            id: id,
            user: user,
            message: message,
          });
        }
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

  const sendMessage = (id, user, message, requestId) => {
    return new Promise((resolve, reject) => {
      try {
        const textAreaField = document.querySelector(
          'textarea[name="body"]'
        ) as HTMLTextAreaElement;
        const buttonField = document.querySelector(
          'input[name="send"]'
        ) as HTMLButtonElement;

        if (!textAreaField) {
          resolve({
            id,
            status: "failed",
            message,
            user,
            requestId,
          });
          return; // Exit the function if the textarea is not found
        }

        textAreaField.value = message;

        const buttonField2 = document.querySelector(
          'input[name="Send"]'
        ) as HTMLButtonElement;

        const buttonToClick = buttonField2 || buttonField;

        if (buttonToClick) {
          buttonToClick.click();
          resolve({ id, status: "success", message, user, requestId });
        } else {
          resolve({ id, status: "failed", message, user, requestId });
        }
      } catch (error) {
        reject({
          id,
          status: "failed",
          message,
          user,
          requestId,
        });
      }
    });
  };

  // Your component's render logic here
  return <div>Content Script</div>;
};

// Render the component
const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
