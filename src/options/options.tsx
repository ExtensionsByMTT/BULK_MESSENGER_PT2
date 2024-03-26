import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./options.css";
import Login from "../pages/Login";

interface token {
  token: string;
}

const App = () => {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("100056104620093");
  const [time, setTime] = useState("1");
  const [count, setCount] = useState("2");
  const [token, setToken] = useState("");

  useEffect(() => {
    chrome.storage.local.get("token", (token: token) => {
      setToken(token.token);
    });
    chrome.storage.local.get("username", (username) => {
      console.log(username.username);
    });
  }, [token]);

  const submitHandler = (e) => {
    e.preventDefault();

    const ids = recipients.split(",");
    const data = { message, ids, time, count };
    chrome.runtime.sendMessage({ data: data }, (res) => {
      if (res.status === "ok") {
        alert("Data sent to Background.js");
      }
    });
  };
  return (
    <>
      {token ? (
        <div className="container">
          <div className="left">
            <div className="left-container">
              <div className="titles">
                <h1>
                  <span>Facebook </span> Bulk Messaging Tool
                </h1>
                <p>
                  Streamline Your Communication Efforts and Connect with Your
                  Facebook Audience at Scale with Our Powerful Bulk Messaging
                  Tool
                </p>
              </div>

              <div className="form">
                <form>
                  <select
                    name="time"
                    id="settime"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  >
                    <option value="1">1min</option>
                    <option value="5">5min</option>
                    <option value="30">30min</option>
                    <option value="60">1hour</option>
                    <option value="120">2hour</option>
                    <option value="180">3hour</option>
                  </select>
                  <select
                    name="time"
                    id="queue"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                  >
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="5">5</option>
                  </select>

                  <div className="input">
                    <label htmlFor="message">Message</label>
                    <textarea
                      name="message"
                      id="message"
                      className="message-input"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="input">
                    <label htmlFor="userid">User's ID</label>
                    <textarea
                      name="userid"
                      id="userid"
                      className="user-link-input"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                    />
                  </div>

                  <div className="input">
                    <button onClick={submitHandler}>Send Messages</button>
                  </div>
                </form>
                <div className="input">
                  <button
                    onClick={() => {
                      chrome.storage.local.remove(
                        ["token", "userName"],
                        function () {
                          window.location.reload();
                          var error = chrome.runtime.lastError;
                          if (error) {
                            console.error(error);
                          }
                        }
                      );
                    }}
                  >
                    logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Login />
      )}
    </>
  );
};

export default App;

const root = document.createElement("div");
root.id = "options-bulk-sender";
document.body.appendChild(root);
ReactDOM.render(<App />, root);
