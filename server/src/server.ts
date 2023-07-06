import mongoose from "mongoose";
import config from "./config";
import app from "./app";
import { Server } from "http";
import { errorLogger, logger } from "./utils/logger";

let server: Server;

// unCaught exception
process.on("uncaughtException", error => {
  logger.error(error);

  process.exit(1);
});

async function main() {
  try {
    await mongoose.connect(`${config.databaseUrl}`);
    logger.info("Database connected");

    server = app.listen(`${config.port}`, () => {
      logger.info(`Application running on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error(error);
  }

  // unhandled rejection
  process.on("unhandledRejection", error => {
    logger.error(error);

    if (server) {
      server.close(() => {
        errorLogger.error(error);
      });
    }
    process.exit(1);
  });
}
// unCaught exception
process.on("SIGTERM", () => {
  logger.info("SIGTERM recieved.");
  if (server) {
    server.close();
  }
  process.exit(1);
});

main();
