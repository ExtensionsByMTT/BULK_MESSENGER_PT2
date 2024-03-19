import React from "react";
import ReactDOM from "react-dom";
import "./popup.css";

const App: React.FC<{}> = () => {
  return (
    <>
      <h1>Hello From Popup</h1>
    </>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
