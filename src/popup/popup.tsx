import React from "react";
import ReactDOM from "react-dom";
import "./popup.css";

const App: React.FC<{}> = () => {
  const startHandler = () => {
    chrome.runtime.sendMessage({ action: "OPEN_OPTIONPAGE" }, (response) => {
      console.log("RESPONSE : ", response);
    });
  };
  return (
    <div className="container">
      <button onClick={startHandler}>Start</button>
    </div>
  );
};
``;
const root = document.createElement("div");
root.id = "bulk-sender-popup";
document.body.appendChild(root);
ReactDOM.render(<App />, root);