import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./options.css";
import { io } from "socket.io-client";
export const serverApi = "http://localhost:8080";

const App = () => {
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState("");
  const [time, setTime] = useState("1");
  const [queue, setQueue] = useState("2");
  const submitHandler = (e) => {
    e.preventDefault();
    try {
      const socket = io(`${serverApi}`);
      const newUsersArray = links.trim().split(/\s*,\s*/);
      socket.emit("sendData", message, newUsersArray, time, queue);
      socket.on("sendIds", (msg, batch) => {
        sendMessageToUser(batch, msg);
        console.log(batch, "current batch ");
      });
      socket.on("endMsg", (endMsg) => {
        socket.disconnect();
      });
    } catch (error) {
    } finally {
      setMessage("");
      setLinks("");
    }
  };

  const sendMessageToUser = (users, message) => {
    users.forEach((user) => {
      chrome.runtime.sendMessage({
        action: "SEND_MESSAGE",
        user,
        message,
      });
    });
  };

  ///////////////////
  return (
    <>
      <div className="container">
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
                  <option value="30">30min</option>
                  <option value="60">1hour</option>
                  <option value="120">2hour</option>
                  <option value="180">3hour</option>
                </select>
                <select
                  name="time"
                  id="queue"
                  value={queue}
                  onChange={(e) => setQueue(e.target.value)}
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
                    value={links}
                    onChange={(e) => setLinks(e.target.value)}
                  />
                </div>

                <div className="input">
                  <button onClick={submitHandler}>Send Messages</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;

const root = document.createElement("div");
root.id = "options-bulk-sender";
document.body.appendChild(root);
ReactDOM.render(<App />, root);
