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
        try {
          document.addEventListener("DOMContentLoaded", () => {
            const message = request.payload.message;
            const messageField = document.querySelector(
              "textarea"
            ) as HTMLTextAreaElement;

            messageField.value = message;

            sendResponse({ status: "ok" });
          });
        } catch (error) {}
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

  // Your component's render logic here
  return <div>Content Script</div>;
};

// Render the component
const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
