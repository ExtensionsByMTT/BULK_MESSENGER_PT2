import React, { useEffect, useState } from "react";
import Request from "../components/Request";
import AgentsTable from "../components/AgentsTable";
import History from "../components/History";

const links = ["New Message", "History"];

const Dashboard = ({ token, userType }) => {
  const [activeLink, setActiveLink] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [links, setLinks] = useState(["New Message", "History"]);

  const handleLinkClick = (index) => {
    setActiveLink(index);
  };

  useEffect(() => {
    if (userType === "admin") {
      setLinks([...links, "Agent"]);
    }
    (async () => {
      const usernameResult = await new Promise<string>((resolve) => {
        chrome.storage.local.get("username", (result) => {
          resolve(result.username || "");
        });
      });

      setCurrentUser(usernameResult);
    })();
  }, []);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="left">
          <div className="logo">
            <img src="dashboard-logo.png" alt="logo" />
          </div>
          <nav className="menu">
            {links.map((link, index) => (
              <div
                key={index}
                className={`link ${activeLink === index ? "active" : ""}`}
                onClick={() => handleLinkClick(index)}
              >
                <div className="item">
                  {link} <div className="circle-1" />
                  <div className="circle-2" />
                </div>
              </div>
            ))}
          </nav>

          <div className="logout">
            <div className="user">
              <div className="detail">
                <h6>
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="dot"
                  >
                    <circle cx="12.1" cy="12.1" r="6" />
                  </svg>
                  {currentUser}
                </h6>
              </div>
              <button
                onClick={() => {
                  chrome.storage.local.remove(
                    ["token", "username", "role"],
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
                <svg
                  width="31"
                  height="31"
                  viewBox="0 0 31 31"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.0001 28.5H23.6251C24.9181 28.5 26.158 27.9864 27.0723 27.0721C27.9865 26.1579 28.5001 24.9179 28.5001 23.625V7.375C28.5001 6.08207 27.9865 4.8421 27.0723 3.92786C26.158 3.01362 24.9181 2.5 23.6251 2.5H22.0001M9.00012 9L2.50012 15.5M2.50012 15.5L9.00012 22M2.50012 15.5L22.0001 15.5"
                    stroke="#D9D9D9"
                    strokeWidth="3.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="right">
          {activeLink === 0 && <Request />}
          {activeLink === 1 && (
            <History
              token={token}
              userType={userType}
              currentUser={currentUser}
            />
          )}
          {activeLink === 2 && userType === "admin" && (
            <AgentsTable
              token={token}
              userType={userType}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
