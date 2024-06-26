import dotenv from "dotenv";
import pino from "pino";
dotenv.config();

const fileTransport = pino.transport({
  targets: [
    {
      target: "pino/file",
    },
    {
      target: "pino-pretty",
      options: { destination: `${process.env.LOG_PATH}/app.log` },
    },
  ],
  options: {
    destination: `${process.env.LOG_PATH}/app.log`,
    colorize: true,
    destination: 1,
  },
});

const logger = pino(fileTransport);

const logBlockedIps = async (ip) => {
  try {
    const date = Date.now();

    logger.error(
      "Blocked IP: " + ip + " at " + new Date(date).toLocaleString()
    );
  } catch (error) {
    logger.error(error);
  }
};

export { logBlockedIps, logger };
