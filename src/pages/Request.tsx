import React, { useState } from "react";
import { Socket } from "socket.io-client";

const Request = ({ pendingTasks }) => {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("");
  const [time, setTime] = useState("1");
  const [count, setCount] = useState("2");

  const submitHandler = (e) => {
    e.preventDefault();
    const token = chrome.storage.local.get("token", (token) => {
      const ids = recipients.split(",");
      const tokenValue = token?.token; // Extract the token value safely

      const data = { message, ids, time, count, token: tokenValue };
      chrome.runtime.sendMessage({ type: "addTask", data: data }, (res) => {
        if (res.status === "ok") {
          console.log("Data sent to Background.js");
        }
      });
    });
  };
  return (
    <div className="request">
      <div className="request-inner-container">
        <div className="left">
          <div className="left-container">
            <div className="titles">
              <h1>
                <span>Facebook </span> Bulk Messaging Tool
              </h1>
              <p>
                Streamline Your Communication Efforts and Connect with Your
                Facebook Audience at Scale with Our Powerful Bulk Messaging Tool
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
                  <option value="10">10min</option>
                  <option value="15">15min</option>
                  <option value="20">20min</option>
                  <option value="25">25min</option>
                  <option value="30">30min</option>
                  <option value="60">1hour</option>
                  <option value="90">1.5hour</option>
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
              </form>
            </div>
          </div>
        </div>
        <div className="right">
          <h5>Pending Task : </h5>
        </div>
      </div>
    </div>
  );
};

export default Request;
