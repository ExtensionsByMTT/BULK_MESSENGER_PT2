import React, { useEffect, useState } from "react";

import {
  formatDate,
  trimMessage,
  sortData,
  statusChangeHandler,
} from "../utils/utlis";
import { config } from "../utils/config";

const MessagesTable = ({
  currentAgent,
  userType,
  token,
  messageData,
  setMessageData,
  messageFilteredData,
  messageSetFilteredData,
}) => {
  const [createdAtSortOrder, setCreatedAtSortOrder] = useState("asc");
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (currentAgent != null) {
      const fetchMessages = async () => {
        try {
          let url;

          if (userType.toLowerCase() === "admin") {
            url = `${config.SERVER_URL}/api/tasks/`;
          } else if (userType.toLowerCase() === "agent") {
            url = `${config.SERVER_URL}/api/users/${currentAgent.id}/tasks`;
          } else {
            throw new Error("Invalid User");
          }
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          setMessageData(data);
          messageSetFilteredData(data);
          setIsDataFetched(true);
        } catch (error) {
          console.error(
            "There was a problem with your fetch operation:",
            error
          );
        }
      };
      fetchMessages();
    }
  }, [userType, currentAgent, refresh]);

  const handleSelect = (id) => {
    setSelectedMessages((prevSelected) => {
      const isSelected = prevSelected.includes(id);
      if (isSelected) {
        return prevSelected.filter((messageId) => messageId != id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleDelete = async () => {
    try {
      console.log("Selected Messages : ", selectedMessages);
      const response = await fetch(`${config.SERVER_URL}/api/messages`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageIds: selectedMessages }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data.message);
      }

      setRefresh(true);
      setSelectedMessages([]);
      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMessages([]);
      setSelectAll(false);
    } else {
      const pendingMessages = messageFilteredData.filter(
        (message) => message.status === "pending"
      );
      setSelectedMessages(pendingMessages.map((message) => message.id));
      setSelectAll(true);
    }
  };

  return (
    <div className="table">
      <table cellSpacing={0}>
        <thead>
          <tr className="heading-row">
            <th className="Message">Message</th>
            <th className="Sent">Sent To</th>
            <th className="Status">
              <select
                defaultValue="Status"
                onChange={(e) =>
                  statusChangeHandler(e, messageData, messageFilteredData)
                }
              >
                <option hidden value="Status">
                  Status
                </option>
                <option value="all">All</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </th>
            {userType === "admin" && <th className="Agent">Agent</th>}
            <th
              className="Created"
              onClick={() =>
                sortData(
                  "createdAt",
                  messageData,
                  messageFilteredData,
                  messageSetFilteredData,
                  createdAtSortOrder,
                  setCreatedAtSortOrder
                )
              }
            >
              <span>Created At</span>

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
                className={`${createdAtSortOrder}`}
              >
                <path d="m3 16 4 4 4-4" />
                <path d="M7 20V4" />
                <path d="m21 8-4-4-4 4" />
                <path d="M17 4v16" />
              </svg>
            </th>
            <th
              className="Created"
              onClick={() =>
                sortData(
                  "createdAt",
                  messageData,
                  messageFilteredData,
                  messageSetFilteredData,
                  createdAtSortOrder,
                  setCreatedAtSortOrder
                )
              }
            >
              <span>Scheduled At</span>

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
                className={`${createdAtSortOrder}`}
              >
                <path d="m3 16 4 4 4-4" />
                <path d="M7 20V4" />
                <path d="m21 8-4-4-4 4" />
                <path d="M17 4v16" />
              </svg>
            </th>
            <th>
              <input
                type="checkbox"
                checked={selectedMessages.length > 0}
                onChange={handleSelectAll}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {messageFilteredData.length > 0 ? (
            messageFilteredData.map((data) => {
              const { formattedDate, formattedTime } = formatDate(
                data.createdAt
              );
              const {
                formattedDate: scheduledDate,
                formattedTime: scheduledTime,
              } = formatDate(data.scheduledAt);

              return (
                <tr key={data._id} className="data-row">
                  <td className="message">{trimMessage(data.message)}</td>
                  <td className="sent_to">{data.sent_to}</td>
                  <td className="status">
                    <p className={`${data.status}`}>{data.status}</p>
                  </td>
                  {userType === "admin" && (
                    <td className="agent">{data.agent}</td>
                  )}
                  <td className="time">
                    <p>{formattedTime}</p>
                    <p>{formattedDate}</p>
                  </td>
                  <td className="time">
                    <p>{scheduledTime}</p>
                    <p>{scheduledDate}</p>
                  </td>
                  {data.status === "pending" && (
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(data.id)}
                        onChange={() => handleSelect(data.id)}
                      />
                    </td>
                  )}
                </tr>
              );
            })
          ) : isDataFetched ? (
            <tr>
              <td colSpan={userType === "admin" ? 5 : 4} className="no-data">
                <p>No Data found</p>
              </td>
            </tr>
          ) : (
            <tr>
              <td colSpan={userType === "admin" ? 5 : 4} className="loading">
                <div className="loader"></div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MessagesTable;
