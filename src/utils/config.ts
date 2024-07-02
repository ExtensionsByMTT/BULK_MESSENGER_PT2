const production = false;

const _config = {
  SERVER_URL: production
    ? "https://bulk-messenger-pt-4-ek29.onrender.com"
    : "http://localhost:5513",
  SOCKET_SERVER_URL: production
    ? "wss://bulk-messenger-pt-4-ek29.onrender.com"
    : "ws://localhost:5513",
};

export const config = Object.freeze(_config);
