import React from "react";

const View = ({ message }) => {
  return (
    <div
      style={{
        width: "60vw",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "16px",
          gap: "4px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Agent : </span>{" "}
        <p>{message.agent}</p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "16px",
          gap: "4px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Created At : </span>{" "}
        <p>{message.createdAt}</p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          fontSize: "16px",
          gap: "4px",
        }}
      >
        <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
          Message :{" "}
        </span>{" "}
        <p>{message.message}</p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "16px",
          gap: "4px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Sent To : </span>{" "}
        <p>{message.sent_to}</p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "16px",
          gap: "4px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Status : </span>{" "}
        <p className={`py-1 px-4 status-${message.status} rounded-3xl`}>
          {message.status}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: "16px",
          gap: "4px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Reason : </span>{" "}
        <p className={``}>{message.reason}</p>
      </div>
    </div>
  );
};

export default View;
