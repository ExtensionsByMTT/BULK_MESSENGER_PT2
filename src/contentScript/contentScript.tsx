////////////////////////////////////////////////
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./contentScript.css";

// export const serverApi = "http://localhost:8080";

const App: React.FC<{}> = () => {
  useEffect(() => {
    const messageListener = (request, sender, sendResponse) => {
      if (request.action === "loginUser") {
        const { username, password } = request.payload;

        console.log("PAYLOAD : ", request.payload);

        login(username, password);
      }

      if (request.action === "sendMessage") {
        const { message } = request.payload;

        sendMessage(message);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const login = (username, password) => {
    const emailFeild = document.querySelector(
      'input[name="email"]'
    ) as HTMLInputElement;
    const passwordFeild = document.querySelector(
      'input[name="pass"]'
    ) as HTMLInputElement;
    const loginBtn = document.querySelector(
      'input[name="login'
    ) as HTMLButtonElement;

    emailFeild.value = username;
    passwordFeild.value = password;
    loginBtn.click();
    console.log(emailFeild, passwordFeild);
  };

  const sendMessage = async (message) => {
    try {
      console.log("SEND MESSAGE CALLED");

      // Ensure the page has loaded and the elements are available
      const messageLink = document.querySelector(
        'a[href*="messages/thread"]'
      ) as HTMLAnchorElement;
      if (!messageLink) {
        throw new Error("Message link not found");
      }

      messageLink.click();

      // Assuming the message input field becomes available after clicking the message link
      // You might need to add a delay or a more reliable way to wait for the input field to be available
      const inputField = document.querySelector(
        'textarea[name="body"]'
      ) as HTMLTextAreaElement;
      if (!inputField) {
        throw new Error("Message input field not found");
      }

      inputField.value = message;

      const sendBtn = document.querySelector(
        'input[name="Send"]'
      ) as HTMLInputElement;
      if (!sendBtn) {
        throw new Error("Send button not found");
      }

      sendBtn.click();
    } catch (error) {
      console.error("Error sending message:", error);
      // Here you can handle the error further, e.g., show an error message to the user
    }
  };

  return <></>;
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
