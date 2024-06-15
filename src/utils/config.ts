const production = false;

const _config = {
  SERVER_URL: production
    ? "https://bulk-messenger-pt-4.onrender.com"
    : "http://localhost:5001",
  SOCKET_SERVER_URL: production
    ? "wss://bulk-messenger-pt-4.onrender.com"
    : "ws://localhost:5001",
};

export const config = Object.freeze(_config);
