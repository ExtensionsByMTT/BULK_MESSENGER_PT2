////////////////////////////////////////////////
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./contentScript.css";

// export const serverApi = "http://localhost:8080";

const App: React.FC<{}> = () => {
  const url = window.location.href;
  const [msg, setMsg] = useState("");
  //////////////////////useEffects////////////////////////////
  useEffect(() => {
    chrome.storage.local.get(["agentMessage"]).then((result) => {
      setMsg(result.agentMessage);
    });
    const messageListener = (request, sender, sendResponse) => {
      if (request.type === "EXECUTE_TASK") {
      }
    };
    if (msg === "") return;
    //for checking the message button
    let messageButton: HTMLAnchorElement | null = null;
    const messageButtons =
      document.querySelectorAll<HTMLAnchorElement>("a[href]");
    const linksArray = Array.from(messageButtons);
    const filteredLinks = linksArray.filter((link) =>
      link.href.includes("messages/thread")
    );
    filteredLinks.forEach((link) => {
      messageButton = link;
    });

    if (messageButton) {
      messageButton.click();
      const successID = /\/profile.php\?id=(\d+)|\/([^\/?]+)\?_rdr/;
      const match = url.match(successID);

      if (match) {
        const id = match[1] || match[2];
      }
    } else {
      const rejectedId = /\/profile.php\?id=(\d+)|\/([^\/?]+)\?_rdr/;
      const match = url.match(rejectedId);
      if (match) {
      }
    }
    ///////////////////////executeTask to send the message agend typed & checking if DOM fully loaded ////////////////////
    ///////////////////////////check if message button us available/////////////////////////////
    const NewMessageInputs = document.querySelectorAll("form[action]");
    const NewMessages = Array.from(NewMessageInputs) as HTMLFormElement[];
    const filteredMessages = NewMessages.filter((form) => {
      return form.action.includes("messages/send");
    });

    const textareas = [];

    filteredMessages.forEach((form) => {
      const textarea = form.querySelector("textarea");
      if (textarea) {
        textareas.push(textarea);
      }
    });

    const input = document.getElementById("composerInput") as HTMLInputElement;
    ///
    //checking msg has been sended or not by time and current msg

    const fuaDiv = document.querySelector("#fua");
    let spanValue, abbrValue;

    if (fuaDiv) {
      const spanElement = fuaDiv.querySelector("span");
      const abbrElement = fuaDiv.querySelector("abbr");
      spanValue = spanElement ? spanElement.textContent : "";
      abbrValue = abbrElement ? abbrElement.textContent : "";
    }

    try {
      if (input || textareas.length > 0) {
        const button = document.querySelector(
          'input[value="Send"]'
        ) as HTMLInputElement;
        if ((input && button) || (textareas.length > 0 && button)) {
          if (input) {
            input.value = msg;
          }
          textareas.forEach((textarea) => {
            textarea.value = msg;
          });
          if (spanValue === msg || abbrValue === "Just now") return;
          button.click();
        } else {
          console.error("ELEMENT NOT FOUND");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      // console.log("MSG SENT");
      // Additional finalization steps if needed
    }

    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [msg]);

  return <></>;
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
