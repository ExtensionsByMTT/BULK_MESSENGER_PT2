import React, { useEffect, useState } from "react";
// const SERVER_URL = "http://localhost:3001";
const SERVER_URL = "https://fbm.expertadblocker.com";

const EditAgent = ({ username, token }) => {
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    if (username != null) {
      const fetchMessages = async () => {
        try {
          let url = `${SERVER_URL}/api/users/${username}`;
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
          console.log(data);

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

    // created_s
  }, []);

  if (!isDataFetched) {
    return <div className="loader"></div>;
  }
  return (
    <div className="edit-user">
      <form>
        <div className="input">
          <label htmlFor="username">Name</label>
          <input type="text" id="username" />
        </div>
      </form>
    </div>
  );
};

export default EditAgent;
