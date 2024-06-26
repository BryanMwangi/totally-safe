import app from "./App/app.js";
import { logger } from "./Logs/logs.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  try {
    logger.info(`Server listening on port ${PORT}!`);
  } catch (error) {
    logger.error(`${error}`);
  }
});
