import React, { useEffect, useState } from "react";
import { config } from "../utils/config";

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [currentTabUrl, setCurrentTabUrl] = useState("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var currentTab = tabs[0];
      var currentTabUrl = currentTab.url;
      setCurrentTabUrl(currentTabUrl);
    });
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  function generateUniqueId() {
    const randomStr = Math.random().toString(36).substring(2, 12);
    const timestamp = new Date().getTime();
    const uniqueId = randomStr + "-" + timestamp;
    return uniqueId;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.SERVER_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, currentTabUrl }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data.message);
      }

      const uniqueId = generateUniqueId();
      const addDataResult = await new Promise<string>((resolve, reject) => {
        chrome.storage.local.set(
          {
            agentID: data.id,
            username: data.username,
            role: data.role,
            clientID: uniqueId,
            token: data.token,
          },
          () => {
            resolve("Token saved to local storage");
          }
        );
      });
      console.log(addDataResult);
      setIsLoggedIn(true);
      window.location.reload();
    } catch (error) {
      setFormData({ username: "", password: "" });

      console.error(error.message);
      alert(error.message);
    }
  };

  return (
    <div className="login">
      <div className="left">
        <div className="left-inner-container">
          <div className="logo">
            <img src="logo.png" alt="logo " />
          </div>
          <form className="form" onSubmit={handleLogin}>
            <div className="input">
              <input
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input">
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input">
              <button>Login</button>
            </div>
          </form>
        </div>
      </div>
      <div className="right">
        <div className="right-inner-container">
          <img src="login-banner.png" alt="login" />
        </div>
      </div>
    </div>
  );
};

export default Login;
