import React, { useEffect, useState } from "react";
import MessagesTable from "./MessagesTable";
// const SERVER_URL = "http://localhost:3001";
const SERVER_URL = "https://fbm.expertadblocker.com";

const History = ({ token, userType, currentUser }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const calanderChangeHandler = (e) => {
    console.log(e.target.value);
    const date = e.target.value;

    const filteredData = date
      ? data.filter(
          (item) =>
            new Date(item.created_at).toDateString() ===
            new Date(date).toDateString()
        )
      : data;
    console.log(filteredData);

    setFilteredData(filteredData);
  };

  const filterDataBySearch = (data: any[]) => {
    if (!searchInput) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  };

  useEffect(() => {
    console.log("CHNAGE : ", searchInput);
    const newData = filterDataBySearch(data);
    setFilteredData(newData);
  }, [searchInput]);

  return (
    <div className="history">
      <div className="history-container">
        <div className="top">
          <div className="search">
            <svg
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.75749 3.25359C8.03226 3.25359 6.37769 3.9389 5.15777 5.15877C3.93784 6.37863 3.2525 8.03312 3.2525 9.75827C3.2525 11.4834 3.93784 13.1379 5.15777 14.3578C6.37769 15.5776 8.03226 16.263 9.75749 16.263C11.4827 16.263 13.1373 15.5776 14.3572 14.3578C15.5771 13.1379 16.2625 11.4834 16.2625 9.75827C16.2625 8.03312 15.5771 6.37863 14.3572 5.15877C13.1373 3.9389 11.4827 3.25359 9.75749 3.25359ZM1.84517e-07 9.75827C-0.000195784 8.22268 0.362072 6.70873 1.05734 5.33954C1.75261 3.97036 2.76124 2.7846 4.00122 1.8787C5.24119 0.972807 6.67748 0.372358 8.19328 0.12619C9.70908 -0.119979 11.2616 -0.00491509 12.7245 0.462022C14.1875 0.928959 15.5195 1.73458 16.6124 2.81338C17.7053 3.89217 18.5281 5.21367 19.0139 6.67039C19.4997 8.12711 19.6348 9.67793 19.4082 11.1967C19.1816 12.7155 18.5997 14.1593 17.7099 15.4108L25.5435 23.2441C25.8397 23.5508 26.0036 23.9616 25.9999 24.388C25.9962 24.8143 25.8252 25.2222 25.5237 25.5237C25.2222 25.8252 24.8143 25.9962 24.3879 25.9999C23.9615 26.0036 23.5507 25.8397 23.244 25.5435L15.412 17.7119C13.9522 18.7498 12.2348 19.3659 10.4481 19.4927C8.66141 19.6195 6.87427 19.252 5.28254 18.4306C3.69082 17.6092 2.35593 16.3654 1.42414 14.8357C0.492364 13.306 -0.0003481 11.5494 1.84517e-07 9.75827Z"
                fill="#404040"
              />
            </svg>

            <input
              type="text"
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <ul className="actions">
            <li className="calender">
              <svg
                width="27"
                height="27"
                viewBox="0 0 27 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.20585 0.852905C6.78658 0.852905 6.38447 1.01946 6.088 1.31593C5.79153 1.61241 5.62497 2.01451 5.62497 2.43379V4.01467H4.04409C3.20554 4.01467 2.40133 4.34778 1.80838 4.94073C1.21544 5.53367 0.882324 6.33788 0.882324 7.17643V22.9853C0.882324 23.8238 1.21544 24.628 1.80838 25.221C2.40133 25.8139 3.20554 26.147 4.04409 26.147H23.0147C23.8532 26.147 24.6574 25.8139 25.2504 25.221C25.8433 24.628 26.1764 23.8238 26.1764 22.9853V7.17643C26.1764 6.33788 25.8433 5.53367 25.2504 4.94073C24.6574 4.34778 23.8532 4.01467 23.0147 4.01467H21.4338V2.43379C21.4338 2.01451 21.2672 1.61241 20.9708 1.31593C20.6743 1.01946 20.2722 0.852905 19.8529 0.852905C19.4336 0.852905 19.0315 1.01946 18.7351 1.31593C18.4386 1.61241 18.272 2.01451 18.272 2.43379V4.01467H8.78674V2.43379C8.78674 2.01451 8.62018 1.61241 8.32371 1.31593C8.02723 1.01946 7.62513 0.852905 7.20585 0.852905ZM7.20585 8.75732C6.78658 8.75732 6.38447 8.92387 6.088 9.22035C5.79153 9.51682 5.62497 9.91892 5.62497 10.3382C5.62497 10.7575 5.79153 11.1596 6.088 11.4561C6.38447 11.7525 6.78658 11.9191 7.20585 11.9191H19.8529C20.2722 11.9191 20.6743 11.7525 20.9708 11.4561C21.2672 11.1596 21.4338 10.7575 21.4338 10.3382C21.4338 9.91892 21.2672 9.51682 20.9708 9.22035C20.6743 8.92387 20.2722 8.75732 19.8529 8.75732H7.20585Z"
                  fill="#404040"
                />
              </svg>
              {showDatePicker && (
                <input
                  type="date"
                  onChange={calanderChangeHandler}
                  max={new Date().toISOString().split("T")[0]}
                />
              )}
            </li>
          </ul>
        </div>
        {/* Table  */}
        <MessagesTable
          currentUser={currentUser}
          token={token}
          userType={userType}
          messageData={data}
          setMessageData={setData}
          messageFilteredData={filteredData}
          messageSetFilteredData={setFilteredData}
        />
      </div>
    </div>
  );
};

export default History;
