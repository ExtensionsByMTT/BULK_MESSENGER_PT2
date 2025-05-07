const production = true;

const _config = {
  SERVER_URL: production
    ? "https://fbm.milkyway-casino.com"
    : "http://localhost:5001",
  SOCKET_SERVER_URL: production
    ? "https://fbm.milkyway-casino.com"
    : "ws://localhost:5001",
};

export const config = Object.freeze(_config);
