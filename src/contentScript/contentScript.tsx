////////////////////////////////////////////////
import React from "react";
import ReactDOM from "react-dom";
import "./contentScript.css";

const App: React.FC<{}> = () => {
  return <></>;
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
