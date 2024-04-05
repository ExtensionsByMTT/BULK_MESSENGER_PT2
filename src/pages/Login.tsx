import React, { useState } from "react";

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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://fbm.expertadblocker.com/api/auth/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data?.success) {
        setIsLoggedIn(true);
        chrome.storage.local.set({ token: data.token }, function () {
          console.log("Token saved to local storage");
        });
      }
      console.log(data);
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
