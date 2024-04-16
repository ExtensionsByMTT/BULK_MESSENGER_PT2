import React, { useState } from "react";
// const SERVER_URL = "http://localhost:3001";
const SERVER_URL = "https://fbm.expertadblocker.com";

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });

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
      const response = await fetch(`${SERVER_URL}/api/auth/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data?.success) {
        const uniqueId = generateUniqueId();
        const addDataResult = await new Promise<string>((resolve, reject) => {
          chrome.storage.local.set(
            {
              token: data.token,
              role: data.role,
              username: formData.username,
              clientID: uniqueId,
            },
            () => {
              resolve("Token saved to local storage");
            }
          );
        });
        console.log(addDataResult);
        setIsLoggedIn(true);
        window.location.reload();
      }
      console.log(data);
      alert(data?.message);
    } catch (error) {
      console.error(error.message);
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
