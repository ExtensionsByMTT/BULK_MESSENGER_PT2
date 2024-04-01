import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./options.css";
import Login from "../pages/Login";
import Request from "../pages/Request";

const App = () => {
  const [isloggedIn, setIsLoggedIn] = useState(false);
  const [pendingTasks, setPendingTasks] = useState([]);

  useEffect(() => {
    chrome.storage.local.get("token", (token) => {
      if (token?.token) {
        setIsLoggedIn(true);
      }
    });
    chrome.storage.local.get("pendingTasks", (result) => {
      if (result?.pendingTasks) {
        setPendingTasks(result?.pendingTasks);
      }
    });
  }, [isloggedIn]);
  return (
    <>{isloggedIn ? <Request pendingTasks={pendingTasks} /> : <Login setIsLoggedIn={setIsLoggedIn} />}</>
  );
};

export default App;

const root = document.createElement("div");
root.id = "dashboard";
document.body.appendChild(root);
ReactDOM.render(<App />, root);
