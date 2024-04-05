import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./options.css";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

const App = () => {
  const [isloggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState("agent");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const roleResult = await new Promise<string>((resolve, reject) => {
        chrome.storage.local.get("role", (result) => {
          resolve(result.role || "");
        });
      });

      const tokenResult = await new Promise<string>((resolve, reject) => {
        chrome.storage.local.get("token", (result) => {
          resolve(result.token || "");
        });
      });

      setToken(tokenResult);
      setUserType(roleResult);
      setIsLoggedIn(!!tokenResult);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return <div>Loading.....</div>;
  }

  return (
    <>
      {isloggedIn ? (
        <Dashboard token={token} userType={userType} />
      ) : (
        <Login setIsLoggedIn={setIsLoggedIn} />
      )}
    </>
  );
};

export default App;

const root = document.createElement("div");
root.id = "bulkMessenger";
document.body.appendChild(root);
ReactDOM.render(<App />, root);
