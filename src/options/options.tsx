import React from "react";
import ReactDOM from "react-dom";
import "./options.css";

const App: React.FC<{}> = () => {
  return (
    <>
      <h1>This is option page</h1>
    </>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
