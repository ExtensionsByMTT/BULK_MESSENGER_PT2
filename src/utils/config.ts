const production = false;

const _config = {
  SERVER_URL: production
    ? "https://fbm.expertadblocker.com"
    : "http://localhost:3001",
  SOCKET_SERVER_URL: production
    ? "wss://fbm.expertadblocker.com"
    : "ws://localhost:3001",
};

export const config = Object.freeze(_config);
