// src/error-logger.ts

import { createLogger, format, transports } from "winston"
import path from "path"
import fs from "fs"

// Ensure the logs directory exists
const logDirectory = path.join(__dirname, "..", "logs")
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory)
}

// Configure Winston logger
const logger = createLogger({
  level: "error",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: path.join(logDirectory, "error.log") }),
    new transports.Console(),
  ],
})

// Log uncaught exceptions and unhandled promise rejections
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  })
  process.exit(1)
})

process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Rejection", {
    reason: reason instanceof Error ? reason.message : reason,
  })
})

export default logger
