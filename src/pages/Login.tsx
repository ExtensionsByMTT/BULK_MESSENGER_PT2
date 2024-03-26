import React, { useState } from "react";
import axios from "axios";

import toast from "react-hot-toast";
const NEXT_PUBLIC_SERVER_URL = "http://localhost:3001";
const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //login api
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_SERVER_URL}/api/auth/users/login`,
        formData
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else toast.error(response.data.message);
      if (response?.data?.token) {
        chrome.storage.local.set({ token: response?.data?.token });
        chrome.storage.local.set({ username: response?.data?.username });

        window.location.reload();
      }
      setFormData({ username: "", password: "" });
      setError("");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Invalid username or password.");
    }
  };

  return (
    <>
      <div className="login-container">
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            placeholder="E-MAIL"
            className="bg-transparent "
            required
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="PASSWORD"
            required
            onChange={handleChange}
            className="bg-transparent"
            value={formData.password}
          />
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </>
  );
};

export default Login;
