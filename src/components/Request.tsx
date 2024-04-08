import React, { useState } from "react";

const Request = () => {
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
          alert("Data sent to Background.js");
        }
      });
    });
  };
  return (
    <div className="request">
      <div className="request-container">
        <form>
          <div className="input">
            <label htmlFor="message">Message</label>
            <textarea
              name="message"
              id="message"
              className="message-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message here..."
              rows={4}
            />
          </div>

          <div className="input">
            <label htmlFor="userid">Users ID</label>
            <textarea
              name="userid"
              id="userid"
              className="user-link-input"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="Enter user IDs..."
              rows={5}
            />
          </div>

          <div className="input">
            <label htmlFor="">Interval</label>
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
              <option value="150">2.5hour</option>
              <option value="180">3hour</option>
              <option value="210">3.5hour</option>
            </select>
          </div>

          <div className="input">
            <label htmlFor="">Count</label>
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
          </div>
          <div className="btn">
            <button onClick={submitHandler}>Send Messages</button>{" "}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Request;
