import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./options.css";
import Login from "../pages/Login";
import Request from "../pages/Request";

const App = () => {
  const [isloggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = chrome.storage.local.get("token", (token) => {
      if (token?.token) {
        setIsLoggedIn(true);
      }
    });

    console.log("IS LOGGED IN : ", isloggedIn);
    console.log("TOKEN : ", token);
  }, [isloggedIn]);
  return (
    <>{isloggedIn ? <Request /> : <Login setIsLoggedIn={setIsLoggedIn} />}</>
  );
};

export default App;

const root = document.createElement("div");
root.id = "dashboard";
document.body.appendChild(root);
ReactDOM.render(<App />, root);
