import React, { useState } from "react";
import { handleFileUpload } from "../components/Excel";
import { config } from "../utils/config";
interface Agent {
  agentID: string;
  username: string;
  role: string;
  clientID: string;
  token: string;
}

const Request = () => {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState("");
  const [time, setTime] = useState("1");
  const [count, setCount] = useState("2");
  const [loading, setLoading] = useState(false);
  const [facebookIds, setFacebookIds] = useState<any[]>([]);
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const agent: Agent = await new Promise((resolve) => {
      chrome.storage.local.get("agentID", (agent: Agent) => {
        resolve(agent);
      });
    });

    const agentToken: Agent = await new Promise((resolve) => {
      chrome.storage.local.get("token", (agent: Agent) => {
        resolve(agent);
      });
    });

    const users = recipients.split(",");
    const tokenValue = agent?.agentID;
    const data = {
      message,
      users,
      interval: time,
      usersPerInterval: count,
      agent: tokenValue,
    };

    try {
      const response = await fetch(`${config.SERVER_URL}/AdminKeyModels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${agentToken.token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.status !== 201) {
        throw new Error(responseData.message);
      }

      alert(responseData.message);
      setMessage("");
      setRecipients("");
      setTime("");
      setCount("");
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleData = (data: any[]) => {
    setFacebookIds(data);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e, handleData);
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
              value={recipients || facebookIds}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="Enter user IDs..."
              rows={5}
            />
          </div>
          <div className="excel">
            <label htmlFor="fileInput" className="custom-file-upload">
              Upload File
            </label>
            <input
              type="file"
              id="fileInput"
              accept=".xlsx,.xls"
              onChange={handleChange}
              name=""
              style={{ display: "none" }}
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
            {loading ? (
              <button>
                <div className="request-loader"></div>
              </button>
            ) : (
              <button onClick={submitHandler}>Send Messages</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Request;