import React, { useEffect, useState } from "react";
// const SERVER_URL = "http://localhost:3001";
const SERVER_URL = "https://fbm.expertadblocker.com";
import {
  formatDate,
  trimMessage,
  sortData,
  statusChangeHandler,
} from "../utils/utlis";

const MessagesTable = ({
  currentUser,
  userType,
  token,
  messageData,
  setMessageData,
  messageFilteredData,
  messageSetFilteredData,
}) => {
  const [createdAtSortOrder, setCreatedAtSortOrder] = useState("asc");
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    if (currentUser != null) {
      const fetchMessages = async () => {
        try {
          let url;

          if (userType === "admin") {
            url = `${SERVER_URL}/api/messages/`;
          } else if (userType === "agent") {
            url = `${SERVER_URL}/api/messages/${currentUser}`;
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
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          console.log(data.data);

          setMessageData(data?.data);
          messageSetFilteredData(data?.data);
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
  }, [userType, currentUser]);
  return (
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
                "created_at",
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
        </tr>
      </thead>
      <tbody>
        {messageFilteredData.length > 0 ? (
          messageFilteredData.map((data) => {
            const { formattedDate, formattedTime } = formatDate(
              data.created_at
            );

            return (
              <tr key={data.id} className="data-row">
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
  );
};

export default MessagesTable;
